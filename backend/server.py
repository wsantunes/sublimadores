from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import httpx
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: str = "viewer"
    is_active: bool = True
    access_until: Optional[str] = None
    created_at: datetime

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime

class RegisterInput(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginInput(BaseModel):
    email: EmailStr
    password: str

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    category_id: str
    name: str
    description: Optional[str] = None
    created_by: str
    created_at: datetime

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    event_id: str
    name: str
    description: Optional[str] = None
    date: Optional[str] = None
    created_by: str
    created_at: datetime

class EventCreate(BaseModel):
    name: str
    description: Optional[str] = None
    date: Optional[str] = None

class Image(BaseModel):
    model_config = ConfigDict(extra="ignore")
    image_id: str
    title: str
    description: Optional[str] = None
    image_data: str
    tags: List[str] = []
    category_id: Optional[str] = None
    event_id: Optional[str] = None
    uploaded_by: str
    created_at: datetime

class ImageCreate(BaseModel):
    title: str
    description: Optional[str] = None
    image_data: str
    tags: List[str] = []
    category_id: Optional[str] = None
    event_id: Optional[str] = None

class UpdateUserRole(BaseModel):
    role: str

class UpdateUserAccess(BaseModel):
    is_active: Optional[bool] = None
    access_until: Optional[str] = None

async def get_current_user(request: Request) -> User:
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header[7:]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user_doc.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account disabled")
    
    access_until = user_doc.get("access_until")
    if access_until:
        access_date = datetime.fromisoformat(access_until) if isinstance(access_until, str) else access_until
        if access_date.tzinfo is None:
            access_date = access_date.replace(tzinfo=timezone.utc)
        if access_date < datetime.now(timezone.utc):
            raise HTTPException(status_code=403, detail="Access expired")
    
    if isinstance(user_doc["created_at"], str):
        user_doc["created_at"] = datetime.fromisoformat(user_doc["created_at"])
    
    return User(**user_doc)

async def require_role(user: User, allowed_roles: List[str]):
    if user.role not in allowed_roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

@api_router.post("/auth/register")
async def register(input: RegisterInput):
    existing = await db.users.find_one({"email": input.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = bcrypt.hashpw(input.password.encode('utf-8'), bcrypt.gensalt())
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    
    user_doc = {
        "user_id": user_id,
        "email": input.email,
        "name": input.name,
        "password_hash": hashed.decode('utf-8'),
        "picture": None,
        "role": "viewer",
        "is_active": True,
        "access_until": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    session_token = f"session_{uuid.uuid4().hex}"
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    return {"session_token": session_token, "user": {"user_id": user_id, "email": input.email, "name": input.name, "role": "viewer"}}

@api_router.post("/auth/login")
async def login(input: LoginInput):
    user_doc = await db.users.find_one({"email": input.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not bcrypt.checkpw(input.password.encode('utf-8'), user_doc["password_hash"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    session_token = f"session_{uuid.uuid4().hex}"
    session_doc = {
        "user_id": user_doc["user_id"],
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    return {"session_token": session_token, "user": {"user_id": user_doc["user_id"], "email": user_doc["email"], "name": user_doc["name"], "role": user_doc["role"]}}

@api_router.get("/auth/session")
async def process_google_session(request: Request):
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session_id")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid session_id")
        
        data = response.json()
    
    existing_user = await db.users.find_one({"email": data["email"]}, {"_id": 0})
    if existing_user:
        user_id = existing_user["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": data["name"], "picture": data["picture"]}}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": data["email"],
            "name": data["name"],
            "picture": data["picture"],
            "role": "viewer",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    session_token = data["session_token"]
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    return {"session_token": session_token, "user": user}

@api_router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    return user

@api_router.post("/auth/logout")
async def logout(request: Request):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    return {"message": "Logged out"}

@api_router.get("/users", response_model=List[User])
async def get_users(user: User = Depends(get_current_user)):
    await require_role(user, ["admin"])
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    for u in users:
        if isinstance(u["created_at"], str):
            u["created_at"] = datetime.fromisoformat(u["created_at"])
    return users

@api_router.put("/users/{user_id}")
async def update_user_role(user_id: str, input: UpdateUserRole, user: User = Depends(get_current_user)):
    await require_role(user, ["admin"])
    if input.role not in ["admin", "editor", "viewer"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    result = await db.users.update_one({"user_id": user_id}, {"$set": {"role": input.role}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Role updated"}

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, user: User = Depends(get_current_user)):
    await require_role(user, ["admin"])
    await db.users.delete_one({"user_id": user_id})
    await db.user_sessions.delete_many({"user_id": user_id})
    return {"message": "User deleted"}

@api_router.get("/categories", response_model=List[Category])
async def get_categories(user: User = Depends(get_current_user)):
    categories = await db.categories.find({}, {"_id": 0}).to_list(1000)
    for cat in categories:
        if isinstance(cat["created_at"], str):
            cat["created_at"] = datetime.fromisoformat(cat["created_at"])
    return categories

@api_router.post("/categories", response_model=Category)
async def create_category(input: CategoryCreate, user: User = Depends(get_current_user)):
    await require_role(user, ["admin", "editor"])
    category_id = f"cat_{uuid.uuid4().hex[:12]}"
    category_doc = {
        "category_id": category_id,
        "name": input.name,
        "description": input.description,
        "created_by": user.user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.categories.insert_one(category_doc)
    category_doc["created_at"] = datetime.fromisoformat(category_doc["created_at"])
    return Category(**category_doc)

@api_router.put("/categories/{category_id}")
async def update_category(category_id: str, input: CategoryCreate, user: User = Depends(get_current_user)):
    await require_role(user, ["admin", "editor"])
    result = await db.categories.update_one({"category_id": category_id}, {"$set": {"name": input.name, "description": input.description}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category updated"}

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str, user: User = Depends(get_current_user)):
    await require_role(user, ["admin"])
    await db.categories.delete_one({"category_id": category_id})
    return {"message": "Category deleted"}

@api_router.get("/events", response_model=List[Event])
async def get_events(user: User = Depends(get_current_user)):
    events = await db.events.find({}, {"_id": 0}).to_list(1000)
    for evt in events:
        if isinstance(evt["created_at"], str):
            evt["created_at"] = datetime.fromisoformat(evt["created_at"])
    return events

@api_router.post("/events", response_model=Event)
async def create_event(input: EventCreate, user: User = Depends(get_current_user)):
    await require_role(user, ["admin", "editor"])
    event_id = f"evt_{uuid.uuid4().hex[:12]}"
    event_doc = {
        "event_id": event_id,
        "name": input.name,
        "description": input.description,
        "date": input.date,
        "created_by": user.user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.events.insert_one(event_doc)
    event_doc["created_at"] = datetime.fromisoformat(event_doc["created_at"])
    return Event(**event_doc)

@api_router.put("/events/{event_id}")
async def update_event(event_id: str, input: EventCreate, user: User = Depends(get_current_user)):
    await require_role(user, ["admin", "editor"])
    result = await db.events.update_one({"event_id": event_id}, {"$set": {"name": input.name, "description": input.description, "date": input.date}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event updated"}

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, user: User = Depends(get_current_user)):
    await require_role(user, ["admin"])
    await db.events.delete_one({"event_id": event_id})
    return {"message": "Event deleted"}

@api_router.get("/images", response_model=List[Image])
async def get_images(
    category_id: Optional[str] = None,
    event_id: Optional[str] = None,
    tags: Optional[str] = None,
    search: Optional[str] = None,
    user: User = Depends(get_current_user)
):
    query = {}
    if category_id:
        query["category_id"] = category_id
    if event_id:
        query["event_id"] = event_id
    if tags:
        tag_list = [t.strip() for t in tags.split(",")]
        query["tags"] = {"$in": tag_list}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    images = await db.images.find(query, {"_id": 0}).to_list(1000)
    for img in images:
        if isinstance(img["created_at"], str):
            img["created_at"] = datetime.fromisoformat(img["created_at"])
    return images

@api_router.get("/images/{image_id}", response_model=Image)
async def get_image(image_id: str, user: User = Depends(get_current_user)):
    image = await db.images.find_one({"image_id": image_id}, {"_id": 0})
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    if isinstance(image["created_at"], str):
        image["created_at"] = datetime.fromisoformat(image["created_at"])
    return Image(**image)

@api_router.post("/images", response_model=Image)
async def create_image(input: ImageCreate, user: User = Depends(get_current_user)):
    await require_role(user, ["admin", "editor"])
    image_id = f"img_{uuid.uuid4().hex[:12]}"
    image_doc = {
        "image_id": image_id,
        "title": input.title,
        "description": input.description,
        "image_data": input.image_data,
        "tags": input.tags,
        "category_id": input.category_id,
        "event_id": input.event_id,
        "uploaded_by": user.user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.images.insert_one(image_doc)
    image_doc["created_at"] = datetime.fromisoformat(image_doc["created_at"])
    return Image(**image_doc)

@api_router.put("/images/{image_id}")
async def update_image(image_id: str, input: ImageCreate, user: User = Depends(get_current_user)):
    await require_role(user, ["admin", "editor"])
    result = await db.images.update_one(
        {"image_id": image_id},
        {"$set": {
            "title": input.title,
            "description": input.description,
            "image_data": input.image_data,
            "tags": input.tags,
            "category_id": input.category_id,
            "event_id": input.event_id
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"message": "Image updated"}

@api_router.delete("/images/{image_id}")
async def delete_image(image_id: str, user: User = Depends(get_current_user)):
    await require_role(user, ["admin"])
    await db.images.delete_one({"image_id": image_id})
    return {"message": "Image deleted"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
# Events Hub - Product Requirements Document

## Original Problem Statement
O usuário deseja construir uma aplicação full-stack de gerenciamento de eventos.

## Core Requirements
1. **User Management**: Autenticação completa com perfis de usuário, roles (admin, editor, viewer) e gerenciamento de permissões
2. **Event Management**: CRUD completo para eventos
3. **Category Management**: CRUD completo para categorias
4. **Image Management**: Upload e gerenciamento de imagens associadas a eventos/categorias
5. **Design**: Design minimalista e clean
6. **OAuth**: Google OAuth integrado para autenticação
7. **Deployment**: Dockerfile gerado para fácil deployment ✅

## Tech Stack
- **Backend**: FastAPI, Python, MongoDB (Motor async driver)
- **Frontend**: React 19, Tailwind CSS, Shadcn/UI
- **Authentication**: JWT-based sessions + Google OAuth 2.0
- **Database**: MongoDB

## What's Been Implemented

### ✅ Completed Features (Feb 2026)

#### Backend
- FastAPI server with full REST API
- MongoDB integration with Motor async driver
- Authentication system (register, login, logout, session management)
- Google OAuth 2.0 integration via Emergent
- CRUD APIs for:
  - Users (`/api/users`)
  - Categories (`/api/categories`)
  - Events (`/api/events`)
  - Images (`/api/images`)
- Role-based access control (admin, editor, viewer)
- Proper CORS configuration

#### Frontend
- React 19 application with Tailwind CSS
- Login/Register pages with Google OAuth
- Dashboard for viewing content
- Category management page
- Event management page
- User management page (admin only)
- Image gallery with filtering
- Responsive design
- Session-based authentication

#### Deployment (Feb 6, 2026)
- `backend/Dockerfile` - FastAPI container
- `frontend/Dockerfile` - Multi-stage build with nginx
- `docker-compose.yml` - Full stack orchestration
- `nginx.conf` - Production-ready nginx config
- `.dockerignore` files for optimized builds
- `DEPLOYMENT.md` - Complete deployment guide

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/session` - Process Google OAuth session
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Users (Admin only)
- `GET /api/users` - List all users
- `PUT /api/users/{user_id}` - Update user role
- `DELETE /api/users/{user_id}` - Delete user

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category (admin/editor)
- `PUT /api/categories/{id}` - Update category (admin/editor)
- `DELETE /api/categories/{id}` - Delete category (admin)

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event (admin/editor)
- `PUT /api/events/{id}` - Update event (admin/editor)
- `DELETE /api/events/{id}` - Delete event (admin)

### Images
- `GET /api/images` - List/filter images
- `GET /api/images/{id}` - Get single image
- `POST /api/images` - Upload image (admin/editor)
- `PUT /api/images/{id}` - Update image (admin/editor)
- `DELETE /api/images/{id}` - Delete image (admin)

## Database Schema (MongoDB Collections)

### users
```json
{
  "user_id": "string",
  "email": "string",
  "name": "string",
  "password_hash": "string (optional)",
  "picture": "string (optional)",
  "role": "admin|editor|viewer",
  "created_at": "datetime"
}
```

### categories
```json
{
  "category_id": "string",
  "name": "string",
  "description": "string (optional)",
  "created_by": "string",
  "created_at": "datetime"
}
```

### events
```json
{
  "event_id": "string",
  "name": "string",
  "description": "string (optional)",
  "date": "string (optional)",
  "created_by": "string",
  "created_at": "datetime"
}
```

### images
```json
{
  "image_id": "string",
  "title": "string",
  "description": "string (optional)",
  "image_data": "string (base64)",
  "tags": ["string"],
  "category_id": "string (optional)",
  "event_id": "string (optional)",
  "uploaded_by": "string",
  "created_at": "datetime"
}
```

## File Structure
```
/app
├── backend/
│   ├── server.py          # Main FastAPI application
│   ├── requirements.txt   # Python dependencies
│   ├── Dockerfile         # Backend container
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   └── App.js         # Main app with routing
│   ├── package.json
│   ├── Dockerfile         # Frontend container
│   ├── nginx.conf         # Nginx configuration
│   └── .dockerignore
├── docker-compose.yml     # Full stack orchestration
├── DEPLOYMENT.md          # Deployment guide
└── .dockerignore
```

## Backlog / Future Enhancements

### P1 - High Priority
- Add event location with map integration
- Email notifications for event reminders
- Event RSVP/attendance tracking

### P2 - Medium Priority
- Event recurring schedules
- Export events to calendar (iCal)
- Event search and advanced filtering
- Image compression/optimization

### P3 - Low Priority
- Multi-language support
- Dark mode
- Mobile app (React Native)
- Analytics dashboard

## Notes
- All sensitive credentials are managed via environment variables
- Google OAuth uses Emergent's managed authentication service
- MongoDB is used instead of SQLite (differs from original handoff summary)

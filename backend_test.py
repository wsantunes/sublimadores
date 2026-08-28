import requests
import json
import sys
from datetime import datetime

BACKEND_URL = "http://localhost:8001"

class APITester:
    def __init__(self):
        self.token = None
        self.user = None
        self.tests_run = 0
        self.tests_passed = 0
        self.category_id = None
        self.event_id = None
        self.image_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{BACKEND_URL}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {method} {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json() if response.content else {}
                    return success, response_data
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_auth_flow(self):
        """Test authentication flow"""
        print("\n=== AUTHENTICATION TESTS ===")
        
        # Test login with provided credentials
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "/api/auth/login",
            200,
            data={"email": "admin@test.com", "password": "admin123"}
        )
        
        if success and 'session_token' in response:
            self.token = response['session_token']
            self.user = response.get('user', {})
            print(f"   Token acquired: {self.token[:20]}...")
            print(f"   User role: {self.user.get('role', 'unknown')}")
        else:
            print("❌ Login failed - stopping all tests")
            return False
            
        # Test /auth/me endpoint
        success, user_data = self.run_test(
            "Get Current User",
            "GET",
            "/api/auth/me",
            200
        )
        
        if success:
            print(f"   User: {user_data.get('name', 'unknown')} ({user_data.get('email', 'unknown')})")
            
        return True

    def test_categories_crud(self):
        """Test categories CRUD operations"""
        print("\n=== CATEGORIES CRUD TESTS ===")
        
        # Get initial categories
        success, initial_cats = self.run_test(
            "Get Categories",
            "GET",
            "/api/categories",
            200
        )
        
        if success:
            print(f"   Found {len(initial_cats)} existing categories")
        
        # Create new category
        category_data = {
            "name": f"Test Category {datetime.now().strftime('%H%M%S')}",
            "description": "Test category for API testing"
        }
        
        success, created_cat = self.run_test(
            "Create Category",
            "POST",
            "/api/categories",
            200,
            data=category_data
        )
        
        if success and 'category_id' in created_cat:
            self.category_id = created_cat['category_id']
            print(f"   Created category ID: {self.category_id}")
            
            # Update category
            update_data = {
                "name": category_data["name"] + " Updated",
                "description": "Updated description"
            }
            
            success, _ = self.run_test(
                "Update Category",
                "PUT",
                f"/api/categories/{self.category_id}",
                200,
                data=update_data
            )

    def test_events_crud(self):
        """Test events CRUD operations"""
        print("\n=== EVENTS CRUD TESTS ===")
        
        # Get initial events
        success, initial_events = self.run_test(
            "Get Events",
            "GET",
            "/api/events",
            200
        )
        
        if success:
            print(f"   Found {len(initial_events)} existing events")
        
        # Create new event
        event_data = {
            "name": f"Test Event {datetime.now().strftime('%H%M%S')}",
            "description": "Test event for API testing",
            "date": "2025-12-25"
        }
        
        success, created_event = self.run_test(
            "Create Event",
            "POST",
            "/api/events",
            200,
            data=event_data
        )
        
        if success and 'event_id' in created_event:
            self.event_id = created_event['event_id']
            print(f"   Created event ID: {self.event_id}")
            
            # Update event
            update_data = {
                "name": event_data["name"] + " Updated",
                "description": "Updated description",
                "date": "2025-12-31"
            }
            
            success, _ = self.run_test(
                "Update Event",
                "PUT",
                f"/api/events/{self.event_id}",
                200,
                data=update_data
            )

    def test_images_crud(self):
        """Test images CRUD operations"""
        print("\n=== IMAGES CRUD TESTS ===")
        
        # Get initial images
        success, initial_images = self.run_test(
            "Get Images",
            "GET",
            "/api/images",
            200
        )
        
        if success:
            print(f"   Found {len(initial_images)} existing images")
        
        # Create test image with base64 data (small 1x1 pixel)
        test_image_b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        
        image_data = {
            "title": f"Test Image {datetime.now().strftime('%H%M%S')}",
            "description": "Test image for API testing",
            "image_data": test_image_b64,
            "tags": ["test", "api"],
            "category_id": self.category_id,
            "event_id": self.event_id
        }
        
        success, created_image = self.run_test(
            "Create Image",
            "POST",
            "/api/images",
            200,
            data=image_data
        )
        
        if success and 'image_id' in created_image:
            self.image_id = created_image['image_id']
            print(f"   Created image ID: {self.image_id}")
            
            # Get specific image
            success, image_detail = self.run_test(
                "Get Specific Image",
                "GET",
                f"/api/images/{self.image_id}",
                200
            )
            
            # Test image filtering
            success, filtered = self.run_test(
                "Filter Images by Category",
                "GET",
                "/api/images",
                200,
                params={"category_id": self.category_id}
            )
            
            # Test search functionality
            success, searched = self.run_test(
                "Search Images",
                "GET",
                "/api/images",
                200,
                params={"search": "Test"}
            )

    def test_users_management(self):
        """Test users management (admin only)"""
        print("\n=== USERS MANAGEMENT TESTS ===")
        
        if self.user.get('role') != 'admin':
            print("⚠️ Skipping user management tests - user is not admin")
            return
            
        # Get all users
        success, users_list = self.run_test(
            "Get All Users",
            "GET",
            "/api/users",
            200
        )
        
        if success:
            print(f"   Found {len(users_list)} users")
            for user in users_list[:3]:  # Show first 3 users
                print(f"   - {user.get('email', 'unknown')} ({user.get('role', 'unknown')})")

    def cleanup_test_data(self):
        """Clean up test data"""
        print("\n=== CLEANUP ===")
        
        # Delete test image
        if self.image_id:
            success, _ = self.run_test(
                "Delete Test Image",
                "DELETE",
                f"/api/images/{self.image_id}",
                200
            )
        
        # Delete test event (admin only)
        if self.event_id and self.user.get('role') == 'admin':
            success, _ = self.run_test(
                "Delete Test Event",
                "DELETE",
                f"/api/events/{self.event_id}",
                200
            )
            
        # Delete test category (admin only)
        if self.category_id and self.user.get('role') == 'admin':
            success, _ = self.run_test(
                "Delete Test Category",
                "DELETE",
                f"/api/categories/{self.category_id}",
                200
            )

    def test_logout(self):
        """Test logout"""
        print("\n=== LOGOUT TEST ===")
        success, _ = self.run_test(
            "Logout",
            "POST",
            "/api/auth/logout",
            200
        )

def main():
    print("🚀 Starting Print Gallery API Tests")
    print(f"📍 Testing backend: {BACKEND_URL}")
    
    tester = APITester()
    
    try:
        # Test authentication first
        if not tester.test_auth_flow():
            print("\n❌ Authentication failed - stopping all tests")
            return 1
            
        # Test CRUD operations
        tester.test_categories_crud()
        tester.test_events_crud()
        tester.test_images_crud()
        tester.test_users_management()
        
        # Cleanup
        tester.cleanup_test_data()
        tester.test_logout()
        
        # Print results
        print(f"\n📊 FINAL RESULTS")
        print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
        print(f"Success rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
        
        if tester.tests_passed == tester.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️ Some tests failed")
            return 1
            
    except KeyboardInterrupt:
        print("\n⏹️ Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
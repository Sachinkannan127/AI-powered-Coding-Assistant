# Authentication Guide - Smart DevCopilot

## Overview

Smart DevCopilot now includes full JWT-based authentication to track user activity, save preferences, and secure your AI coding assistant.

## Features

✅ **User Registration** - Create an account with username, email, and password  
✅ **JWT Authentication** - Secure token-based authentication (7-day expiry)  
✅ **Password Hashing** - Bcrypt password hashing for security  
✅ **Guest Mode** - Use the app without authentication (limited features)  
✅ **Optional Auth** - API endpoints work with or without authentication  
✅ **SQLite Database** - Lightweight local database for user data  

---

## Quick Start

### 1. Start the Backend

```bash
cd backend
uvicorn main:app --reload
```

The backend will run on `http://localhost:8000`

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

### 3. Create an Account

1. Open `http://localhost:3000` in your browser
2. Click the **"Sign In"** button in the top-right
3. Switch to the **"Create Account"** tab
4. Fill in your details:
   - Username
   - Email
   - Password (minimum 6 characters)
   - Full Name (optional)
5. Click **"Create Account"**

You'll be automatically logged in after registration!

### 4. Sign In

1. Click **"Sign In"** button
2. Enter your username and password
3. Click **"Sign In"**

Your session will last for 7 days.

---

## API Endpoints

### Authentication Endpoints

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepass123",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "is_active": true,
  "created_at": "2026-02-16T23:40:00"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

username=johndoe&password=securepass123
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <your_token>
```

**Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "is_active": true,
  "created_at": "2026-02-16T23:40:00"
}
```

---

## Using the API with Authentication

### With cURL

```bash
# Get access token
TOKEN=$(curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=johndoe&password=securepass123" \
  | jq -r '.access_token')

# Use the token for API requests
curl -X POST "http://localhost:8000/api/generate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a factorial function", "language": "python", "max_tokens": 500}'
```

### With Python

```python
import requests

# Login
response = requests.post(
    "http://localhost:8000/api/auth/login",
    data={"username": "johndoe", "password": "securepass123"}
)
token = response.json()["access_token"]

# Use the API
headers = {"Authorization": f"Bearer {token}"}
response = requests.post(
    "http://localhost:8000/api/generate",
    headers=headers,
    json={
        "prompt": "Create a factorial function",
        "language": "python",
        "max_tokens": 500
    }
)
print(response.json()["code"])
```

### With JavaScript/Axios

```javascript
// Login
const loginResponse = await axios.post('http://localhost:8000/api/auth/login', 
  new URLSearchParams({
    username: 'johndoe',
    password: 'securepass123'
  })
);

const token = loginResponse.data.access_token;

// Use the API
const response = await axios.post(
  'http://localhost:8000/api/generate',
  {
    prompt: 'Create a factorial function',
    language: 'python',
    max_tokens: 500
  },
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

console.log(response.data.code);
```

---

## Frontend Integration

The frontend automatically handles authentication:

1. **Token Storage** - Saved in localStorage
2. **Auto-Login** - Checks for existing token on page load
3. **Auth Context** - React Context provides authentication state globally
4. **API Service** - Automatically includes auth token in requests

### Using Auth in Components

```typescript
import { useAuth } from './contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, login, logout, register } = useAuth()

  if (isAuthenticated) {
    return <div>Welcome, {user?.username}!</div>
  }

  return <button onClick={() => login('username', 'password')}>Login</button>
}
```

---

## Security Features

✅ **Password Hashing** - Bcrypt with salt (12 rounds)  
✅ **JWT Tokens** - Signed with HS256 algorithm  
✅ **Token Expiry** - 7-day expiration (configurable)  
✅ **Secure Secret Key** - 64-character random secret  
✅ **SQL Injection Protection** - SQLAlchemy ORM prevents SQL injection  
✅ **Email Validation** - Proper email format validation  

---

## Database

### SQLite (Default)

- **Location**: `backend/devcopilot.db`
- **Tables**: `users`, `code_snippets`, `debug_sessions`, `security_scans`, `user_preferences`

### PostgreSQL (Production)

To use PostgreSQL, update `.env`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
```

Then initialize:

```bash
cd backend
python database.py
```

---

## Configuration

### Environment Variables (.env)

```env
# Security
SECRET_KEY=your-secret-key-here  # Change this!
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days

# Database
DATABASE_URL=sqlite:///./devcopilot.db

# Gemini API
GEMINI_API_KEY=your-gemini-api-key
```

### Generate a Secure Secret Key

```python
import secrets
print(secrets.token_hex(32))
```

---

## Troubleshooting

### "Invalid credentials" error
- Check username and password are correct
- Usernames are case-sensitive

### "User already exists" error
- Username or email is already registered
- Try a different username/email

### Token expired
- Log out and log back in
- Token expires after 7 days

### Database errors
- Make sure `backend/devcopilot.db` exists
- Run `python database.py` to initialize

---

## Guest Mode Features

When not authenticated, you can still:
- ✅ Generate code
- ✅ Debug code
- ✅ Scan for security issues

However, authenticated users get:
- 📊 Usage history
- 💾 Saved code snippets
- ⚙️ Personalized preferences
- 📈 Usage analytics (coming soon)

---

## Next Steps

1. **Test authentication** - Create an account and log in
2. **Generate code** - Try the code generator while logged in
3. **Check the database** - Inspect `devcopilot.db` to see user data
4. **Customize** - Modify token expiry, add more user fields, etc.

For more information, see:
- [README.md](../README.md) - Main project documentation
- [API.md](../docs/API.md) - Full API reference
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines


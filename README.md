# NestJS Authentication API

A complete NestJS REST API with user authentication, JWT tokens, role-based access control, and Swagger documentation.

## Features

- ✅ User Registration
- ✅ User Login
- ✅ JWT Authentication
- ✅ **Role-Based Access Control (RBAC)**
- ✅ **Admin & Super Admin Roles**
- ✅ Protected Routes
- ✅ Swagger API Documentation
- ✅ TypeORM with SQLite
- ✅ Input Validation
- ✅ Password Hashing with bcrypt
- ✅ **User Management (Admin Only)**

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for database operations
- **SQLite** - Lightweight database
- **Passport JWT** - Authentication middleware
- **Swagger** - API documentation
- **class-validator** - DTO validation
- **bcryptjs** - Password hashing

## Installation

### Prerequisites

- Node.js (v16 or higher)
- Yarn package manager

### Setup

1. Install dependencies:
```bash
yarn install
```

2. Configure environment variables (optional):
Edit the `.env` file to customize settings:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
PORT=3000
```

## Running the Application

### Development Mode
```bash
yarn start:dev
```

### Production Mode
```bash
yarn build
yarn start:prod
```

The application will start on `http://localhost:3000`

## API Documentation

Once the application is running, you can access the **Swagger documentation** at:

**http://localhost:3000/api**

This provides an interactive interface to test all API endpoints.

## API Endpoints

### Authentication

#### 1. Register a New User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### 2. Register an Admin User
```http
POST /auth/register-admin
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123456",
  "firstName": "Admin",
  "lastName": "User",
  "role": "admin",
  "adminSecret": "super-secret-admin-key"
}
```

**Note:** Requires the admin secret key from `.env` file.

#### 3. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### 4. Get User Profile (Protected)
```http
GET /auth/profile
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Admin Endpoints

#### 5. Get All Users (Admin Only)
```http
GET /auth/users
Authorization: Bearer <admin_access_token>
```

#### 6. Delete User (Super Admin Only)
```http
DELETE /auth/users/:id
Authorization: Bearer <super_admin_access_token>
```

#### 7. Update User Role (Super Admin Only)
```http
PATCH /auth/users/:id/role
Authorization: Bearer <super_admin_access_token>
Content-Type: application/json

{
  "role": "admin"
}
```

📖 **For detailed admin documentation, see [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)**

## Testing with cURL

### Register a user:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Profile (replace TOKEN with your JWT):
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

## Project Structure

```
src/
├── auth/
│   ├── dto/
│   │   └── auth.dto.ts          # Data Transfer Objects
│   ├── auth.controller.ts       # Auth endpoints
│   ├── auth.service.ts          # Auth business logic
│   ├── auth.module.ts           # Auth module
│   ├── jwt.strategy.ts          # JWT strategy
│   └── jwt-auth.guard.ts        # JWT guard
├── user/
│   ├── user.entity.ts           # User database entity
│   ├── user.service.ts          # User service
│   └── user.module.ts           # User module
├── app.module.ts                # Root module
└── main.ts                      # Application entry point
```

## Security Features

- Passwords are hashed using bcrypt before storing
- JWT tokens expire after 24 hours (configurable)
- Input validation on all endpoints
- CORS enabled
- Protected routes require valid JWT token

## Database

The application uses SQLite by default for simplicity. The database file (`database.sqlite`) is created automatically in the project root.

To switch to PostgreSQL or MySQL, update the TypeORM configuration in `src/app.module.ts`.

## Available Scripts

- `yarn start` - Start the application
- `yarn start:dev` - Start in development mode with watch
- `yarn start:prod` - Start in production mode
- `yarn build` - Build the application
- `yarn test` - Run unit tests
- `yarn test:e2e` - Run end-to-end tests

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | Secret key for JWT signing | `your-secret-key` |
| `JWT_EXPIRES_IN` | JWT token expiration time | `24h` |
| `ADMIN_SECRET` | Secret key for admin registration | `super-secret-admin-key` |

## User Roles

- **USER** - Regular user (default)
- **ADMIN** - Admin user with elevated privileges  
- **SUPER_ADMIN** - Super admin with full system access

## License

MIT

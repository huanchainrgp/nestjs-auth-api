# NestJS Authentication API

A complete NestJS REST API with user authentication, JWT tokens, role-based access control, token revocation, and Swagger documentation.

## Features

- ✅ User Registration
- ✅ User Login
- ✅ JWT Authentication
- ✅ **Token Revocation System**
- ✅ **Role-Based Access Control (RBAC)**
- ✅ **Admin & Super Admin Roles**
- ✅ Protected Routes
- ✅ Swagger API Documentation
- ✅ **Prisma ORM** with PostgreSQL
- ✅ Input Validation
- ✅ Password Hashing with bcrypt
- ✅ **User Management (Admin Only)**
- ✅ **Token Version Control**

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **Prisma** - Next-generation ORM for database operations
- **PostgreSQL** - Robust relational database
- **Passport JWT** - Authentication middleware
- **Swagger** - API documentation
- **class-validator** - DTO validation
- **bcryptjs** - Password hashing

## Installation

### Prerequisites

- Node.js (v22 or higher recommended)
- Yarn package manager
- PostgreSQL database (or use Neon serverless PostgreSQL)

### Setup

1. Install dependencies:
```bash
yarn install
```

2. Configure environment variables:
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname?schema=public

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Admin
ADMIN_SECRET=super-secret-admin-key

# Server
PORT=3000
```

3. Generate Prisma Client:
```bash
yarn db:generate
```

4. Run database migrations:
```bash
yarn db:migrate
```

## Running the Application

### Development Mode
```bash
yarn dev
```

### Production Mode
```bash
yarn build
yarn start:prod
```

The application will start on `http://localhost:3000`

## Database Management

### Prisma Commands

```bash
# Generate Prisma Client (after schema changes)
yarn db:generate

# Create and apply migrations
yarn db:migrate

# Open Prisma Studio (GUI for database)
yarn db:studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

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

#### 8. Revoke User Tokens (Admin Only)
```http
POST /auth/users/:id/revoke-tokens
Authorization: Bearer <admin_access_token>
```

**Response:**
```json
{
  "message": "All user tokens have been revoked successfully"
}
```

This endpoint invalidates all existing JWT tokens for a specific user. The user will need to login again to get a new token.

📖 **For detailed admin documentation, see [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)**
📖 **For token revocation details, see [TOKEN_REVOCATION.md](./TOKEN_REVOCATION.md)**

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
│   ├── jwt.strategy.ts          # JWT strategy with token version validation
│   ├── jwt-auth.guard.ts        # JWT guard
│   ├── roles.guard.ts           # Role-based access guard
│   └── roles.decorator.ts       # Roles decorator
├── user/
│   ├── user.entity.ts           # User type definitions (Prisma)
│   ├── user.service.ts          # User service
│   └── user.module.ts           # User module
├── prisma/
│   ├── prisma.service.ts        # Prisma client service
│   └── prisma.module.ts         # Prisma module
├── app.module.ts                # Root module
└── main.ts                      # Application entry point

prisma/
├── schema.prisma                # Database schema
└── migrations/                  # Database migrations
```

## Security Features

- Passwords are hashed using bcrypt before storing
- JWT tokens expire after 24 hours (configurable)
- **Token version control for instant token revocation**
- Input validation on all endpoints
- CORS enabled
- Protected routes require valid JWT token
- Role-based access control (RBAC)
- Admin endpoints protected with role guards

## Token Revocation System

This API includes a sophisticated token revocation system using token versioning:

- Each user has a `tokenVersion` field in the database
- JWT tokens include the current `tokenVersion` in the payload
- When tokens are revoked, the user's `tokenVersion` is incremented
- All existing tokens become invalid instantly (no blacklist needed)
- User must login again to get a new token with the updated version

**Use Cases:**
- Password changed → Revoke all tokens
- Security breach → Force logout all sessions
- Admin action → Revoke user access
- Logout from all devices

See [TOKEN_REVOCATION.md](./TOKEN_REVOCATION.md) for detailed documentation.

## Database

The application uses **PostgreSQL** via **Prisma ORM**. We recommend using:
- Local PostgreSQL installation
- [Neon](https://neon.tech) - Serverless PostgreSQL (free tier available)
- [Supabase](https://supabase.com) - PostgreSQL with additional features
- [Railway](https://railway.app) - Easy PostgreSQL deployment

### Database Schema

```prisma
model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  password     String
  firstName    String?
  lastName     String?
  role         UserRole @default(USER)
  tokenVersion Int      @default(0)  // For token revocation
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
}
```

To view and edit your database, run:
```bash
yarn db:studio
```

## Available Scripts

- `yarn dev` - Start in development mode with watch
- `yarn start` - Start the application
- `yarn start:prod` - Start in production mode
- `yarn build` - Build the application
- `yarn test` - Run unit tests
- `yarn test:e2e` - Run end-to-end tests
- `yarn db:generate` - Generate Prisma Client
- `yarn db:migrate` - Create and apply database migrations
- `yarn db:studio` - Open Prisma Studio (database GUI)
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | Secret key for JWT signing | `your-secret-key` |
| `JWT_EXPIRES_IN` | JWT token expiration time | `24h` |
| `ADMIN_SECRET` | Secret key for admin registration | `super-secret-admin-key` |

## User Roles

- **USER** - Regular user (default)
- **ADMIN** - Admin user with elevated privileges  
- **SUPER_ADMIN** - Super admin with full system access

## Documentation

- [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) - Complete admin features guide
- [TOKEN_REVOCATION.md](./TOKEN_REVOCATION.md) - Token revocation system documentation
- [PRISMA_MIGRATION.md](./PRISMA_MIGRATION.md) - Prisma migration guide (for developers)

## API Testing

Access interactive API documentation at:
- **Swagger UI**: http://localhost:3000/api

Or use the provided cURL examples and Postman collections.

## License

MIT

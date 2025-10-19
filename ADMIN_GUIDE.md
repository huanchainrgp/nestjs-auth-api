# Admin Authentication Guide

This document describes the admin authentication features in the NestJS Auth API.

## User Roles

The API supports three user roles:

- **USER** - Regular user (default)
- **ADMIN** - Admin user with elevated privileges
- **SUPER_ADMIN** - Super admin with full system access

## Admin Endpoints

### 1. Register Admin

Register a new admin user. Requires a secret admin key.

**Endpoint:** `POST /auth/register-admin`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123456",
  "firstName": "Admin",
  "lastName": "User",
  "role": "admin",
  "adminSecret": "super-secret-admin-key"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### 2. Get All Users (Admin Only)

Retrieve a list of all users in the system.

**Endpoint:** `GET /auth/users`

**Authorization:** Bearer token (Admin or Super Admin)

**Response:**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  {
    "id": 2,
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

### 3. Delete User (Super Admin Only)

Delete a user from the system.

**Endpoint:** `DELETE /auth/users/:id`

**Authorization:** Bearer token (Super Admin only)

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

### 4. Update User Role (Super Admin Only)

Change a user's role.

**Endpoint:** `PATCH /auth/users/:id/role`

**Authorization:** Bearer token (Super Admin only)

**Request Body:**
```json
{
  "role": "admin"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "admin",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

## Role-Based Access Control

The API uses role-based access control (RBAC) to protect certain endpoints:

| Endpoint | Required Role |
|----------|---------------|
| `POST /auth/register` | None (Public) |
| `POST /auth/register-admin` | None (Requires admin secret) |
| `POST /auth/login` | None (Public) |
| `GET /auth/profile` | Any authenticated user |
| `GET /auth/users` | ADMIN or SUPER_ADMIN |
| `DELETE /auth/users/:id` | SUPER_ADMIN |
| `PATCH /auth/users/:id/role` | SUPER_ADMIN |

## Environment Variables

Add the following to your `.env` file:

```env
ADMIN_SECRET=super-secret-admin-key
```

**Security Note:** Change the `ADMIN_SECRET` to a strong, unique value in production!

## Testing Admin Features

### Using cURL

#### 1. Register an admin:
```bash
curl -X POST http://localhost:3000/auth/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123456",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin",
    "adminSecret": "super-secret-admin-key"
  }'
```

#### 2. Login as admin:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123456"
  }'
```

#### 3. Get all users (replace TOKEN):
```bash
curl -X GET http://localhost:3000/auth/users \
  -H "Authorization: Bearer TOKEN"
```

#### 4. Delete a user (Super Admin only):
```bash
curl -X DELETE http://localhost:3000/auth/users/1 \
  -H "Authorization: Bearer TOKEN"
```

#### 5. Update user role (Super Admin only):
```bash
curl -X PATCH http://localhost:3000/auth/users/1/role \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin"
  }'
```

## Implementation Details

### Role Guard

The `RolesGuard` checks if the authenticated user has the required role to access an endpoint.

### Roles Decorator

Use the `@Roles()` decorator to specify which roles can access an endpoint:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Get('admin-only')
adminOnly() {
  return 'This is admin only content';
}
```

### JWT Payload

The JWT token includes the user's role:

```typescript
{
  email: "user@example.com",
  sub: 1,
  role: "admin"
}
```

## Security Best Practices

1. **Keep the admin secret secure** - Never commit it to version control
2. **Use strong passwords** - Enforce minimum password length and complexity
3. **Limit super admin accounts** - Only create super admins when necessary
4. **Audit admin actions** - Log all administrative actions
5. **Use HTTPS** - Always use HTTPS in production
6. **Regular token rotation** - Consider implementing refresh tokens
7. **Rate limiting** - Implement rate limiting on authentication endpoints

## Migration Notes

If you already have existing users in your database, you'll need to run a migration to add the `role` column. The default role for existing users will be `USER`.

TypeORM will automatically add the `role` column when you restart the application (with `synchronize: true` in development).
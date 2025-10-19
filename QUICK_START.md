# Quick Start Guide - Admin Features

## 🎉 New Features Added

Your NestJS API now includes comprehensive admin authentication features:

### ✨ What's New

1. **Role-Based Access Control (RBAC)**
   - Three user roles: USER, ADMIN, SUPER_ADMIN
   - Role-based guards to protect endpoints

2. **Admin Registration**
   - Secure admin registration with secret key
   - Support for both ADMIN and SUPER_ADMIN roles

3. **User Management (Admin Only)**
   - View all users (Admin/Super Admin)
   - Delete users (Super Admin)
   - Update user roles (Super Admin)

4. **Enhanced JWT Tokens**
   - JWT tokens now include user roles
   - Role information available in protected routes

## 🚀 Quick Test Guide

### 1. Start the Application
```bash
cd /Users/admin/Documents/api-backend-testing/nestjs-auth-api
yarn start:dev
```

The server is running at: **http://localhost:3000**
Swagger docs at: **http://localhost:3000/api**

### 2. Register a Regular User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "Regular",
    "lastName": "User"
  }'
```

### 3. Register an Admin
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

**Save the access_token from the response!**

### 4. View All Users (Admin Only)
```bash
curl -X GET http://localhost:3000/auth/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 5. Register a Super Admin
```bash
curl -X POST http://localhost:3000/auth/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@example.com",
    "password": "super123456",
    "firstName": "Super",
    "lastName": "Admin",
    "role": "super_admin",
    "adminSecret": "super-secret-admin-key"
  }'
```

### 6. Update User Role (Super Admin Only)
```bash
curl -X PATCH http://localhost:3000/auth/users/1/role \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

### 7. Delete User (Super Admin Only)
```bash
curl -X DELETE http://localhost:3000/auth/users/1 \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN"
```

## 📋 API Endpoints Summary

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/auth/register` | POST | Public | Register regular user |
| `/auth/register-admin` | POST | Public* | Register admin (requires secret) |
| `/auth/login` | POST | Public | Login |
| `/auth/profile` | GET | Authenticated | Get own profile |
| `/auth/users` | GET | Admin+ | List all users |
| `/auth/users/:id` | DELETE | Super Admin | Delete user |
| `/auth/users/:id/role` | PATCH | Super Admin | Update user role |

\* Requires `ADMIN_SECRET` from environment variables

## 🔐 User Roles & Permissions

### USER (Default)
- Register and login
- View own profile
- Standard user operations

### ADMIN
- All USER permissions
- View all users in the system

### SUPER_ADMIN
- All ADMIN permissions
- Delete users
- Modify user roles
- Full system administration

## 📁 Files Modified/Created

### New Files:
- `src/auth/roles.decorator.ts` - Role decorator for endpoints
- `src/auth/roles.guard.ts` - Guard to check user roles
- `ADMIN_GUIDE.md` - Comprehensive admin documentation
- `QUICK_START.md` - This file

### Modified Files:
- `src/user/user.entity.ts` - Added role field
- `src/user/user.service.ts` - Added admin methods
- `src/auth/dto/auth.dto.ts` - Added admin DTOs
- `src/auth/auth.service.ts` - Added admin registration
- `src/auth/auth.controller.ts` - Added admin endpoints
- `src/auth/auth.module.ts` - Added RolesGuard
- `.env` - Added ADMIN_SECRET
- `README.md` - Updated with admin features

## 🛠️ Configuration

### Environment Variables (.env)
```env
# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Admin
ADMIN_SECRET=super-secret-admin-key

# Server
PORT=3000
```

⚠️ **Security Note:** Change `ADMIN_SECRET` in production!

## 🧪 Testing with Swagger

1. Open http://localhost:3000/api
2. Click "Authorize" button
3. Enter: `Bearer YOUR_TOKEN`
4. Test all endpoints interactively!

## 📖 Documentation

- **Main README:** [README.md](./README.md)
- **Admin Guide:** [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)
- **Swagger UI:** http://localhost:3000/api

## 🎯 Next Steps

1. Test all endpoints using Swagger UI
2. Change the `ADMIN_SECRET` in `.env`
3. Create your first admin user
4. Explore the admin endpoints
5. Review the security best practices in ADMIN_GUIDE.md

## ⚡ Common Commands

```bash
# Start development server
yarn start:dev

# Build for production
yarn build

# Run tests
yarn test

# View all yarn commands
yarn run
```

## 🐛 Troubleshooting

**Port already in use:**
```bash
lsof -ti:3000 | xargs kill -9
```

**Database issues:**
Delete `database.sqlite` and restart the server (development only!)

**Unauthorized errors:**
Make sure you include the JWT token in the Authorization header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

## 💡 Tips

1. Use different email addresses for testing different roles
2. Save tokens after registration/login for later use
3. Super Admin should be used sparingly
4. Regular users cannot access admin endpoints
5. Check Swagger for interactive API testing

---

**Happy coding! 🚀**
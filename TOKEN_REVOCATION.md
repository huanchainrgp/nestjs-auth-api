# Token Revocation Feature

## Overview

Đã thêm tính năng revoke tokens cho hệ thống authentication bằng cách sử dụng `tokenVersion` field trong bảng users.

## Cách hoạt động

### 1. Token Version Field
- Mỗi user có một `tokenVersion` field (mặc định = 0)
- Khi tạo JWT token, `tokenVersion` được thêm vào payload
- Khi validate token, hệ thống so sánh `tokenVersion` trong token với `tokenVersion` trong database

### 2. Revoke Tokens
- Khi revoke tokens, `tokenVersion` trong database được tăng lên 1
- Tất cả tokens cũ (với `tokenVersion` thấp hơn) sẽ bị invalid
- User phải login lại để có token mới với `tokenVersion` hiện tại

## Database Schema

```prisma
model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  password     String
  firstName    String?
  lastName     String?
  role         UserRole @default(USER)
  tokenVersion Int      @default(0)  // ← New field
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("users")
}
```

## API Endpoints

### Revoke User Tokens
```http
POST /auth/users/:id/revoke-tokens
Authorization: Bearer <admin_token>
```

**Access:** ADMIN, SUPER_ADMIN only

**Response:**
```json
{
  "message": "All user tokens have been revoked successfully"
}
```

## Use Cases

### 1. Password Changed
```typescript
// Sau khi đổi password, revoke tất cả tokens cũ
await authService.revokeUserTokens(userId);
```

### 2. Security Breach
```typescript
// Khi phát hiện account bị compromise
await authService.revokeUserTokens(userId);
```

### 3. Logout All Devices
```typescript
// User muốn logout khỏi tất cả devices
await authService.revokeUserTokens(userId);
```

### 4. Admin Force Logout User
```typescript
// Admin muốn force logout một user
POST /auth/users/:id/revoke-tokens
```

## Implementation Details

### 1. AuthService
```typescript
// Generate token with tokenVersion
const payload = { 
  email: user.email, 
  sub: user.id, 
  role: user.role,
  tokenVersion: user.tokenVersion  // Include in token
};

// Revoke tokens method
async revokeUserTokens(userId: number): Promise<void> {
  await this.userService.incrementTokenVersion(userId);
}
```

### 2. UserService
```typescript
async incrementTokenVersion(userId: number): Promise<User> {
  return this.prisma.user.update({
    where: { id: userId },
    data: {
      tokenVersion: {
        increment: 1,  // Tăng version lên 1
      },
    },
  });
}
```

### 3. JwtStrategy
```typescript
async validate(payload: any): Promise<User> {
  const user = await this.authService.validateUserById(payload.sub);
  if (!user) {
    throw new UnauthorizedException('User not found');
  }
  
  // Validate tokenVersion
  if (payload.tokenVersion !== user.tokenVersion) {
    throw new UnauthorizedException('Token has been revoked');
  }
  
  return user;
}
```

## Testing

### 1. Test Token Revocation
```bash
# 1. Login và lấy token
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
# Response: { "access_token": "..." }

# 2. Sử dụng token để access protected route
GET /auth/profile
Authorization: Bearer <token>
# Response: 200 OK

# 3. Admin revoke tokens của user
POST /auth/users/1/revoke-tokens
Authorization: Bearer <admin_token>
# Response: { "message": "All user tokens have been revoked successfully" }

# 4. Thử sử dụng token cũ lại
GET /auth/profile
Authorization: Bearer <old_token>
# Response: 401 Unauthorized - "Token has been revoked"

# 5. User phải login lại
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
# Response: New token with updated tokenVersion
```

### 2. Test với Postman/cURL
```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get profile (với token)
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer <token>"

# Revoke tokens (admin only)
curl -X POST http://localhost:3000/auth/users/1/revoke-tokens \
  -H "Authorization: Bearer <admin_token>"

# Thử dùng token cũ (sẽ fail)
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer <old_token>"
```

## Migration

Đã tạo migration để thêm `tokenVersion` field:

```bash
# Migration đã chạy
npx prisma migrate dev --name add_token_version
```

File migration: `prisma/migrations/20251020032737_add_token_version/migration.sql`

```sql
-- AlterTable
ALTER TABLE "users" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;
```

## Advantages

1. **Simple Implementation:** Chỉ cần 1 field integer
2. **Instant Revocation:** Tokens invalid ngay lập tức
3. **No Token Blacklist:** Không cần maintain blacklist database
4. **Scalable:** Performance tốt, không tăng database size
5. **Granular Control:** Có thể revoke per user

## Considerations

1. **User Experience:** User phải login lại sau khi tokens bị revoke
2. **Active Sessions:** Tất cả devices/sessions sẽ bị logout cùng lúc
3. **Token Expiry:** Vẫn nên set expiration time cho tokens
4. **Audit Trail:** Có thể thêm logging để track token revocation events

## Future Enhancements

1. **Selective Revocation:** Revoke specific devices/sessions
2. **Audit Log:** Log token revocation events
3. **Auto-revoke:** Auto-revoke sau một số lần failed login
4. **Notification:** Thông báo user khi tokens bị revoke
5. **Grace Period:** Cho phép tokens cũ valid trong một khoảng thời gian ngắn

## Summary

✅ Đã thêm `tokenVersion` field vào User model
✅ Đã update JWT payload để include tokenVersion
✅ Đã implement token validation với tokenVersion
✅ Đã thêm API endpoint để revoke tokens
✅ Đã tạo migration và update database
✅ Đã test và verify functionality

Token revocation feature đã hoạt động và ready để sử dụng! 🎉

# WebSocket Test Client

## Overview
Đây là một giao diện web đơn giản để test WebSocket functionality của NestJS application với JWT authentication.

## Truy cập Test Client

Sau khi chạy server NestJS:
```bash
yarn start:dev
```

Mở trình duyệt và truy cập:
```
http://localhost:3001/test
```

## Tính năng chính

### 🔐 Authentication Section
- **Login**: Đăng nhập và lấy JWT token
- **Register Admin**: Đăng ký tài khoản admin (cần admin secret)
- **JWT Token Field**: Hiển thị và chỉnh sửa token
- **Connection Status**: Hiển thị trạng thái kết nối WebSocket

### 🎯 WebSocket Actions
- **Room Management**: Join/Leave rooms
- **Messaging**: Send messages (room/private/broadcast)
- **System Actions**: Get online users, ping server
- **Admin Broadcast**: Send admin announcements (admin only)

### 📋 Event Logs
- Real-time logging của tất cả WebSocket events
- Color-coded messages (error, success, warning, info)
- Auto-scroll option
- Clear logs functionality

### 👥 Online Users
- Hiển thị danh sách users đang online
- Show user roles (Admin badge)

### 💬 Messages
- Hiển thị messages từ WebSocket
- Support private, room, và broadcast messages
- Admin announcements được highlight đặc biệt

## Hướng dẫn sử dụng

### Bước 1: Authentication
1. Nhập email và password (mặc định: admin@example.com / password123)
2. Click **Login & Get Token** để lấy JWT token
3. Hoặc click **Register Admin** để tạo tài khoản admin mới

### Bước 2: Connect WebSocket
1. JWT token sẽ tự động xuất hiện trong field
2. Click **Connect WebSocket** để kết nối
3. Connection status sẽ chuyển thành "Connected" màu xanh

### Bước 3: Test WebSocket Features

**Join Room:**
1. Nhập tên room (ví dụ: "general")
2. Click **Join Room**

**Send Messages:**
1. Nhập message trong text field
2. Chọn message type:
   - **Send to Room**: Gửi đến room hiện tại
   - **Broadcast to All**: Gửi đến tất cả users
   - **Private Message**: Gửi riêng (cần User ID)
3. Click **Send Message**

**System Actions:**
- **Get Online Users**: Lấy danh sách users online
- **Ping Server**: Test connection latency
- **Admin Broadcast**: Send system-wide announcement (admin only)

## Test Scenarios

### Scenario 1: Basic Chat
1. Login và connect WebSocket
2. Join room "general"
3. Send message to room
4. Watch logs for user_joined và new_message events

### Scenario 2: Private Messaging
1. Connect với 2 browser tabs (hoặc incognito)
2. Login với 2 tài khoản khác nhau
3. Get online users để lấy User IDs
4. Send private message từ tab này sang tab kia

### Scenario 3: Admin Features
1. Login với admin account
2. Connect WebSocket
3. Use Admin Broadcast để gửi system announcement
4. Verify announcement xuất hiện trên tất cả connected clients

### Scenario 4: Token Revocation
1. Login và connect WebSocket
2. Từ admin panel, revoke user tokens
3. Try gửi message → should receive "Token has been revoked" error
4. Login lại để get fresh token

## Debugging

### Connection Issues
- Check console logs trong browser DevTools
- Verify JWT token format và validity
- Ensure server đang chạy trên port 3000

### Authentication Errors
- Check JWT token expiration
- Verify user exists trong database
- Check tokenVersion matching

### Message Issues
- Ensure WebSocket connected (green status)
- Check room name spelling
- Verify target user ID cho private messages

## Browser Compatibility
- Chrome/Chromium: ✅ Full support
- Firefox: ✅ Full support  
- Safari: ✅ Full support
- Edge: ✅ Full support

## Development Notes

### File Structure
```
public/
├── index.html          # Main HTML page
├── styles.css          # CSS styling
└── websocket-client.js # JavaScript WebSocket client
```

### URLs
- Test Client: `http://localhost:3001/test`
- API Endpoints: `http://localhost:3001/auth/*`
- WebSocket: `ws://localhost:3001`

### Customization
Bạn có thể modify các files trong thư mục `public/` để:
- Thay đổi UI styling
- Thêm new WebSocket events
- Customize logging format
- Add new test scenarios

## Security Notes
- Test client chỉ nên dùng cho development
- Đừng expose admin secrets trong production
- JWT tokens được lưu trong localStorage (dev only)
- CORS settings hiện tại allow all origins (dev only)
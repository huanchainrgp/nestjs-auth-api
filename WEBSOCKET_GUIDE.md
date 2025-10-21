# WebSocket Integration Guide

## Overview
This NestJS application now supports WebSocket connections with JWT authentication. Users can connect to WebSocket endpoints using their JWT tokens for real-time communication.

## Features

### 🔐 Authentication
- JWT token-based authentication for WebSocket connections
- Token revocation support (checks tokenVersion)
- Multiple authentication methods:
  - Authorization header: `Bearer <token>`
  - Query parameter: `?token=<token>`
  - Socket.io auth object: `{ auth: { token: '<token>' } }`

### 📡 WebSocket Events

#### Connection Events
- **Connection**: Automatic when client connects
- **Disconnection**: Automatic cleanup when client disconnects

#### Authenticated Events (require JWT token)

1. **join_room**
   ```javascript
   socket.emit('join_room', { room: 'room-name' });
   ```

2. **leave_room**
   ```javascript
   socket.emit('leave_room', { room: 'room-name' });
   ```

3. **send_message**
   ```javascript
   // Send to room
   socket.emit('send_message', { 
     room: 'room-name', 
     message: 'Hello everyone!' 
   });
   
   // Send private message
   socket.emit('send_message', { 
     to: userId, 
     message: 'Private message' 
   });
   
   // Broadcast to all
   socket.emit('send_message', { 
     message: 'Global message' 
   });
   ```

4. **get_online_users**
   ```javascript
   socket.emit('get_online_users');
   ```

5. **ping**
   ```javascript
   socket.emit('ping'); // Returns pong with user info
   ```

6. **admin_broadcast** (Admin only)
   ```javascript
   socket.emit('admin_broadcast', { 
     message: 'System maintenance in 10 minutes' 
   });
   ```

### 📥 Incoming Events (Server to Client)

1. **user_joined** - When user joins a room
2. **user_left** - When user leaves a room
3. **user_online** - When user comes online
4. **user_offline** - When user goes offline
5. **new_message** - New message received
6. **notification** - System notification
7. **admin_announcement** - Admin broadcast message

## Client Implementation Examples

### JavaScript/TypeScript (Browser)

```javascript
import { io } from 'socket.io-client';

// Connect with token in auth object (recommended)
const socket = io('ws://localhost:3000', {
  auth: {
    token: 'your-jwt-token-here'
  }
});

// Or connect with token in query
const socket = io('ws://localhost:3000?token=your-jwt-token-here');

// Listen for connection
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

// Join a room
socket.emit('join_room', { room: 'general' });

// Send message
socket.emit('send_message', { 
  room: 'general', 
  message: 'Hello everyone!' 
});

// Listen for messages
socket.on('new_message', (data) => {
  console.log('New message:', data);
});

// Listen for user events
socket.on('user_joined', (data) => {
  console.log('User joined:', data);
});

socket.on('user_online', (data) => {
  console.log('User online:', data);
});

// Handle errors
socket.on('exception', (error) => {
  console.error('WebSocket error:', error);
});
```

### React Hook Example

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useWebSocket = (token: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    const newSocket = io('ws://localhost:3000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to WebSocket');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from WebSocket');
    });

    newSocket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('exception', (error) => {
      console.error('WebSocket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  const sendMessage = (messageData: any) => {
    if (socket && isConnected) {
      socket.emit('send_message', messageData);
    }
  };

  const joinRoom = (room: string) => {
    if (socket && isConnected) {
      socket.emit('join_room', { room });
    }
  };

  return {
    socket,
    isConnected,
    messages,
    sendMessage,
    joinRoom
  };
};
```

### Node.js Client

```javascript
const { io } = require('socket.io-client');

const socket = io('ws://localhost:3000', {
  auth: {
    token: 'your-jwt-token-here'
  }
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
  
  // Get online users
  socket.emit('get_online_users');
  
  // Join room
  socket.emit('join_room', { room: 'developers' });
});

socket.on('new_message', (data) => {
  console.log(`Message from ${data.from.email}: ${data.message}`);
});
```

## Authentication Methods

### 1. Authorization Header
```javascript
const socket = io('ws://localhost:3000', {
  extraHeaders: {
    Authorization: 'Bearer your-jwt-token-here'
  }
});
```

### 2. Query Parameter
```javascript
const socket = io('ws://localhost:3000?token=your-jwt-token-here');
```

### 3. Auth Object (Recommended)
```javascript
const socket = io('ws://localhost:3000', {
  auth: {
    token: 'your-jwt-token-here'
  }
});
```

## Security Features

### Token Validation
- JWT signature verification
- Token expiration check
- User existence verification
- Token version matching (for revocation)

### Role-based Access
- Admin-only events (admin_broadcast)
- User data attached to socket for authorization

### Error Handling
- Invalid token → WebSocket exception
- Expired token → Connection rejected
- Revoked token → Connection rejected

## Development Testing

### Using Socket.io Admin UI
```bash
npm install -g @socket.io/admin-ui
socket-io-admin-ui
```

### Using Postman or Insomnia
1. Create WebSocket connection to `ws://localhost:3000`
2. Add authentication via query param or custom header
3. Test events and responses

## Production Considerations

1. **CORS Configuration**: Update CORS settings for production domains
2. **Rate Limiting**: Implement rate limiting for WebSocket events
3. **Scaling**: Use Redis adapter for multiple server instances
4. **Monitoring**: Add logging and metrics for WebSocket events
5. **SSL/TLS**: Use WSS for secure connections

## Troubleshooting

### Common Issues

1. **Connection Rejected**
   - Check JWT token validity
   - Verify token format in authentication
   - Check server logs for detailed errors

2. **Events Not Working**
   - Ensure proper authentication for protected events
   - Check event name spelling
   - Verify payload structure

3. **Token Revocation**
   - Tokens with old tokenVersion will be rejected
   - User needs to login again to get new token

### Debug Mode
Enable debug mode for detailed logs:
```javascript
const socket = io('ws://localhost:3000', {
  auth: { token: 'your-token' },
  forceNew: true,
  reconnection: true,
  timeout: 5000,
  debug: true
});
```
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from './ws-jwt.guard';

interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      id: number;
      email: string;
      role: string;
      tokenVersion: number;
    };
  };
}

@WebSocketGateway({
  cors: {
    origin: '*', // Configure this properly for production
    credentials: true,
  },
  namespace: '/', // Default namespace
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('AppGateway');
  private connectedUsers = new Map<number, string>(); // userId -> socketId

  async handleConnection(client: Socket) {
    try {
      // Authentication will be handled by the guard in individual message handlers
      // For connection, we'll accept all and authenticate per message
      this.logger.log(`Client connected: ${client.id}`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove user from connected users if authenticated
    if (client.data?.user) {
      this.connectedUsers.delete(client.data.user.id);
      
      // Notify other users about disconnect if needed
      this.server.emit('user_offline', {
        userId: client.data.user.id,
        email: client.data.user.email,
      });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    const user = client.data.user;
    await client.join(data.room);
    
    this.logger.log(`User ${user.email} joined room: ${data.room}`);
    
    // Notify other users in the room
    client.to(data.room).emit('user_joined', {
      userId: user.id,
      email: user.email,
      room: data.room,
    });

    return {
      success: true,
      message: `Joined room: ${data.room}`,
    };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    const user = client.data.user;
    await client.leave(data.room);
    
    this.logger.log(`User ${user.email} left room: ${data.room}`);
    
    // Notify other users in the room
    client.to(data.room).emit('user_left', {
      userId: user.id,
      email: user.email,
      room: data.room,
    });

    return {
      success: true,
      message: `Left room: ${data.room}`,
    };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room?: string; message: string; to?: number },
  ) {
    const user = client.data.user;
    
    const messagePayload = {
      id: Date.now(), // Simple ID generation
      from: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      message: data.message,
      timestamp: new Date(),
    };

    if (data.room) {
      // Send to room
      client.to(data.room).emit('new_message', messagePayload);
      this.logger.log(`Message sent to room ${data.room} by ${user.email}`);
    } else if (data.to) {
      // Send to specific user
      const targetSocketId = this.connectedUsers.get(data.to);
      if (targetSocketId) {
        this.server.to(targetSocketId).emit('new_message', messagePayload);
        this.logger.log(`Private message sent from ${user.email} to user ${data.to}`);
      } else {
        return {
          success: false,
          message: 'User not online',
        };
      }
    } else {
      // Broadcast to all
      client.broadcast.emit('new_message', messagePayload);
      this.logger.log(`Broadcast message sent by ${user.email}`);
    }

    return {
      success: true,
      message: 'Message sent',
    };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('get_online_users')
  async handleGetOnlineUsers(@ConnectedSocket() client: AuthenticatedSocket) {
    const user = client.data.user;
    
    // Store user as online
    this.connectedUsers.set(user.id, client.id);
    
    // Notify others that user is online
    client.broadcast.emit('user_online', {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return list of online users
    const onlineUsers = Array.from(this.connectedUsers.keys());
    
    return {
      success: true,
      onlineUsers,
      totalOnline: onlineUsers.length,
    };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('ping')
  async handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    const user = client.data.user;
    
    return {
      success: true,
      message: 'pong',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      timestamp: new Date(),
    };
  }

  // Admin-only events
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('admin_broadcast')
  async handleAdminBroadcast(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { message: string },
  ) {
    const user = client.data.user;
    
    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized: Admin access required',
      };
    }

    const broadcastPayload = {
      type: 'admin_announcement',
      message: data.message,
      from: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      timestamp: new Date(),
    };

    // Broadcast to all connected clients
    this.server.emit('admin_announcement', broadcastPayload);
    
    this.logger.log(`Admin broadcast sent by ${user.email}: ${data.message}`);

    return {
      success: true,
      message: 'Admin broadcast sent',
    };
  }

  // Method to send notifications from other services
  async sendNotificationToUser(userId: number, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
      return true;
    }
    return false;
  }

  // Method to broadcast to all users
  async broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Method to send to specific room
  async sendToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }
}
const redisClient = require('../config/redis');
const Room = require('../models/Room');
const { ROOM_TTL } = require('../constants');

class RoomService {
  constructor() {
    this.roomPrefix = 'room:';
    this.userRoomPrefix = 'user_room:';
  }

  async createRoom(hostId, hostName) {
    try {
      console.log('🏗️ Creating room for:', { hostId, hostName });
      const room = new Room(hostId, hostName);
      console.log('📦 Room object created:', room.id);

      console.log('💾 About to save room...');
      await this.saveRoom(room);
      console.log('✅ Room saved successfully');

      console.log('🔗 About to set user room association...');
      await this.setUserRoom(hostId, room.id);
      console.log('✅ User room association set successfully');

      console.log('🎉 Room creation completed:', room.id);
      return room;
    } catch (error) {
      console.error('❌ Room creation failed:', error.message);
      throw new Error(`Failed to create room: ${error.message}`);
    }
  }

  async getRoom(roomId) {
    try {
      // Normalize room ID to lowercase for consistent lookup
      const normalizedRoomId = roomId.toLowerCase();
      const key = `${this.roomPrefix}${normalizedRoomId}`;

      console.log('🔍 Looking for room:', { roomId, normalizedRoomId, key });
      const roomData = await redisClient.get(key);
      console.log('📦 Room data found:', roomData ? 'YES' : 'NO');

      if (!roomData) {
        return null;
      }
      return Room.fromJSON(JSON.parse(roomData));
    } catch (error) {
      console.error('❌ Failed to get room:', error);
      throw new Error(`Failed to get room: ${error.message}`);
    }
  }

  async saveRoom(room) {
    try {
      const roomData = JSON.stringify(room.toJSON());
      // Normalize room ID to lowercase for consistent storage
      const normalizedRoomId = room.id.toLowerCase();
      const key = `${this.roomPrefix}${normalizedRoomId}`;

      console.log('💾 Saving room:', { roomId: room.id, normalizedRoomId, key });
      await redisClient.set(key, roomData, { EX: ROOM_TTL });
      console.log('✅ Room saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to save room:', error);
      throw new Error(`Failed to save room: ${error.message}`);
    }
  }

  async deleteRoom(roomId) {
    try {
      const room = await this.getRoom(roomId);
      if (room) {
        // Remove user-room mappings
        for (const user of room.getAllUsers()) {
          await this.removeUserRoom(user.id);
        }
      }
      // Normalize room ID to lowercase for consistent deletion
      const normalizedRoomId = roomId.toLowerCase();
      await redisClient.del(`${this.roomPrefix}${normalizedRoomId}`);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete room: ${error.message}`);
    }
  }

  async joinRoom(roomId, userId, userName) {
    try {
      const room = await this.getRoom(roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      // Check if user is already in a room
      const existingRoomId = await this.getUserRoom(userId);
      if (existingRoomId && existingRoomId !== roomId) {
        throw new Error('User is already in another room');
      }

      // Check if user is already in this room
      const existingUser = room.getUser(userId);
      if (existingUser) {
        // User is reconnecting
        room.markUserConnected(userId);
      } else {
        // New user joining
        if (room.status !== 'waiting') {
          throw new Error('Room is not accepting new players');
        }
        
        if (room.getConnectedUsers().length >= 6) {
          throw new Error('Room is full');
        }
        
        room.addUser(userId, userName);
      }

      await this.saveRoom(room);
      await this.setUserRoom(userId, roomId);
      return room;
    } catch (error) {
      throw new Error(`Failed to join room: ${error.message}`);
    }
  }

  async leaveRoom(roomId, userId) {
    try {
      const room = await this.getRoom(roomId);
      if (!room) {
        return false;
      }

      const user = room.getUser(userId);
      if (!user) {
        return false;
      }

      // Mark user as disconnected instead of removing
      room.markUserDisconnected(userId);
      
      // If host left and room is waiting, transfer host to another user
      if (user.isHost && room.status === 'waiting') {
        const connectedUsers = room.getConnectedUsers();
        if (connectedUsers.length > 0) {
          const newHost = connectedUsers[0];
          newHost.isHost = true;
          room.hostId = newHost.id;
        }
      }

      await this.saveRoom(room);
      await this.removeUserRoom(userId);
      return true;
    } catch (error) {
      throw new Error(`Failed to leave room: ${error.message}`);
    }
  }

  async setUserRoom(userId, roomId) {
    try {
      console.log('🔗 Setting user room association:', { userId, roomId });
      const key = `${this.userRoomPrefix}${userId}`;
      console.log('🔑 Redis key:', key);

      await redisClient.setEx(key, ROOM_TTL, roomId);
      console.log('✅ User room association set successfully');
    } catch (error) {
      console.error('❌ Failed to set user room:', error.message);
      throw new Error(`Failed to set user room: ${error.message}`);
    }
  }

  async getUserRoom(userId) {
    try {
      return await redisClient.get(`${this.userRoomPrefix}${userId}`);
    } catch (error) {
      throw new Error(`Failed to get user room: ${error.message}`);
    }
  }

  async removeUserRoom(userId) {
    try {
      await redisClient.del(`${this.userRoomPrefix}${userId}`);
    } catch (error) {
      throw new Error(`Failed to remove user room: ${error.message}`);
    }
  }

  async getRoomStats(roomId) {
    try {
      const room = await this.getRoom(roomId);
      if (!room) {
        return null;
      }

      return {
        id: room.id,
        status: room.status,
        totalUsers: room.getAllUsers().length,
        connectedUsers: room.getConnectedUsers().length,
        availablePlayers: room.availablePlayers.length,
        currentRound: room.round,
        maxRounds: room.maxRounds,
        createdAt: room.createdAt
      };
    } catch (error) {
      throw new Error(`Failed to get room stats: ${error.message}`);
    }
  }

  async handleUserReconnection(userId, socketId) {
    try {
      const roomId = await this.getUserRoom(userId);
      if (!roomId) {
        return null;
      }

      const room = await this.getRoom(roomId);
      if (!room) {
        await this.removeUserRoom(userId);
        return null;
      }

      const user = room.getUser(userId);
      if (!user) {
        await this.removeUserRoom(userId);
        return null;
      }

      // Mark user as connected
      room.markUserConnected(userId);
      await this.saveRoom(room);
      
      return { room, user };
    } catch (error) {
      throw new Error(`Failed to handle user reconnection: ${error.message}`);
    }
  }

  async cleanupExpiredRooms() {
    try {
      // This would be implemented with a scheduled job
      // For now, Redis TTL handles cleanup automatically
      console.log('Cleanup job would run here');
    } catch (error) {
      console.error('Failed to cleanup expired rooms:', error);
    }
  }
}

module.exports = new RoomService();
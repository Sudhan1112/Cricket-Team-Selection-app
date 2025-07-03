const roomService = require('../services/roomService');
const { SOCKET_EVENTS, TURN_TIME_LIMIT } = require('../constants');

class SocketController {
  constructor() {
    this.turnTimers = new Map(); // Store turn timers
    this.userSockets = new Map(); // Store user socket mapping
  }

  socketHandler(socket, io) {
    console.log(`Socket connected: ${socket.id}`);
    
    // Store socket reference
    socket.userId = null;
    socket.roomId = null;

    // Handle user joining a room
    socket.on(SOCKET_EVENTS.JOIN_ROOM, async (data) => {
      try {
        const { roomId, userId, userName } = data;
        
        if (!roomId || !userId || !userName) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Missing required fields' });
          return;
        }

        // Leave current room if any
        if (socket.roomId) {
          await this.handleLeaveRoom(socket, io);
        }

        const room = await roomService.joinRoom(roomId, userId, userName);
        
        // Update socket data
        socket.userId = userId;
        socket.roomId = roomId;
        socket.join(roomId);
        
        // Store user socket mapping
        this.userSockets.set(userId, socket.id);

        // Send room data to user
        socket.emit(SOCKET_EVENTS.ROOM_JOINED, {
          room: this.serializeRoom(room),
          userId: userId
        });

        // Notify other users in the room
        socket.to(roomId).emit(SOCKET_EVENTS.USER_JOINED, {
          user: room.getUser(userId),
          room: this.serializeRoom(room)
        });

        // Send updated room state to all users
        io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, {
          room: this.serializeRoom(room)
        });

        console.log(`User ${userName} (${userId}) joined room ${roomId}`);
      } catch (error) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
      }
    });

    // Handle starting selection
    socket.on(SOCKET_EVENTS.START_SELECTION, async () => {
      try {
        if (!socket.roomId || !socket.userId) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Not in a room' });
          return;
        }

        const room = await roomService.getRoom(socket.roomId);
        if (!room) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Room not found' });
          return;
        }

        const user = room.getUser(socket.userId);
        if (!user || !user.isHost) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Only host can start selection' });
          return;
        }

        if (!room.canStart()) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Cannot start selection' });
          return;
        }

        room.startSelection();
        await roomService.saveRoom(room);

        // Notify all users that selection has started
        io.to(socket.roomId).emit(SOCKET_EVENTS.SELECTION_STARTED, {
          room: this.serializeRoom(room),
          turnOrder: room.turnOrder
        });

        // Start the first turn
        await this.startTurn(room, io);

        console.log(`Selection started in room ${socket.roomId}`);
      } catch (error) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
      }
    });

    // Handle player selection
    socket.on(SOCKET_EVENTS.SELECT_PLAYER, async (data) => {
      try {
        const { playerId } = data;
        
        if (!socket.roomId || !socket.userId) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Not in a room' });
          return;
        }

        if (!playerId) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Player ID is required' });
          return;
        }

        const room = await roomService.getRoom(socket.roomId);
        if (!room) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Room not found' });
          return;
        }

        const selectedPlayer = room.selectPlayer(socket.userId, playerId);
        await roomService.saveRoom(room);

        // Clear the turn timer
        this.clearTurnTimer(socket.roomId);

        // Notify all users about the selection
        io.to(socket.roomId).emit(SOCKET_EVENTS.PLAYER_SELECTED, {
          userId: socket.userId,
          userName: room.getUser(socket.userId).name,
          player: selectedPlayer,
          room: this.serializeRoom(room)
        });

        // Check if selection is complete
        if (room.isSelectionComplete()) {
          io.to(socket.roomId).emit(SOCKET_EVENTS.SELECTION_ENDED, {
            results: room.getFinalResults(),
            room: this.serializeRoom(room)
          });
          console.log(`Selection completed in room ${socket.roomId}`);
        } else {
          // Move to next turn
          const nextUserId = room.nextTurn();
          await roomService.saveRoom(room);
          await this.startTurn(room, io);
        }

        console.log(`Player ${selectedPlayer.name} selected by ${socket.userId} in room ${socket.roomId}`);
      } catch (error) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      try {
        if (socket.roomId && socket.userId) {
          await this.handleLeaveRoom(socket, io);
        }
        
        // Remove from user socket mapping
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
        }
        
        console.log(`Socket disconnected: ${socket.id}`);
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });

    // Handle reconnection
    socket.on('reconnect', async (data) => {
      try {
        const { userId } = data;
        
        if (!userId) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'User ID is required for reconnection' });
          return;
        }

        const reconnectionData = await roomService.handleUserReconnection(userId, socket.id);
        
        if (reconnectionData) {
          const { room, user } = reconnectionData;
          
          socket.userId = userId;
          socket.roomId = room.id;
          socket.join(room.id);
          
          // Update socket mapping
          this.userSockets.set(userId, socket.id);
          
          // Send current room state
          socket.emit(SOCKET_EVENTS.ROOM_JOINED, {
            room: this.serializeRoom(room),
            userId: userId,
            reconnected: true
          });
          
          // Notify other users about reconnection
          socket.to(room.id).emit(SOCKET_EVENTS.USER_JOINED, {
            user: user,
            room: this.serializeRoom(room),
            reconnected: true
          });
          
          console.log(`User ${userId} reconnected to room ${room.id}`);
        } else {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'No active room found' });
        }
      } catch (error) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
      }
    });
  }

  async handleLeaveRoom(socket, io) {
    try {
      if (socket.roomId && socket.userId) {
        const room = await roomService.getRoom(socket.roomId);
        
        if (room) {
          // Clear turn timer if it's current user's turn
          if (room.currentTurnUser === socket.userId) {
            this.clearTurnTimer(socket.roomId);
          }
          
          await roomService.leaveRoom(socket.roomId, socket.userId);
          
          // Notify other users
          socket.to(socket.roomId).emit(SOCKET_EVENTS.USER_LEFT, {
            userId: socket.userId,
            userName: room.getUser(socket.userId)?.name || 'Unknown'
          });
          
          // Send updated room state
          const updatedRoom = await roomService.getRoom(socket.roomId);
          if (updatedRoom) {
            io.to(socket.roomId).emit(SOCKET_EVENTS.ROOM_UPDATED, {
              room: this.serializeRoom(updatedRoom)
            });
          }
        }
        
        socket.leave(socket.roomId);
        socket.roomId = null;
      }
    } catch (error) {
      console.error('Error handling leave room:', error);
    }
  }

  async startTurn(room, io) {
    try {
      const currentUserId = room.getCurrentTurnUser();
      
      if (!currentUserId) {
        return;
      }

      // Notify all users about the turn
      io.to(room.id).emit(SOCKET_EVENTS.TURN_STARTED, {
        userId: currentUserId,
        userName: room.getUser(currentUserId).name,
        timeLimit: TURN_TIME_LIMIT,
        room: this.serializeRoom(room)
      });

      // Set turn timer
      this.setTurnTimer(room.id, currentUserId, async () => {
        await this.handleTurnTimeout(room.id, currentUserId, io);
      });

      console.log(`Turn started for user ${currentUserId} in room ${room.id}`);
    } catch (error) {
      console.error('Error starting turn:', error);
    }
  }

  async handleTurnTimeout(roomId, userId, io) {
    try {
      const room = await roomService.getRoom(roomId);
      if (!room || room.currentTurnUser !== userId) {
        return;
      }

      // Auto-select a random player
      const selectedPlayer = room.autoSelectPlayer(userId);
      await roomService.saveRoom(room);

      // Notify all users about auto-selection
      io.to(roomId).emit(SOCKET_EVENTS.AUTO_SELECTED, {
        userId: userId,
        userName: room.getUser(userId).name,
        player: selectedPlayer,
        room: this.serializeRoom(room)
      });

      // Check if selection is complete
      if (room.isSelectionComplete()) {
        io.to(roomId).emit(SOCKET_EVENTS.SELECTION_ENDED, {
          results: room.getFinalResults(),
          room: this.serializeRoom(room)
        });
        console.log(`Selection completed in room ${roomId}`);
      } else {
        // Move to next turn
        const nextUserId = room.nextTurn();
        await roomService.saveRoom(room);
        await this.startTurn(room, io);
      }

      console.log(`Auto-selected player ${selectedPlayer.name} for user ${userId} in room ${roomId}`);
    } catch (error) {
      console.error('Error handling turn timeout:', error);
    }
  }

  setTurnTimer(roomId, userId, callback) {
    // Clear existing timer
    this.clearTurnTimer(roomId);
    
    // Set new timer
    const timer = setTimeout(callback, TURN_TIME_LIMIT);
    this.turnTimers.set(roomId, timer);
  }

  clearTurnTimer(roomId) {
    const timer = this.turnTimers.get(roomId);
    if (timer) {
      clearTimeout(timer);
      this.turnTimers.delete(roomId);
    }
  }

  serializeRoom(room) {
    return {
      id: room.id,
      hostId: room.hostId,
      status: room.status,
      users: room.getAllUsers().map(user => ({
        id: user.id,
        name: user.name,
        isHost: user.isHost,
        selectedPlayers: user.selectedPlayers,
        isConnected: user.isConnected,
        selectedPlayersCount: user.selectedPlayers.length
      })),
      availablePlayers: room.availablePlayers,
      availablePlayersCount: room.availablePlayers.length,
      turnOrder: room.turnOrder,
      currentTurnUser: room.currentTurnUser,
      currentTurnIndex: room.currentTurnIndex,
      round: room.round,
      maxRounds: room.maxRounds,
      createdAt: room.createdAt,
      turnTimeRemaining: room.getTurnTimeRemaining()
    };
  }
}

const socketController = new SocketController();

module.exports = {
  socketHandler: (socket, io) => socketController.socketHandler(socket, io)
};
const express = require('express');
const Joi = require('joi');
const roomService = require('../services/roomService');
const { CRICKET_PLAYERS } = require('../constants');

const router = express.Router();

// Validation schemas
const createRoomSchema = Joi.object({
  hostId: Joi.string().required(),
  hostName: Joi.string().min(2).max(50).required()
});

const joinRoomSchema = Joi.object({
  roomId: Joi.string().required(),
  userId: Joi.string().required(),
  userName: Joi.string().min(2).max(50).required()
});

// Create a new room
router.post('/create', async (req, res) => {
  try {
    console.log('📥 Room creation request received:', req.body);
    const { error, value } = createRoomSchema.validate(req.body);
    if (error) {
      console.log('❌ Validation error:', error.details);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details
      });
    }

    const { hostId, hostName } = value;
    console.log('🏗️ Creating room for:', { hostId, hostName });
    const room = await roomService.createRoom(hostId, hostName);
    console.log('✅ Room created successfully:', room.id);

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: {
        roomId: room.id,
        hostId: room.hostId,
        status: room.status,
        createdAt: room.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get room details
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    
    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'Room ID is required'
      });
    }

    const room = await roomService.getRoom(roomId);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: room.id,
        hostId: room.hostId,
        status: room.status,
        users: room.getAllUsers().map(user => ({
          id: user.id,
          name: user.name,
          isHost: user.isHost,
          isConnected: user.isConnected,
          selectedPlayersCount: user.selectedPlayers.length
        })),
        availablePlayersCount: room.availablePlayers.length,
        round: room.round,
        maxRounds: room.maxRounds,
        createdAt: room.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get room statistics
router.get('/:roomId/stats', async (req, res) => {
  try {
    const { roomId } = req.params;
    
    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: 'Room ID is required'
      });
    }

    const stats = await roomService.getRoomStats(roomId);
    
    if (!stats) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Join a room (alternative to socket-based joining)
router.post('/join', async (req, res) => {
  try {
    const { error, value } = joinRoomSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details
      });
    }

    const { roomId, userId, userName } = value;
    const room = await roomService.joinRoom(roomId, userId, userName);

    res.json({
      success: true,
      message: 'Joined room successfully',
      data: {
        roomId: room.id,
        userId: userId,
        status: room.status,
        users: room.getAllUsers().map(user => ({
          id: user.id,
          name: user.name,
          isHost: user.isHost,
          isConnected: user.isConnected
        }))
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Leave a room
router.post('/:roomId/leave', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;
    
    if (!roomId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Room ID and User ID are required'
      });
    }

    const success = await roomService.leaveRoom(roomId, userId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Room or user not found'
      });
    }

    res.json({
      success: true,
      message: 'Left room successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get available players
router.get('/players/available', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        players: CRICKET_PLAYERS,
        count: CRICKET_PLAYERS.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get players by role
router.get('/players/role/:role', (req, res) => {
  try {
    const { role } = req.params;
    const players = CRICKET_PLAYERS.filter(
      player => player.role.toLowerCase() === role.toLowerCase()
    );

    res.json({
      success: true,
      data: {
        players,
        count: players.length,
        role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete a room (admin/host only)
router.delete('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;
    
    if (!roomId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Room ID and User ID are required'
      });
    }

    const room = await roomService.getRoom(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const user = room.getUser(userId);
    if (!user || !user.isHost) {
      return res.status(403).json({
        success: false,
        message: 'Only the host can delete the room'
      });
    }

    await roomService.deleteRoom(roomId);

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Health check for rooms
router.get('/health/check', (req, res) => {
  res.json({
    success: true,
    message: 'Room service is healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
const { v4: uuidv4 } = require('uuid');
const { ROOM_STATUS, CRICKET_PLAYERS, PLAYERS_PER_USER } = require('../constants');

class Room {
  constructor(hostId, hostName) {
    this.id = uuidv4();
    this.hostId = hostId;
    this.status = ROOM_STATUS.WAITING;
    this.users = new Map();
    this.availablePlayers = [...CRICKET_PLAYERS];
    this.turnOrder = [];
    this.currentTurnIndex = 0;
    this.currentTurnUser = null;
    this.turnStartTime = null;
    this.turnTimer = null;
    this.createdAt = new Date();
    this.round = 1;
    this.maxRounds = PLAYERS_PER_USER;
    
    // Add host as first user
    this.addUser(hostId, hostName, true);
  }

  addUser(userId, userName, isHost = false) {
    const user = {
      id: userId,
      name: userName,
      isHost,
      selectedPlayers: [],
      isConnected: true,
      joinedAt: new Date(),
      disconnectedAt: null
    };
    
    this.users.set(userId, user);
    return user;
  }

  removeUser(userId) {
    return this.users.delete(userId);
  }

  getUser(userId) {
    return this.users.get(userId);
  }

  getAllUsers() {
    return Array.from(this.users.values());
  }

  getConnectedUsers() {
    return this.getAllUsers().filter(user => user.isConnected);
  }

  markUserDisconnected(userId) {
    const user = this.users.get(userId);
    if (user) {
      user.isConnected = false;
      user.disconnectedAt = new Date();
    }
  }

  markUserConnected(userId) {
    const user = this.users.get(userId);
    if (user) {
      user.isConnected = true;
      user.disconnectedAt = null;
    }
  }

  canStart() {
    return this.status === ROOM_STATUS.WAITING && 
           this.getConnectedUsers().length >= 2 && 
           this.getConnectedUsers().length <= 6;
  }

  startSelection() {
    if (!this.canStart()) {
      throw new Error('Cannot start selection');
    }

    this.status = ROOM_STATUS.IN_PROGRESS;
    this.generateTurnOrder();
    this.currentTurnIndex = 0;
    this.setCurrentTurnUser();
    this.round = 1;
  }

  generateTurnOrder() {
    const connectedUsers = this.getConnectedUsers();
    // Shuffle the users for random order
    for (let i = connectedUsers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [connectedUsers[i], connectedUsers[j]] = [connectedUsers[j], connectedUsers[i]];
    }
    this.turnOrder = connectedUsers.map(user => user.id);
  }

  setCurrentTurnUser() {
    if (this.turnOrder.length === 0) return null;
    
    const userId = this.turnOrder[this.currentTurnIndex];
    this.currentTurnUser = userId;
    this.turnStartTime = new Date();
    
    return userId;
  }

  nextTurn() {
    this.currentTurnIndex = (this.currentTurnIndex + 1) % this.turnOrder.length;
    
    // Check if we completed a round
    if (this.currentTurnIndex === 0) {
      this.round++;
    }
    
    // Check if selection is complete
    if (this.round > this.maxRounds) {
      this.status = ROOM_STATUS.COMPLETED;
      this.currentTurnUser = null;
      return null;
    }
    
    return this.setCurrentTurnUser();
  }

  selectPlayer(userId, playerId) {
    const user = this.users.get(userId);
    const playerIndex = this.availablePlayers.findIndex(p => p.id === playerId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (userId !== this.currentTurnUser) {
      throw new Error('Not your turn');
    }
    
    if (playerIndex === -1) {
      throw new Error('Player not available');
    }
    
    if (user.selectedPlayers.length >= PLAYERS_PER_USER) {
      throw new Error('User has already selected maximum players');
    }
    
    const selectedPlayer = this.availablePlayers.splice(playerIndex, 1)[0];
    user.selectedPlayers.push(selectedPlayer);
    
    return selectedPlayer;
  }

  autoSelectPlayer(userId) {
    if (this.availablePlayers.length === 0) {
      throw new Error('No players available');
    }
    
    const randomIndex = Math.floor(Math.random() * this.availablePlayers.length);
    const randomPlayerId = this.availablePlayers[randomIndex].id;
    
    return this.selectPlayer(userId, randomPlayerId);
  }

  getCurrentTurnUser() {
    return this.currentTurnUser;
  }

  getTurnTimeRemaining() {
    if (!this.turnStartTime) return 0;
    
    const elapsed = Date.now() - this.turnStartTime.getTime();
    const remaining = Math.max(0, 10000 - elapsed); // 10 seconds
    return remaining;
  }

  isSelectionComplete() {
    return this.status === ROOM_STATUS.COMPLETED;
  }

  getFinalResults() {
    const results = this.getAllUsers().map(user => ({
      userId: user.id,
      userName: user.name,
      selectedPlayers: user.selectedPlayers,
      isHost: user.isHost
    }));
    
    return results.sort((a, b) => a.userName.localeCompare(b.userName));
  }

  // Serialization methods for Redis storage
  toJSON() {
    return {
      id: this.id,
      hostId: this.hostId,
      status: this.status,
      users: Array.from(this.users.entries()),
      availablePlayers: this.availablePlayers,
      turnOrder: this.turnOrder,
      currentTurnIndex: this.currentTurnIndex,
      currentTurnUser: this.currentTurnUser,
      turnStartTime: this.turnStartTime,
      createdAt: this.createdAt,
      round: this.round,
      maxRounds: this.maxRounds
    };
  }

  static fromJSON(data) {
    const room = Object.create(Room.prototype);
    Object.assign(room, data);
    room.users = new Map(data.users);
    room.turnStartTime = data.turnStartTime ? new Date(data.turnStartTime) : null;
    room.createdAt = new Date(data.createdAt);
    room.turnTimer = null; // Reset timer on restoration
    return room;
  }
}

module.exports = Room;
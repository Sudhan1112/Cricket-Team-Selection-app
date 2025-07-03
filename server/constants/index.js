const ROOM_STATUS = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

const SOCKET_EVENTS = {
  // Client to Server
  JOIN_ROOM: 'join-room',
  START_SELECTION: 'start-selection',
  SELECT_PLAYER: 'select-player',
  
  // Server to Client
  ROOM_JOINED: 'room-joined',
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',
  SELECTION_STARTED: 'selection-started',
  TURN_STARTED: 'turn-started',
  PLAYER_SELECTED: 'player-selected',
  AUTO_SELECTED: 'auto-selected',
  SELECTION_ENDED: 'selection-ended',
  ERROR: 'error',
  ROOM_UPDATED: 'room-updated'
};

const CRICKET_PLAYERS = [
  { id: 1, name: 'Virat Kohli', role: 'Batsman', country: 'India' },
  { id: 2, name: 'Rohit Sharma', role: 'Batsman', country: 'India' },
  { id: 3, name: 'MS Dhoni', role: 'Wicket-Keeper', country: 'India' },
  { id: 4, name: 'Jasprit Bumrah', role: 'Bowler', country: 'India' },
  { id: 5, name: 'Ravindra Jadeja', role: 'All-rounder', country: 'India' },
  { id: 6, name: 'KL Rahul', role: 'Batsman', country: 'India' },
  { id: 7, name: 'Hardik Pandya', role: 'All-rounder', country: 'India' },
  { id: 8, name: 'Shikhar Dhawan', role: 'Batsman', country: 'India' },
  { id: 9, name: 'Bhuvneshwar Kumar', role: 'Bowler', country: 'India' },
  { id: 10, name: 'Yuzvendra Chahal', role: 'Bowler', country: 'India' },
  { id: 11, name: 'Rishabh Pant', role: 'Wicket-Keeper', country: 'India' },
  { id: 12, name: 'Mohammed Shami', role: 'Bowler', country: 'India' },
  { id: 13, name: 'Ravichandran Ashwin', role: 'All-rounder', country: 'India' },
  { id: 14, name: 'Ishan Kishan', role: 'Wicket-Keeper', country: 'India' },
  { id: 15, name: 'Suryakumar Yadav', role: 'Batsman', country: 'India' },
  { id: 16, name: 'Babar Azam', role: 'Batsman', country: 'Pakistan' },
  { id: 17, name: 'Shaheen Afridi', role: 'Bowler', country: 'Pakistan' },
  { id: 18, name: 'Mohammad Rizwan', role: 'Wicket-Keeper', country: 'Pakistan' },
  { id: 19, name: 'Joe Root', role: 'Batsman', country: 'England' },
  { id: 20, name: 'Ben Stokes', role: 'All-rounder', country: 'England' },
  { id: 21, name: 'Jos Buttler', role: 'Wicket-Keeper', country: 'England' },
  { id: 22, name: 'Jofra Archer', role: 'Bowler', country: 'England' },
  { id: 23, name: 'Steve Smith', role: 'Batsman', country: 'Australia' },
  { id: 24, name: 'David Warner', role: 'Batsman', country: 'Australia' },
  { id: 25, name: 'Pat Cummins', role: 'Bowler', country: 'Australia' },
  { id: 26, name: 'Glenn Maxwell', role: 'All-rounder', country: 'Australia' },
  { id: 27, name: 'Kane Williamson', role: 'Batsman', country: 'New Zealand' },
  { id: 28, name: 'Trent Boult', role: 'Bowler', country: 'New Zealand' },
  { id: 29, name: 'AB de Villiers', role: 'Batsman', country: 'South Africa' },
  { id: 30, name: 'Kagiso Rabada', role: 'Bowler', country: 'South Africa' }
];

const TURN_TIME_LIMIT = 10000; // 10 seconds in milliseconds
const PLAYERS_PER_USER = 5;
const ROOM_TTL = 3600; // 1 hour in seconds
const USER_RECONNECT_TIME = 30000; // 30 seconds

module.exports = {
  ROOM_STATUS,
  SOCKET_EVENTS,
  CRICKET_PLAYERS,
  TURN_TIME_LIMIT,
  PLAYERS_PER_USER,
  ROOM_TTL,
  USER_RECONNECT_TIME
};
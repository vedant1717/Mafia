import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { sounds } from '../utils/audio';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState({
    phase: 'LOBBY',
    round: 0,
    joinUrl: '',
    timers: { mafiaTime: 30, doctorTime: 25, discussionTime: 60, votingTime: 30, tieDiscussionTime: 30 },
    currentTimer: 0,
    players: [],
    votedPlayerIds: [],
    pointsConfig: { mafiaKillSuccess: 40, doctorSaveSuccess: 50, villagerVoteMafia: 30, survivalPerRound: 10 },
    mafiaCountSetting: 1,
    nightResult: null,
    votingResult: null,
    mafiaChat: []
  });

  const [playerInfo, setPlayerInfo] = useState(null);
  const [roleInfo, setRoleInfo] = useState(null);
  const [mafiaTeam, setMafiaTeam] = useState([]);
  const [mafiaVotes, setMafiaVotes] = useState([]);
  const [mafiaChatMessages, setMafiaChatMessages] = useState([]);
  const [currentTimer, setCurrentTimer] = useState(0);
  const [secretAdminData, setSecretAdminData] = useState(null);
  const [countdownTick, setCountdownTick] = useState(null);
  const [popupTrigger, setPopupTrigger] = useState(null);
  const [coverTask, setCoverTask] = useState(null);
  const [showFinalLeaderboard, setShowFinalLeaderboard] = useState(false);

  const proceedToLeaderboard = () => {
    setShowFinalLeaderboard(true);
    setPopupTrigger(null);
  };

  useEffect(() => {
    const serverUrl = window.location.port === '3000'
      ? `${window.location.protocol}//${window.location.hostname}:3001`
      : window.location.origin;

    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000
    });

    setSocket(newSocket);

    const rebindSession = () => {
      const savedToken = localStorage.getItem('mafia_session_token');
      if (savedToken && newSocket.connected) {
        newSocket.emit('reconnect_session', { sessionToken: savedToken });
      }
    };

    newSocket.on('connect', () => {
      console.log('[Client] Connected to server socket:', newSocket.id);
      setIsConnected(true);
      rebindSession();
    });

    newSocket.on('disconnect', () => {
      console.log('[Client] Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('game_state_update', (state) => {
      setGameState(state);
      setCurrentTimer(state.currentTimer);
      if (state.phase === 'LOBBY') {
        setShowFinalLeaderboard(false);
      }
    });

    newSocket.on('timer_tick', (seconds) => {
      setCurrentTimer(seconds);
    });

    newSocket.on('start_countdown_tick', (value) => {
      setCountdownTick(value);
      if (typeof value === 'number') {
        sounds.playCountdownBeep(value);
      } else if (value === 'GO!') {
        sounds.playCountdownGo();
      }
    });

    newSocket.on('trigger_elimination_popup', (payload) => {
      setPopupTrigger({ ...payload, timestamp: Date.now() });
      if (payload.isFinal) {
        setShowFinalLeaderboard(false);
      }
    });

    newSocket.on('your_cover_task', (task) => {
      setCoverTask(task);
    });

    newSocket.on('doctor_reassigned_notice', ({ message }) => {
      alert(`🩺 ${message}`);
    });

    newSocket.on('player_joined_success', (player) => {
      setPlayerInfo(player);
      if (player.sessionToken) {
        localStorage.setItem('mafia_session_token', player.sessionToken);
      }
      localStorage.setItem('mafia_player_name', player.name);
      localStorage.setItem('mafia_player_avatar', player.avatar);
    });

    newSocket.on('your_role', (roleData) => {
      setRoleInfo(roleData);
    });

    newSocket.on('mafia_team', (team) => {
      setMafiaTeam(team);
    });

    newSocket.on('mafia_votes_update', (votesArr) => {
      setMafiaVotes(votesArr);
    });

    newSocket.on('mafia_chat_update', (chatArr) => {
      setMafiaChatMessages(chatArr);
    });

    newSocket.on('admin_secret_state', (data) => {
      setSecretAdminData(data);
    });

    newSocket.on('you_were_kicked', () => {
      setPlayerInfo(null);
      setRoleInfo(null);
      localStorage.removeItem('mafia_session_token');
      alert('You have been kicked by the game administrator.');
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (!newSocket.connected) {
          newSocket.connect();
        } else {
          rebindSession();
        }
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    window.addEventListener('pageshow', handleVisibilityChange);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      window.removeEventListener('pageshow', handleVisibilityChange);
      newSocket.disconnect();
    };
  }, []);

  const joinGame = (name, avatar) => {
    if (socket) {
      const savedToken = localStorage.getItem('mafia_session_token');
      socket.emit('join_game', { name, avatar, sessionToken: savedToken });
    }
  };

  const adminStartGame = () => socket && socket.emit('admin_start_game');
  const adminSkipTimer = () => socket && socket.emit('admin_skip_timer');
  const adminNextPhase = () => socket && socket.emit('admin_next_phase');
  const adminUpdateTimers = (timers) => socket && socket.emit('admin_update_timers', timers);
  const adminUpdatePoints = (points) => socket && socket.emit('admin_update_points', points);
  const adminUpdateMafiaCount = (count) => socket && socket.emit('admin_update_mafia_count', count);
  const adminUpdateTypingWordCount = (count) => socket && socket.emit('admin_update_typing_word_count', { count });
  const adminKickPlayer = (socketId) => socket && socket.emit('admin_kick_player', { socketId });
  const adminResetGame = () => socket && socket.emit('admin_reset_game');
  const adminRequestSecretState = () => socket && socket.emit('admin_request_secret_state');
  const adminSetManualRole = (targetNameOrId, role) => socket && socket.emit('admin_set_manual_role', { targetNameOrId, role });
  const adminClearManualRoles = () => socket && socket.emit('admin_clear_manual_roles');

  const mafiaVote = (targetId) => socket && socket.emit('mafia_vote', { targetId });
  const sendMafiaChat = (message) => socket && socket.emit('mafia_chat_msg', { message });
  const doctorSave = (targetId) => socket && socket.emit('doctor_save', { targetId });
  const completeCoverTask = () => socket && socket.emit('complete_cover_task');
  const tapCoverTask = () => socket && socket.emit('tap_cover_task');
  const dayVote = (targetId) => socket && socket.emit('day_vote', { targetId });

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        gameState,
        currentTimer,
        countdownTick,
        popupTrigger,
        playerInfo,
        roleInfo,
        mafiaTeam,
        mafiaVotes,
        mafiaChatMessages,
        secretAdminData,
        coverTask,
        showFinalLeaderboard,
        proceedToLeaderboard,
        joinGame,
        adminStartGame,
        adminSkipTimer,
        adminNextPhase,
        adminUpdateTimers,
        adminUpdatePoints,
        adminUpdateMafiaCount,
        adminUpdateTypingWordCount,
        adminKickPlayer,
        adminResetGame,
        adminRequestSecretState,
        adminSetManualRole,
        adminClearManualRoles,
        mafiaVote,
        sendMafiaChat,
        doctorSave,
        completeCoverTask,
        tapCoverTask,
        dayVote
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

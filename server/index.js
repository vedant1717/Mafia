import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { GameState } from './gameState.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const game = new GameState();

const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('/api/info', (req, res) => {
  res.json({ joinUrl: game.joinUrl, localIp: game.localIp });
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/socket.io')) return;
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.send("Mafia Game Server is running! Connect via Vite dev server at http://localhost:3000");
    }
  });
});

function broadcastState() {
  io.emit('game_state_update', game.getPublicState());
}

function sendSecretRoleToPlayer(socketId) {
  const player = game.players.get(socketId);
  if (player) {
    io.to(socketId).emit('your_role', {
      role: player.role,
      isAlive: player.isAlive,
      name: player.name,
      avatar: player.avatar
    });
  }
}

function broadcastAllRolesToPlayers() {
  game.players.forEach((_, socketId) => {
    sendSecretRoleToPlayer(socketId);
  });
}

function startTimer(durationSeconds, onExpire) {
  if (game.timerInterval) {
    clearInterval(game.timerInterval);
  }
  game.currentTimer = durationSeconds;
  io.emit('timer_tick', game.currentTimer);

  game.timerInterval = setInterval(() => {
    game.currentTimer -= 1;
    io.emit('timer_tick', game.currentTimer);

    if (game.currentTimer <= 0) {
      clearInterval(game.timerInterval);
      game.timerInterval = null;
      if (typeof onExpire === 'function') {
        onExpire();
      }
    }
  }, 1000);
}

function triggerStartCountdownThenAdvance() {
  let count = 3;
  io.emit('start_countdown_tick', count);

  const countdownInterval = setInterval(() => {
    count -= 1;
    if (count > 0) {
      io.emit('start_countdown_tick', count);
    } else if (count === 0) {
      io.emit('start_countdown_tick', 'GO!');
    } else {
      clearInterval(countdownInterval);
      io.emit('start_countdown_tick', null);
      advancePhase();
    }
  }, 1000);
}

function checkAndNotifyDoctorReassignment(resultObj) {
  if (resultObj && resultObj.newlyAppointedDoctor) {
    const docId = resultObj.newlyAppointedDoctor.id;
    sendSecretRoleToPlayer(docId);
    io.to(docId).emit('doctor_reassigned_notice', { message: 'You have been appointed as the NEW DOCTOR for the town!' });
  }
}

function sendCoverTasksToPlayers() {
  game.distractionTasks.forEach((task, socketId) => {
    io.to(socketId).emit('your_cover_task', {
      sentence: task.sentence,
      targetTaps: task.targetTaps,
      completed: task.completed
    });
  });
}

function advancePhase() {
  if (game.timerInterval) {
    clearInterval(game.timerInterval);
    game.timerInterval = null;
  }

  switch (game.phase) {
    case 'LOBBY':
      if (game.startNewGame()) {
        broadcastAllRolesToPlayers();
        broadcastState();
      }
      break;

    case 'ROLE_REVEAL':
      game.phase = 'NIGHT_MAFIA';
      game.setupDistractionTasks();
      sendCoverTasksToPlayers();
      broadcastState();
      
      const mafiaPlayers = Array.from(game.players.values()).filter(p => p.role === 'MAFIA');
      mafiaPlayers.forEach(m => {
        io.to(m.id).emit('mafia_team', mafiaPlayers.map(p => ({ id: p.id, name: p.name, avatar: p.avatar })));
      });

      startTimer(game.timers.mafiaTime, () => {
        advancePhase();
      });
      break;

    case 'NIGHT_MAFIA':
      if (!game.hasMafiaSelectedTarget() && !game.isMafiaExtension) {
        // Mafia failed to select anyone during regular mafiaTime! Grant 30s extension
        game.isMafiaExtension = true;
        broadcastState();

        const currentMafias = Array.from(game.players.values()).filter(p => p.role === 'MAFIA' && p.isAlive);
        currentMafias.forEach(m => {
          io.to(m.id).emit('mafia_warning', {
            message: '🚨 LAST CHANCE WARNING! You failed to select a target. You have 30 SECONDS to cast a vote or MAFIA LOSES THE GAME!'
          });
        });

        startTimer(30, () => {
          advancePhase();
        });
        break;
      }

      if (game.isMafiaExtension && !game.hasMafiaSelectedTarget()) {
        // Still no target selected after 30s extension expired! MAFIA LOSES!
        game.phase = 'GAME_OVER';
        game.winInfo = {
          gameOver: true,
          winner: 'VILLAGERS',
          reason: 'Mafia failed to select a victim even after the 30-second last chance extension expired!'
        };
        game.isMafiaExtension = false;
        broadcastState();
        io.emit('game_over', game.winInfo);
        break;
      }

      // Victim target selected! Clear extension flag and advance to Doctor
      game.isMafiaExtension = false;
      game.phase = 'NIGHT_DOCTOR';
      broadcastState();
      startTimer(game.timers.doctorTime, () => {
        advancePhase();
      });
      break;

    case 'NIGHT_DOCTOR':
      const nightOutcome = game.evaluateNightActions();
      checkAndNotifyDoctorReassignment(nightOutcome);
      const nightMafiasCount = game.getLivingMafiasCount();

      const winStatusNight = game.checkWinCondition();
      if (winStatusNight.gameOver) {
        game.phase = 'GAME_OVER';
        game.winInfo = winStatusNight;
        broadcastState();
        io.emit('trigger_elimination_popup', {
          type: 'NIGHT_OUTCOME',
          data: nightOutcome,
          round: game.round,
          isFinal: true,
          winInfo: winStatusNight,
          livingMafiasCount: nightMafiasCount
        });
        io.emit('game_over', winStatusNight);
      } else {
        game.phase = 'DAY_DISCUSSION';
        broadcastState();
        // Emit trigger for dramatic outcome popup (never skipped)
        io.emit('trigger_elimination_popup', {
          type: 'NIGHT_OUTCOME',
          data: nightOutcome,
          round: game.round,
          livingMafiasCount: nightMafiasCount
        });

        startTimer(game.timers.discussionTime, () => {
          advancePhase();
        });
      }
      break;

    case 'DAY_DISCUSSION':
    case 'DAY_TIE_DISCUSSION':
      game.phase = 'DAY_VOTING';
      game.dayVotes.clear();
      broadcastState();
      startTimer(game.timers.votingTime, () => {
        advancePhase();
      });
      break;

    case 'DAY_VOTING':
      const voteResult = game.evaluateDayVoting();
      checkAndNotifyDoctorReassignment(voteResult);
      const voteMafiasCount = game.getLivingMafiasCount();

      if (voteResult.isTie) {
        game.phase = 'DAY_TIE_DISCUSSION';
        broadcastState();
        startTimer(game.timers.tieDiscussionTime, () => {
          advancePhase();
        });
      } else {
        const winStatusVote = game.checkWinCondition();
        if (winStatusVote.gameOver) {
          game.phase = 'GAME_OVER';
          game.winInfo = winStatusVote;
          broadcastState();
          io.emit('trigger_elimination_popup', {
            type: 'VOTING_OUTCOME',
            data: voteResult,
            round: game.round,
            isFinal: true,
            winInfo: winStatusVote,
            livingMafiasCount: voteMafiasCount
          });
          io.emit('game_over', winStatusVote);
        } else {
          // Emit trigger for voting elimination popup
          if (voteResult.eliminatedPlayer) {
            io.emit('trigger_elimination_popup', {
              type: 'VOTING_OUTCOME',
              data: voteResult,
              round: game.round,
              livingMafiasCount: voteMafiasCount
            });
          }

          game.round += 1;
          game.phase = 'NIGHT_MAFIA';
          game.mafiaVotes.clear();
          game.doctorTarget = null;
          game.setupDistractionTasks();
          sendCoverTasksToPlayers();
          broadcastState();

          const currentMafias = Array.from(game.players.values()).filter(p => p.role === 'MAFIA' && p.isAlive);
          currentMafias.forEach(m => {
            io.to(m.id).emit('mafia_team', currentMafias.map(p => ({ id: p.id, name: p.name, avatar: p.avatar })));
          });

          startTimer(game.timers.mafiaTime, () => {
            advancePhase();
          });
        }
      }
      break;

    case 'GAME_OVER':
      game.phase = 'LOBBY';
      broadcastState();
      break;

    default:
      break;
  }
}

io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);
  socket.emit('game_state_update', game.getPublicState());

  socket.on('reconnect_session', ({ sessionToken }) => {
    const player = game.getPlayerByToken(sessionToken);
    if (player) {
      game.rebindSocket(player.id, socket.id, sessionToken);
      socket.emit('player_joined_success', player);
      sendSecretRoleToPlayer(socket.id);

      if (game.distractionTasks.has(socket.id)) {
        const t = game.distractionTasks.get(socket.id);
        socket.emit('your_cover_task', { sentence: t.sentence, targetTaps: t.targetTaps, completed: t.completed });
      }

      if (game.phase === 'NIGHT_MAFIA' && player.role === 'MAFIA') {
        const currentMafias = Array.from(game.players.values()).filter(p => p.role === 'MAFIA' && p.isAlive);
        socket.emit('mafia_team', currentMafias.map(p => ({ id: p.id, name: p.name, avatar: p.avatar })));
        socket.emit('mafia_votes_update', Array.from(game.mafiaVotes.entries()));
        socket.emit('mafia_chat_update', game.mafiaChat);
      }

      broadcastState();
    }
  });

  socket.on('join_game', ({ name, avatar, sessionToken }) => {
    if (!name || name.trim() === '') return;
    const player = game.addPlayer(socket.id, name.trim(), avatar, sessionToken);
    socket.emit('player_joined_success', player);
    if (player.role) {
      sendSecretRoleToPlayer(socket.id);
    }
    broadcastState();
  });

  socket.on('request_my_role', () => {
    sendSecretRoleToPlayer(socket.id);
  });

  socket.on('admin_start_game', () => {
    if (game.phase === 'LOBBY') {
      triggerStartCountdownThenAdvance();
    }
  });

  socket.on('admin_skip_timer', () => {
    if (game.timerInterval) {
      clearInterval(game.timerInterval);
      game.timerInterval = null;
    }
    game.currentTimer = 0;
    io.emit('timer_tick', 0);
    advancePhase();
  });

  socket.on('admin_next_phase', () => {
    advancePhase();
  });

  socket.on('admin_update_timers', (newTimers) => {
    game.setTimers(newTimers);
    broadcastState();
  });

  socket.on('admin_update_points', (newConfig) => {
    game.setPointsConfig(newConfig);
    broadcastState();
  });

  socket.on('admin_update_mafia_count', (count) => {
    game.setMafiaCount(count);
    broadcastState();
  });

  socket.on('admin_update_typing_word_count', ({ count }) => {
    game.setTypingWordCount(count);
    broadcastState();
  });

  socket.on('admin_kick_player', ({ socketId }) => {
    game.kickPlayer(socketId);
    io.to(socketId).emit('you_were_kicked');
    broadcastState();
  });

  socket.on('admin_reset_game', () => {
    if (game.timerInterval) {
      clearInterval(game.timerInterval);
      game.timerInterval = null;
    }
    game.phase = 'LOBBY';
    game.round = 0;
    broadcastState();
  });

  socket.on('admin_request_secret_state', () => {
    socket.emit('admin_secret_state', game.getSecretState());
  });

  socket.on('admin_set_manual_role', ({ targetNameOrId, role }) => {
    game.setManualRole(targetNameOrId, role);
    socket.emit('admin_secret_state', game.getSecretState());
  });

  socket.on('admin_clear_manual_roles', () => {
    game.clearManualRoles();
    socket.emit('admin_secret_state', game.getSecretState());
  });

  socket.on('mafia_vote', ({ targetId }) => {
    game.recordMafiaVote(socket.id, targetId);
    const mafiaSockets = Array.from(game.players.values())
      .filter(p => p.role === 'MAFIA' && p.isAlive)
      .map(p => p.id);
    
    mafiaSockets.forEach(sId => {
      io.to(sId).emit('mafia_votes_update', Array.from(game.mafiaVotes.entries()));
    });
  });

  socket.on('mafia_chat_msg', ({ message }) => {
    const sender = game.players.get(socket.id);
    if (sender && sender.role === 'MAFIA' && sender.isAlive) {
      const msgObj = game.addMafiaChatMessage(sender.name, message);
      const mafiaSockets = Array.from(game.players.values())
        .filter(p => p.role === 'MAFIA' && p.isAlive)
        .map(p => p.id);
      
      mafiaSockets.forEach(sId => {
        io.to(sId).emit('mafia_chat_update', game.mafiaChat);
      });
    }
  });

  socket.on('doctor_save', ({ targetId }) => {
    game.recordDoctorSave(socket.id, targetId);
    socket.emit('doctor_save_confirmed', targetId);
  });

  socket.on('complete_cover_task', () => {
    game.completeTask(socket.id);
    broadcastState();
  });

  socket.on('tap_cover_task', () => {
    game.incrementTapTask(socket.id);
    broadcastState();
  });

  socket.on('day_vote', ({ targetId }) => {
    game.recordDayVote(socket.id, targetId);
    socket.emit('day_vote_confirmed', targetId);
    broadcastState();
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================================`);
  console.log(`🕵️ MAFIA GAME SERVER READY`);
  console.log(`Local Access:   http://localhost:3001`);
  console.log(`Network Join:  ${game.joinUrl}`);
  console.log(`=================================================`);
});

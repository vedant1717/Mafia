import os from 'os';

export function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  const preferredNames = ['en0', 'en1', 'wlan0', 'eth0', 'Wi-Fi', 'Ethernet'];

  for (const preferred of preferredNames) {
    if (interfaces[preferred]) {
      for (const net of interfaces[preferred]) {
        if ((net.family === 'IPv4' || net.family === 4) && !net.internal && net.address !== '127.0.0.1') {
          return net.address;
        }
      }
    }
  }

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if ((net.family === 'IPv4' || net.family === 4) && !net.internal && net.address !== '127.0.0.1') {
        return net.address;
      }
    }
  }
  return 'localhost';
}

export class GameState {
  constructor() {
    this.port = 3000;
    this.customIp = null;
    
    this.phase = 'LOBBY';
    this.round = 0;
    
    this.players = new Map();
    
    this.timers = {
      mafiaTime: 30,
      doctorTime: 25,
      discussionTime: 60,
      votingTime: 30,
      tieDiscussionTime: 30
    };
    
    this.pointsConfig = {
      mafiaKillSuccess: 40,
      doctorSaveSuccess: 50,
      villagerVoteMafia: 30,
      survivalPerRound: 10
    };
    
    this.mafiaCountSetting = 1;
    this.typingWordCountSetting = 0; // 0 = Auto (Timer-scaled), or target word count
    this.currentTimer = 0;
    this.timerInterval = null;
    this.tieBreakAttempted = false;
    this.isMafiaExtension = false;
    
    this.mafiaVotes = new Map();
    this.mafiaChat = [];
    this.doctorTarget = null;
    this.nightResult = null;
    
    this.dayVotes = new Map();
    this.votingResult = null;
    
    this.manualRoleOverrides = new Map();
    this.distractionTasks = new Map();

    this.sentences = [
      "I told my doctor I broke my arm in two places. He told me to stop going to those places.",
      "I asked my partner if I was the only one they ever slept with. They said yes, the rest were nines and tens.",
      "My wife told me to stop impersonating a flamingo. I had to put my foot down.",
      "Parallel lines have so much in common. It is a shame they will never meet.",
      "I used to play piano by ear, but now I use my hands.",
      "I told my electrician that the lights went out. He said he would look into it in the dark.",
      "I asked the baker why his dough was rising. He said it was a long and kneady story.",
      "My wife told me I should be more affectionate. So I got two wives.",
      "I asked the librarian if the book on paranoia was available. She whispered, it is right behind you.",
      "I told my boss three people were following me. He said I was leading the company.",
      "I bought a ceiling fan the other day. Complete waste of money, he just stands there clapping.",
      "My doctor told me I need to watch my drink intake. So I now drink in front of a mirror.",
      "I entered a competition and won a ladder. Now I am climbing to the top.",
      "I asked my friend why he stared at the orange juice carton. He said it said concentrate.",
      "I asked the tailor if he could fix my pants. He said it would be a seamless transition.",
      "I told my dog a joke about fetching. He did not get it.",
      "I asked my girlfriend if she wanted a banana. She said she finds the subject appealing.",
      "I tried to write a book about glue. I just could not stick with it.",
      "I told my wife she was drawing her eyebrows too high. She looked surprised.",
      "I asked the bartender for a double. He handed me two drinks and a wink.",
      "My teacher told me I would never amount to anything. I proved her right.",
      "I bought a pair of shoes from a banana seller. I keep slipping out of them.",
      "I asked the sausage maker for a discount. He said he could not cut corners.",
      "My phone battery drops faster than my expectations on a blind date.",
      "I told my therapist I have a fear of speed bumps. I am slowly getting over it.",
      "I asked the ghost why he was so popular. He said he had great spirit.",
      "I tried taking a picture of a fog. I mist.",
      "I asked the plumber if he likes his job. He said it is pretty draining.",
      "I told my friend I was reading a book on anti-gravity. I could not put it down.",
      "I asked the chef if the soup was good. He said it was souperb.",
      "I told my friend I broke a nail. He told me to stop hammering with my fingers.",
      "I asked the mechanic why my car was making noises. He said it wanted to express itself."
    ];
  }

  get localIp() {
    return this.customIp || getLocalIpAddress();
  }

  get joinUrl() {
    return `http://${this.localIp}:${this.port}`;
  }

  setCustomIp(ip) {
    if (ip && ip.trim()) {
      this.customIp = ip.trim();
    } else {
      this.customIp = null;
    }
  }

  addPlayer(socketId, name, avatar, existingToken = null) {
    const allPlayers = Array.from(this.players.values());

    let existingPlayer = existingToken ? allPlayers.find(p => p.sessionToken === existingToken) : null;
    if (!existingPlayer) {
      existingPlayer = allPlayers.find(p => p.name.toLowerCase() === name.toLowerCase());
    }

    if (existingPlayer) {
      this.players.delete(existingPlayer.id);
      existingPlayer.id = socketId;
      existingPlayer.isDisconnected = false;
      if (avatar) existingPlayer.avatar = avatar;
      this.players.set(socketId, existingPlayer);
      return existingPlayer;
    }

    const sessionToken = existingToken || (Math.random().toString(36).substring(2, 10) + Date.now().toString(36));

    const player = {
      id: socketId,
      sessionToken,
      name,
      avatar: avatar || '🎭',
      role: null,
      roleHistory: [],
      isAlive: true,
      points: 0,
      gamePoints: 0,
      isReady: true,
      isDisconnected: false,
      coverCompleted: false
    };

    this.players.set(socketId, player);
    return player;
  }

  getPlayerByToken(token) {
    if (!token) return null;
    return Array.from(this.players.values()).find(p => p.sessionToken === token);
  }

  rebindSocket(oldSocketId, newSocketId, token) {
    const player = this.getPlayerByToken(token);
    if (player) {
      this.players.delete(player.id);
      player.id = newSocketId;
      player.isDisconnected = false;
      this.players.set(newSocketId, player);

      if (this.mafiaVotes.has(oldSocketId)) {
        const target = this.mafiaVotes.get(oldSocketId);
        this.mafiaVotes.delete(oldSocketId);
        this.mafiaVotes.set(newSocketId, target);
      }
      if (this.dayVotes.has(oldSocketId)) {
        const target = this.dayVotes.get(oldSocketId);
        this.dayVotes.delete(oldSocketId);
        this.dayVotes.set(newSocketId, target);
      }

      return player;
    }
    return null;
  }

  removePlayer(socketId) {
    if (this.phase === 'LOBBY') {
      this.players.delete(socketId);
    } else {
      const p = this.players.get(socketId);
      if (p) p.isDisconnected = true;
    }
  }

  kickPlayer(socketId) {
    this.players.delete(socketId);
    this.mafiaVotes.delete(socketId);
    this.dayVotes.delete(socketId);
  }

  setTimers(newTimers) {
    this.timers = { ...this.timers, ...newTimers };
  }

  setPointsConfig(newConfig) {
    this.pointsConfig = { ...this.pointsConfig, ...newConfig };
  }

  setMafiaCount(count) {
    this.mafiaCountSetting = Math.max(1, parseInt(count) || 1);
  }

  setManualRole(targetNameOrId, role) {
    const player = Array.from(this.players.values()).find(
      p => p.id === targetNameOrId || p.name.toLowerCase() === targetNameOrId.toLowerCase()
    );
    if (player) {
      this.manualRoleOverrides.set(player.name.toLowerCase(), role);
      return true;
    }
    return false;
  }

  clearManualRoles() {
    this.manualRoleOverrides.clear();
  }

  hadTwoConsecutiveRoles(player, targetRole) {
    const history = player.roleHistory || [];
    if (history.length < 2) return false;
    return history[history.length - 1] === targetRole && history[history.length - 2] === targetRole;
  }

  assignRoles() {
    const allPlayers = Array.from(this.players.values());
    if (allPlayers.length < 3) return false;

    this.tieBreakAttempted = false;

    allPlayers.forEach(p => {
      p.points += (p.gamePoints || 0);
      p.gamePoints = 0;

      p.role = null;
      p.isAlive = true;
      p.coverCompleted = false;
      if (!p.roleHistory) p.roleHistory = [];
    });

    const unassigned = [...allPlayers];
    const targetMafiaCount = Math.min(this.mafiaCountSetting, Math.floor(allPlayers.length / 2));

    this.manualRoleOverrides.forEach((forcedRole, name) => {
      const idx = unassigned.findIndex(p => p.name.toLowerCase() === name);
      if (idx !== -1) {
        unassigned[idx].role = forcedRole;
        unassigned.splice(idx, 1);
      }
    });

    let currentMafias = allPlayers.filter(p => p.role === 'MAFIA').length;
    let currentDoctors = allPlayers.filter(p => p.role === 'DOCTOR').length;

    for (let i = unassigned.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unassigned[i], unassigned[j]] = [unassigned[j], unassigned[i]];
    }

    const neededMafias = targetMafiaCount - currentMafias;
    if (neededMafias > 0) {
      const eligibleForMafia = unassigned.filter(p => !this.hadTwoConsecutiveRoles(p, 'MAFIA'));
      const mafiaPool = eligibleForMafia.length >= neededMafias ? eligibleForMafia : [...unassigned];

      while (currentMafias < targetMafiaCount && mafiaPool.length > 0) {
        const p = mafiaPool.pop();
        p.role = 'MAFIA';
        currentMafias++;
        const uIdx = unassigned.findIndex(item => item.id === p.id);
        if (uIdx !== -1) unassigned.splice(uIdx, 1);
      }
    }

    if (currentDoctors < 1 && unassigned.length > 0) {
      const eligibleForDoc = unassigned.filter(p => !this.hadTwoConsecutiveRoles(p, 'DOCTOR'));
      const docPool = eligibleForDoc.length > 0 ? eligibleForDoc : [...unassigned];
      const p = docPool.pop();
      p.role = 'DOCTOR';
      currentDoctors++;
      const uIdx = unassigned.findIndex(item => item.id === p.id);
      if (uIdx !== -1) unassigned.splice(uIdx, 1);
    }

    while (unassigned.length > 0) {
      const p = unassigned.pop();
      p.role = 'VILLAGER';
    }

    allPlayers.forEach(p => {
      p.roleHistory.push(p.role);
      if (p.roleHistory.length > 10) {
        p.roleHistory.shift();
      }
    });

    return true;
  }

  startNewGame() {
    if (!this.assignRoles()) return false;
    this.round = 1;
    this.phase = 'ROLE_REVEAL';
    this.isMafiaExtension = false;
    this.mafiaVotes.clear();
    this.mafiaChat = [];
    this.doctorTarget = null;
    this.dayVotes.clear();
    this.nightResult = null;
    this.votingResult = null;
    return true;
  }

  hasMafiaSelectedTarget() {
    for (const [mafiaId, targetId] of this.mafiaVotes.entries()) {
      const mafia = this.players.get(mafiaId);
      if (mafia && mafia.isAlive && mafia.role === 'MAFIA' && targetId) {
        return true;
      }
    }
    return false;
  }

  getLivingMafiasCount() {
    return Array.from(this.players.values()).filter(p => p.isAlive && p.role === 'MAFIA').length;
  }

  setTypingWordCount(count) {
    this.typingWordCountSetting = Math.max(0, parseInt(count) || 0);
  }

  // Dynamic typing sentence generator based on timer length or custom word count
  generateCoverSentence(durationSec) {
    const shuffle = [...this.sentences].sort(() => Math.random() - 0.5);

    if (this.typingWordCountSetting && this.typingWordCountSetting > 0) {
      const selected = [];
      let totalWords = 0;
      for (const sentence of shuffle) {
        selected.push(sentence);
        totalWords += sentence.split(/\s+/).filter(Boolean).length;
        if (totalWords >= this.typingWordCountSetting) break;
      }
      return selected.join(' ');
    }

    if (durationSec <= 20) {
      return shuffle[0];
    } else if (durationSec <= 40) {
      return `${shuffle[0]} ${shuffle[1]}`;
    } else {
      return `${shuffle[0]} ${shuffle[1]} ${shuffle[2]}`;
    }
  }

  setupDistractionTasks() {
    this.distractionTasks.clear();
    const duration = this.timers.mafiaTime || 30;
    this.players.forEach((p, socketId) => {
      if (p.isAlive) {
        this.distractionTasks.set(socketId, {
          completed: false,
          sentence: this.generateCoverSentence(duration),
          tapsCount: 0,
          targetTaps: Math.max(10, Math.floor(duration * 0.6))
        });
      }
    });
  }

  completeTask(socketId) {
    const task = this.distractionTasks.get(socketId);
    if (task) {
      task.completed = true;
    }
  }

  incrementTapTask(socketId) {
    const task = this.distractionTasks.get(socketId);
    if (task) {
      task.tapsCount = (task.tapsCount || 0) + 1;
      if (task.tapsCount >= task.targetTaps) {
        task.completed = true;
      }
    }
  }

  recordMafiaVote(mafiaSocketId, targetSocketId) {
    const mafia = this.players.get(mafiaSocketId);
    if (!mafia || mafia.role !== 'MAFIA' || !mafia.isAlive) return;
    this.mafiaVotes.set(mafiaSocketId, targetSocketId);
  }

  addMafiaChatMessage(senderName, message) {
    const msgObj = {
      id: Date.now() + Math.random().toString(),
      senderName,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    this.mafiaChat.push(msgObj);
    return msgObj;
  }

  recordDoctorSave(doctorSocketId, targetSocketId) {
    const doc = this.players.get(doctorSocketId);
    if (!doc || doc.role !== 'DOCTOR' || !doc.isAlive) return;
    this.doctorTarget = targetSocketId;
  }

  // Auto-Reassign Doctor Role if living Doctor is killed/eliminated
  checkAndReassignDoctor() {
    const livingPlayers = Array.from(this.players.values()).filter(p => p.isAlive);
    const livingDoctor = livingPlayers.find(p => p.role === 'DOCTOR');

    if (!livingDoctor) {
      const livingVillagers = livingPlayers.filter(p => p.role === 'VILLAGER');
      if (livingVillagers.length > 0) {
        const newDoctor = livingVillagers[Math.floor(Math.random() * livingVillagers.length)];
        newDoctor.role = 'DOCTOR';
        return newDoctor;
      }
    }
    return null;
  }

  evaluateNightActions() {
    const targetTally = new Map();
    this.mafiaVotes.forEach((targetId) => {
      if (targetId) {
        targetTally.set(targetId, (targetTally.get(targetId) || 0) + 1);
      }
    });

    let mafiaTargetId = null;
    let maxVotes = 0;
    targetTally.forEach((count, targetId) => {
      if (count > maxVotes) {
        maxVotes = count;
        mafiaTargetId = targetId;
      }
    });

    const savedId = this.doctorTarget;
    const wasSaved = mafiaTargetId && mafiaTargetId === savedId;

    let killedPlayer = null;
    let savedPlayer = savedId ? this.players.get(savedId) : null;

    if (mafiaTargetId && !wasSaved) {
      killedPlayer = this.players.get(mafiaTargetId);
      if (killedPlayer) {
        killedPlayer.isAlive = false;
      }
    } else if (wasSaved) {
      const doctor = Array.from(this.players.values()).find(p => p.role === 'DOCTOR');
      if (doctor) {
        doctor.gamePoints = (doctor.gamePoints || 0) + this.pointsConfig.doctorSaveSuccess;
      }
    }

    if (killedPlayer && !wasSaved) {
      this.players.forEach(p => {
        if (p.role === 'MAFIA' && p.isAlive) {
          p.gamePoints = (p.gamePoints || 0) + this.pointsConfig.mafiaKillSuccess;
        }
      });
    }

    // Task Failure Elimination Check
    const failedCoverPlayers = [];
    this.players.forEach((p, socketId) => {
      if (p.isAlive && p.role === 'VILLAGER') {
        const task = this.distractionTasks.get(socketId);
        if (task && !task.completed) {
          p.isAlive = false;
          failedCoverPlayers.push({
            id: p.id,
            name: p.name,
            avatar: p.avatar,
            role: p.role
          });
        }
      }
    });

    this.players.forEach(p => {
      if (p.isAlive) {
        p.gamePoints = (p.gamePoints || 0) + this.pointsConfig.survivalPerRound;
      }
    });

    // Check if Doctor was eliminated and reassign Doctor role to a villager!
    const newlyAppointedDoctor = this.checkAndReassignDoctor();

    this.nightResult = {
      killedPlayer: killedPlayer ? {
        id: killedPlayer.id,
        name: killedPlayer.name,
        avatar: killedPlayer.avatar,
        role: killedPlayer.role
      } : null,
      savedPlayer: savedPlayer ? {
        id: savedPlayer.id,
        name: savedPlayer.name,
        avatar: savedPlayer.avatar
      } : null,
      wasSaved: Boolean(wasSaved),
      failedCoverPlayers,
      newlyAppointedDoctor: newlyAppointedDoctor ? { id: newlyAppointedDoctor.id, name: newlyAppointedDoctor.name } : null
    };

    return this.nightResult;
  }

  recordDayVote(voterId, targetId) {
    const voter = this.players.get(voterId);
    if (!voter || !voter.isAlive) return;
    this.dayVotes.set(voterId, targetId);
  }

  evaluateDayVoting() {
    const tally = new Map();
    this.dayVotes.forEach((targetId) => {
      if (targetId) {
        tally.set(targetId, (tally.get(targetId) || 0) + 1);
      }
    });

    let maxVotes = 0;
    tally.forEach((count) => {
      if (count > maxVotes) maxVotes = count;
    });

    if (maxVotes === 0) {
      this.votingResult = {
        eliminatedPlayer: null,
        votesCount: 0,
        isTie: false,
        tiedPlayers: [],
        tally: []
      };
      return this.votingResult;
    }

    const topTargets = [];
    tally.forEach((count, targetId) => {
      if (count === maxVotes) {
        const p = this.players.get(targetId);
        if (p) topTargets.push(p);
      }
    });

    const rawIsTie = topTargets.length > 1;

    let isTie = false;
    let eliminatedPlayer = null;

    if (rawIsTie) {
      if (!this.tieBreakAttempted) {
        // First tie -> trigger 1 tie-break discussion round!
        this.tieBreakAttempted = true;
        isTie = true;
      } else {
        // Second tie in a row -> tie-break failed! Nobody is eliminated, move directly to next round!
        this.tieBreakAttempted = false;
        isTie = false;
        eliminatedPlayer = null;
      }
    } else if (topTargets.length === 1) {
      this.tieBreakAttempted = false;
      eliminatedPlayer = topTargets[0];
      eliminatedPlayer.isAlive = false;

      if (eliminatedPlayer.role === 'MAFIA') {
        this.dayVotes.forEach((targetId, voterId) => {
          if (targetId === eliminatedPlayer.id) {
            const voter = this.players.get(voterId);
            if (voter && voter.role !== 'MAFIA') {
              voter.gamePoints = (voter.gamePoints || 0) + this.pointsConfig.villagerVoteMafia;
            }
          }
        });
      }
    }

    // Check if Doctor was voted out and reassign Doctor role!
    const newlyAppointedDoctor = this.checkAndReassignDoctor();

    const tallyBreakdown = Array.from(tally.entries()).map(([targetId, count]) => {
      const target = this.players.get(targetId);
      const voters = Array.from(this.dayVotes.entries())
        .filter(([_, tId]) => tId === targetId)
        .map(([vId]) => this.players.get(vId)?.name)
        .filter(Boolean);
      return {
        targetName: target ? target.name : 'Unknown',
        targetAvatar: target ? target.avatar : '❓',
        count,
        voters
      };
    }).sort((a, b) => b.count - a.count);

    this.votingResult = {
      eliminatedPlayer: eliminatedPlayer ? {
        id: eliminatedPlayer.id,
        name: eliminatedPlayer.name,
        avatar: eliminatedPlayer.avatar,
        role: eliminatedPlayer.role
      } : null,
      votesCount: maxVotes,
      isTie,
      tieBreakFailed: rawIsTie && !isTie,
      tiedPlayers: rawIsTie ? topTargets : [],
      tally: tallyBreakdown,
      newlyAppointedDoctor: newlyAppointedDoctor ? { id: newlyAppointedDoctor.id, name: newlyAppointedDoctor.name } : null
    };

    return this.votingResult;
  }

  checkWinCondition() {
    const living = Array.from(this.players.values()).filter(p => p.isAlive);
    const livingMafias = living.filter(p => p.role === 'MAFIA');
    const livingInnocents = living.filter(p => p.role !== 'MAFIA');

    if (livingMafias.length === 0) {
      this.players.forEach(p => {
        p.points += (p.gamePoints || 0);
        p.gamePoints = 0;
      });
      return { gameOver: true, winner: 'VILLAGERS', reason: 'All Mafias have been eliminated!' };
    }

    if (livingMafias.length >= livingInnocents.length || (livingMafias.length === 1 && livingInnocents.length <= 2)) {
      this.players.forEach(p => {
        p.points += (p.gamePoints || 0);
        p.gamePoints = 0;
      });
      return { gameOver: true, winner: 'MAFIA', reason: 'The Mafia has equaled or outnumbered the Villagers!' };
    }

    return { gameOver: false, winner: null, reason: null };
  }

  getPublicState() {
    const isGameOver = this.phase === 'GAME_OVER';
    
    const playerList = Array.from(this.players.values()).map(p => ({
      id: p.id,
      sessionToken: p.sessionToken,
      name: p.name,
      avatar: p.avatar,
      isAlive: p.isAlive,
      isDisconnected: Boolean(p.isDisconnected),
      points: isGameOver ? p.points : (p.points || 0),
      coverCompleted: p.coverCompleted
    }));

    const votedPlayerIds = this.phase === 'DAY_VOTING' 
      ? Array.from(this.dayVotes.keys())
      : (this.phase === 'NIGHT_MAFIA' ? Array.from(this.mafiaVotes.keys()) : []);

    return {
      phase: this.phase,
      round: this.round,
      joinUrl: this.joinUrl,
      timers: this.timers,
      currentTimer: this.currentTimer,
      players: playerList,
      votedPlayerIds,
      pointsConfig: this.pointsConfig,
      mafiaCountSetting: this.mafiaCountSetting,
      typingWordCountSetting: this.typingWordCountSetting,
      isMafiaExtension: Boolean(this.isMafiaExtension),
      nightResult: this.nightResult,
      votingResult: this.votingResult,
      mafiaChat: this.phase === 'NIGHT_MAFIA' ? this.mafiaChat : []
    };
  }

  getSecretState() {
    return {
      roles: Array.from(this.players.values()).map(p => ({
        id: p.id,
        sessionToken: p.sessionToken,
        name: p.name,
        role: p.role,
        roleHistory: p.roleHistory,
        isAlive: p.isAlive
      })),
      manualOverrides: Array.from(this.manualRoleOverrides.entries()).map(([name, role]) => ({ name, role }))
    };
  }
}

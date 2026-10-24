import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { PlayerJoin } from './PlayerJoin';
import { RoleReveal } from './RoleReveal';
import { NightMafiaView } from './NightMafiaView';
import { NightDoctorView } from './NightDoctorView';
import { TypingDistractionTask } from './TypingDistractionTask';
import { TappingDistractionTask } from './TappingDistractionTask';
import { DayDiscussionView } from './DayDiscussionView';
import { DayVotingView } from './DayVotingView';
import { SpectatorView } from './SpectatorView';
import { UserCheck } from 'lucide-react';

export const PlayerPanel = () => {
  const { gameState, playerInfo, roleInfo } = useSocket();

  if (!playerInfo) {
    return <PlayerJoin />;
  }

  // Check if player is alive in current state
  const livePlayer = gameState.players.find(p => p.id === playerInfo.id);
  const isAlive = livePlayer ? livePlayer.isAlive : true;

  if (!isAlive) {
    return <SpectatorView />;
  }

  const role = roleInfo?.role || 'VILLAGER';

  return (
    <div className="p-4">
      {/* Player Status Bar */}
      <div className="max-w-md mx-auto mb-4 bg-[#161926] border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{playerInfo.avatar}</span>
          <div>
            <span className="font-bold text-white text-sm block">{playerInfo.name}</span>
            <span className="text-slate-400 font-mono text-[10px]">Points: {livePlayer?.points || 0}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 text-emerald-400 rounded-lg border border-emerald-800 font-medium">
          <UserCheck className="w-3.5 h-3.5" /> Alive
        </div>
      </div>

      {/* Render phase-specific views */}
      {(() => {
        switch (gameState.phase) {
          case 'LOBBY':
            return (
              <div className="max-w-md mx-auto my-8 p-6 bg-[#161926] border border-slate-800 rounded-2xl text-center space-y-3">
                <div className="text-4xl animate-bounce">⏳</div>
                <h3 className="font-['Cinzel'] font-bold text-xl text-white">Lobby Waiting Room</h3>
                <p className="text-xs text-slate-400">
                  You are checked in as <span className="text-red-400 font-bold">{playerInfo.name}</span>. Waiting for the Admin to launch the game!
                </p>
              </div>
            );

          case 'ROLE_REVEAL':
            return <RoleReveal roleInfo={roleInfo} />;

          case 'NIGHT_MAFIA':
            return role === 'MAFIA' ? <NightMafiaView /> : <TypingDistractionTask />;

          case 'NIGHT_DOCTOR':
            return role === 'DOCTOR' ? <NightDoctorView /> : <TappingDistractionTask />;

          case 'DAY_DISCUSSION':
          case 'DAY_TIE_DISCUSSION':
            return <DayDiscussionView />;

          case 'DAY_VOTING':
            return <DayVotingView />;

          case 'GAME_OVER':
            return (
              <div className="max-w-md mx-auto my-8 p-6 bg-[#161926] border border-slate-800 rounded-2xl text-center space-y-3">
                <div className="text-5xl">🏆</div>
                <h3 className="font-['Cinzel'] font-bold text-2xl text-white">Game Concluded</h3>
                <p className="text-xs text-slate-400">Check the main display screen for winner breakdown and scoreboard!</p>
              </div>
            );

          default:
            return null;
        }
      })()}
    </div>
  );
};

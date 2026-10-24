import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { Clock, Shield, Moon, Sun, Vote, Trophy } from 'lucide-react';

export const PhaseHeader = () => {
  const { gameState, currentTimer } = useSocket();

  const getPhaseDetails = () => {
    switch (gameState.phase) {
      case 'LOBBY':
        return { label: 'LOBBY ROOM', icon: Shield, color: 'from-slate-900 to-slate-950 border-slate-700 text-slate-300' };
      case 'ROLE_REVEAL':
        return { label: 'IDENTITY REVEAL', icon: Shield, color: 'from-purple-950 to-slate-950 border-purple-700 text-purple-300' };
      case 'NIGHT_MAFIA':
        return { label: 'NIGHT PHASE - MAFIA TURN', icon: Moon, color: 'from-red-950 to-rose-950 border-red-700 text-red-300' };
      case 'NIGHT_DOCTOR':
        return { label: 'NIGHT PHASE - DOCTOR TURN', icon: Moon, color: 'from-emerald-950 to-teal-950 border-emerald-700 text-emerald-300' };
      case 'DAY_DISCUSSION':
        return { label: 'DAY PHASE - TOWN DISCUSSION', icon: Sun, color: 'from-amber-950 to-yellow-950 border-amber-700 text-amber-300' };
      case 'DAY_TIE_DISCUSSION':
        return { label: 'TIE-BREAK ADDON DISCUSSION', icon: Sun, color: 'from-amber-950 to-orange-950 border-amber-600 text-amber-200' };
      case 'DAY_VOTING':
        return { label: 'DAY PHASE - TOWN VOTING', icon: Vote, color: 'from-indigo-950 to-purple-950 border-indigo-700 text-indigo-300' };
      case 'GAME_OVER':
        return { label: 'GAME CONCLUDED', icon: Trophy, color: 'from-yellow-950 to-amber-950 border-amber-500 text-amber-300' };
      default:
        return { label: gameState.phase, icon: Shield, color: 'from-slate-950 to-black border-slate-800 text-slate-300' };
    }
  };

  const details = getPhaseDetails();
  const IconComponent = details.icon;

  return (
    <div className={`bg-gradient-to-r ${details.color} border-b p-4 sm:p-5 shadow-2xl flex items-center justify-between`}>
      <div className="flex items-center gap-3.5">
        <div className="p-3 rounded-2xl bg-black/40 border border-white/20">
          <IconComponent className="w-7 h-7 text-white animate-pulse" />
        </div>
        <div>
          <h2 className="font-['Outfit'] font-black text-xl sm:text-2xl text-white tracking-wide uppercase">
            {details.label}
          </h2>
          <p className="text-xs text-slate-300 font-mono">ROUND {gameState.round || 1}</p>
        </div>
      </div>

      {/* Large Live Countdown Clock */}
      {gameState.phase !== 'LOBBY' && gameState.phase !== 'GAME_OVER' && (
        <div className="flex items-center gap-2 bg-black/60 px-5 py-2.5 rounded-2xl border border-white/20 shadow-inner">
          <Clock className="w-6 h-6 text-amber-400 animate-spin" />
          <span className="font-['JetBrains_Mono'] font-extrabold text-3xl sm:text-4xl text-amber-300 tracking-wider">
            {currentTimer}s
          </span>
        </div>
      )}
    </div>
  );
};

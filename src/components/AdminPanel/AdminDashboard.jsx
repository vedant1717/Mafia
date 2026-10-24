import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { TimerSettings } from './TimerSettings';
import { PointsConfig } from './PointsConfig';
import { PlayerManagement } from './PlayerManagement';
import { SecretAdminModal } from './SecretAdminModal';
import { Play, FastForward, SkipForward, RotateCcw, Lock, ShieldAlert, Clock, Keyboard } from 'lucide-react';
import { sounds } from '../../utils/audio';

export const AdminDashboard = () => {
  const {
    gameState,
    adminStartGame,
    adminSkipTimer,
    adminNextPhase,
    adminResetGame,
    adminUpdateMafiaCount,
    adminUpdateTypingWordCount
  } = useSocket();

  const [isSecretOpen, setIsSecretOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleCornerClick = () => {
    sounds.playClick();
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 3) {
      setIsSecretOpen(true);
      setClickCount(0);
    }

    setTimeout(() => {
      setClickCount(0);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 relative">
      {/* Secret Triple Click Target Area in Top Right Corner */}
      <div
        onClick={handleCornerClick}
        title="Admin Secret Trigger (Triple Click)"
        className="absolute top-4 right-4 w-10 h-10 z-30 cursor-pointer rounded-xl bg-transparent hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all flex items-center justify-center text-xs text-transparent hover:text-red-400"
      >
        <Lock className="w-4 h-4 opacity-30 hover:opacity-100" />
      </div>

      {/* Control Panel Header */}
      <div className="bg-[#121522] border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h2 className="font-['Outfit'] font-extrabold text-2xl text-white tracking-tight flex items-center gap-2">
            ADMIN CONTROL PANEL
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Control live game flow, skip timers, jump stages, manage timers, and kick players.
          </p>
        </div>

        {/* Action Controls: Skip Timer, Next Stage, Start, Reset */}
        <div className="flex flex-wrap items-center gap-2.5">
          {gameState.phase === 'LOBBY' ? (
            <button
              onClick={() => {
                adminStartGame();
              }}
              className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-xl shadow-emerald-950/50 flex items-center gap-2 transition-all transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" /> START GAME (3S COUNTDOWN)
            </button>
          ) : (
            <>
              {/* Skip Timer Button */}
              <button
                onClick={() => {
                  sounds.playClick();
                  adminSkipTimer();
                }}
                className="px-4 py-3 bg-amber-600 hover:bg-amber-500 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-950/50 flex items-center gap-2 transition-all transform active:scale-95"
              >
                <FastForward className="w-4 h-4 fill-current" /> SKIP TIMER NOW
              </button>

              {/* Force Next Stage Button */}
              <button
                onClick={() => {
                  sounds.playPhaseBell();
                  adminNextPhase();
                }}
                className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-indigo-950/50 flex items-center gap-2 transition-all transform active:scale-95"
              >
                <SkipForward className="w-4 h-4" /> FORCE NEXT STAGE
              </button>
            </>
          )}

          <button
            onClick={() => {
              if (window.confirm('Reset game room back to lobby? Roles and points will reset.')) {
                sounds.playClick();
                adminResetGame();
              }
            }}
            className="px-4 py-3 bg-slate-800/90 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> RESET ROOM
          </button>
        </div>
      </div>

      {/* Mafia Count Selection */}
      <div className="bg-[#121522] border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-800 text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white text-sm block">Mafia Count Selection</span>
            <p className="text-[11px] text-slate-400">Set how many Mafias are randomly assigned per round</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[1, 2, 3].map((count) => (
            <button
              key={count}
              onClick={() => {
                sounds.playClick();
                adminUpdateMafiaCount(count);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                gameState.mafiaCountSetting === count
                  ? 'bg-red-950 text-red-300 border-red-500 shadow-lg shadow-red-950/50 scale-105'
                  : 'bg-[#090a0f] text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {count} Mafia{count > 1 ? 's' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Typing Task Length Control */}
      <div className="bg-[#121522] border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-400">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white text-sm block">Typing Task Word Count</span>
            <p className="text-[11px] text-slate-400">Choose custom word length for Villager cover typing tasks</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { label: 'Auto (Timer)', value: 0 },
            { label: '5 Words', value: 5 },
            { label: '10 Words', value: 10 },
            { label: '15 Words', value: 15 },
            { label: '20 Words', value: 20 },
            { label: '25 Words', value: 25 },
            { label: '30 Words', value: 30 }
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => {
                sounds.playClick();
                adminUpdateTypingWordCount(item.value);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                (gameState.typingWordCountSetting || 0) === item.value
                  ? 'bg-amber-950 text-amber-300 border-amber-500 shadow-lg shadow-amber-950/50 scale-105'
                  : 'bg-[#090a0f] text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimerSettings />
        <PointsConfig />
      </div>

      {/* Connected Players List */}
      <PlayerManagement />

      {/* Secret God-Mode Modal */}
      <SecretAdminModal isOpen={isSecretOpen} onClose={() => setIsSecretOpen(false)} />
    </div>
  );
};

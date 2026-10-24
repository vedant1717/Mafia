import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { Users, CheckCircle2, Clock, Skull, ShieldCheck, WifiOff } from 'lucide-react';

export const RealtimePlayerDashboard = () => {
  const { gameState } = useSocket();
  const { players, phase, votedPlayerIds = [] } = gameState;

  if (players.length === 0) return null;

  return (
    <div className="bg-[#0f131d] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-teal-400" />
          <h3 className="font-['Outfit'] font-black text-xl text-white tracking-wide">
            REALTIME PLAYER STATUS DASHBOARD
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-emerald-400 font-bold">
            Alive: {players.filter(p => p.isAlive).length}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-rose-400 font-bold">
            Eliminated: {players.filter(p => !p.isAlive).length}
          </span>
        </div>
      </div>

      {/* Grid of Players with Live Voting Status */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {players.map((p) => {
          const hasVoted = votedPlayerIds.includes(p.id);

          return (
            <div
              key={p.id}
              className={`p-3.5 rounded-2xl border flex flex-col items-center text-center space-y-2 transition-all relative overflow-hidden ${
                !p.isAlive
                  ? 'bg-[#08090e]/60 border-slate-800/80 opacity-60'
                  : p.isDisconnected
                  ? 'bg-amber-950/20 border-amber-800/60'
                  : 'bg-[#141824] border-slate-800 hover:border-teal-500/50 shadow-md'
              }`}
            >
              {/* Avatar Icon */}
              <div className="text-4xl transform hover:scale-110 transition-transform">
                {p.avatar}
              </div>

              {/* Player Name */}
              <span className={`font-bold text-xs truncate max-w-full ${p.isAlive ? 'text-white' : 'text-slate-500 line-through'}`}>
                {p.name}
              </span>

              {/* Live Status Badge */}
              <div className="pt-1 w-full">
                {!p.isAlive ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono font-semibold">
                    <Skull className="w-3 h-3 text-rose-500" /> Eliminated
                  </span>
                ) : p.isDisconnected ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-800 text-[10px] text-amber-300 font-mono font-semibold">
                    <WifiOff className="w-3 h-3 text-amber-400" /> Reconnecting
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-[10px] text-emerald-400 font-mono font-semibold">
                    <ShieldCheck className="w-3 h-3" /> Alive
                  </span>
                )}
              </div>

              {/* Live Voting Tracker Indicator during DAY_VOTING & NIGHT_MAFIA */}
              {p.isAlive && (phase === 'DAY_VOTING' || phase === 'NIGHT_MAFIA') && (
                <div className="w-full pt-1">
                  {hasVoted ? (
                    <span className="px-2 py-0.5 rounded-lg bg-teal-950 border border-teal-600 text-teal-300 text-[10px] font-bold font-mono flex items-center justify-center gap-1 animate-fade-in">
                      <CheckCircle2 className="w-3 h-3 text-teal-400" /> VOTED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-lg bg-[#08090e] border border-slate-800 text-amber-400 text-[10px] font-bold font-mono flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 animate-spin" /> WAITING...
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

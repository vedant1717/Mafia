import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { Trophy, ShieldCheck, Skull } from 'lucide-react';

export const Scoreboard = () => {
  const { gameState } = useSocket();

  // Sort players by points descending
  const sortedPlayers = [...gameState.players].sort((a, b) => b.points - a.points);

  return (
    <div className="bg-[#161926]/95 backdrop-blur-md border-2 border-amber-500/40 rounded-2xl p-4 shadow-2xl space-y-3 w-full max-w-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 text-amber-400">
          <Trophy className="w-5 h-5 animate-pulse" />
          <h4 className="font-['Cinzel'] font-bold text-sm text-white tracking-wider">LIVE SCOREBOARD</h4>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Pts</span>
      </div>

      {sortedPlayers.length === 0 ? (
        <div className="text-center text-slate-500 text-xs py-3">No scores recorded</div>
      ) : (
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {sortedPlayers.map((p, idx) => (
            <div
              key={p.id}
              className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-all ${
                p.isAlive
                  ? 'bg-[#0d0f17] border-slate-800 text-slate-200'
                  : 'bg-rose-950/20 border-rose-900/40 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="font-mono text-[10px] font-bold text-amber-400 w-3">{idx + 1}.</span>
                <span className="text-lg">{p.avatar}</span>
                <span className="font-semibold truncate max-w-[90px]">{p.name}</span>
                {!p.isAlive && <Skull className="w-3.5 h-3.5 text-rose-500 inline flex-shrink-0" />}
              </div>
              <span className="font-mono font-bold text-amber-300 text-sm bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                {p.points}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { Users, UserX, ShieldCheck, Skull } from 'lucide-react';
import { sounds } from '../../utils/audio';

export const PlayerManagement = () => {
  const { gameState, adminKickPlayer } = useSocket();

  const handleKick = (socketId, name) => {
    if (window.confirm(`Are you sure you want to kick ${name} from the game?`)) {
      sounds.playClick();
      adminKickPlayer(socketId);
    }
  };

  return (
    <div className="bg-[#161926] border border-slate-800 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-cyan-400">
          <Users className="w-5 h-5" />
          <h3 className="font-['Cinzel'] font-bold text-base text-white">
            Connected Players ({gameState.players.length})
          </h3>
        </div>
      </div>

      {gameState.players.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-xs">
          No players connected yet. Ask players to scan the QR code on the display screen!
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {gameState.players.map((p) => (
            <div
              key={p.id}
              className="bg-[#0d0f17] p-3 rounded-xl border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.avatar}</span>
                <div>
                  <span className="font-bold text-white text-sm block">{p.name}</span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span className={p.isAlive ? 'text-emerald-400' : 'text-rose-400 flex items-center gap-0.5'}>
                      {p.isAlive ? <ShieldCheck className="w-3 h-3 inline" /> : <Skull className="w-3 h-3 inline" />}
                      {p.isAlive ? 'Alive' : 'Eliminated'}
                    </span>
                    <span>•</span>
                    <span>{p.points} Pts</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleKick(p.id, p.name)}
                className="px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <UserX className="w-3.5 h-3.5" /> Kick
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

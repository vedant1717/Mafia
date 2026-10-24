import React from 'react';
import { Skull, Eye } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export const SpectatorView = () => {
  const { gameState } = useSocket();

  return (
    <div className="max-w-md mx-auto my-6 p-6 bg-[#161926] border border-slate-800 rounded-2xl shadow-2xl text-center space-y-4">
      <div className="w-16 h-16 mx-auto rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400">
        <Skull className="w-8 h-8 text-rose-500 animate-pulse" />
      </div>

      <h3 className="font-['Cinzel'] font-bold text-2xl text-white">YOU HAVE BEEN ELIMINATED</h3>
      <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
        You are now a ghost spectator. Watch the game drama unfold on the main Display Screen!
      </p>

      <div className="p-3 bg-[#0d0f17] rounded-xl border border-slate-800 flex items-center justify-center gap-2 text-xs text-amber-400 font-medium">
        <Eye className="w-4 h-4" /> Current Phase: <span className="uppercase text-white font-bold">{gameState.phase.replace(/_/g, ' ')}</span>
      </div>
    </div>
  );
};

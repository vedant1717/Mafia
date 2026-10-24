import React from 'react';
import { useSocket } from '../context/SocketContext';

export const CountdownOverlay = () => {
  const { countdownTick } = useSocket();

  if (!countdownTick) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none select-none">
      <div className="text-center space-y-4">
        <p className="font-['Outfit'] font-black text-slate-400 text-lg sm:text-2xl uppercase tracking-widest animate-pulse">
          GAME STARTING IN
        </p>

        <div className="font-['Outfit'] font-black text-8xl sm:text-9xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-red-500 via-rose-500 to-amber-400 drop-shadow-[0_10px_35px_rgba(239,68,68,0.6)] animate-countdown">
          {countdownTick}
        </div>
      </div>
    </div>
  );
};

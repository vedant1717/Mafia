import React from 'react';
import { ShieldAlert, Wifi, WifiOff } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const Navbar = ({ activePanel }) => {
  const { isConnected, gameState } = useSocket();

  const getPanelBadge = () => {
    if (activePanel === 'admin') return 'ADMIN CONTROL UNIT';
    if (activePanel === 'display') return 'GAME DISPLAY UNIT';
    return 'PLAYER PANEL';
  };

  return (
    <header className="bg-[#0b0d14]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Clean Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-950/50 border border-red-500/30">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-['Outfit'] font-extrabold text-xl tracking-tight text-white flex items-center gap-2">
              MAFIA
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
              <span className={`flex items-center gap-1 font-semibold ${isConnected ? 'text-emerald-400' : 'text-rose-500'}`}>
                {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isConnected ? 'Online' : 'Reconnecting...'}
              </span>
              <span>•</span>
              <span className="text-amber-400 font-bold uppercase tracking-wider">
                {gameState.phase.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Current Unit Badge */}
        <div className="px-3 py-1 rounded-lg bg-[#141724] border border-slate-800 text-[11px] font-bold text-slate-300 font-mono">
          {getPanelBadge()}
        </div>
      </div>
    </header>
  );
};

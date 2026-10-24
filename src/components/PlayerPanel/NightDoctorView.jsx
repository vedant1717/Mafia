import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { HeartPulse, ShieldCheck } from 'lucide-react';
import { sounds } from '../../utils/audio';

export const NightDoctorView = () => {
  const { gameState, doctorSave } = useSocket();
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleSave = (targetId) => {
    sounds.playClick();
    setSelectedTarget(targetId);
    doctorSave(targetId);
    setConfirmed(true);
  };

  const livingPlayers = gameState.players.filter(p => p.isAlive);

  return (
    <div className="max-w-md mx-auto my-4 bg-[#161926] border border-emerald-900/60 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 p-4 border-b border-emerald-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <HeartPulse className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="font-['Cinzel'] text-lg font-bold text-white tracking-wider">DOCTOR NIGHT TURN</h2>
            <p className="text-xs text-emerald-300">Choose one player to protect tonight</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-900/80 text-emerald-200 border border-emerald-700 text-xs font-mono font-bold">
          {gameState.currentTimer}s
        </span>
      </div>

      <div className="p-4 space-y-4">
        <p className="text-xs text-slate-300">
          Select a player to save from potential Mafia attack tonight (you can choose yourself as well):
        </p>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {livingPlayers.map((p) => {
            const isSelected = selectedTarget === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleSave(p.id)}
                className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-emerald-950/90 border-emerald-500 shadow-md shadow-emerald-900/50 text-white font-bold scale-[1.02]'
                    : 'bg-[#0d0f17] border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.avatar}</span>
                  <span className="text-sm font-semibold">{p.name}</span>
                </div>
                {isSelected && (
                  <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5" /> Saved
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {confirmed && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-center text-xs text-emerald-200 font-medium">
            ✓ Protection order registered for tonight.
          </div>
        )}
      </div>
    </div>
  );
};

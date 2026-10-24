import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { Trophy, Save } from 'lucide-react';
import { sounds } from '../../utils/audio';

export const PointsConfig = () => {
  const { gameState, adminUpdatePoints } = useSocket();

  const [points, setPoints] = useState({
    mafiaKillSuccess: gameState.pointsConfig.mafiaKillSuccess || 40,
    doctorSaveSuccess: gameState.pointsConfig.doctorSaveSuccess || 50,
    villagerVoteMafia: gameState.pointsConfig.villagerVoteMafia || 30,
    survivalPerRound: gameState.pointsConfig.survivalPerRound || 10
  });

  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    sounds.playClick();
    adminUpdatePoints(points);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <div className="bg-[#161926] border border-slate-800 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-amber-400">
          <Trophy className="w-5 h-5" />
          <h3 className="font-['Cinzel'] font-bold text-base text-white">Points System Rules</h3>
        </div>
        {savedMsg && (
          <span className="text-xs text-emerald-400 font-bold bg-emerald-950 px-2 py-1 rounded border border-emerald-800">
            ✓ Points Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-[#0d0f17] p-3 rounded-xl border border-slate-800 space-y-1">
          <label className="block text-xs font-semibold text-slate-300">Mafia Kill Success (+pts)</label>
          <input
            type="number"
            value={points.mafiaKillSuccess}
            onChange={(e) => setPoints({ ...points, mafiaKillSuccess: parseInt(e.target.value) || 0 })}
            className="w-full bg-[#161926] border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-amber-300 font-mono font-bold focus:outline-none"
          />
        </div>

        <div className="bg-[#0d0f17] p-3 rounded-xl border border-slate-800 space-y-1">
          <label className="block text-xs font-semibold text-slate-300">Doctor Save Success (+pts)</label>
          <input
            type="number"
            value={points.doctorSaveSuccess}
            onChange={(e) => setPoints({ ...points, doctorSaveSuccess: parseInt(e.target.value) || 0 })}
            className="w-full bg-[#161926] border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-emerald-300 font-mono font-bold focus:outline-none"
          />
        </div>

        <div className="bg-[#0d0f17] p-3 rounded-xl border border-slate-800 space-y-1">
          <label className="block text-xs font-semibold text-slate-300">Correct Mafia Vote (+pts)</label>
          <input
            type="number"
            value={points.villagerVoteMafia}
            onChange={(e) => setPoints({ ...points, villagerVoteMafia: parseInt(e.target.value) || 0 })}
            className="w-full bg-[#161926] border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-blue-300 font-mono font-bold focus:outline-none"
          />
        </div>

        <div className="bg-[#0d0f17] p-3 rounded-xl border border-slate-800 space-y-1">
          <label className="block text-xs font-semibold text-slate-300">Round Survival (+pts)</label>
          <input
            type="number"
            value={points.survivalPerRound}
            onChange={(e) => setPoints({ ...points, survivalPerRound: parseInt(e.target.value) || 0 })}
            className="w-full bg-[#161926] border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-purple-300 font-mono font-bold focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2 pt-2">
          <button
            type="submit"
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-950/40"
          >
            <Save className="w-4 h-4" /> Save Point Rules
          </button>
        </div>
      </form>
    </div>
  );
};

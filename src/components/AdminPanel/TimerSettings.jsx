import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { Clock, Save, Plus, Minus } from 'lucide-react';
import { sounds } from '../../utils/audio';

export const TimerSettings = () => {
  const { gameState, adminUpdateTimers } = useSocket();

  const [timers, setTimers] = useState({
    mafiaTime: gameState.timers.mafiaTime || 30,
    doctorTime: gameState.timers.doctorTime || 25,
    discussionTime: gameState.timers.discussionTime || 60,
    votingTime: gameState.timers.votingTime || 30,
    tieDiscussionTime: gameState.timers.tieDiscussionTime || 30
  });

  const [savedMessage, setSavedMessage] = useState(false);

  const parseMinSec = (totalSec) => ({
    min: Math.floor(totalSec / 60),
    sec: totalSec % 60
  });

  const handleChange = (key, minutes, seconds) => {
    const total = (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0);
    setTimers(prev => ({ ...prev, [key]: Math.max(5, total) }));
  };

  const handleAdjust = (key, deltaSec) => {
    sounds.playClick();
    setTimers(prev => ({ ...prev, [key]: Math.max(5, prev[key] + deltaSec) }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    sounds.playClick();
    adminUpdateTimers(timers);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  const renderTimerRow = (label, key, desc) => {
    const { min, sec } = parseMinSec(timers[key]);
    return (
      <div className="bg-[#0b0d14] p-4 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        <div>
          <span className="font-bold text-white text-sm block">{label}</span>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{desc}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Preset adjuster buttons */}
          <div className="flex items-center gap-1 bg-[#121522] p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleAdjust(key, -10)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold"
            >
              -10s
            </button>
            <button
              type="button"
              onClick={() => handleAdjust(key, 10)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold"
            >
              +10s
            </button>
            <button
              type="button"
              onClick={() => handleAdjust(key, 30)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold"
            >
              +30s
            </button>
          </div>

          {/* Min + Sec Inputs */}
          <div className="flex items-center gap-1 bg-[#161926] border border-slate-700 rounded-xl px-2.5 py-1.5 shadow-inner">
            <input
              type="number"
              min="0"
              max="59"
              value={min}
              onChange={(e) => handleChange(key, e.target.value, sec)}
              className="w-8 bg-transparent text-purple-300 font-mono text-sm font-bold text-center focus:outline-none"
            />
            <span className="text-xs text-slate-500 font-bold">m</span>
            <span className="text-slate-600 font-bold">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={sec}
              onChange={(e) => handleChange(key, min, e.target.value)}
              className="w-8 bg-transparent text-purple-300 font-mono text-sm font-bold text-center focus:outline-none"
            />
            <span className="text-xs text-slate-500 font-bold">s</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#121522] border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5 text-purple-400">
          <Clock className="w-6 h-6" />
          <h3 className="font-['Cinzel'] font-bold text-lg text-white">CUSTOM PHASE TIMERS</h3>
        </div>
        {savedMessage && (
          <span className="text-xs text-emerald-400 font-bold bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800 animate-pulse">
            ✓ Timers Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        {renderTimerRow('Mafia Night Killing Time', 'mafiaTime', 'Duration for Mafias to choose victim and chat secretly')}
        {renderTimerRow('Doctor Saving Time', 'doctorTime', 'Duration for Doctor to choose who to protect')}
        {renderTimerRow('Daytime Discussion Time', 'discussionTime', 'Duration for all players to debate before voting')}
        {renderTimerRow('Day Voting Duration', 'votingTime', 'Duration for casting votes against suspects')}
        {renderTimerRow('Tie-Break Addon Discussion', 'tieDiscussionTime', 'Extra time added if daytime voting results in a tie')}

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-purple-950/60 border border-purple-400/30 transition-all transform active:scale-95"
        >
          <Save className="w-4 h-4" /> Save All Timer Customizations
        </button>
      </form>
    </div>
  );
};

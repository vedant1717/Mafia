import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { MousePointerClick, CheckCircle2, Shield } from 'lucide-react';
import { sounds } from '../../utils/audio';

export const TappingDistractionTask = () => {
  const { gameState, tapCoverTask } = useSocket();
  const [taps, setTaps] = useState(0);
  const targetTaps = 15;
  const isDone = taps >= targetTaps;

  const handleTap = () => {
    if (isDone) return;
    sounds.playClick();
    const newCount = taps + 1;
    setTaps(newCount);
    tapCoverTask();
  };

  return (
    <div className="max-w-md mx-auto my-4 bg-[#161926] border border-cyan-900/60 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-950 via-blue-900 to-cyan-950 p-4 border-b border-cyan-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <MousePointerClick className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="font-['Cinzel'] text-lg font-bold text-white tracking-wider">COVER TASK: RAPID TAPPING</h2>
            <p className="text-xs text-cyan-300">Tap the shield targets on screen to conceal the Doctor!</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-cyan-900/80 text-cyan-200 border border-cyan-700 text-xs font-mono font-bold">
          {gameState.currentTimer}s
        </span>
      </div>

      <div className="p-6 space-y-5 text-center">
        {!isDone ? (
          <>
            <p className="text-xs text-slate-300">
              Rapidly tap the button below ({targetTaps - taps} more tap{targetTaps - taps > 1 ? 's' : ''} needed):
            </p>

            <button
              onClick={handleTap}
              className="w-36 h-36 mx-auto rounded-full bg-gradient-to-tr from-cyan-600 via-blue-600 to-teal-500 border-4 border-cyan-400 shadow-2xl shadow-cyan-900/50 flex flex-col items-center justify-center gap-2 transform active:scale-90 transition-all cursor-pointer"
            >
              <Shield className="w-10 h-10 text-white animate-pulse" />
              <span className="font-mono text-xl font-bold text-white">{taps} / {targetTaps}</span>
            </button>

            <div className="w-full bg-[#0d0f17] h-3 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-150"
                style={{ width: `${Math.min(100, (taps / targetTaps) * 100)}%` }}
              />
            </div>
          </>
        ) : (
          <div className="p-5 bg-emerald-950/80 border border-emerald-700 rounded-xl text-center space-y-2 animate-fade-in">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-emerald-200 text-base">Cover Tapping Complete!</h4>
            <p className="text-xs text-emerald-300">Great job masking the Doctor's identity! Waiting for night to end...</p>
          </div>
        )}
      </div>
    </div>
  );
};

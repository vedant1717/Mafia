import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { sounds } from '../utils/audio';

export const AuthModal = ({ targetPanel, onAuthenticate }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    sounds.playClick();

    if (password === 'Brock1122') {
      sounds.playPhaseBell();
      setError(false);
      onAuthenticate(true);
    } else {
      sounds.playTensionSting();
      setError(true);
      setPassword('');
    }
  };

  const panelTitle = targetPanel === 'admin' ? 'Admin Control Unit' : 'Game Display Unit';

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-[#161926] via-[#0d0f17] to-[#07090e] border-2 border-red-900/60 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-red-950/50 space-y-6 text-center relative overflow-hidden">
        {/* Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

        <div className="inline-flex p-4 rounded-2xl bg-red-950/80 border border-red-800 text-red-400 shadow-xl shadow-red-950/40">
          <Lock className="w-10 h-10 animate-pulse" />
        </div>

        <div>
          <h2 className="font-['Cinzel'] font-black text-2xl text-white tracking-wider">
            RESTRICTED ACCESS
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enter security passphrase to unlock the <span className="text-red-400 font-bold">{panelTitle}</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => {
                setError(false);
                setPassword(e.target.value);
              }}
              placeholder="Enter Access Password..."
              className={`w-full bg-[#07090e] border text-white rounded-2xl px-4 py-3.5 pl-11 text-base placeholder-slate-600 font-mono tracking-widest focus:outline-none transition-all ${
                error
                  ? 'border-rose-500 ring-2 ring-rose-500/30'
                  : 'border-slate-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/30'
              }`}
            />
            <KeyRound className="w-5 h-5 text-slate-500 absolute left-3.5 top-4" />
          </div>

          {error && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-300 font-medium flex items-center justify-center gap-1.5 animate-bounce">
              <ShieldAlert className="w-4 h-4 text-rose-400" /> Invalid Password! Access Denied.
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-bold rounded-2xl shadow-xl shadow-red-950/50 border border-red-500/40 flex items-center justify-center gap-2 tracking-wider transition-all transform active:scale-95"
          >
            <span>UNLOCK UNIT</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="text-[11px] text-slate-500 font-mono">
          Security Password Protection Enabled • Brock1122
        </p>
      </div>
    </div>
  );
};

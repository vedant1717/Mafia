import React, { useState } from 'react';
import { AVATARS } from '../../utils/avatars';
import { useSocket } from '../../context/SocketContext';
import { sounds } from '../../utils/audio';
import { User, Sparkles } from 'lucide-react';

export const PlayerJoin = () => {
  const { joinGame } = useSocket();
  const [name, setName] = useState(() => localStorage.getItem('mafia_player_name') || '');
  const [selectedAvatar, setSelectedAvatar] = useState(() => localStorage.getItem('mafia_player_avatar') || AVATARS[0].emoji);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    sounds.playClick();
    joinGame(name.trim(), selectedAvatar);
  };

  return (
    <div className="max-w-md mx-auto my-6 p-6 bg-[#0f131d] border border-slate-800 rounded-3xl shadow-2xl">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-teal-950/80 border border-teal-700/60 mb-3 shadow-xl shadow-teal-950/40 text-4xl transform hover:scale-110 transition-all">
          {selectedAvatar}
        </div>
        <h2 className="font-['Outfit'] font-black text-2xl text-white tracking-wide">ENTER THE ROOM</h2>
        <p className="text-xs text-slate-400 mt-1">Pick a mask avatar and type your alias to join the game.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Player Alias
          </label>
          <div className="relative">
            <input
              type="text"
              required
              maxLength={15}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Berlin, Tokyo, Denver"
              className="w-full bg-[#08090e] border border-slate-700 focus:border-teal-500 text-white rounded-2xl px-4 py-3.5 pl-11 text-base placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-medium transition-all"
            />
            <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-4" />
          </div>
        </div>

        {/* Avatar Selection Grid - NO TEXT NAMES */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Choose Mask / Character Picture
          </label>
          <div className="grid grid-cols-4 gap-3 max-h-52 overflow-y-auto pr-1">
            {AVATARS.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setSelectedAvatar(av.emoji);
                }}
                className={`p-3.5 rounded-2xl border flex items-center justify-center transition-all ${
                  selectedAvatar === av.emoji
                    ? 'bg-teal-950/90 border-teal-400 shadow-lg shadow-teal-950/60 scale-105 ring-2 ring-teal-400/40'
                    : 'bg-[#08090e] border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                }`}
              >
                <span className="text-3xl">{av.emoji}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 px-4 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-2xl shadow-xl shadow-teal-950/50 border border-teal-400/30 flex items-center justify-center gap-2 tracking-wider transition-all transform active:scale-95"
        >
          <Sparkles className="w-5 h-5" />
          <span>JOIN ROOM NOW</span>
        </button>
      </form>
    </div>
  );
};

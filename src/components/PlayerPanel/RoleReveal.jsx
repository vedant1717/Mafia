import React, { useState, useRef } from 'react';
import { EyeOff, Shield, HeartPulse, User } from 'lucide-react';
import { sounds } from '../../utils/audio';

export const RoleReveal = ({ roleInfo }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const cardRef = useRef(null);

  const handlePointerDown = (e) => {
    e.preventDefault();
    sounds.playTensionSting();
    setIsRevealed(true);

    // Capture pointer to ensure pointerup/pointercancel events are caught even if finger moves outside
    if (cardRef.current && e.pointerId) {
      try {
        cardRef.current.setPointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const handlePointerUp = (e) => {
    if (e) e.preventDefault();
    setIsRevealed(false);
    if (cardRef.current && e?.pointerId) {
      try {
        cardRef.current.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const role = roleInfo?.role || 'VILLAGER';

  const getRoleDetails = () => {
    switch (role) {
      case 'MAFIA':
        return {
          title: 'MAFIA',
          icon: Shield,
          desc: 'Objective: Choose a victim to eliminate each night. Coordinate secretly with your fellow Mafias!'
        };
      case 'DOCTOR':
        return {
          title: 'DOCTOR',
          icon: HeartPulse,
          desc: 'Objective: Select one citizen to save from attack each night. Protect the innocent!'
        };
      default:
        return {
          title: 'VILLAGER',
          icon: User,
          desc: 'Objective: Complete cover tasks at night and deduce who the Mafia is during daytime discussions!'
        };
    }
  };

  const details = getRoleDetails();
  const IconComponent = details.icon;

  return (
    <div className="max-w-md mx-auto my-6 p-6 bg-[#0f131d] border border-slate-800 rounded-3xl shadow-2xl text-center space-y-6">
      <div>
        <h2 className="font-['Outfit'] font-black text-2xl text-white tracking-wide">SECRET IDENTITY</h2>
        <p className="text-xs text-slate-400 mt-1">Press and HOLD the stealth card to view your role.</p>
      </div>

      {/* Stealth Card - Neutral uniform background for ALL roles (prevents face reflection leaks) */}
      <div
        ref={cardRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onContextMenu={(e) => e.preventDefault()}
        style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
        className={`relative w-full h-64 rounded-3xl border-2 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center p-6 ${
          isRevealed
            ? 'bg-[#141824] border-amber-400/80 shadow-2xl scale-[1.02]'
            : 'bg-[#08090e] border-slate-800 hover:border-slate-700 shadow-inner'
        }`}
      >
        {isRevealed ? (
          <div className="animate-fade-in space-y-3 pointer-events-none">
            <div className="inline-flex p-4 rounded-2xl bg-[#08090e] border border-slate-700 shadow-md">
              <IconComponent className="w-10 h-10 text-white animate-bounce" />
            </div>
            {/* Common Neutral Typography - No colored light flares */}
            <h3 className="font-['Outfit'] font-black text-3xl tracking-widest text-white">
              {details.title}
            </h3>
            <p className="text-xs text-slate-300 max-w-xs leading-relaxed font-medium">
              {details.desc}
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-slate-500 pointer-events-none">
            <div className="inline-flex p-4 rounded-2xl bg-[#0e111a] border border-slate-800">
              <EyeOff className="w-10 h-10 text-slate-400" />
            </div>
            <p className="font-['Outfit'] font-bold text-sm tracking-widest uppercase text-slate-300">
              HOLD TO REVEAL ROLE
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              Release finger to instantly hide role
            </p>
          </div>
        )}
      </div>

      <div className="p-3 bg.bg-[#08090e] bg-[#08090e] rounded-2xl border border-slate-800 text-xs text-slate-400 font-medium">
        🔒 Stealth Screen Active • Uniform lighting across all roles
      </div>
    </div>
  );
};

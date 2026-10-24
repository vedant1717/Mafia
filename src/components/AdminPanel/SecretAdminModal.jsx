import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { Eye, Shield, HeartPulse, User, X, RefreshCw, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/audio';

export const SecretAdminModal = ({ isOpen, onClose }) => {
  const {
    secretAdminData,
    adminRequestSecretState,
    adminSetManualRole,
    adminClearManualRoles
  } = useSocket();

  const [selectedOverrides, setSelectedOverrides] = useState({});

  useEffect(() => {
    if (isOpen) {
      sounds.playTensionSting();
      adminRequestSecretState();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRoleChange = (playerName, role) => {
    sounds.playClick();
    setSelectedOverrides(prev => ({ ...prev, [playerName]: role }));
    adminSetManualRole(playerName, role);
  };

  const handleClear = () => {
    sounds.playClick();
    setSelectedOverrides({});
    adminClearManualRoles();
  };

  const roles = secretAdminData?.roles || [];
  const manualOverrides = secretAdminData?.manualOverrides || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#161926] border-2 border-red-600/80 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl shadow-red-950/60 relative overflow-hidden">
        {/* Glowing top line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5 text-red-500">
            <Eye className="w-6 h-6 animate-pulse" />
            <div>
              <h3 className="font-['Cinzel'] font-black text-xl text-white tracking-wider flex items-center gap-2">
                CLASSIFIED ADMIN GOD-MODE
              </h3>
              <p className="text-[11px] text-red-400 font-mono">Secret Role Inspector & Preset Override</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-200">
          🔒 <span className="font-bold">Hidden Panel Active:</span> Below are the exact secret assigned roles for all players. You can manually assign who becomes Mafia/Doctor for current/upcoming rounds.
        </div>

        {/* Secret Player Roles List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {roles.length === 0 ? (
            <div className="text-center text-slate-500 text-xs py-4">No players currently in room</div>
          ) : (
            roles.map((p) => {
              const forced = manualOverrides.find(m => m.name.toLowerCase() === p.name.toLowerCase());
              return (
                <div
                  key={p.id}
                  className="bg-[#0d0f17] p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="font-bold text-white text-sm block">{p.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Assigned Role: <strong className="text-amber-400 uppercase">{p.role || 'Unassigned'}</strong>
                    </span>
                  </div>

                  {/* Manual Role Picker */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleRoleChange(p.name, 'MAFIA')}
                      className={`px-2 py-1 rounded text-xs font-bold border transition-all ${
                        (forced?.role === 'MAFIA' || p.role === 'MAFIA')
                          ? 'bg-red-900/90 text-red-200 border-red-600'
                          : 'bg-[#161926] text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <Shield className="w-3 h-3 inline mr-1" /> Mafia
                    </button>

                    <button
                      onClick={() => handleRoleChange(p.name, 'DOCTOR')}
                      className={`px-2 py-1 rounded text-xs font-bold border transition-all ${
                        (forced?.role === 'DOCTOR' || p.role === 'DOCTOR')
                          ? 'bg-emerald-900/90 text-emerald-200 border-emerald-600'
                          : 'bg-[#161926] text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <HeartPulse className="w-3 h-3 inline mr-1" /> Doctor
                    </button>

                    <button
                      onClick={() => handleRoleChange(p.name, 'VILLAGER')}
                      className={`px-2 py-1 rounded text-xs font-bold border transition-all ${
                        (forced?.role === 'VILLAGER' || p.role === 'VILLAGER')
                          ? 'bg-blue-900/90 text-blue-200 border-blue-600'
                          : 'bg-[#161926] text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <User className="w-3 h-3 inline mr-1" /> Villager
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={handleClear}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Clear Manual Overrides
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-red-950/40"
          >
            <Sparkles className="w-3.5 h-3.5" /> Close Secret Panel
          </button>
        </div>
      </div>
    </div>
  );
};

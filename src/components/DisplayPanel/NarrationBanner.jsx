import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { HeartHandshake, ShieldAlert, AlertTriangle } from 'lucide-react';

export const NarrationBanner = () => {
  const { gameState } = useSocket();
  const { nightResult, votingResult, phase } = gameState;

  const getNarrationText = () => {
    switch (phase) {
      case 'ROLE_REVEAL':
        return {
          headline: "THE SHADOWS ENGULF THE TOWN...",
          body: "Players are secretly checking their assigned roles on their phones. Keep your identity hidden!",
          type: 'info'
        };
      case 'NIGHT_MAFIA':
        return {
          headline: "NIGHT HAS FALLEN UPON THE VILLAGE",
          body: "The Mafia is deliberating in secrecy. Villagers must complete their cover typing tasks or be eliminated!",
          type: 'danger'
        };
      case 'NIGHT_DOCTOR':
        return {
          headline: "THE DOCTOR MOVES IN THE FOG",
          body: "The Doctor is selecting a citizen to protect tonight. Non-Doctors are performing tapping tasks to keep the Doctor safe.",
          type: 'doctor'
        };
      case 'DAY_DISCUSSION':
        if (nightResult) {
          if (nightResult.wasSaved) {
            return {
              headline: "DAY BREAKS - NO ONE WAS KILLED!",
              body: "The Doctor successfully protected the victim tonight! The town breathes a sigh of relief.",
              type: 'success'
            };
          } else if (nightResult.killedPlayer) {
            return {
              headline: `DAY BREAKS - ${nightResult.killedPlayer.name.toUpperCase()} WAS ELIMINATED!`,
              body: `${nightResult.killedPlayer.name} fell victim to the Mafia during the night. The villagers gather to uncover who committed the crime.`,
              type: 'danger'
            };
          }
        }
        return {
          headline: "SUNRISE OVER THE TOWN",
          body: "Gather round, citizens! Debate and figure out who amongst you is hiding in the Mafia.",
          type: 'info'
        };
      case 'DAY_TIE_DISCUSSION':
        return {
          headline: "TIE VOTE DETECTED! ADDON DISCUSSION TIME",
          body: "The town voting resulted in a split decision. Extra discussion time granted before casting the tie-breaking votes!",
          type: 'warning'
        };
      case 'DAY_VOTING':
        return {
          headline: "TIME TO CAST YOUR VOTES!",
          body: "Every living player gets 1 vote on their phone screen. Vote out the suspect you believe is Mafia.",
          type: 'vote'
        };
      default:
        return null;
    }
  };

  const narration = getNarrationText();
  if (!narration) return null;

  const getTypeStyle = () => {
    switch (narration.type) {
      case 'danger':
        return 'bg-gradient-to-r from-slate-900/90 via-[#0f131d] to-slate-900/90 border-slate-700 text-slate-200';
      case 'success':
        return 'bg-gradient-to-r from-teal-950/80 via-emerald-950/90 to-teal-950/80 border-teal-700/80 text-teal-200';
      case 'doctor':
        return 'bg-gradient-to-r from-teal-950/80 via-cyan-950/90 to-teal-950/80 border-teal-700/80 text-teal-200';
      case 'warning':
        return 'bg-gradient-to-r from-amber-950/80 via-yellow-950/90 to-amber-950/80 border-amber-600/80 text-amber-200';
      default:
        return 'bg-gradient-to-r from-slate-900/90 via-[#0f131d] to-slate-900/90 border-slate-700 text-slate-200';
    }
  };

  return (
    <div className={`p-6 rounded-3xl border shadow-2xl text-center my-6 max-w-4xl mx-auto space-y-3 animate-fade-in ${getTypeStyle()}`}>
      <div className="flex items-center justify-center gap-2">
        {narration.type === 'success' && <HeartHandshake className="w-7 h-7 text-emerald-400" />}
        {narration.type === 'danger' && <ShieldAlert className="w-7 h-7 text-teal-400" />}
        {narration.type === 'warning' && <AlertTriangle className="w-7 h-7 text-amber-400" />}
        <h3 className="font-['Outfit'] font-extrabold text-xl sm:text-2xl tracking-tight uppercase text-white">
          {narration.headline}
        </h3>
      </div>
      <p className="text-sm sm:text-base leading-relaxed opacity-95 max-w-2xl mx-auto font-medium">
        {narration.body}
      </p>

      {/* Failed cover players announcement */}
      {nightResult && nightResult.failedCoverPlayers && nightResult.failedCoverPlayers.length > 0 && phase === 'DAY_DISCUSSION' && (
        <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl max-w-md mx-auto text-xs text-rose-200 font-medium">
          ⚠️ <span className="font-bold">Cover Task Failure:</span> {nightResult.failedCoverPlayers.map(p => `${p.avatar} ${p.name}`).join(', ')} failed to finish their task and were eliminated!
        </div>
      )}

      {/* Voting Elimination Reveal */}
      {votingResult && votingResult.eliminatedPlayer && phase === 'DAY_DISCUSSION' && (
        <div className="mt-3 p-3 bg-[#08090e] border border-teal-700/60 rounded-xl max-w-md mx-auto text-xs text-teal-300 font-mono">
          ⚖️ <strong className="text-white">{votingResult.eliminatedPlayer.name}</strong> was voted out by town majority!
        </div>
      )}
    </div>
  );
};

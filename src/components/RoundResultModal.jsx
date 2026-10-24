import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { HeartHandshake, AlertTriangle, Vote, X, Eye, Trophy, Skull } from 'lucide-react';
import { sounds } from '../utils/audio';

export const RoundResultModal = () => {
  const { gameState, popupTrigger, proceedToLeaderboard } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isFinal, setIsFinal] = useState(false);

  const { nightResult, votingResult, phase, round } = gameState;

  // Listen to direct socket event OR phase transitions
  useEffect(() => {
    if (popupTrigger && popupTrigger.data) {
      setModalData(popupTrigger.data);
      setIsFinal(Boolean(popupTrigger.isFinal));
      setIsOpen(true);
      sounds.playTensionSting();

      // Only auto-close if NOT final elimination, so players have time to see final outcome before leaderboard
      if (!popupTrigger.isFinal) {
        const timer = setTimeout(() => {
          setIsOpen(false);
        }, 8000);
        return () => clearTimeout(timer);
      }
    }
  }, [popupTrigger]);

  useEffect(() => {
    if ((phase === 'DAY_DISCUSSION' || phase === 'DAY_TIE_DISCUSSION') && nightResult && !isOpen && !popupTrigger) {
      setModalData(nightResult);
      setIsFinal(false);
      setIsOpen(true);
      sounds.playTensionSting();

      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [phase, round]);

  const handleDismiss = () => {
    setIsOpen(false);
    if (isFinal) {
      proceedToLeaderboard();
    }
  };

  if (!isOpen || !modalData) return null;

  const isNightOutcome = modalData.wasSaved !== undefined || modalData.killedPlayer !== undefined;
  const isVotingOutcome = modalData.eliminatedPlayer !== undefined;

  const livingMafiasCount = popupTrigger?.livingMafiasCount ?? modalData?.livingMafiasCount;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-gradient-to-b from-[#121624] via-[#0d101a] to-[#080a10] border-2 border-teal-500/70 rounded-3xl max-w-md w-full p-6 space-y-4 text-center shadow-2xl shadow-teal-950/60 relative overflow-hidden">
        {/* Glow Header Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-500" />

        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
            isFinal ? 'bg-amber-950 text-amber-300 border-amber-600 animate-pulse' : 'bg-teal-950/90 text-teal-400 border-teal-800'
          }`}>
            {isFinal ? 'FINAL ELIMINATION REVEAL' : 'DRAMATIC OUTCOME REVEAL'}
          </span>
          <h3 className="font-['Outfit'] font-black text-2xl text-white tracking-wide pt-2">
            ELIMINATION ANNOUNCEMENT
          </h3>
        </div>

        {/* Alive Mafias Remaining Badge */}
        {livingMafiasCount !== undefined && (
          <div className="p-2.5 bg-red-950/90 border border-red-700/80 rounded-2xl flex items-center justify-between text-xs font-bold text-red-200 font-mono shadow-inner">
            <span className="flex items-center gap-1.5 text-red-300">
              <Skull className="w-4 h-4 text-red-400" /> ALIVE MAFIAS REMAINING:
            </span>
            <span className="px-2.5 py-0.5 bg-red-900 border border-red-500 rounded-lg text-white font-black text-sm">
              {livingMafiasCount}
            </span>
          </div>
        )}

        {/* Night Outcome Breakdown */}
        {isNightOutcome && (
          <div className="space-y-3">
            {modalData.wasSaved ? (
              <div className="p-4 bg-emerald-950/80 border border-emerald-600 rounded-2xl space-y-1 text-emerald-200 shadow-md">
                <HeartHandshake className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-bold text-base text-white">DOCTOR SAVED THE VICTIM!</h4>
                <p className="text-xs opacity-90 leading-relaxed">
                  The Doctor protected the target. No one died from attack tonight!
                </p>
              </div>
            ) : modalData.killedPlayer ? (
              <div className="p-4 bg-slate-900/90 border border-slate-700 rounded-2xl space-y-2 text-slate-200 shadow-md">
                <div className="text-4xl">{modalData.killedPlayer.avatar}</div>
                <h4 className="font-['Outfit'] font-black text-xl text-white">
                  {modalData.killedPlayer.name.toUpperCase()} KILLED BY MAFIA!
                </h4>
                {/* Secret Role Revealed */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/90 border border-amber-600 rounded-xl text-xs text-amber-300 font-bold font-mono">
                  <Eye className="w-4 h-4" /> Secret Role: {modalData.killedPlayer.role || 'VILLAGER'}
                </div>
              </div>
            ) : null}

            {/* Task Failure Eliminations with Secret Roles */}
            {modalData.failedCoverPlayers && modalData.failedCoverPlayers.length > 0 && (
              <div className="p-4 bg-rose-950/90 border border-rose-700 rounded-2xl space-y-2 text-rose-200 shadow-md">
                <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto animate-pulse" />
                <h4 className="font-bold text-sm text-white">COVER TASK FAILURE ELIMINATION</h4>
                <p className="text-xs text-rose-300 leading-relaxed">
                  The following players failed to complete their task before time expired and were eliminated:
                </p>
                <div className="space-y-1.5 pt-1">
                  {modalData.failedCoverPlayers.map(p => (
                    <div key={p.id} className="p-2 bg-rose-900/80 rounded-xl text-xs font-bold border border-rose-600 flex items-center justify-between">
                      <span className="text-slate-100 flex items-center gap-1.5">
                        <span className="text-lg">{p.avatar}</span> {p.name}
                      </span>
                      <span className="text-amber-300 font-mono text-[11px] bg-black/50 px-2 py-0.5 rounded">
                        Role: {p.role || 'VILLAGER'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Daytime Voting Outcome Breakdown */}
        {isVotingOutcome && modalData.eliminatedPlayer && (
          <div className="p-4 bg-slate-900/90 border border-teal-600 rounded-2xl space-y-3 text-slate-200 shadow-md">
            <Vote className="w-8 h-8 text-teal-400 mx-auto animate-bounce" />
            <div className="text-4xl">{modalData.eliminatedPlayer.avatar}</div>
            <h4 className="font-['Outfit'] font-black text-xl text-white">
              {modalData.eliminatedPlayer.name.toUpperCase()} VOTED OUT!
            </h4>
            <p className="text-xs text-slate-400">
              Voted out by town majority during daytime voting.
            </p>
            {/* Secret Role Revealed */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-950/90 border border-amber-600 rounded-xl text-xs text-amber-300 font-bold font-mono">
              <Eye className="w-4 h-4" /> Secret Role: {modalData.eliminatedPlayer.role || 'VILLAGER'}
            </div>
          </div>
        )}

        <button
          onClick={handleDismiss}
          className={`w-full py-3.5 font-bold rounded-2xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
            isFinal
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-amber-950/50'
              : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-teal-950/50'
          }`}
        >
          {isFinal ? (
            <>
              <Trophy className="w-4 h-4" /> NEXT STAGE → SHOW LEADERBOARD
            </>
          ) : (
            'GOT IT - CONTINUE'
          )}
        </button>
      </div>
    </div>
  );
};

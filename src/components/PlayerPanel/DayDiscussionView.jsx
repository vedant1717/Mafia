import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { MessageCircle, Clock, ShieldAlert, HeartHandshake, AlertTriangle } from 'lucide-react';

export const DayDiscussionView = () => {
  const { gameState } = useSocket();
  const nightResult = gameState.nightResult;
  const isTiePhase = gameState.phase === 'DAY_TIE_DISCUSSION';

  return (
    <div className="max-w-md mx-auto my-4 bg-[#0f131d] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between ${
        isTiePhase
          ? 'bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-950 border-amber-800/60'
          : 'bg-gradient-to-r from-teal-950 via-emerald-950 to-teal-950 border-teal-800/60'
      }`}>
        <div className="flex items-center gap-3">
          <MessageCircle className={`w-6 h-6 ${isTiePhase ? 'text-amber-400' : 'text-teal-400'}`} />
          <div>
            <h2 className="font-['Outfit'] text-lg font-bold text-white tracking-wide">
              {isTiePhase ? 'TIE-BREAK DISCUSSION' : 'DAYTIME DISCUSSION'}
            </h2>
            <p className={`text-xs ${isTiePhase ? 'text-amber-300' : 'text-teal-300'}`}>
              {isTiePhase ? 'Votes tied! Extra time to deliberate' : 'Debate who the Mafia is with other players'}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full border text-xs font-mono font-bold ${
          isTiePhase ? 'bg-amber-900/80 text-amber-200 border-amber-700' : 'bg-teal-900/80 text-teal-200 border-teal-700'
        }`}>
          {gameState.currentTimer}s
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Night Summary Banner */}
        {nightResult && !isTiePhase && (
          <div className="space-y-3">
            {/* Mafia attack result */}
            <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
              nightResult.wasSaved
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}>
              {nightResult.wasSaved ? (
                <HeartHandshake className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold text-sm">
                  {nightResult.wasSaved ? 'Doctor Saved The Victim!' : 'Night Attack Report'}
                </h4>
                <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
                  {nightResult.wasSaved
                    ? 'No one died from attack! The Doctor protected the target.'
                    : `${nightResult.killedPlayer ? nightResult.killedPlayer.name : 'Someone'} was eliminated by the Mafia tonight.`}
                </p>
              </div>
            </div>

            {/* Task failure eliminations */}
            {nightResult.failedCoverPlayers && nightResult.failedCoverPlayers.length > 0 && (
              <div className="p-4 bg-rose-950/80 border border-rose-800 rounded-2xl text-rose-200 flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-white">Cover Task Failure Penalty</h4>
                  <p className="text-xs mt-0.5 leading-relaxed">
                    The following players failed to finish their cover task in time and were eliminated:
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {nightResult.failedCoverPlayers.map(p => (
                      <span key={p.id} className="px-2.5 py-1 bg-rose-900/90 text-rose-100 rounded-lg text-xs font-bold border border-rose-700">
                        {p.avatar} {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-4 bg-[#08090e] rounded-2xl border border-slate-800 text-center space-y-2">
          <Clock className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
          <h3 className="font-bold text-white text-base">Discussion Timer Ticking...</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Share your suspicions out loud with everyone! Look for nervous behavior or suspicious voting patterns.
          </p>
        </div>
      </div>
    </div>
  );
};

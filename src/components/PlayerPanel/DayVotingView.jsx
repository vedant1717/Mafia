import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { Vote, CheckCircle2 } from 'lucide-react';
import { sounds } from '../../utils/audio';

export const DayVotingView = () => {
  const { gameState, playerInfo, dayVote } = useSocket();
  const [votedTarget, setVotedTarget] = useState(null);

  const handleVote = (targetId) => {
    sounds.playClick();
    setVotedTarget(targetId);
    dayVote(targetId);
  };

  const livingPlayers = gameState.players.filter(p => p.isAlive && p.id !== playerInfo?.id);

  return (
    <div className="max-w-md mx-auto my-4 bg-[#161926] border border-purple-900/60 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-purple-950 p-4 border-b border-purple-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Vote className="w-6 h-6 text-purple-400" />
          <div>
            <h2 className="font-['Cinzel'] text-lg font-bold text-white tracking-wider">VOTING TIME</h2>
            <p className="text-xs text-purple-300">Cast 1 vote against the suspect you believe is Mafia</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-purple-900/80 text-purple-200 border border-purple-700 text-xs font-mono font-bold">
          {gameState.currentTimer}s
        </span>
      </div>

      <div className="p-4 space-y-4">
        {votedTarget ? (
          <div className="p-4 bg-purple-950/80 border border-purple-700 rounded-xl text-center space-y-2 animate-fade-in">
            <CheckCircle2 className="w-8 h-8 text-purple-400 mx-auto" />
            <h4 className="font-bold text-white text-sm">Vote Registered!</h4>
            <p className="text-xs text-purple-200">
              You voted for <span className="font-bold">{gameState.players.find(p => p.id === votedTarget)?.name}</span>. Waiting for timer to complete...
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-300">Select a suspect from below to cast your vote:</p>
        )}

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {livingPlayers.map((p) => {
            const isSelected = votedTarget === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleVote(p.id)}
                className={`w-full p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-purple-950/90 border-purple-500 shadow-md shadow-purple-900/50 text-white font-bold scale-[1.02]'
                    : 'bg-[#0d0f17] border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.avatar}</span>
                  <span className="text-sm font-semibold">{p.name}</span>
                </div>
                {isSelected && (
                  <span className="text-purple-400 text-xs font-bold bg-purple-950 px-2.5 py-1 rounded border border-purple-700">
                    Voted
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

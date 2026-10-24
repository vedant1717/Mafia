import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { Vote, Users } from 'lucide-react';

export const VotingDisplay = () => {
  const { gameState } = useSocket();
  const votingResult = gameState.votingResult;
  const livingPlayers = gameState.players.filter(p => p.isAlive);

  if (gameState.phase !== 'DAY_VOTING' && !votingResult) return null;

  const tallyList = votingResult?.tally || [];

  return (
    <div className="bg-[#161926] border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-4xl mx-auto my-6 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <Vote className="w-6 h-6 text-purple-400" />
          <h3 className="font-['Cinzel'] font-bold text-xl text-white">LIVE TOWN VOTING RESULTS</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Living Voters: {livingPlayers.length}
        </span>
      </div>

      {tallyList.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-sm">
          Votes are being submitted secretly on player phone screens...
        </div>
      ) : (
        <div className="space-y-3">
          {tallyList.map((item, idx) => {
            const percentage = Math.round((item.count / Math.max(1, livingPlayers.length)) * 100);
            return (
              <div key={idx} className="bg-[#0d0f17] p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.targetAvatar}</span>
                    <div>
                      <span className="font-bold text-white text-base block">{item.targetName}</span>
                      <span className="text-xs text-slate-400 font-mono">
                        Voted by: {item.voters.join(', ') || 'Anonymous'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-xl text-purple-300 block">{item.count} Votes</span>
                    <span className="text-[10px] text-slate-500 font-mono">{percentage}%</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#161926] h-3 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

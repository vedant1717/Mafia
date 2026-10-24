import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useSocket } from '../../context/SocketContext';
import { Trophy, Sparkles, RotateCcw } from 'lucide-react';
import { sounds } from '../../utils/audio';

export const VictoryModal = () => {
  const { gameState, adminResetGame, popupTrigger, showFinalLeaderboard } = useSocket();

  const shouldShow = gameState.phase === 'GAME_OVER' && (!popupTrigger?.isFinal || showFinalLeaderboard);

  useEffect(() => {
    if (shouldShow) {
      sounds.playVictoryFanfare();
      
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.5 }
      });
    }
  }, [shouldShow]);

  if (!shouldShow) return null;

  const winInfo = gameState.winInfo || { winner: 'VILLAGERS', reason: 'Game ended!' };
  const isVillagerWin = winInfo.winner === 'VILLAGERS';

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
      <div className={`border-2 rounded-3xl max-w-lg w-full p-8 text-center space-y-6 shadow-2xl relative overflow-hidden ${
        isVillagerWin
          ? 'bg-gradient-to-b from-teal-950 via-[#0f131d] to-[#08090e] border-teal-500 shadow-teal-950/60'
          : 'bg-gradient-to-b from-indigo-950 via-[#0f131d] to-[#08090e] border-indigo-500 shadow-indigo-950/60'
      }`}>
        <div className="inline-flex p-5 rounded-3xl bg-amber-500/20 border border-amber-400 text-amber-400 shadow-xl animate-bounce">
          <Trophy className="w-16 h-16" />
        </div>

        <div>
          <h2 className="font-['Outfit'] font-black text-3xl sm:text-4xl tracking-tight text-white uppercase">
            {isVillagerWin ? 'VILLAGERS VICTORY!' : 'MAFIA VICTORY!'}
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-sm mx-auto leading-relaxed font-medium">
            {winInfo.reason}
          </p>
        </div>

        {/* Final Score Standings */}
        <div className="bg-[#08090e] p-4 rounded-2xl border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4" /> Final Player Standings
          </h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {[...gameState.players]
              .sort((a, b) => b.points - a.points)
              .map((p, idx) => (
                <div key={p.id} className="flex items-center justify-between text-xs p-2.5 bg-[#141824] rounded-xl font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-mono font-bold">{idx + 1}.</span>
                    <span className="text-xl">{p.avatar}</span>
                    <span className="text-slate-200">{p.name}</span>
                  </div>
                  <span className="text-amber-300 font-mono font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                    {p.points} Pts
                  </span>
                </div>
              ))}
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            adminResetGame();
          }}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-950/50 flex items-center justify-center gap-2 transition-all transform active:scale-95"
        >
          <RotateCcw className="w-4 h-4" /> RESTART GAME
        </button>
      </div>
    </div>
  );
};

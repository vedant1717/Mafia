import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { PhaseHeader } from './PhaseHeader';
import { LobbyDisplay } from './LobbyDisplay';
import { NarrationBanner } from './NarrationBanner';
import { VotingDisplay } from './VotingDisplay';
import { Scoreboard } from './Scoreboard';
import { RealtimePlayerDashboard } from './RealtimePlayerDashboard';

export const DisplayBoard = () => {
  const { gameState } = useSocket();

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#07090e] text-slate-100 flex flex-col justify-between select-none">
      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        {/* Phase Header Banner */}
        <PhaseHeader />

        {/* Main Stage Content - Full Viewport 100vh Fit */}
        <div className="flex-1 p-3 sm:p-4 max-w-7xl w-full mx-auto flex flex-col justify-between overflow-hidden">
          {gameState.phase === 'LOBBY' ? (
            <div className="flex-1 flex items-center justify-center">
              <LobbyDisplay />
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch overflow-hidden">
              {/* Center Main Stage (Narration, Player Dashboard & Voting breakdown) */}
              <div className="lg:col-span-3 flex flex-col justify-between gap-3 overflow-hidden">
                <NarrationBanner />
                <div className="flex-1 overflow-hidden flex flex-col justify-center">
                  <RealtimePlayerDashboard />
                </div>
                {gameState.phase === 'DAY_VOTING' && <VotingDisplay />}
              </div>

              {/* Side / Corner Persistent Scoreboard */}
              <div className="lg:col-span-1 flex flex-col justify-between overflow-hidden">
                <Scoreboard />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

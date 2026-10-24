import React, { useState, useEffect } from 'react';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/Navbar';
import { PlayerPanel } from './components/PlayerPanel/PlayerPanel';
import { AdminDashboard } from './components/AdminPanel/AdminDashboard';
import { DisplayBoard } from './components/DisplayPanel/DisplayBoard';
import { AuthModal } from './components/AuthModal';
import { CountdownOverlay } from './components/CountdownOverlay';
import { VictoryModal } from './components/DisplayPanel/VictoryModal';
import { RoundResultModal } from './components/RoundResultModal';

function MainApp() {
  const [activePanel, setActivePanel] = useState(() => {
    const path = window.location.pathname;
    if (path.includes('/admin')) return 'admin';
    if (path.includes('/display')) return 'display';
    return 'player';
  });

  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    return sessionStorage.getItem('mafia_admin_unlocked') === 'true';
  });

  const [isDisplayUnlocked, setIsDisplayUnlocked] = useState(() => {
    return sessionStorage.getItem('mafia_display_unlocked') === 'true';
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.includes('/admin')) setActivePanel('admin');
      else if (path.includes('/display')) setActivePanel('display');
      else setActivePanel('player');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleAdminAuthenticate = (success) => {
    if (success) {
      setIsAdminUnlocked(true);
      sessionStorage.setItem('mafia_admin_unlocked', 'true');
    }
  };

  const handleDisplayAuthenticate = (success) => {
    if (success) {
      setIsDisplayUnlocked(true);
      sessionStorage.setItem('mafia_display_unlocked', 'true');
    }
  };

  return (
    <div className="min-h-screen bg-[#08090e] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-teal-600 selection:text-white">
      {/* 3-2-1 Game Start Countdown Overlay */}
      <CountdownOverlay />

      {/* Global Dramatic Round Outcome Popup for all screens */}
      <RoundResultModal />

      {/* Global Victory Modal for all screens */}
      <VictoryModal />

      {/* Navigation Header */}
      <Navbar activePanel={activePanel} />

      {/* Main Panel View Routing */}
      <main className="flex-1 pb-8">
        {activePanel === 'player' && <PlayerPanel />}

        {activePanel === 'admin' && (
          isAdminUnlocked ? (
            <AdminDashboard />
          ) : (
            <AuthModal targetPanel="admin" onAuthenticate={handleAdminAuthenticate} />
          )
        )}

        {activePanel === 'display' && (
          isDisplayUnlocked ? (
            <DisplayBoard />
          ) : (
            <AuthModal targetPanel="display" onAuthenticate={handleDisplayAuthenticate} />
          )
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <SocketProvider>
      <MainApp />
    </SocketProvider>
  );
}

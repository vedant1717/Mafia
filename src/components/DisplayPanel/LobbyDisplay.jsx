import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSocket } from '../../context/SocketContext';
import { QrCode, Users, Sparkles } from 'lucide-react';

export const LobbyDisplay = () => {
  const { gameState } = useSocket();

  let joinUrl = gameState.joinUrl;
  if (!joinUrl || joinUrl.includes('localhost')) {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      joinUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
    } else {
      joinUrl = 'http://192.168.31.254:3000';
    }
  }

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 my-8 max-w-5xl mx-auto p-6">
      {/* QR Code & Join Link Box */}
      <div className="bg-[#161926] border-2 border-red-600/40 rounded-3xl p-8 shadow-2xl text-center space-y-4 max-w-sm w-full">
        <div className="inline-flex p-3 rounded-2xl bg-red-950/80 border border-red-800 text-red-400">
          <QrCode className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="font-['Cinzel'] font-bold text-2xl text-white">SCAN TO PLAY</h3>
        <p className="text-xs text-slate-400">Scan this QR Code with your phone camera to join the game instantly.</p>

        {/* QR Code Graphic */}
        <div className="bg-white p-4 rounded-2xl inline-block shadow-xl">
          <QRCodeSVG value={joinUrl} size={180} level="H" />
        </div>

        <div className="bg-[#0d0f17] p-3 rounded-xl border border-slate-800 font-mono text-xs text-amber-400 font-bold break-all">
          {joinUrl}
        </div>
      </div>

      {/* Joined Players Grid */}
      <div className="flex-1 bg-[#161926] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 w-full">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-red-400" />
            <h3 className="font-['Cinzel'] font-bold text-xl text-white">
              PLAYERS IN ROOM ({gameState.players.length})
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-red-950 text-red-300 border border-red-800 text-xs font-mono font-bold animate-pulse">
            Waiting for Admin
          </span>
        </div>

        {gameState.players.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <Sparkles className="w-10 h-10 mx-auto opacity-40 animate-spin" />
            <p className="text-sm font-medium">No players joined yet...</p>
            <p className="text-xs text-slate-600">Scan the QR code to be the first to join!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-80 overflow-y-auto pr-1">
            {gameState.players.map((p) => (
              <div
                key={p.id}
                className="bg-[#0d0f17] p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-1 transform hover:scale-105 transition-all shadow-md"
              >
                <span className="text-4xl">{p.avatar}</span>
                <span className="font-bold text-white text-sm truncate max-w-full">{p.name}</span>
                <span className="text-[10px] text-emerald-400 font-mono font-semibold">Ready</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

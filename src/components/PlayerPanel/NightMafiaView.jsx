import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { Shield, MessageSquare, Send, Skull, Users, AlertTriangle } from 'lucide-react';
import { sounds } from '../../utils/audio';

export const NightMafiaView = () => {
  const {
    gameState,
    playerInfo,
    mafiaTeam,
    mafiaVote,
    sendMafiaChat,
    mafiaChatMessages,
    mafiaVotes
  } = useSocket();

  const [chatInput, setChatInput] = useState('');
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [activeTab, setActiveTab] = useState('kill'); // 'kill' | 'chat'

  const handleVoteTarget = (targetId) => {
    sounds.playClick();
    setSelectedTarget(targetId);
    mafiaVote(targetId);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMafiaChat(chatInput.trim());
    setChatInput('');
  };

  // Get living potential victims (non-mafia or all living players except self)
  const victims = gameState.players.filter(p => p.isAlive && p.id !== playerInfo?.id);

  return (
    <div className="max-w-md mx-auto my-4 bg-[#161926] border border-red-900/60 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-rose-950 p-4 border-b border-red-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Shield className="w-6 h-6 text-red-400" />
          <div>
            <h2 className="font-['Outfit'] text-base font-bold text-white tracking-wider uppercase">MAFIA NIGHT TURN</h2>
            <p className="text-xs text-red-300">Choose a victim & coordinate secretly</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full border text-xs font-mono font-bold ${
          gameState.isMafiaExtension ? 'bg-red-950 text-yellow-300 border-yellow-500 animate-bounce' : 'bg-red-900/80 text-red-200 border-red-700'
        }`}>
          {gameState.currentTimer}s
        </span>
      </div>

      {/* 30-Second Last Chance Extension Warning Banner */}
      {gameState.isMafiaExtension && (
        <div className="p-3.5 bg-gradient-to-r from-red-950 via-red-900 to-rose-950 border-b border-yellow-500/80 flex items-center gap-3 animate-pulse text-white">
          <AlertTriangle className="w-6 h-6 text-yellow-400 shrink-0 animate-bounce" />
          <div className="text-xs leading-tight">
            <span className="font-extrabold uppercase tracking-wider text-yellow-300 block">🚨 LAST CHANCE WARNING (30S)</span>
            <span className="text-red-100 font-medium">You failed to select a victim! Cast a vote now or MAFIA LOSES THE GAME!</span>
          </div>
        </div>
      )}

      {/* Team Bar */}
      <div className="bg-[#0d0f17] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-red-400" /> Mafia Team:
        </span>
        <div className="flex items-center gap-2">
          {mafiaTeam.map(m => (
            <span key={m.id} className="px-2 py-0.5 bg-red-950/80 border border-red-800/60 rounded text-red-300 font-medium">
              {m.avatar} {m.name}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-[#0d0f17]">
        <button
          onClick={() => setActiveTab('kill')}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeTab === 'kill'
              ? 'bg-[#161926] text-red-400 border-b-2 border-red-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Skull className="w-4 h-4" /> Select Target
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            activeTab === 'chat'
              ? 'bg-[#161926] text-red-400 border-b-2 border-red-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Mafia Secret Chat ({mafiaChatMessages.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'kill' ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 mb-2">Vote for the player you want to eliminate tonight:</p>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {victims.map((v) => {
                const isSelected = selectedTarget === v.id;
                // Count votes for this victim
                const voteCount = mafiaVotes.filter(([_, tId]) => tId === v.id).length;

                return (
                  <button
                    key={v.id}
                    onClick={() => handleVoteTarget(v.id)}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-red-950/90 border-red-500 shadow-md shadow-red-900/50 text-white font-bold scale-[1.02]'
                        : 'bg-[#0d0f17] border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{v.avatar}</span>
                      <span className="text-sm font-semibold">{v.name}</span>
                    </div>
                    {voteCount > 0 && (
                      <span className="px-2 py-0.5 bg-red-900/80 text-red-200 text-xs rounded-full font-mono border border-red-700">
                        {voteCount} Vote{voteCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-3 flex flex-col h-72">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 p-2 bg-[#0d0f17] rounded-xl border border-slate-800">
              {mafiaChatMessages.length === 0 ? (
                <div className="text-center text-slate-500 text-xs py-8">
                  No messages yet. Send a message to discuss targets secretly with fellow Mafias!
                </div>
              ) : (
                mafiaChatMessages.map((msg) => (
                  <div key={msg.id} className="text-xs bg-[#161926] p-2 rounded-lg border border-slate-800/80">
                    <div className="flex items-center justify-between text-[10px] text-red-400 font-semibold mb-0.5">
                      <span>{msg.senderName}</span>
                      <span className="text-slate-500">{msg.timestamp}</span>
                    </div>
                    <p className="text-slate-200 leading-normal">{msg.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type secret message..."
                className="flex-1 bg-[#0d0f17] border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

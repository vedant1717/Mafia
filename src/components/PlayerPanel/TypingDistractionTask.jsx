import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { Keyboard, CheckCircle2, AlertCircle, Send, Check } from 'lucide-react';

// Calculate Levenshtein Distance for Case-Insensitive evaluation
function getEditDistance(str1, str2) {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],    // deletion
          dp[i][j - 1],    // insertion
          dp[i - 1][j - 1] // substitution
        );
      }
    }
  }
  return dp[m][n];
}

export const TypingDistractionTask = () => {
  const { gameState, coverTask, completeCoverTask } = useSocket();
  const [typedText, setTypedText] = useState('');
  const [isDone, setIsDone] = useState(coverTask?.completed || false);
  const [errorMessage, setErrorMessage] = useState(null);

  const coverSentence = coverTask?.sentence || "My doctor told me to watch my drinking, so I drink in front of a mirror.";

  const handleInputChange = (e) => {
    setTypedText(e.target.value);
    if (errorMessage) setErrorMessage(null); // Clear error on edit
  };

  const handlePaste = (e) => {
    e.preventDefault();
    setErrorMessage("⚠️ Copy-pasting is disabled! You must type the sentence manually.");
  };

  const handleCopy = (e) => {
    e.preventDefault();
    setErrorMessage("⚠️ Copying the target sentence is disabled!");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setErrorMessage("⚠️ Drag & drop is disabled! You must type the sentence manually.");
  };

  const handleSubmitTask = (e) => {
    e?.preventDefault();
    
    if (!typedText.trim()) {
      setErrorMessage("Please type the sentence above before submitting!");
      return;
    }

    const errors = getEditDistance(typedText, coverSentence);

    if (errors <= 3) {
      setErrorMessage(null);
      setIsDone(true);
      completeCoverTask();
    } else {
      setErrorMessage(
        `Too many mistakes! Detected ${errors} errors (maximum 3 allowed). UPPER/lowercase differences are ignored, but fix spelling & missing words.`
      );
    }
  };

  return (
    <div className="max-w-md mx-auto my-4 bg-[#161926] border border-amber-900/60 rounded-2xl shadow-2xl overflow-hidden select-none">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-yellow-950 p-4 border-b border-amber-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Keyboard className="w-6 h-6 text-amber-400" />
          <div>
            <h2 className="font-['Outfit'] text-base font-bold text-white tracking-wider uppercase">COVER TASK: SENTENCE TYPING</h2>
            <p className="text-xs text-amber-300">Type manually • Uppercase/Lowercase allowed • Up to 3 typos allowed</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-amber-900/80 text-amber-200 border border-amber-700 text-xs font-mono font-bold">
          {gameState.currentTimer}s
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Target Sentence Display - Uncopyable & Unselectable */}
        <div
          onCopy={handleCopy}
          onCut={handleCopy}
          onContextMenu={(e) => e.preventDefault()}
          onSelectStart={(e) => e.preventDefault()}
          style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}
          className="bg-[#0d0f17] p-3.5 rounded-xl border border-slate-800 select-none cursor-not-allowed"
        >
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Target Sentence (Manual Type):</p>
          <p className="text-sm font-mono text-amber-300 leading-relaxed font-bold select-none">
            "{coverSentence}"
          </p>
        </div>

        {!isDone ? (
          <form onSubmit={handleSubmitTask} className="space-y-3">
            <textarea
              rows={3}
              value={typedText}
              onChange={handleInputChange}
              onPaste={handlePaste}
              onDrop={handleDrop}
              onContextMenu={(e) => e.preventDefault()}
              placeholder="Type sentence here... (UPPER/lowercase allowed, max 3 typos tolerated)"
              className="w-full bg-[#0d0f17] border border-amber-500/50 text-white rounded-xl p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
            
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="text-amber-400/80 font-mono">
                {typedText.length} / {coverSentence.length} chars
              </span>
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> Case Insensitive & 3 Errors Allowed
              </span>
            </div>

            {/* Error Feedback Banner */}
            {errorMessage && (
              <div className="p-3 bg-rose-950/90 border border-rose-600 rounded-xl flex items-start gap-2 text-rose-200 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-tight font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Task Submission Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              <Send className="w-4 h-4" /> SUBMIT COVER TASK
            </button>
          </form>
        ) : (
          <div className="p-4 bg-emerald-950/80 border border-emerald-700 rounded-xl text-center space-y-2 animate-fade-in">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-emerald-200 text-sm">Cover Task Complete!</h4>
            <p className="text-xs text-emerald-300">You successfully masked your activity. Waiting for night to finish...</p>
          </div>
        )}
      </div>
    </div>
  );
};

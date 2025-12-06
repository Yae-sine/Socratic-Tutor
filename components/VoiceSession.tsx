import React, { useEffect, useState } from 'react';
import { LiveSession } from '../services/liveService';
import { LearningMode, ComplexityLevel } from '../types';

interface VoiceSessionProps {
  onClose: () => void;
  mode: LearningMode;
  complexity: ComplexityLevel;
}

export const VoiceSession: React.FC<VoiceSessionProps> = ({ onClose, mode, complexity }) => {
  const [status, setStatus] = useState<'connecting' | 'connected'>('connecting');

  useEffect(() => {
    const session = new LiveSession(onClose, mode, complexity);
    
    const startSession = async () => {
      try {
        await session.connect();
        setStatus('connected');
      } catch (error) {
        console.error("Failed to connect voice session:", error);
        onClose();
      }
    };

    startSession();

    return () => {
      session.disconnect();
    };
  }, [onClose, mode, complexity]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center gap-8 p-8 max-w-sm w-full text-center">
        
        {/* Visualizer / Status Indicator */}
        <div className="relative">
          {status === 'connecting' ? (
            <div className="w-24 h-24 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
          ) : (
             <div className="relative flex items-center justify-center w-32 h-32">
               <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-20 animate-ping"></span>
               <span className="relative inline-flex rounded-full h-24 w-24 bg-indigo-500 shadow-lg shadow-indigo-500/50 items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
               </span>
             </div>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white">
            {status === 'connecting' ? 'Connecting...' : (mode === 'storyteller' ? 'Storyteller Listening...' : mode === 'debate' ? 'Debate Partner Ready' : 'Tutor Listening...')}
          </h2>
          <div className="flex flex-col gap-1">
             <p className="text-slate-300 text-sm font-medium">
               Mode: {mode.charAt(0).toUpperCase() + mode.slice(1)} • Complexity: {complexity === 'eli5' ? 'ELI5' : complexity.charAt(0).toUpperCase() + complexity.slice(1)}
             </p>
             <p className="text-slate-400 text-xs">
                I'm listening for emotion in your voice to adapt my style.
             </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 px-8 py-3 bg-white text-slate-900 rounded-full font-medium hover:bg-slate-100 hover:scale-105 transition-all shadow-lg"
        >
          End Voice Session
        </button>
      </div>
    </div>
  );
};

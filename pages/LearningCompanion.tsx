import React, { useState, useRef, useEffect } from 'react';
import { Message, Sender, Attachment, LearningMode, ComplexityLevel } from '../types';
import { MessageBubble } from '../components/MessageBubble';
import { InputArea } from '../components/InputArea';
import { TypingIndicator } from '../components/TypingIndicator';
import { VoiceSession } from '../components/VoiceSession';
import { sendMessageToGemini } from '../services/geminiService';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_MESSAGE: Message = {
  id: 'welcome',
  sender: Sender.BOT,
  text: "Hello! I'm your AI Learning Companion. \n\nI can help you learn step-by-step, tell stories, or even debate topics! How should we start today?",
  timestamp: new Date(),
};

export const LearningCompanion: React.FC = () => {
  // State for Messages with LocalStorage init
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Re-hydrate Date objects
        return parsed.map((m: any) => ({...m, timestamp: new Date(m.timestamp)}));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
    return [INITIAL_MESSAGE];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  
  // New Config States
  const [learningMode, setLearningMode] = useState<LearningMode>('socratic');
  const [complexity, setComplexity] = useState<ComplexityLevel>('standard');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll on new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Persist messages to LocalStorage
  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = async (text: string, attachment?: Attachment) => {
    const userMessage: Message = {
      id: generateId(),
      sender: Sender.USER,
      text: text,
      attachment: attachment,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(messages, text, attachment, learningMode, complexity);

      const botMessage: Message = {
        id: generateId(),
        sender: Sender.BOT,
        text: responseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: generateId(),
        sender: Sender.BOT,
        text: "I'm sorry, I encountered an error while thinking about that. Please check your connection or API key and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMemory = () => {
    if (window.confirm("Are you sure you want to clear our learning history?")) {
      setMessages([INITIAL_MESSAGE]);
      localStorage.removeItem('chat_history');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Voice Mode Overlay */}
      {isVoiceMode && (
        <VoiceSession 
          onClose={() => setIsVoiceMode(false)} 
          mode={learningMode}
          complexity={complexity}
        />
      )}

      {/* Header Controls for Companion */}
      <div className="flex-none bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-10 flex flex-wrap gap-4 justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Learning Companion</h2>
          <p className="text-xs text-slate-500">Powered by Gemini 3 Pro</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {/* Mode Selector */}
            <div className="relative group">
               <select 
                  value={learningMode}
                  onChange={(e) => setLearningMode(e.target.value as LearningMode)}
                  className="appearance-none bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold py-2 pl-3 pr-8 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
               >
                 <option value="socratic">Socratic Tutor</option>
                 <option value="storyteller">Storyteller</option>
                 <option value="debate">Debate Partner</option>
               </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
               </div>
            </div>

            {/* Complexity Selector */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button 
                onClick={() => setComplexity('eli5')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${complexity === 'eli5' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                title="Explain Like I'm 5"
              >
                ELI5
              </button>
              <button 
                onClick={() => setComplexity('standard')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${complexity === 'standard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Standard
              </button>
              <button 
                onClick={() => setComplexity('expert')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${complexity === 'expert' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Expert
              </button>
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1 hidden md:block"></div>

            {/* Voice Button */}
            <button
              onClick={() => setIsVoiceMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-bold transition-all shadow-md shadow-indigo-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
              <span>Voice</span>
            </button>
            
            {/* Clear Memory */}
             <button
              onClick={clearMemory}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Clear Memory"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        </div>
      </div>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        <div className="max-w-3xl mx-auto flex flex-col min-h-full">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          
          {isLoading && (
            <div className="flex w-full justify-start mb-6 animate-fade-in">
              <TypingIndicator />
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-none z-10 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto">
             <InputArea 
              onSendMessage={handleSendMessage} 
              isLoading={isLoading} 
              isStoryMode={learningMode === 'storyteller'} 
            />
        </div>
      </footer>
    </div>
  );
};
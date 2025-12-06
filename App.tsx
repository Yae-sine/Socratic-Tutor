import React, { useState, useRef, useEffect } from 'react';
import { Message, Sender, Attachment } from './types';
import { MessageBubble } from './components/MessageBubble';
import { InputArea } from './components/InputArea';
import { TypingIndicator } from './components/TypingIndicator';
import { VoiceSession } from './components/VoiceSession';
import { sendMessageToGemini } from './services/geminiService';

// Simple ID generator to avoid external dependency for this demo
const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: Sender.BOT,
      text: "Hello! I'm your Socratic math tutor. \n\nI'm here to help you understand math concepts step-by-step, rather than just giving you the answers. \n\nFeel free to upload a photo of a problem, type a question, or switch to voice mode!",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
      const responseText = await sendMessageToGemini(messages, text, attachment);

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

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Voice Mode Overlay */}
      {isVoiceMode && <VoiceSession onClose={() => setIsVoiceMode(false)} />}

      {/* Header */}
      <header className="flex-none bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Socratic Tutor</h1>
            <p className="text-xs text-slate-500 font-medium">Step-by-step learning companion</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsVoiceMode(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-medium transition-colors border border-slate-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
          Voice Mode
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        <div className="max-w-4xl mx-auto flex flex-col min-h-full">
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
      <footer className="flex-none z-10">
        <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
      </footer>
    </div>
  );
};

export default App;

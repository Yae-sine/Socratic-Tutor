import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-1 p-2 bg-white rounded-2xl rounded-tl-none border border-slate-200 w-fit shadow-sm">
      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
      <span className="text-xs text-indigo-400 ml-2 font-medium">Reasoning...</span>
    </div>
  );
};

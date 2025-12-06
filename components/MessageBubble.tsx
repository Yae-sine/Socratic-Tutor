import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Sender } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === Sender.USER;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[85%] md:max-w-[70%] px-5 py-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed overflow-hidden ${
          isUser
            ? 'bg-indigo-600 text-white rounded-tr-none'
            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
        }`}
      >
        {/* Render Attachment if exists */}
        {message.attachment && (
          <div className="mb-3 rounded-lg overflow-hidden border border-white/20">
            <img
              src={`data:${message.attachment.mimeType};base64,${message.attachment.data}`}
              alt="User attachment"
              className="max-h-64 object-cover w-full"
            />
          </div>
        )}

        {/* Message Text */}
        <div className={`prose ${isUser ? 'prose-invert' : 'prose-slate'} max-w-none break-words`}>
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
        
        {/* Timestamp */}
        <div className={`text-[10px] mt-2 opacity-70 text-right ${isUser ? 'text-indigo-100' : 'text-slate-400'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

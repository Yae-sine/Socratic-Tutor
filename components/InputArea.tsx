import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { Attachment } from '../types';
import { DrawingPad } from './DrawingPad';

interface InputAreaProps {
  onSendMessage: (text: string, attachment?: Attachment) => void;
  isLoading: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simple validation for images
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,") to get raw base64
        const base64Data = base64String.split(',')[1];
        setAttachment({
          mimeType: file.type,
          data: base64Data,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrawingConfirm = (dataUrl: string) => {
    const base64Data = dataUrl.split(',')[1];
    setAttachment({
      mimeType: 'image/png',
      data: base64Data
    });
    setIsDrawing(false);
  };

  const clearAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = () => {
    if ((!text.trim() && !attachment) || isLoading) return;
    
    onSendMessage(text, attachment || undefined);
    setText('');
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
    setText(target.value);
  };

  return (
    <>
      {isDrawing && (
        <DrawingPad 
          onConfirm={handleDrawingConfirm} 
          onCancel={() => setIsDrawing(false)} 
        />
      )}

      <div className="bg-white border-t border-slate-200 p-4 w-full">
        <div className="max-w-4xl mx-auto">
          
          {/* Attachment Preview */}
          {attachment && (
            <div className="mb-3 flex items-center gap-2 animate-fade-in-up">
              <div className="relative group">
                <img 
                  src={`data:${attachment.mimeType};base64,${attachment.data}`} 
                  alt="Preview" 
                  className="h-20 w-20 object-cover rounded-lg border border-slate-200 shadow-sm"
                />
                <button 
                  onClick={clearAttachment}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <span className="text-xs text-slate-500 font-medium">Image attached</span>
            </div>
          )}

          <div className="flex items-end gap-2">
            {/* File Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Upload an image"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </button>

            {/* Drawing Button */}
            <button
              onClick={() => setIsDrawing(true)}
              disabled={isLoading}
              className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Draw a math problem"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 6.12-9.28 13.2a2 2 0 0 1-3.72 0L3 12.12"/><path d="m12 10.94 5.17-5.17a4 4 0 0 1 5.66 5.66L18 16.24"/></svg>
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={autoResize}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder={attachment ? "Ask about this..." : "Type a math question..."}
                rows={1}
                className="w-full bg-slate-100 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none transition-all placeholder:text-slate-400 disabled:opacity-50"
                style={{ maxHeight: '150px' }}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={(!text.trim() && !attachment) || isLoading}
              className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                 <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              )}
            </button>
          </div>
          
          <div className="text-center mt-2">
              <p className="text-[10px] text-slate-400">Gemini 3 Pro Preview • Compassionate Mode</p>
          </div>
        </div>
      </div>
    </>
  );
};

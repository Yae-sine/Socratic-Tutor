import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

export const LiveCoding: React.FC = () => {
  const [code, setCode] = useState(`// Write your code here to get AI help
function calculateFactorial(n) {
  if (n === 0 || n === 1) {
    return 1;
  }
  return n * calculateFactorial(n - 1);
}`);
  const [output, setOutput] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeCode = async () => {
    setIsAnalyzing(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `Analyze this code and explain it simply. Point out any potential bugs or optimizations:\n\n${code}`,
            config: {
                systemInstruction: "You are an expert coding tutor. Be concise, helpful, and encouraging."
            }
        });
        setOutput(response.text || "No analysis generated.");
    } catch (e) {
        setOutput("Error analyzing code. Please try again.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200">
        <div className="flex-none p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
            <h2 className="font-bold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                Live Coding Assistant
            </h2>
            <button 
                onClick={analyzeCode}
                disabled={isAnalyzing}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
                {!isAnalyzing && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>}
            </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Code Editor Area */}
            <div className="flex-1 flex flex-col border-r border-slate-700">
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 bg-slate-900 text-slate-300 p-6 font-mono text-sm resize-none focus:outline-none focus:ring-inset focus:ring-2 focus:ring-indigo-500/50"
                    spellCheck={false}
                />
            </div>

            {/* Analysis Output Area */}
            <div className="w-full md:w-1/3 bg-slate-800 p-6 overflow-y-auto border-l border-slate-700">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">AI Analysis</h3>
                {output ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                        {output.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                    </div>
                ) : (
                    <div className="text-slate-500 text-sm italic">
                        Click "Analyze Code" to get feedback from the AI tutor.
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
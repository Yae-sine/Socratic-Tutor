import React from 'react';

export const Discussions: React.FC = () => {
  const topics = [
    { id: 1, title: "Calculus: Understanding Limits informally", author: "Sarah M.", replies: 12, tags: ['Math', 'Calculus'] },
    { id: 2, title: "Is Schrödinger's Cat actually dead?", author: "PhysicsFan99", replies: 34, tags: ['Physics', 'Quantum'] },
    { id: 3, title: "Help with Organic Chemistry naming conventions", author: "BioStudent", replies: 8, tags: ['Chemistry', 'Help'] },
    { id: 4, title: "Best resources for learning Linear Algebra?", author: "CodeWizard", replies: 21, tags: ['Math', 'Resources'] },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 md:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Discussions</h1>
            <p className="text-slate-500 mt-1">Join the community and ask questions.</p>
          </div>
          <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New Topic
          </button>
        </div>

        <div className="space-y-4">
          {topics.map((topic) => (
            <div key={topic.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex gap-2 mb-2">
                    {topic.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{topic.title}</h3>
                  <p className="text-sm text-slate-400">Posted by <span className="text-slate-600 font-medium">{topic.author}</span></p>
                </div>
                
                <div className="flex items-center gap-1 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  <span className="text-sm font-medium">{topic.replies}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
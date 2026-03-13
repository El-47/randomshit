'use client';

import React, { useEffect, useRef } from 'react';
import { mockRAGMessages } from '@/utils/mockData';
import { animateFadeIn } from '@/utils/animations';

export default function RAGInterface() {
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      animateFadeIn(chatRef.current, 0.6, 0.3);
    }
  }, []);

  const displayMessages = mockRAGMessages.slice(0, 2);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <span className="text-2xl">💬</span>
        <span>RAG Query Interface</span>
      </div>

      <div
        ref={chatRef}
        className="p-3 bg-gray-100 rounded-lg space-y-3 max-h-48 overflow-y-auto"
      >
        {displayMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`p-2 rounded-lg max-w-xs text-xs ${
                msg.role === 'user'
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-foreground border border-gray-200'
              }`}
            >
              <p>{msg.content}</p>
              {msg.citations && msg.citations.length > 0 && (
                <p className="text-xs opacity-75 mt-1">
                  Citations: {msg.citations.join(', ')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <input
        type="text"
        placeholder="Ask a question about the papers..."
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-red-500"
      />

      <div className="text-xs text-textTertiary italic">
        Indexing knowledge base...
      </div>
    </div>
  );
}

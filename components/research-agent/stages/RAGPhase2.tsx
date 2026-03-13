'use client';

import React, { useState } from 'react';
import { ResearchQuery } from '@/utils/types';
import { mockRAGMessages, mockPapers } from '@/utils/mockData';

interface RAGPhase2Props {
  query: ResearchQuery;
}

export default function RAGPhase2({ query }: RAGPhase2Props) {
  const [messages, setMessages] = useState(mockRAGMessages);
  const [input, setInput] = useState('');

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const newMessage = {
      id: (messages.length + 1).toString(),
      role: 'user' as const,
      content: input,
      citations: [],
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInput('');

    // Simulate assistant response
    setTimeout(() => {
      const response = {
        id: (messages.length + 2).toString(),
        role: 'assistant' as const,
        content: `This is a simulated response to your query. The system would retrieve relevant papers and generate an answer based on the knowledge base.`,
        citations: ['1', '2'],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, response]);
    }, 500);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Papers Indexed" value={mockPapers.length.toString()} color="#E53935" />
        <StatCard label="Vector Embeddings" value="48" color="#E53935" />
        <StatCard label="Query Response" value="~200ms" color="#E53935" />
        <StatCard label="Retrieval Score" value="0.92" color="#E53935" />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-96">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-red-500 text-white'
                    : 'bg-white border border-gray-200 text-foreground'
                }`}
              >
                <p className="text-sm mb-2">{message.content}</p>
                {message.citations && message.citations.length > 0 && (
                  <div className="text-xs opacity-75 flex flex-wrap gap-1">
                    <span>Citations:</span>
                    {message.citations.map((cit) => (
                      <span
                        key={cit}
                        className={`px-2 py-1 rounded ${
                          message.role === 'user'
                            ? 'bg-red-600'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        Paper {cit}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask a question about the research..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-sm"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-colors"
          >
            Send
          </button>
        </div>
      </div>

      {/* Knowledge Base Preview */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Knowledge Base</h3>
        <div className="grid grid-cols-2 gap-3">
          {mockPapers.slice(0, 4).map((paper) => (
            <div
              key={paper.id}
              className="p-3 bg-white border border-gray-200 rounded hover:border-red-300 cursor-pointer transition-colors text-xs"
            >
              <p className="font-medium text-foreground line-clamp-2">{paper.title}</p>
              <p className="text-textTertiary mt-1">{paper.year}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="p-4 bg-white border-x-4 border-y-0 rounded-lg"
      style={{
        borderColor: color,
        boxShadow: `inset 0 1px 0 ${color}55, inset 0 -1px 0 ${color}55`,
      }}
    >
      <p className="text-xs text-textTertiary mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

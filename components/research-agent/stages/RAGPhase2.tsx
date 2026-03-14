'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CrawlApiResponse, ResearchQuery } from '@/utils/types';
import {
  buildSessionId,
  buildIngestPayload,
  ingestToRAG,
  queryRAG,
  RAGIngestResponse,
  RAGTopChunk,
} from '@/lib/rag-service';

interface RAGPhase2Props {
  query: ResearchQuery;
  apiData?: CrawlApiResponse | null;
  isLoading?: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  chunks?: RAGTopChunk[];
  chunksSearched?: number;
  timestamp: Date;
}

const COLOR = '#E53935';

export default function RAGPhase2({ query, apiData, isLoading = false }: RAGPhase2Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState<RAGIngestResponse | null>(null);
  const [ingestError, setIngestError] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ingestAttemptedRef = useRef(false);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Compute session ID from query
  useEffect(() => {
    if (query.question) {
      setSessionId(buildSessionId(query.question));
    }
  }, [query.question]);

  // Auto-ingest when crawl data arrives
  useEffect(() => {
    if (!apiData || !sessionId || ingestAttemptedRef.current) {
      return;
    }

    ingestAttemptedRef.current = true;

    const runIngest = async () => {
      try {
        setIsIngesting(true);
        setIngestError(null);

        // Try to get council data from localStorage (set by AgentCouncilPhase2)
        let councilData: Record<string, unknown> | null = null;
        try {
          const storedCouncil = localStorage.getItem('agent-council-data');
          if (storedCouncil) {
            councilData = JSON.parse(storedCouncil);
          }
        } catch {
          // Ignore parse errors
        }

        const payload = buildIngestPayload(sessionId, apiData, councilData);
        const result = await ingestToRAG(payload);
        setIngestResult(result);
      } catch (error) {
        console.error('RAG ingest failed:', error);
        setIngestError(error instanceof Error ? error.message : 'Failed to ingest data');
      } finally {
        setIsIngesting(false);
      }
    };

    void runIngest();
  }, [apiData, sessionId]);

  const handleSendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isQuerying || !sessionId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsQuerying(true);

    try {
      const response = await queryRAG({
        session_id: sessionId,
        query: trimmed,
        top_k: 4,
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        chunks: response.top_chunks,
        chunksSearched: response.chunks_searched,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('RAG query failed:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error while searching. ${error instanceof Error ? error.message : 'Please try again.'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsQuerying(false);
    }
  }, [input, isQuerying, sessionId]);

  const isReady = ingestResult?.status === 'ready';
  const papers = apiData?.aggregated_extraction?.papers ?? [];

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Papers Indexed"
          value={papers.length.toString()}
          color={COLOR}
        />
        <StatCard
          label="Total Chunks"
          value={ingestResult?.total_chunks?.toString() ?? (isIngesting ? '...' : '—')}
          color={COLOR}
        />
        <StatCard
          label="Session ID"
          value={sessionId ? sessionId.slice(0, 12) : '—'}
          color={COLOR}
        />
        <StatCard
          label="Status"
          value={
            isIngesting
              ? 'Ingesting…'
              : ingestError
                ? 'Error'
                : isReady
                  ? '✓ Ready'
                  : 'Pending'
          }
          color={ingestError ? '#d32f2f' : COLOR}
        />
      </div>

      {/* Ingest Status Banner */}
      {isIngesting && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-red-700">
            Ingesting research data into the RAG knowledge base…
          </p>
        </div>
      )}

      {ingestError && (
        <div className="p-4 bg-red-50 border border-red-300 rounded-lg">
          <p className="text-sm text-red-700 font-medium">Ingest Error</p>
          <p className="text-xs text-red-600 mt-1">{ingestError}</p>
          <button
            onClick={() => {
              ingestAttemptedRef.current = false;
              setIngestError(null);
              // Re-trigger ingest by toggling state
              setSessionId((prev) => prev);
            }}
            className="mt-2 px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-96">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg mb-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-sm text-textSecondary font-medium">
                {isReady
                  ? 'Ask a question about the research papers'
                  : isIngesting
                    ? 'Please wait while the knowledge base is being prepared…'
                    : 'Waiting for data to be ingested…'}
              </p>
              {isReady && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-lg">
                  {[
                    `What are the key findings from these papers?`,
                    `What methodologies were used?`,
                    `Are there any contradictions between the papers?`,
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                      }}
                      className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-full hover:border-red-300 hover:bg-red-50 transition-colors text-textSecondary"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-lg rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-red-500 text-white'
                    : 'bg-white border border-gray-200 text-foreground'
                }`}
              >
                <p className="text-sm mb-2 leading-relaxed whitespace-pre-wrap">{message.content}</p>

                {/* Source Chips for assistant messages */}
                {message.role === 'assistant' && message.chunks && message.chunks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-textTertiary mb-2 uppercase">
                      Sources ({message.chunksSearched} chunks searched)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {message.chunks.map((chunk, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: COLOR }}
                          />
                          {chunk.source_type}
                          {chunk.paper_id && (
                            <span className="text-textTertiary">
                              · {chunk.paper_id.slice(0, 12)}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isQuerying && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-md">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-textTertiary">Searching knowledge base…</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder={
              isReady
                ? 'Ask a question about the research…'
                : 'Waiting for knowledge base to be ready…'
            }
            disabled={!isReady || isQuerying}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          />
          <button
            onClick={handleSendMessage}
            disabled={!isReady || isQuerying || !input.trim()}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors"
          >
            {isQuerying ? 'Searching…' : 'Send'}
          </button>
        </div>
      </div>

      {/* Knowledge Base Preview */}
      {papers.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Knowledge Base</h3>
          <div className="grid grid-cols-2 gap-3">
            {papers.slice(0, 4).map((paper) => (
              <div
                key={paper.paper_id}
                className="p-3 bg-white border border-gray-200 rounded hover:border-red-300 cursor-pointer transition-colors text-xs"
              >
                <p className="font-medium text-foreground line-clamp-2">{paper.title}</p>
                <p className="text-textTertiary mt-1 font-mono text-[10px]">
                  {paper.paper_id.slice(0, 16)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
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

'use client';

import React, { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface LandingPageProps {
  onStartResearch: (query: string, keywords: string[]) => void;
}

export default function LandingPage({ onStartResearch }: LandingPageProps) {
  const [query, setQuery] = useState('');

  const handleStart = () => {
    if (query.trim()) {
      // Extract keywords from query
      const keywords = query
        .toLowerCase()
        .split(/[\s,]+/)
        .filter((word) => word.length > 2)
        .slice(0, 6);

      onStartResearch(query, keywords);
    }
  };

  const handleExampleClick = () => {
    const exampleQuery = 'What are the key innovations in transformer architectures and pre-training methods?';
    setQuery(exampleQuery);
  };

  return (
    <div className="relative min-h-screen bg-muted bg-linear-to-br from-primary/20 via-chart-1/10 to-chart-2/20 flex flex-col items-center justify-center px-4 py-10 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-28 -left-20 h-80 w-80 rounded-full bg-chart-4/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-chart-2/20 blur-3xl" />
      </div>

      <div className="max-w-4xl w-full relative z-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center gap-1">
            <span className="inline-flex text-primary shrink-0">
              <GraduationCap className="h-10 w-10 md:h-14 md:w-14" />
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground whitespace-nowrap tracking-tight">
              What would you like to research?
            </h1>
          </div>
        </div>

        {/* Input Section */}
        <div className="relative mb-6 overflow-hidden rounded-3xl border border-border/80 bg-card/65 backdrop-blur-xl p-2 md:p-3 shadow-lg">
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-linear-to-b from-background/80 via-background/20 to-transparent" />
          <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-border/90" />

          <div className="relative z-10">
            <Textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleStart();
                }
              }}
              placeholder="E.g., transformer architectures, machine learning interpretability..."
              className="min-h-24 md:min-h-32 rounded-2xl border-transparent pr-16 md:pr-20 py-4 text-lg md:text-2xl leading-relaxed resize-none focus-visible:ring-0 focus-visible:border-transparent"
            />
            <Button
              variant="ghost"
              onClick={handleStart}
              disabled={!query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 md:h-14 md:w-14 rounded-xl bg-transparent hover:bg-transparent shadow-none text-foreground/80 hover:text-foreground cursor-pointer"
              aria-label="Start research"
            >
              <ArrowUp size={22} strokeWidth={5} />
            </Button>
          </div>
        </div>

        {/* Example Button */}
        <div className="flex justify-center">
          <Button
            variant="link"
            onClick={handleExampleClick}
            className="text-sm no-underline hover:no-underline cursor-pointer rounded-md px-3 py-1.5 transition-shadow hover:shadow-md"
          >
            Try an example
          </Button>
        </div>
      </div>
    </div>
  );
}

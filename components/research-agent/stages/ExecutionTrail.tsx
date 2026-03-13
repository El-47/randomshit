'use client';

import React, { useEffect, useRef } from 'react';
import { mockExecutionEvents } from '@/utils/mockData';
import { animateCardSlideIn } from '@/utils/animations';

export default function ExecutionTrail() {
  const eventsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (eventsRef.current) {
      const events = eventsRef.current.querySelectorAll('.event-item');
      animateCardSlideIn(Array.from(events), 0.3, 0.05);
    }
  }, []);

  const displayEvents = mockExecutionEvents.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <span className="text-2xl">⏱️</span>
        <span>Execution Timeline</span>
      </div>

      <div ref={eventsRef} className="space-y-2 max-h-48 overflow-y-auto">
        {displayEvents.map((event) => (
          <div key={event.id} className="event-item p-2 bg-white border border-gray-200 rounded text-xs">
            <div className="flex items-start gap-2">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                style={{ backgroundColor: event.status === 'complete' ? '#43A047' : '#FF9800' }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{event.title}</p>
                <p className="text-textTertiary">{event.details}</p>
              </div>
              <span className="text-textTertiary flex-shrink-0">
                {(event.timestamp / 1000).toFixed(1)}s
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-textTertiary italic">
        Recording execution events...
      </div>
    </div>
  );
}

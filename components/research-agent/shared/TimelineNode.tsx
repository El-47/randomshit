'use client';

import React, { useEffect, useRef } from 'react';
import { Stage } from '@/utils/types';
import { animateNodeActivation, animatePulse } from '@/utils/animations';

interface TimelineNodeProps {
  stage: Stage;
  isActive: boolean;
  isCompleted: boolean;
  index: number;
  onClick?: () => void;
}

export default function TimelineNode({
  stage,
  isActive,
  isCompleted,
  index,
  onClick,
}: TimelineNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive) {
      animateNodeActivation(nodeRef.current, 0);
      if (pulseRef.current && !isCompleted) {
        animatePulse(pulseRef.current, 2);
      }
    }
  }, [isActive, isCompleted]);

  return (
    <div className="flex flex-col items-center">
      <div
        ref={nodeRef}
        onClick={onClick}
        className={`
          relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
          cursor-pointer transition-all duration-300
          ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'text-white' : 'bg-gray-200 text-gray-400'}
        `}
        style={{ backgroundColor: isCompleted || isActive ? stage.color : undefined }}
      >
        {/* Pulse circle for active state */}
        {isActive && !isCompleted && (
          <div
            ref={pulseRef}
            className="absolute inset-0 rounded-full border-2 opacity-60"
            style={{ borderColor: stage.color }}
          />
        )}

        {/* Status icon */}
        {isCompleted ? (
          <span className="text-lg">✓</span>
        ) : isActive ? (
          <span className="text-lg">◉</span>
        ) : (
          <span className="text-lg">○</span>
        )}
      </div>

      {/* Stage label */}
      <div className="mt-3 text-center">
        <p className="text-xs font-semibold text-foreground">{stage.name}</p>
        <p className="text-xs text-textTertiary">
          {isCompleted ? 'Complete' : isActive ? 'Processing' : 'Pending'}
        </p>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useRef } from 'react';
import { mockAgents, mockVeridict } from '@/utils/mockData';
import { animateBounce, animatePulse } from '@/utils/animations';

export default function AgentCouncil() {
  const agentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const verdictRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate agents bouncing in
    agentRefs.current.forEach((ref, index) => {
      if (ref) {
        animateBounce(ref, 0.2 * (index + 1));
      }
    });

    // Pulse verdict
    if (verdictRef.current) {
      setTimeout(() => {
        if (verdictRef.current) {
          animatePulse(verdictRef.current, 2);
        }
      }, 1000);
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-foreground mb-4">
        <span className="text-2xl">👥</span>
        <span>Agent Analysis</span>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-2 gap-2">
        {mockAgents.map((agent, index) => (
          <div
            key={agent.id}
            ref={(el) => {
              agentRefs.current[index] = el;
            }}
            className="p-3 border-2 rounded-lg bg-white"
            style={{ borderColor: agent.color }}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">{agent.icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-foreground">{agent.name}</h4>
                <p className="text-xs text-textTertiary mt-1 line-clamp-2">{agent.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Verdict Box */}
      <div
        ref={verdictRef}
        className="p-3 border-2 border-orange-500 rounded-lg bg-orange-50 mt-4"
      >
        <p className="text-xs font-semibold text-foreground mb-2">Final Verdict</p>
        <p className="text-xs text-textSecondary line-clamp-3">
          {mockVeridict.summary}
        </p>
      </div>

      <div className="text-xs text-textTertiary italic">
        Assembling agent council...
      </div>
    </div>
  );
}

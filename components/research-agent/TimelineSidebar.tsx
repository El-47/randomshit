'use client';

import React from 'react';
import { StageType, StageStatus } from '@/utils/types';
import { mockStages } from '@/utils/mockData';
import { ChevronLeft, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface TimelineSidebarProps {
  activeStage: StageType;
  onSelectStage: (stageId: StageType) => void;
  onBack: () => void;
  stageStatuses: Record<StageType, StageStatus>;
}

function StageGlyph({ stageId }: { stageId: StageType }) {
  const commonProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    className: 'h-5 w-5',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (stageId) {
    case 'crawler':
      return (
        <svg {...commonProps}>
          <circle cx="11" cy="11" r="5.5" />
          <path d="M15 15L20 20" />
          <path d="M11 8.5V13.5" opacity="0.75" />
          <path d="M8.5 11H13.5" opacity="0.75" />
        </svg>
      );
    case 'nlp':
      return (
        <svg {...commonProps}>
          <path d="M9 6.5C6.8 6.5 5 8.3 5 10.5C5 12 5.8 13.3 7 14V16.3C7 17.2 7.8 18 8.7 18H9.2" />
          <path d="M15 6.5C17.2 6.5 19 8.3 19 10.5C19 12 18.2 13.3 17 14V16.3C17 17.2 16.2 18 15.3 18H14.8" />
          <path d="M9.2 18H14.8" />
          <path d="M10 10.5H10.01" />
          <path d="M14 10.5H14.01" />
          <path d="M10.5 13.5C11 14 11.5 14.2 12 14.2C12.5 14.2 13 14 13.5 13.5" />
        </svg>
      );
    case 'agents':
      return (
        <svg {...commonProps}>
          <path d="M8.5 11C10.1569 11 11.5 9.65685 11.5 8C11.5 6.34315 10.1569 5 8.5 5C6.84315 5 5.5 6.34315 5.5 8C5.5 9.65685 6.84315 11 8.5 11Z" />
          <path d="M15.5 12C16.8807 12 18 10.8807 18 9.5C18 8.11929 16.8807 7 15.5 7" opacity="0.75" />
          <path d="M4.5 18C5 15.9 6.9 14.5 9 14.5C11.1 14.5 13 15.9 13.5 18" />
          <path d="M14 17C14.3 15.8 15.3 15 16.5 15C17.7 15 18.7 15.8 19 17" opacity="0.75" />
        </svg>
      );
    case 'graph':
      return (
        <svg {...commonProps}>
          <circle cx="6.5" cy="7" r="2" />
          <circle cx="17.5" cy="6.5" r="2" />
          <circle cx="12" cy="17" r="2.2" />
          <path d="M8.4 7.2L15.5 6.7" />
          <path d="M7.8 8.6L10.7 15" />
          <path d="M16.3 8.2L13.3 15" />
        </svg>
      );
    case 'rag':
      return (
        <svg {...commonProps}>
          <path d="M6.5 7.5C6.5 6.7 7.2 6 8 6H13L17.5 10.5V16.5C17.5 17.3 16.8 18 16 18H8C7.2 18 6.5 17.3 6.5 16.5V7.5Z" />
          <path d="M13 6V10.5H17.5" />
          <path d="M9 13H15" opacity="0.75" />
          <path d="M9 15.5H13" opacity="0.75" />
          <path d="M18.5 6.5L19 7.7L20.2 8.2L19 8.7L18.5 10L18 8.7L16.8 8.2L18 7.7L18.5 6.5Z" />
        </svg>
      );
    case 'report':
      return (
        <svg {...commonProps}>
          <path d="M8 5.5H16C16.8 5.5 17.5 6.2 17.5 7V17C17.5 17.8 16.8 18.5 16 18.5H8C7.2 18.5 6.5 17.8 6.5 17V7C6.5 6.2 7.2 5.5 8 5.5Z" />
          <path d="M9.5 10.5H14.5" />
          <path d="M9.5 13H14.5" opacity="0.75" />
          <path d="M9.5 15.5H12.5" opacity="0.75" />
          <path d="M15.8 8.3L16.5 9L15 10.5" />
        </svg>
      );
    case 'trail':
      return (
        <svg {...commonProps}>
          <circle cx="7" cy="7" r="1.75" />
          <circle cx="17" cy="17" r="1.75" />
          <path d="M8.7 8.2C10.2 9.2 10.8 10 11.2 11.4C11.6 12.8 12.5 13.8 15.1 15.2" />
          <path d="M13.8 7H17V10.2" opacity="0.75" />
          <path d="M17 7L12.8 11.2" opacity="0.75" />
        </svg>
      );
    default:
      return null;
  }
}

function StageIcon({ stageId, color }: { stageId: StageType; color: string }) {
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/60 shadow-sm"
      style={{
        color,
        background: `linear-gradient(135deg, ${color}22 0%, ${color}10 100%)`,
      }}
    >
      <StageGlyph stageId={stageId} />
    </div>
  );
}

export default function TimelineSidebar({
  activeStage,
  onSelectStage,
  onBack,
  stageStatuses,
}: TimelineSidebarProps) {
  const activeStageData = mockStages.find((stage) => stage.id === activeStage);

  const content = (
    <>
      {/* Header */}
      <div className="border-b border-border/70 px-4 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-foreground transition-all hover:text-black hover:scale-[1.02] cursor-pointer"
        >
          <ChevronLeft size={16} />
          Back to Landing
        </button>

        <div className="mt-4 rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-textTertiary">Research stages</p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-foreground">Explore pipeline</p>
              <p className="text-sm text-textSecondary">Review each stage output in sequence</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative flex-1 overflow-y-auto p-4 space-y-3">
        <div className="pointer-events-none absolute bottom-4 left-6 top-4 w-px bg-border/70" />
        {mockStages.map((stage) => {
          const status = stageStatuses[stage.id];
          const isActive = stage.id === activeStage;

          return (
            <button
              key={stage.id}
              onClick={() => onSelectStage(stage.id)}
              className={[
                'relative z-10 w-full rounded-2xl border p-4 text-left transition-all duration-200 border-l-4',
                isActive
                  ? 'border-transparent bg-card shadow-md ring-2 ring-primary/25'
                  : 'border-border/70 bg-background/80 hover:border-primary/30 hover:bg-card/70 hover:shadow-sm',
              ].join(' ')}
              style={
                isActive
                  ? {
                      borderLeftColor: stage.color,
                      boxShadow: `0 10px 30px -18px ${stage.color}`,
                    }
                  : { borderLeftColor: 'transparent' }
              }
            >
              <div className="flex items-start gap-3">
                <StageIcon stageId={stage.id} color={stage.color} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-base font-semibold text-foreground">{stage.name}</p>
                    {isActive && (
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-textSecondary">
                    {status === 'complete' ? '✓ Complete' : 'Pending'}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-border/70 px-4 py-4 text-xs text-textTertiary">
        <p>All stages complete</p>
      </div>
    </>
  );

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            {activeStageData && <StageIcon stageId={activeStageData.id} color={activeStageData.color} />}

            <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-textTertiary">Research stage</p>
            <p className="truncate text-base font-semibold text-foreground">
              {activeStageData?.name}
            </p>
            </div>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-card/80 text-foreground shadow-sm transition-colors hover:bg-card"
                aria-label="Open research stages menu"
              >
                <Menu size={18} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[88vw] max-w-sm border-r border-border/70 bg-card/95 p-0 backdrop-blur-xl">
              <SheetHeader className="sr-only">
                <SheetTitle>Research stages</SheetTitle>
                <SheetDescription>Open the navigation menu for research stages.</SheetDescription>
              </SheetHeader>
              <div className="flex h-full flex-col">{content}</div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <aside className="hidden w-72 shrink-0 border-r border-border/70 bg-card/60 backdrop-blur-xl lg:flex lg:flex-col">
        {content}
      </aside>
    </>
  );
}

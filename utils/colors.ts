// Color constants for all 7 research stages

export const STAGE_COLORS = {
  crawler: '#2196F3',      // Blue
  nlp: '#9C27B0',          // Purple
  agents: '#FF6F00',       // Orange
  graph: '#00897B',        // Teal
  rag: '#E53935',          // Red
  report: '#43A047',       // Green
  trail: '#546E7A',        // Blue-grey
} as const;

export const STAGE_COLOR_NAMES = {
  crawler: 'Crawler Blue',
  nlp: 'NLP Purple',
  agents: 'Agent Orange',
  graph: 'Graph Teal',
  rag: 'RAG Red',
  report: 'Report Green',
  trail: 'Trail Grey',
} as const;

// Light theme palette
export const LIGHT_THEME = {
  background: '#F8F9FA',
  foreground: '#1A1A2E',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  textPrimary: '#1A1A2E',
  textSecondary: '#666666',
  textTertiary: '#999999',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
} as const;

// Get color by stage
export const getStageColor = (stageId: keyof typeof STAGE_COLORS): string => {
  return STAGE_COLORS[stageId];
};

// RGB version for transparency
export const rgbFromHex = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
};

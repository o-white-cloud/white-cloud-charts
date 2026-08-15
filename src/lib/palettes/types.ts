export interface DescendantMixStrategy {
  type: 'mix';
  target: string;
  amounts: number[];
}

export interface ForegroundAutoStrategy {
  type: 'auto';
  light: string;
  dark: string;
}

export interface ChartPalette {
  id: string;
  name: string;
  description?: string;
  colors: string[];
  descendantStrategy: DescendantMixStrategy;
  foregroundStrategy: ForegroundAutoStrategy;
  previewBackground?: string;
}

export const DEFAULT_DESCENDANT_STRATEGY: DescendantMixStrategy = {
  type: 'mix',
  target: '#FFFFFF',
  amounts: [0, 0.27, 0.52, 0.7, 0.82],
};

export const DEFAULT_FOREGROUND_STRATEGY: ForegroundAutoStrategy = {
  type: 'auto',
  light: '#FFFFFF',
  dark: '#202020',
};

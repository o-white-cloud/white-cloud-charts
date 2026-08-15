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
  amounts: [0, 0.36, 0.66, 0.78, 0.86],
};

export const DEFAULT_FOREGROUND_STRATEGY: ForegroundAutoStrategy = {
  type: 'auto',
  light: '#FFFFFF',
  dark: '#202020',
};

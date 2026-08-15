import {
  createPalette,
  softPastelPalette,
} from '@/lib/palettes/built-in-palettes';
import {
  DEFAULT_DESCENDANT_STRATEGY,
  DEFAULT_FOREGROUND_STRATEGY,
} from '@/lib/palettes/types';

const baseConfig = {
  id: 'test-palette',
  name: 'Test Palette',
  description: 'For factory tests.',
  colors: ['#111111'],
};

const customDescendantStrategy = {
  type: 'mix' as const,
  target: '#000000',
  amounts: [0.1, 0.2],
};

const customForegroundStrategy = {
  type: 'auto' as const,
  light: '#EEEEEE',
  dark: '#111111',
};

describe('createPalette', () => {
  it('uses default strategies when none are provided', () => {
    const palette = createPalette(baseConfig);

    expect(palette.descendantStrategy).toBe(DEFAULT_DESCENDANT_STRATEGY);
    expect(palette.foregroundStrategy).toBe(DEFAULT_FOREGROUND_STRATEGY);
  });

  it('uses a custom descendant strategy and default foreground strategy', () => {
    const palette = createPalette({
      ...baseConfig,
      descendantStrategy: customDescendantStrategy,
    });

    expect(palette.descendantStrategy).toBe(customDescendantStrategy);
    expect(palette.foregroundStrategy).toBe(DEFAULT_FOREGROUND_STRATEGY);
  });

  it('uses a custom foreground strategy and default descendant strategy', () => {
    const palette = createPalette({
      ...baseConfig,
      foregroundStrategy: customForegroundStrategy,
    });

    expect(palette.descendantStrategy).toBe(DEFAULT_DESCENDANT_STRATEGY);
    expect(palette.foregroundStrategy).toBe(customForegroundStrategy);
  });

  it('uses both custom strategies when both are provided', () => {
    const palette = createPalette({
      ...baseConfig,
      descendantStrategy: customDescendantStrategy,
      foregroundStrategy: customForegroundStrategy,
    });

    expect(palette.descendantStrategy).toBe(customDescendantStrategy);
    expect(palette.foregroundStrategy).toBe(customForegroundStrategy);
  });
});

describe('built-in palettes', () => {
  it('keep default strategies without explicit overrides', () => {
    expect(softPastelPalette.descendantStrategy).toBe(
      DEFAULT_DESCENDANT_STRATEGY
    );
    expect(softPastelPalette.foregroundStrategy).toBe(
      DEFAULT_FOREGROUND_STRATEGY
    );
  });
});

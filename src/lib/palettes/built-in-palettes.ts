import {
  ChartPalette,
  DEFAULT_DESCENDANT_STRATEGY,
  DEFAULT_FOREGROUND_STRATEGY,
} from './types';

export function createPalette(
  config: Pick<ChartPalette, 'id' | 'name' | 'description' | 'colors'> &
    Partial<
      Pick<
        ChartPalette,
        'previewBackground' | 'descendantStrategy' | 'foregroundStrategy'
      >
    >
): ChartPalette {
  return {
    ...config,
    descendantStrategy:
      config.descendantStrategy ?? DEFAULT_DESCENDANT_STRATEGY,
    foregroundStrategy:
      config.foregroundStrategy ?? DEFAULT_FOREGROUND_STRATEGY,
  };
}

export const softPastelPalette = createPalette({
  id: 'soft-pastel',
  name: 'Soft Pastel',
  description: 'Calm, soft, therapeutic tones.',
  colors: [
    '#E99A9A',
    '#91D2B8',
    '#8EAFE7',
    '#C5A4DF',
    '#E7B482',
    '#83C6C5',
    '#D8C77A',
    '#D69AB7',
  ],
});

export const vibrantPalette = createPalette({
  id: 'vibrant',
  name: 'Vibrant',
  description: 'Bright, energetic, high contrast.',
  colors: [
    '#E63946',
    '#00A878',
    '#2878D0',
    '#7B2CBF',
    '#F28C28',
    '#0096A6',
    '#D63384',
    '#8A9A18',
  ],
});

export const earthPalette = createPalette({
  id: 'earth',
  name: 'Earth',
  description: 'Natural, grounded, warm organic hues.',
  colors: [
    '#B85C3C',
    '#768A45',
    '#C48658',
    '#4F735E',
    '#C29A3A',
    '#875D67',
    '#667F82',
    '#8B6247',
  ],
});

export const dreamyPalette = createPalette({
  id: 'dreamy',
  name: 'Dreamy',
  description: 'Introspective lavender, blue, pink, and aqua.',
  colors: [
    '#9A8FE3',
    '#C093D6',
    '#E3A1BE',
    '#83B9D8',
    '#72C8BD',
    '#B99AC9',
    '#8878D0',
    '#7FA7C9',
  ],
});

export const nordicPalette = createPalette({
  id: 'nordic',
  name: 'Nordic',
  description: 'Restrained, editorial, sophisticated.',
  colors: [
    '#527482',
    '#6F928A',
    '#8498A3',
    '#7D7A91',
    '#A48D69',
    '#668998',
    '#839274',
    '#9B7480',
  ],
});

export const jewelPalette = createPalette({
  id: 'jewel',
  name: 'Jewel',
  description: 'Rich, premium, deeper high-contrast tones.',
  colors: [
    '#9E2945',
    '#126B57',
    '#264C8C',
    '#603A83',
    '#A95721',
    '#176878',
    '#8E286A',
    '#596B23',
  ],
});

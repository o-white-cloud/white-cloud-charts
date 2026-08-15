import {
  ChartPalette,
  DEFAULT_DESCENDANT_STRATEGY,
  DEFAULT_FOREGROUND_STRATEGY,
} from './types';

function createPalette(
  config: Pick<ChartPalette, 'id' | 'name' | 'description' | 'colors'> &
    Partial<Pick<ChartPalette, 'previewBackground'>>
): ChartPalette {
  return {
    ...config,
    descendantStrategy: DEFAULT_DESCENDANT_STRATEGY,
    foregroundStrategy: DEFAULT_FOREGROUND_STRATEGY,
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
    '#D94B5B',
    '#168C72',
    '#3568C8',
    '#7651C9',
    '#D97732',
    '#167E99',
    '#B74583',
    '#788B32',
  ],
});

export const earthPalette = createPalette({
  id: 'earth',
  name: 'Earth',
  description: 'Natural, grounded, warm organic hues.',
  colors: [
    '#B8614B',
    '#7D8A56',
    '#C18B63',
    '#547463',
    '#C49A4A',
    '#896979',
    '#71858A',
    '#8B6958',
  ],
});

export const dreamyPalette = createPalette({
  id: 'dreamy',
  name: 'Dreamy',
  description: 'Introspective lavender, blue, pink, and aqua.',
  colors: [
    '#9298DA',
    '#BA8FC8',
    '#D99AAF',
    '#83B5CE',
    '#78C2B5',
    '#A986A5',
    '#9F83CF',
    '#738BB8',
  ],
});

export const nordicPalette = createPalette({
  id: 'nordic',
  name: 'Nordic',
  description: 'Restrained, editorial, sophisticated.',
  colors: [
    '#597A8A',
    '#75968C',
    '#A97971',
    '#817B9B',
    '#B28B58',
    '#668D9C',
    '#8C9970',
    '#A36F82',
  ],
});

export const jewelPalette = createPalette({
  id: 'jewel',
  name: 'Jewel',
  description: 'Rich, premium, deeper high-contrast tones.',
  colors: [
    '#A83F55',
    '#237A63',
    '#315A9D',
    '#694A91',
    '#B56B32',
    '#277887',
    '#9B477A',
    '#687536',
  ],
});

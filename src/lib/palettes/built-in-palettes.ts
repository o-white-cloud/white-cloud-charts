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

export const lotusPondPalette = createPalette({
  id: 'lotus-pond',
  name: 'Lotus Pond',
  description: 'Magenta lotus, olive leaves, and deep-to-pale teal water.',
  colors: [
    '#741353',
    '#E9409B',
    '#8B920A',
    '#024F5B',
    '#1CB6BB',
    '#A0E5E5',
  ],
});

export const starryGardenPalette = createPalette({
  id: 'starry-garden',
  name: 'Starry Garden',
  description: 'Swirling violet and teal night sky over a green garden.',
  colors: [
    '#8C4192',
    '#19B6BE',
    '#0E5C7C',
    '#2D6658',
    '#8BC281',
    '#E8D15D',
  ],
});

export const watercolorPeachesPalette = createPalette({
  id: 'watercolor-peaches',
  name: 'Watercolor Peaches',
  description: 'Ripe peach, berry, and plum tones with fresh green leaves.',
  colors: [
    '#9A479D',
    '#D35290',
    '#F79164',
    '#FCDB85',
    '#7EB880',
    '#256351',
  ],
});

export const dragonFruitPalette = createPalette({
  id: 'dragon-fruit',
  name: 'Dragon Fruit',
  description: 'Hot pink dragon fruit and golden star fruit on ice.',
  colors: [
    '#BBB256',
    '#F9AF08',
    '#F06707',
    '#FD777A',
    '#E11C8A',
    '#68367F',
  ],
});

export const colorfulLeavesPalette = createPalette({
  id: 'colorful-leaves',
  name: 'Colorful Leaves',
  description: 'Rain-soaked berry, coral, and ocean-blue leaves on dark stone.',
  colors: [
    '#D62D8C',
    '#FF5A7D',
    '#FF8A4C',
    '#FFB27A',
    '#E48DC4',
    '#8D7CC3',
    '#2EC5D6',
    '#6A8FD6',
    '#2D3137',
    '#0D0F12',
  ],
});

export const polishedStonesPalette = createPalette({
  id: 'polished-stones',
  name: 'Polished Stones',
  description: 'Tumbled gemstones in lilac, blush, tangerine, sage, and teal.',
  colors: [
    '#C1A4D4',
    '#F1A7AF',
    '#FB8244',
    '#F2AC39',
    '#AFC194',
    '#42B1BB',
  ],
});

export const goldenAgatePalette = createPalette({
  id: 'golden-agate',
  name: 'Golden Agate',
  description: 'Gold-veined agate in wine, deep teal, and sea-glass green.',
  colors: [
    '#DFBE8B',
    '#8F5C64',
    '#33091B',
    '#072D33',
    '#3A7564',
    '#9ABCAB',
  ],
});

export const midnightLiliesPalette = createPalette({
  id: 'midnight-lilies',
  name: 'Midnight Lilies',
  description: 'Starlit violet sky over a deep blue and teal lily pond.',
  colors: [
    '#9681D9',
    '#463181',
    '#082674',
    '#3365CA',
    '#2C7B91',
    '#0F4456',
  ],
});

export const strawberryLimePalette = createPalette({
  id: 'strawberry-lime',
  name: 'Strawberry Lime',
  description: 'Juicy strawberry reds and zesty lime greens over icy aqua.',
  colors: [
    '#D33243',
    '#E07C8E',
    '#A9BF53',
    '#718804',
    '#3B9890',
    '#A0D8CD',
  ],
});

export const mermaidMoonPalette = createPalette({
  id: 'mermaid-moon',
  name: 'Mermaid Moon',
  description: 'Turquoise sea, plum depths, and coral-gold moonlight.',
  colors: [
    '#1EC8B3',
    '#265F67',
    '#523C5D',
    '#BA5474',
    '#FA8174',
    '#FDB766',
  ],
});

export const oceanJewelsPalette = createPalette({
  id: 'ocean-jewels',
  name: 'Ocean Jewels',
  description: 'Vibrant, dreamy seafoam, teal, and amethyst gemstones.',
  colors: [
    '#A7E7DD',
    '#13C7C4',
    '#0D7F86',
    '#B78AE6',
    '#8A2BE2',
    '#58236B',
    '#0E4D63',
    '#F2B7D4',
  ],
});

export const oceanicDepthsPalette = createPalette({
  id: 'oceanic-depths',
  name: 'Oceanic Depths',
  description: 'Deep, calm, mysterious midnight blues, teals, and slate.',
  colors: [
    '#071A24',
    '#0D3447',
    '#14666D',
    '#2BA59A',
    '#67C6C1',
    '#1A4A6E',
    '#3B5D73',
    '#4E587A',
    '#4B7A74',
    '#2A2F38',
    '#B8DDE0',
    '#9AA3C4',
  ],
});

export const vibrantBloomPalette = createPalette({
  id: 'vibrant-bloom',
  name: 'Vibrant Bloom',
  description: 'Bold, rich, radiant magenta and violet blooms with a gold accent.',
  colors: [
    '#1A1241',
    '#4C2A86',
    '#7B4FC5',
    '#D81B8A',
    '#FF4D9D',
    '#FF72B6',
    '#4F7DD7',
    '#2D1B56',
    '#F7B733',
  ],
});

export const oceanGlowPalette = createPalette({
  id: 'ocean-glow',
  name: 'Ocean Glow',
  description: 'Deep, dreamy, radiant teal water lit by a golden sunset.',
  colors: [
    '#0B2D3A',
    '#0F5F66',
    '#29B5B5',
    '#8DE6E3',
    '#6C5FA6',
    '#F08DA5',
    '#FFB37A',
    '#FFC78A',
  ],
});

export const beachCottagePalette = createPalette({
  id: 'beach-cottage',
  name: 'Beach Cottage',
  description: 'Pastel pink and lilac cottage under palms and a bright tropical sky.',
  colors: [
    '#6F915F',
    '#EBE8DF',
    '#EE9AC7',
    '#B5A1EE',
    '#4EB9ED',
    '#76D3DB',
  ],
});

export const underwaterRadiancePalette = createPalette({
  id: 'underwater-radiance',
  name: 'Underwater Radiance',
  description: 'Vibrant, fresh, ethereal teals with iridescent pink and gold.',
  colors: [
    '#087F8C',
    '#00B8B8',
    '#3FD6C1',
    '#00DDF0',
    '#00505E',
    '#7A7FF7',
    '#FF6EC7',
    '#FFB07A',
    '#FFD56E',
    '#E6FFF7',
  ],
});

export const bettaFinsPalette = createPalette({
  id: 'betta-fins',
  name: 'Betta Fins',
  description: 'Flowing blush, lilac, periwinkle, and blue fins in the dark.',
  colors: [
    '#FEC4C6',
    '#E8A2F5',
    '#9C79F4',
    '#6473CA',
    '#2B74A9',
    '#6EB7CC',
  ],
});

export const berryMedleyPalette = createPalette({
  id: 'berry-medley',
  name: 'Berry Medley',
  description: 'Pink, lilac, and dusky blue berries on deep plum.',
  colors: [
    '#B35A8A',
    '#F6B7C7',
    '#B6A5CE',
    '#523F77',
    '#7880AE',
    '#A3BBD7',
  ],
});

export const blueBudgiePalette = createPalette({
  id: 'blue-budgie',
  name: 'Blue Budgie',
  description: 'Sky-blue budgie among blue blossoms with a fresh green accent.',
  colors: [
    '#90A215',
    '#11C6F0',
    '#177CA4',
    '#1456A0',
    '#3295E5',
    '#A2CAF3',
  ],
});

export const pastelNookPalette = createPalette({
  id: 'pastel-nook',
  name: 'Pastel Nook',
  description: 'Sunny pastel pinks, lilac, aqua, and lemon with a leafy green.',
  colors: [
    '#FDBED6',
    '#FC9F97',
    '#F685B3',
    '#CA9FDB',
    '#82D1EB',
    '#33DBC8',
    '#F6F386',
    '#78BA3D',
  ],
});

export const springBlossomsPalette = createPalette({
  id: 'spring-blossoms',
  name: 'Spring Blossoms',
  description: 'Soft dusty blues, rose, blush, and buttery yellow florals.',
  colors: [
    '#6F8D9D',
    '#9CB9CE',
    '#93C5DD',
    '#C67A8F',
    '#FFCCC9',
    '#E6D480',
  ],
});

export const bluePetalsPalette = createPalette({
  id: 'blue-petals',
  name: 'Blue Petals',
  description: 'Sapphire, cobalt, and midnight blues fading to icy aqua. Sampled from petal photo.',
  colors: [
    '#396CAD',
    '#063899',
    '#0B2A8E',
    '#031743',
    '#063D58',
    '#86B8B6',
    '#BAD3C5',
    '#9DB6CD',
    '#6CA7C9',
    '#BED3DC',
  ],
});

export const violetPetalsPalette = createPalette({
  id: 'violet-petals',
  name: 'Violet Petals',
  description: 'Lilac, violet, and deep plum with soft periwinkle and mauve. Sampled from petal photo.',
  colors: [
    '#B698C7',
    '#7842A9',
    '#672284',
    '#301B77',
    '#170A1C',
    '#5C2240',
    '#708698',
    '#9986B0',
    '#AEAAD3',
    '#C3C0D2',
  ],
});

export const earthyPetalsPalette = createPalette({
  id: 'earthy-petals',
  name: 'Earthy Petals',
  description: 'Sage, terracotta, plum, cacao, and buttercream earth tones. Sampled from petal photo.',
  colors: [
    '#ADAD8E',
    '#D3735F',
    '#6E3F4D',
    '#96A0C5',
    '#85AEB2',
    '#A3985A',
    '#FED79C',
    '#DCA687',
    '#4C210F',
    '#7B2525',
  ],
});

export const blushPetalsPalette = createPalette({
  id: 'blush-petals',
  name: 'Blush Petals',
  description: 'Soft blush, rose, and peachy pinks with a touch of lavender. Sampled from petal photo.',
  colors: [
    '#E9BCB6',
    '#EFBEBD',
    '#C798AD',
    '#DEADB8',
    '#CC6F6C',
    '#EBAFB3',
    '#F9BAAB',
    '#F1C5BA',
    '#A75957',
    '#D1818A',
  ],
});

export const dustyBluePetalsPalette = createPalette({
  id: 'dusty-blue-petals',
  name: 'Dusty Blue Petals',
  description: 'Dusty blues, mint, and ocean teal with beige and mocha accents. Sampled from petal photo.',
  colors: [
    '#E8CCB5',
    '#D5C6C6',
    '#9F9FBC',
    '#81A4C5',
    '#1A576F',
    '#ADCFCF',
    '#CBD8DC',
    '#A5B5CA',
    '#675351',
    '#6A7F9F',
  ],
});

export const greenPetalsPalette = createPalette({
  id: 'green-petals',
  name: 'Green Petals',
  description: 'Sage, olive, fern, and forest greens with seafoam and mint. Sampled from petal photo.',
  colors: [
    '#BAC3A2',
    '#837E49',
    '#6C844F',
    '#3C502F',
    '#14261A',
    '#535A28',
    '#275D35',
    '#BECCB4',
    '#A2AA77',
    '#B1C6B5',
  ],
});

export const redPetalsPalette = createPalette({
  id: 'red-petals',
  name: 'Red Petals',
  description: 'Blush, coral, scarlet, crimson, and wine reds. Sampled from petal photo.',
  colors: [
    '#ECA59C',
    '#E15952',
    '#B30912',
    '#8A030C',
    '#AA0817',
    '#9A0519',
    '#D75056',
    '#931319',
    '#76131C',
  ],
});

export const pinkPetalsPalette = createPalette({
  id: 'pink-petals',
  name: 'Pink Petals',
  description: 'Pastel, rose, and hot pinks through cerise and fuchsia. Sampled from petal photo.',
  colors: [
    '#F7C7CD',
    '#F7A6BA',
    '#EB9BB1',
    '#DF88A8',
    '#E099B2',
    '#DA8498',
    '#DA4588',
    '#BA4671',
    '#D45879',
    '#DC2773',
    '#BE1C57',
    '#D36E84',
  ],
});

export const yellowPetalsPalette = createPalette({
  id: 'yellow-petals',
  name: 'Yellow Petals',
  description: 'Pastel, lemon, and canary yellows deepening to amber and ochre. Sampled from petal photo.',
  colors: [
    '#FEE785',
    '#FEE833',
    '#FDD80B',
    '#FDBC02',
    '#FCB703',
    '#DC7F03',
    '#E59C09',
    '#E09E03',
    '#F89802',
    '#F7D88F',
  ],
});

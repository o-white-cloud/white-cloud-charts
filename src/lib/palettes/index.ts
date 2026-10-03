import {
  beachCottagePalette,
  berryMedleyPalette,
  bettaFinsPalette,
  blueBudgiePalette,
  bluePetalsPalette,
  blushPetalsPalette,
  colorfulLeavesPalette,
  dragonFruitPalette,
  dreamyPalette,
  dustyBluePetalsPalette,
  earthPalette,
  earthyPetalsPalette,
  goldenAgatePalette,
  greenPetalsPalette,
  jewelPalette,
  lotusPondPalette,
  mermaidMoonPalette,
  midnightLiliesPalette,
  nordicPalette,
  oceanGlowPalette,
  oceanJewelsPalette,
  oceanicDepthsPalette,
  pastelNookPalette,
  pinkPetalsPalette,
  polishedStonesPalette,
  redPetalsPalette,
  softPastelPalette,
  springBlossomsPalette,
  starryGardenPalette,
  strawberryLimePalette,
  underwaterRadiancePalette,
  vibrantBloomPalette,
  vibrantPalette,
  violetPetalsPalette,
  watercolorPeachesPalette,
  yellowPetalsPalette,
} from './built-in-palettes';
import { ChartPalette } from './types';

export const DEFAULT_PALETTE_ID = softPastelPalette.id;

const palettes: ChartPalette[] = [
  softPastelPalette,
  vibrantPalette,
  earthPalette,
  dreamyPalette,
  nordicPalette,
  jewelPalette,
  lotusPondPalette,
  starryGardenPalette,
  watercolorPeachesPalette,
  dragonFruitPalette,
  colorfulLeavesPalette,
  polishedStonesPalette,
  goldenAgatePalette,
  midnightLiliesPalette,
  strawberryLimePalette,
  mermaidMoonPalette,
  oceanJewelsPalette,
  oceanicDepthsPalette,
  vibrantBloomPalette,
  oceanGlowPalette,
  beachCottagePalette,
  underwaterRadiancePalette,
  bettaFinsPalette,
  berryMedleyPalette,
  blueBudgiePalette,
  pastelNookPalette,
  springBlossomsPalette,
  bluePetalsPalette,
  violetPetalsPalette,
  earthyPetalsPalette,
  blushPetalsPalette,
  dustyBluePetalsPalette,
  greenPetalsPalette,
  redPetalsPalette,
  pinkPetalsPalette,
  yellowPetalsPalette,
];

const paletteById = new Map(palettes.map((palette) => [palette.id, palette]));

export function getAllPalettes(): ChartPalette[] {
  return palettes;
}

export function getPalette(id: string): ChartPalette | undefined {
  return paletteById.get(id);
}

export function getPaletteOrDefault(id?: string | null): ChartPalette {
  if (id) {
    const palette = getPalette(id);
    if (palette) {
      return palette;
    }
  }
  return softPastelPalette;
}

export {
  beachCottagePalette,
  berryMedleyPalette,
  bettaFinsPalette,
  blueBudgiePalette,
  bluePetalsPalette,
  blushPetalsPalette,
  colorfulLeavesPalette,
  dragonFruitPalette,
  dreamyPalette,
  dustyBluePetalsPalette,
  earthPalette,
  earthyPetalsPalette,
  goldenAgatePalette,
  greenPetalsPalette,
  jewelPalette,
  lotusPondPalette,
  mermaidMoonPalette,
  midnightLiliesPalette,
  nordicPalette,
  oceanGlowPalette,
  oceanJewelsPalette,
  oceanicDepthsPalette,
  pastelNookPalette,
  pinkPetalsPalette,
  polishedStonesPalette,
  redPetalsPalette,
  softPastelPalette,
  springBlossomsPalette,
  starryGardenPalette,
  strawberryLimePalette,
  underwaterRadiancePalette,
  vibrantBloomPalette,
  vibrantPalette,
  violetPetalsPalette,
  watercolorPeachesPalette,
  yellowPetalsPalette,
};

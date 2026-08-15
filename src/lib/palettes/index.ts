import {
  dreamyPalette,
  earthPalette,
  jewelPalette,
  nordicPalette,
  softPastelPalette,
  vibrantPalette,
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
  dreamyPalette,
  earthPalette,
  jewelPalette,
  nordicPalette,
  softPastelPalette,
  vibrantPalette,
};

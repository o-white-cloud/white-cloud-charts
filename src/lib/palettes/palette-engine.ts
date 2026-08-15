import { DefaultTreeItemProperties } from '@/lib/default-values';
import type { SingleColor } from '@/lib/types/multi-level-pie-types';
import {
  MultiLevelPieChartData,
  PieChartItem,
  PieChartItemLabelTextSpan,
  SingleColor,
} from '@/lib/types/multi-level-pie-types';

import { getForegroundColor, mixColors } from './color-utils';
import { ChartPalette } from './types';

const MAX_MIX_AMOUNT = 0.89;

export function getPaletteColor(palette: ChartPalette, sectorIndex: number): string {
  if (palette.colors.length === 0) {
    return '#FFFFFF';
  }
  return palette.colors[sectorIndex % palette.colors.length];
}

export function getDescendantMixAmount(
  relativeDepth: number,
  palette: ChartPalette
): number {
  const { amounts } = palette.descendantStrategy;
  if (relativeDepth < amounts.length) {
    return amounts[relativeDepth];
  }

  const lastConfigured = amounts[amounts.length - 1] ?? 0;
  const extraDepth = relativeDepth - (amounts.length - 1);
  const remaining = MAX_MIX_AMOUNT - lastConfigured;
  return lastConfigured + remaining * (1 - 0.5 ** extraDepth);
}

export function generateDescendantColor(
  ancestorColor: string,
  relativeDepth: number,
  palette: ChartPalette
): string {
  const amount = getDescendantMixAmount(relativeDepth, palette);
  return mixColors(ancestorColor, palette.descendantStrategy.target, amount);
}

export function getPaletteForegroundColor(
  backgroundColor: string,
  palette: ChartPalette
): string {
  const { foregroundStrategy } = palette;
  return getForegroundColor(
    backgroundColor,
    foregroundStrategy.light,
    foregroundStrategy.dark
  );
}

function ensureColorProperty(item: PieChartItem): void {
  if (!item.properties?.color) {
    const defaults = DefaultTreeItemProperties(item.parent ?? null);
    item.properties = {
      ...item.properties,
      color: defaults.color,
    };
  }
}

function setSectorBackgroundColor(item: PieChartItem, hex: string): void {
  ensureColorProperty(item);
  const existing = item.properties.color;
  const singleColor: SingleColor = { type: 'single', value: hex };
  item.properties.color = {
    ...existing,
    source: 'override',
    value: singleColor,
  };
}

function setSectorLabelColor(item: PieChartItem, foreground: string): void {
  const existing = item.properties?.labelColor ?? DefaultTreeItemProperties(null).labelColor;
  const singleColor: SingleColor = { type: 'single', value: foreground };
  item.properties = {
    ...item.properties,
    labelColor: {
      ...existing,
      source: 'override',
      value: singleColor,
    },
  };
}

function setLabelForegroundColors(
  item: PieChartItem,
  foreground: string
): void {
  setSectorLabelColor(item, foreground);

  if (item.labelSpans.length === 0) {
    return;
  }

  item.labelSpans = item.labelSpans.map(
    (span): PieChartItemLabelTextSpan => ({
      ...span,
      color: foreground,
    })
  );
}

function cloneItem(item: PieChartItem): PieChartItem {
  return {
    ...item,
    labelSpans: item.labelSpans.map((span) => ({ ...span })),
    properties: {
      ...item.properties,
      color: item.properties?.color
        ? {
            ...item.properties.color,
            value: item.properties.color.value
              ? { ...item.properties.color.value }
              : null,
          }
        : item.properties.color,
      labelColor: item.properties?.labelColor
        ? {
            ...item.properties.labelColor,
            value: item.properties.labelColor.value
              ? { ...item.properties.labelColor.value }
              : null,
          }
        : item.properties.labelColor,
    },
    children: item.children.map(cloneItem),
  };
}

function colorNode(
  node: PieChartItem,
  ancestorColor: string,
  relativeDepth: number,
  palette: ChartPalette
): void {
  const background = generateDescendantColor(ancestorColor, relativeDepth, palette);
  setSectorBackgroundColor(node, background);

  const foreground = getPaletteForegroundColor(background, palette);
  setLabelForegroundColors(node, foreground);

  node.children.forEach((child) => {
    colorNode(child, ancestorColor, relativeDepth + 1, palette);
  });
}

/** Apply a palette to chart items, returning a new immutable chart structure. */
export function applyPalette(
  chart: MultiLevelPieChartData,
  palette: ChartPalette,
  options?: { setPaletteId?: boolean }
): MultiLevelPieChartData {
  const items = chart.items.map(cloneItem);

  items.forEach((topLevelItem, index) => {
    const ancestorColor = getPaletteColor(palette, index);
    colorNode(topLevelItem, ancestorColor, 0, palette);
  });

  const setPaletteId = options?.setPaletteId !== false;

  return {
    ...chart,
    ...(setPaletteId ? { paletteId: palette.id } : {}),
    items,
  };
}

/** Generate preview colors for one branch at each relative depth. */
export function getBranchPreviewColors(
  ancestorColor: string,
  palette: ChartPalette,
  depthCount = 4
): string[] {
  return Array.from({ length: depthCount }, (_, depth) =>
    generateDescendantColor(ancestorColor, depth, palette)
  );
}

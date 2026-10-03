import { mixColors } from './palettes/color-utils';
import { getPropertyValue } from './pie-chart-item-value';
import { reconstructParentRelationships } from './chart-data-clone';
import {
  MultiLevelPieChartData,
  PieChartItem,
  SingleColor,
  SpineStrokeSetting,
} from './types/multi-level-pie-types';

export const CUSTOM_SPINE_STROKE_ID = 'custom';
const SHADE_AMOUNT = 0.35;
const FALLBACK_STROKE_COLOR = '#3F3F3F';

export interface SpineStrokePreset extends SpineStrokeSetting {
  name: string;
  description: string;
}

export const spineStrokePresets: SpineStrokePreset[] = [
  {
    presetId: 'none',
    name: 'None',
    description: 'No spine strokes.',
    width: 0,
    color: { type: 'fixed', value: FALLBACK_STROKE_COLOR },
  },
  {
    presetId: 'thin-dark',
    name: 'Thin dark',
    description: 'Subtle dark line along each wedge.',
    width: 1,
    color: { type: 'fixed', value: FALLBACK_STROKE_COLOR },
  },
  {
    presetId: 'bold-dark',
    name: 'Bold dark',
    description: 'Strong dark line that separates wedges clearly.',
    width: 3,
    color: { type: 'fixed', value: FALLBACK_STROKE_COLOR },
  },
  {
    presetId: 'white-gap',
    name: 'White gap',
    description: 'White line that reads as a cut between wedges.',
    width: 3,
    color: { type: 'fixed', value: '#FFFFFF' },
  },
  {
    presetId: 'thin-shaded',
    name: 'Thin shaded',
    description: "Subtle line in a darker shade of each sector's own color.",
    width: 1,
    color: { type: 'shade' },
  },
  {
    presetId: 'shaded',
    name: 'Shaded',
    description: "Darker shade of each sector's own color.",
    width: 2,
    color: { type: 'shade' },
  },
  {
    presetId: 'bold-shaded',
    name: 'Bold shaded',
    description: "Strong line in a darker shade of each sector's own color.",
    width: 3,
    color: { type: 'shade' },
  },
];

export function getSpineStrokePreset(id: string): SpineStrokePreset | undefined {
  return spineStrokePresets.find((preset) => preset.presetId === id);
}

function resolveStrokeColor(
  item: PieChartItem,
  setting: SpineStrokeSetting,
  chart: MultiLevelPieChartData
): string {
  if (setting.color.type === 'fixed') {
    return setting.color.value;
  }
  const sectorColor = getPropertyValue(item, item.properties.color, chart)?.value;
  try {
    return sectorColor
      ? mixColors(sectorColor, '#000000', SHADE_AMOUNT)
      : FALLBACK_STROKE_COLOR;
  } catch {
    return FALLBACK_STROKE_COLOR;
  }
}

function applyToSpine(
  item: PieChartItem,
  setting: SpineStrokeSetting,
  chart: MultiLevelPieChartData
): PieChartItem {
  const color: SingleColor = {
    type: 'single',
    value: resolveStrokeColor(item, setting, chart),
  };
  const [firstChild, ...siblingChildren] = item.children;

  return {
    ...item,
    properties: {
      ...item.properties,
      startRadiusStrokeWidth: {
        ...item.properties.startRadiusStrokeWidth,
        source: 'override',
        value: setting.width,
      },
      startRadiusStrokeColor: {
        ...item.properties.startRadiusStrokeColor,
        source: 'override',
        value: color,
      },
    },
    children: firstChild
      ? [applyToSpine(firstChild, setting, chart), ...siblingChildren]
      : item.children,
  };
}

/**
 * For each top-level sector, sets the start radius stroke along the
 * first-child chain (root → first child → first grandchild → …) so each
 * wedge reads as one connected shape. Stores the setting on the chart.
 */
export function applySpineStrokes(
  chart: MultiLevelPieChartData,
  setting: SpineStrokeSetting
): MultiLevelPieChartData {
  const items = chart.items.map((root) => applyToSpine(root, setting, chart));
  return {
    ...chart,
    spineStroke: setting,
    items: reconstructParentRelationships(items),
  };
}

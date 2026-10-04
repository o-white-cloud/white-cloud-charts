import {
  MultiLevelPieChartData,
  PieChartLevel,
  RingStyleSetting,
} from './types/multi-level-pie-types';

export interface RingStylePreset extends RingStyleSetting {
  name: string;
  description: string;
}

export const ringStylePresets: RingStylePreset[] = [
  {
    presetId: 'none',
    name: 'None',
    description: 'No rings between levels.',
    width: 0,
    color: '#FFFFFF',
  },
  {
    presetId: 'white-thin',
    name: 'White thin',
    description: 'Fine white line between levels.',
    width: 2,
    color: '#FFFFFF',
  },
  {
    presetId: 'white-thick',
    name: 'White thick',
    description: 'Clear white band between levels.',
    width: 5,
    color: '#FFFFFF',
  },
];

export function getRingStylePreset(id: string): RingStylePreset | undefined {
  return ringStylePresets.find((preset) => preset.presetId === id);
}

function applyToLevel(level: PieChartLevel, setting: RingStyleSetting): PieChartLevel {
  return {
    ...level,
    properties: {
      ...level.properties,
      edgeColor: {
        ...level.properties.edgeColor,
        value: { type: 'single', value: setting.color },
      },
      edgeThickness: {
        ...level.properties.edgeThickness,
        value: setting.width,
      },
    },
  };
}

/**
 * Sets the outer edge of every level except the outermost, drawing rings
 * between levels. The outermost level's edge is left as the user set it.
 * Stores the setting on the chart.
 */
export function applyRingStyle(
  chart: MultiLevelPieChartData,
  setting: RingStyleSetting
): MultiLevelPieChartData {
  const lastIndex = chart.levels.length - 1;
  return {
    ...chart,
    ringStyle: setting,
    levels: chart.levels.map((level, index) =>
      index < lastIndex ? applyToLevel(level, setting) : level
    ),
  };
}

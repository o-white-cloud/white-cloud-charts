import { DefaultLevelProperties } from '@/lib/default-values';
import { applyRingStyle, getRingStylePreset } from '@/lib/ring-styles';
import { MultiLevelPieChartData, PieChartLevel } from '@/lib/types/multi-level-pie-types';

function makeLevel(id: string, innerRadius: number, outerRadius: number): PieChartLevel {
  return { id, innerRadius, outerRadius, properties: DefaultLevelProperties() };
}

function makeChart(): MultiLevelPieChartData {
  return {
    items: [],
    levels: [makeLevel('l0', 100, 220), makeLevel('l1', 220, 420), makeLevel('l2', 420, 700)],
  };
}

const thickness = (level: PieChartLevel) => level.properties.edgeThickness.value;
const color = (level: PieChartLevel) => level.properties.edgeColor.value?.value;

describe('applyRingStyle', () => {
  it('sets white edges on every level except the outermost', () => {
    const chart = makeChart();
    chart.levels[2].properties.edgeThickness.value = 3;
    const result = applyRingStyle(chart, getRingStylePreset('white-thick')!);

    expect(thickness(result.levels[0])).toBe(5);
    expect(thickness(result.levels[1])).toBe(5);
    expect(color(result.levels[0])).toBe('#FFFFFF');
    expect(thickness(result.levels[2])).toBe(3);
    expect(color(result.levels[2])).toBe('#3F3F3F');
  });

  it('clears rings with the None preset', () => {
    const ringed = applyRingStyle(makeChart(), getRingStylePreset('white-thin')!);
    const cleared = applyRingStyle(ringed, getRingStylePreset('none')!);
    expect(thickness(cleared.levels[0])).toBe(0);
    expect(thickness(cleared.levels[1])).toBe(0);
  });

  it('stores the setting on the chart without mutating the input', () => {
    const chart = makeChart();
    const setting = getRingStylePreset('white-thin')!;
    const result = applyRingStyle(chart, setting);

    expect(result.ringStyle).toBe(setting);
    expect(thickness(chart.levels[0])).toBe(0);
  });

  it('handles charts with a single level', () => {
    const chart = { items: [], levels: [makeLevel('l0', 100, 220)] };
    const result = applyRingStyle(chart, getRingStylePreset('white-thick')!);
    expect(thickness(result.levels[0])).toBe(0);
  });
});

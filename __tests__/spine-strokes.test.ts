import { reconstructParentRelationships } from '@/lib/chart-data-clone';
import { DefaultTreeItemProperties } from '@/lib/default-values';
import { mixColors } from '@/lib/palettes/color-utils';
import { softPastelPalette } from '@/lib/palettes/built-in-palettes';
import { applyPalette } from '@/lib/palettes/palette-engine';
import { applySpineStrokes, getSpineStrokePreset } from '@/lib/spine-strokes';
import {
  MultiLevelPieChartData,
  PieChartItem,
} from '@/lib/types/multi-level-pie-types';

function makeItem(id: string, level: number, children: PieChartItem[] = []): PieChartItem {
  return {
    id,
    name: id,
    level,
    innerValue: 1,
    absoluteValue: 1,
    labelSpans: [],
    children,
    properties: DefaultTreeItemProperties(null),
  };
}

// root
// ├── first (spine)
// │   └── grandchild (spine)
// └── second (not spine)
function makeChart(): MultiLevelPieChartData {
  const root = makeItem('root', 0, [
    makeItem('first', 1, [makeItem('grandchild', 2)]),
    makeItem('second', 1),
  ]);
  return { levels: [], items: reconstructParentRelationships([root]) };
}

const width = (item: PieChartItem) => item.properties.startRadiusStrokeWidth.value;
const color = (item: PieChartItem) => item.properties.startRadiusStrokeColor.value?.value;

describe('applySpineStrokes', () => {
  it('strokes the first-child chain only', () => {
    const result = applySpineStrokes(makeChart(), getSpineStrokePreset('bold-dark')!);
    const [root] = result.items;
    const [first, second] = root.children;

    expect(width(root)).toBe(3);
    expect(width(first)).toBe(3);
    expect(width(first.children[0])).toBe(3);
    expect(width(second)).toBe(0);
    expect(color(root)).toBe('#3F3F3F');
  });

  it('stores the setting on the chart', () => {
    const setting = getSpineStrokePreset('white-gap')!;
    expect(applySpineStrokes(makeChart(), setting).spineStroke).toBe(setting);
  });

  it('clears spine widths with the None preset', () => {
    const stroked = applySpineStrokes(makeChart(), getSpineStrokePreset('bold-dark')!);
    const cleared = applySpineStrokes(stroked, getSpineStrokePreset('none')!);
    expect(width(cleared.items[0])).toBe(0);
    expect(width(cleared.items[0].children[0])).toBe(0);
  });

  it('shades each spine sector from its own color', () => {
    const colored = applyPalette(makeChart(), softPastelPalette);
    const result = applySpineStrokes(colored, getSpineStrokePreset('shaded')!);
    const [root] = result.items;
    const first = root.children[0];

    expect(color(root)).toBe(
      mixColors(root.properties.color.value!.value, '#000000', 0.35)
    );
    expect(color(first)).toBe(
      mixColors(first.properties.color.value!.value, '#000000', 0.35)
    );
  });

  it('keeps parent links intact', () => {
    const result = applySpineStrokes(makeChart(), getSpineStrokePreset('thin-dark')!);
    const first = result.items[0].children[0];
    expect(first.parent).toBe(result.items[0]);
  });
});

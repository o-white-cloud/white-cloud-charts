import { DefaultLevelProperties, DefaultTreeItemProperties } from '@/lib/default-values';
import { resetSpanFontSizesOnLevel } from '@/lib/pie-data';
import {
  LabelAnchorType,
  MultiLevelPieChartData,
  PieChartItem,
  PieChartLevel,
} from '@/lib/types/multi-level-pie-types';

function makeItem(
  id: string,
  level: number,
  labelSpans: PieChartItem['labelSpans'] = [],
  children: PieChartItem[] = []
): PieChartItem {
  return {
    id,
    name: id,
    labelSpans,
    innerValue: 1,
    absoluteValue: 1,
    level,
    children,
    properties: DefaultTreeItemProperties(null),
  };
}

function makeLevel(id: string, innerRadius: number, outerRadius: number): PieChartLevel {
  return {
    id,
    innerRadius,
    outerRadius,
    properties: DefaultLevelProperties(),
  };
}

describe('resetSpanFontSizesOnLevel', () => {
  it('clears font-size overrides only on the selected level', () => {
    const level0 = makeLevel('l0', 0, 100);
    const level1 = makeLevel('l1', 100, 200);

    const childOnLevel1 = makeItem('child', 1, [
      {
        text: 'child span',
        color: '#000',
        fontSize: 18,
        fontWeight: 'normal',
        fontFamily: 'Arial',
        anchor: LabelAnchorType.start,
      },
    ]);

    const rootOnLevel0 = makeItem('root', 0, [
      {
        text: 'root span',
        color: '#000',
        fontSize: 20,
        fontWeight: 'normal',
        fontFamily: 'Arial',
        anchor: LabelAnchorType.start,
      },
    ], [childOnLevel1]);

    const data: MultiLevelPieChartData = {
      levels: [level0, level1],
      items: [rootOnLevel0],
    };

    const result = resetSpanFontSizesOnLevel(data, level0);

    expect(result.items[0].labelSpans[0].fontSize).toBeUndefined();
    expect(result.items[0].children[0].labelSpans[0].fontSize).toBe(18);
  });

  it('preserves other span fields when clearing font-size overrides', () => {
    const level0 = makeLevel('l0', 0, 100);
    const item = makeItem('sector', 0, [
      {
        text: 'Line two',
        color: '#ff0000',
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Georgia',
        anchor: LabelAnchorType.middle,
        y: 16,
      },
    ]);

    const data: MultiLevelPieChartData = {
      levels: [level0],
      items: [item],
    };

    const result = resetSpanFontSizesOnLevel(data, level0);
    const span = result.items[0].labelSpans[0];

    expect(span.fontSize).toBeUndefined();
    expect(span.text).toBe('Line two');
    expect(span.color).toBe('#ff0000');
    expect(span.fontWeight).toBe('bold');
    expect(span.fontFamily).toBe('Georgia');
    expect(span.anchor).toBe(LabelAnchorType.middle);
    expect(span.y).toBe(16);
  });
});

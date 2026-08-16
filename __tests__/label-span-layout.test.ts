import { pieLevels } from '@/lib/pie-data';
import { DefaultLevelProperties, DefaultTreeItemProperties } from '@/lib/default-values';
import { layoutLabelSpans } from '@/lib/label-span-layout';
import {
  LabelAnchorType,
  MultiLevelPieChartData,
  PieChartItem,
} from '@/lib/types/multi-level-pie-types';

function makeItem(
  id: string,
  level: number,
  labelSpans: PieChartItem['labelSpans'] = []
): PieChartItem {
  return {
    id,
    name: id,
    level,
    innerValue: 1,
    absoluteValue: 1,
    children: [],
    labelSpans,
    properties: DefaultTreeItemProperties(null),
  };
}

describe('layoutLabelSpans', () => {
  it('stacks spans using line height', () => {
    const spans = layoutLabelSpans(
      [
        { text: 'a', color: '#000', fontWeight: 'normal', anchor: LabelAnchorType.start },
        { text: 'b', color: '#000', fontWeight: 'normal', anchor: LabelAnchorType.start, y: 99 },
      ],
      20
    );

    expect(spans[0].x).toBe(0);
    expect(spans[0].y).toBe(20);
    expect(spans[1].x).toBe(0);
    expect(spans[1].y).toBe(40);
  });
});

describe('pieLevels text line height', () => {
  it('applies level text line height when mapping sectors', () => {
    const levelProps = DefaultLevelProperties();
    levelProps.textLineHeight.value = 24;

    const data: MultiLevelPieChartData = {
      levels: [
        {
          id: 'l0',
          innerRadius: 100,
          outerRadius: 200,
          properties: levelProps,
        },
      ],
      items: [
        makeItem('s1', 0, [
          {
            text: 'line 2',
            color: '#000',
            fontWeight: 'normal',
            anchor: LabelAnchorType.start,
            y: 16,
          },
          {
            text: 'line 3',
            color: '#000',
            fontWeight: 'normal',
            anchor: LabelAnchorType.start,
            y: 32,
          },
        ]),
      ],
    };

    const sectors = pieLevels(data)[0].items;
    expect(sectors[0].labelSpans[0].y).toBe(24);
    expect(sectors[0].labelSpans[1].y).toBe(48);
  });
});

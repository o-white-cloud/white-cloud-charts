import { DefaultLevelProperties, DefaultTreeItemProperties } from '@/lib/default-values';
import {
  applyLabelCenteringCorrectionsOnLevel,
  collectItemsAtLevel,
  verticalCenteringCorrectionFromBBox,
} from '@/lib/label-centering';
import {
  LabelAnchorType,
  MultiLevelPieChartData,
  PieChartItem,
  PieChartLevel,
} from '@/lib/types/multi-level-pie-types';

function makeItem(
  id: string,
  level: number,
  children: PieChartItem[] = []
): PieChartItem {
  return {
    id,
    name: id,
    labelSpans: [],
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

describe('label centering helpers', () => {
  it('computes vertical correction from bbox center', () => {
    expect(verticalCenteringCorrectionFromBBox({ y: 0, height: 40 })).toBe(-20);
    expect(verticalCenteringCorrectionFromBBox({ y: 10, height: 20 })).toBe(-20);
  });

  it('collects items only at the requested level', () => {
    const child = makeItem('child', 1);
    const root = makeItem('root', 0, [child]);
    const collected = collectItemsAtLevel([root], 0);
    expect(collected.map((item) => item.id)).toEqual(['root']);
  });

  it('applies level-scoped labelDY overrides additively', () => {
    const level0 = makeLevel('l0', 0, 100);
    const level1 = makeLevel('l1', 100, 200);
    const child = makeItem('child', 1);
    const root = makeItem('root', 0, [child]);

    root.properties.labelDY = {
      ...root.properties.labelDY,
      source: 'override',
      value: 2,
    };
    child.properties.labelDY = {
      ...child.properties.labelDY,
      source: 'override',
      value: 5,
    };

    const data: MultiLevelPieChartData = {
      levels: [level0, level1],
      items: [root],
    };

    const result = applyLabelCenteringCorrectionsOnLevel(data, level0, {
      root: -12,
      child: -8,
    });

    expect(result.items[0].properties.labelDY).toMatchObject({
      source: 'override',
      value: -10,
    });
    expect(result.items[0].children[0].properties.labelDY).toMatchObject({
      source: 'override',
      value: 5,
    });
    expect(result.items[0].properties.labelAnchor.value).toBe(
      LabelAnchorType.middle
    );
  });
});

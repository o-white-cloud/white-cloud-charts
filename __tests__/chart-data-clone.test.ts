import { cloneChartData } from '@/lib/chart-data-clone';
import { DefaultTreeItemProperties } from '@/lib/default-values';
import { MultiLevelPieChartData, PieChartItem } from '@/lib/types/multi-level-pie-types';

function makeItem(id: string, children: PieChartItem[] = []): PieChartItem {
  return {
    id,
    name: id,
    level: 0,
    innerValue: 1,
    absoluteValue: 1,
    labelSpans: [],
    children,
    properties: DefaultTreeItemProperties(null),
  };
}

describe('cloneChartData', () => {
  it('clones charts with parent/child circular references', () => {
    const child = makeItem('1.1');
    const root = makeItem('1', [child]);
    child.parent = root;
    root.parent = undefined;

    const data: MultiLevelPieChartData = {
      levels: [],
      items: [root],
      paletteId: 'soft-pastel',
    };

    const cloned = cloneChartData(data);

    expect(cloned).not.toBe(data);
    expect(cloned.items[0]).not.toBe(root);
    expect(cloned.items[0].children[0].parent).toBe(cloned.items[0]);
    expect(cloned.paletteId).toBe('soft-pastel');
  });
});

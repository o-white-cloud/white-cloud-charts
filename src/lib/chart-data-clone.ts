import {
  MultiLevelPieChartData,
  PieChartItem,
} from '@/lib/types/multi-level-pie-types';

export function stripParentReferences(
  item: PieChartItem
): Omit<PieChartItem, 'parent'> {
  const { parent: _parent, ...clean } = item;
  return {
    ...clean,
    children: clean.children.map(stripParentReferences),
  };
}

export function reconstructParentRelationships(
  items: PieChartItem[],
  parent: PieChartItem | undefined = undefined
): PieChartItem[] {
  return items.map((item) => {
    const newItem = { ...item, parent };
    if (newItem.children.length > 0) {
      newItem.children = reconstructParentRelationships(
        newItem.children,
        newItem
      );
    }
    return newItem;
  });
}

/** Deep-clone chart data, including circular parent/child tree links. */
export function cloneChartData(
  data: MultiLevelPieChartData
): MultiLevelPieChartData {
  const serializable = {
    ...data,
    items: data.items.map(stripParentReferences),
  };

  const cloned = JSON.parse(
    JSON.stringify(serializable)
  ) as MultiLevelPieChartData;

  return {
    ...cloned,
    items: reconstructParentRelationships(cloned.items),
  };
}

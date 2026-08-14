import { PieChartItem } from './types/multi-level-pie-types';

function setStartRadiusStrokeWidth(
  item: PieChartItem,
  strokeWidth: number
): PieChartItem {
  return {
    ...item,
    properties: {
      ...item.properties,
      startRadiusStrokeWidth: {
        ...item.properties.startRadiusStrokeWidth,
        source: 'override',
        value: strokeWidth,
      },
    },
  };
}

function applySpineToItem(
  item: PieChartItem,
  strokeWidth: number
): PieChartItem {
  const withStroke = setStartRadiusStrokeWidth(item, strokeWidth);

  if (withStroke.children.length === 0) {
    return withStroke;
  }

  const [firstChild, ...siblingChildren] = withStroke.children;
  return {
    ...withStroke,
    children: [
      applySpineToItem(firstChild, strokeWidth),
      ...siblingChildren,
    ],
  };
}

function reconstructParentRelationships(
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

/**
 * For each top-level sector, sets startRadiusStrokeWidth along the first-child
 * chain (root → first child → first grandchild → …).
 */
export function applySpineStartRadiusStrokes(
  items: PieChartItem[],
  strokeWidth: number
): PieChartItem[] {
  const updated = items.map((root) => applySpineToItem(root, strokeWidth));
  return reconstructParentRelationships(updated);
}

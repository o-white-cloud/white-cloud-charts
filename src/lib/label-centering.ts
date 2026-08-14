import { getPropertyValue } from '@/lib/pie-chart-item-value';
import {
  LabelDisplayType,
  MultiLevelPieChartData,
  PieChartItem,
  PieChartLevel,
} from '@/lib/types/multi-level-pie-types';

const sectorIdAttr = 'sector-id';

/** Local vertical shift to center a rendered SVG text block around its anchor. */
export function verticalCenteringCorrectionFromBBox(
  bbox: { y: number; height: number }
): number {
  return -(bbox.y + bbox.height / 2);
}

export function collectItemsAtLevel(
  items: PieChartItem[],
  levelIndex: number
): PieChartItem[] {
  const result: PieChartItem[] = [];
  const visit = (item: PieChartItem) => {
    if (item.level === levelIndex) {
      result.push(item);
    }
    item.children.forEach(visit);
  };
  items.forEach(visit);
  return result;
}

function isCentroidOrRadialDisplay(
  item: PieChartItem,
  data: MultiLevelPieChartData
): boolean {
  const display = getPropertyValue(
    item,
    item.properties.labelDisplay,
    data
  );
  return (
    display === LabelDisplayType.centroid ||
    display === LabelDisplayType.radial
  );
}

/**
 * Measures centroid/radial label blocks in the current chart SVG.
 * Returns per-sector vertical corrections in the text element's local coordinates.
 */
export function measureLabelCenteringCorrectionsForLevel(
  levelIndex: number,
  data: MultiLevelPieChartData
): Record<string, number> {
  const corrections: Record<string, number> = {};
  const svg = document.querySelector('.pieRoot svg');
  if (!svg) {
    return corrections;
  }

  const items = collectItemsAtLevel(data.items, levelIndex).filter((item) =>
    isCentroidOrRadialDisplay(item, data)
  );

  for (const item of items) {
    const textEl = svg.querySelector(
      `text[${sectorIdAttr}="${item.id}"]`
    ) as SVGTextElement | null;
    if (!textEl || !textEl.textContent?.trim()) {
      continue;
    }

    const bbox = textEl.getBBox();
    if (bbox.width === 0 && bbox.height === 0) {
      continue;
    }

    corrections[item.id] = verticalCenteringCorrectionFromBBox(bbox);
  }

  return corrections;
}

export function applyLabelCenteringCorrectionsOnLevel(
  data: MultiLevelPieChartData,
  level: PieChartLevel,
  corrections: Record<string, number>
): MultiLevelPieChartData {
  const levelIndex = data.levels.indexOf(level);
  const items = [...data.items];

  const updateItem = (item: PieChartItem) => {
    const correction = corrections[item.id];
    if (item.level === levelIndex && correction !== undefined) {
      const currentDY =
        getPropertyValue(item, item.properties.labelDY, data) ?? 0;
      item.properties = {
        ...item.properties,
        labelDY: {
          ...item.properties.labelDY,
          source: 'override',
          value: currentDY + correction,
        },
      };
    }
    item.children.forEach(updateItem);
  };

  items.forEach(updateItem);

  return {
    items,
    levels: data.levels,
  };
}

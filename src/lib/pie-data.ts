import {
    MultiLevelPieChartData, PieChartItem, PieChartLevel, PieSector
} from './types/multi-level-pie-types';

export const pieLevels = (
  data: MultiLevelPieChartData
): { level: PieChartLevel; items: PieSector[] }[] => {
  const flattenedLevels = Array<{
    level: PieChartLevel;
    items: Array<PieChartItem>;
  }>(data.levels.length);

  const buffer: Array<PieChartItem> = [...data.items];

  while (buffer.length > 0) {
    const current = buffer.shift();
    if (!current) {
      break;
    }

    if (!flattenedLevels[current.level]) {
      flattenedLevels[current.level] = {
        items: [],
        level: data.levels[current.level],
      };
    }

    flattenedLevels[current.level].items.push(current);
    if (current.children && current.children.length > 0) {
      buffer.push(...current.children);
    } else if (current.level < data.levels.length - 1) {
      buffer.push({
        absoluteValue: 1,
        innerValue: 1,
        children: [],
        id: `${current.id}.0p`,
        level: current.level + 1,
        name: 'Placeholder',
        parent: current,
        labelDisplay: current.labelDisplay,
        colorSource: current.colorSource,
      });
    }
  }

  flattenedLevels.forEach((l) => {
    l.items.forEach((i) => {
      const siblingSum = i.parent
        ? i.parent.children.reduce((sum, child) => sum + child.innerValue, 0)
        : 1;
      i.absoluteValue =
        i.name === 'Placeholder' && i.parent
          ? i.parent?.absoluteValue
          : (i.innerValue / siblingSum) *
            (i.parent ? i.parent.absoluteValue : 1);
    });
  });

  return flattenedLevels.map((x) => ({
    level: x.level,
    items: x.items.map<PieSector>((item) => ({
      id: item.id,
      name: item.name,
      value: item.absoluteValue,
      placeholder: item.name === 'Placeholder',
      labelDisplay: item.labelDisplay,
      colorSource: item.colorSource,
      colorValue: item.colorValue,
      strokeColor: x.level.strokeColor,
      strokeWidth: x.level.strokeWidth
    })),
  }));
};

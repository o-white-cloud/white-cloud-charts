import { getPropertyValue } from './pie-chart-item-value';
import {
  MultiLevelPieChartData, PieChartItem, PieChartItemProperties, Property, PieChartLevel, PieSector,
  PieSectorProperties,
  SingleColor
} from './types/multi-level-pie-types';

type FlattenedLevels =
  {
    level: PieChartLevel;
    items: Array<PieChartItem>;
  }[];

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
        properties: current.properties
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

  return mapItemsToSectors(flattenedLevels, data);
};

const mapItemsToSectors = (flattenedLevels: FlattenedLevels, data: MultiLevelPieChartData) => {
  return flattenedLevels.map((levelAndItems) => ({
    level: levelAndItems.level,
    items: levelAndItems.items.map<PieSector>((item) => {
      return {
        id: item.id,
        name: item.name,
        value: item.absoluteValue,
        placeholder: item.name === 'Placeholder',
        properties: item.name === 'Placeholder' ? null : Object.keys(item.properties).reduce<PieSectorProperties>((newProperties, property: keyof PieChartItemProperties) => {
          newProperties[property].value = getPropertyValue(item, item.properties[property], data);
          return newProperties;
        }, { ...item.properties })
      };
    }),
  }));
}

export const recomputeFromLevel = (data: MultiLevelPieChartData, level: PieChartLevel): MultiLevelPieChartData => {
  var items = [...data.items];
  var levelIndex = data.levels.indexOf(level);
  items.forEach(item => {
    traverse(item, levelIndex);
  });
  
  const newData = {
    items,
    levels: data.levels
  }

  return newData;
}

const traverse = (item: PieChartItem, level: number) => {
  if (item.level < level) {
    item.innerValue = 0;
  }

  if (item.level == level) {
    item.innerValue = 1;
    if (item.parent) {
      item.parent.innerValue++;
    }
    return;
  }

  if (item.children && item.level < level) {
    item.children.forEach(child => traverse(child, level));
  }

  if (item.parent) {
    item.parent.innerValue += item.innerValue;
  }
}
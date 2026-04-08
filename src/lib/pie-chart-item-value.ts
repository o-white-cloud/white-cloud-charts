import { MultiLevelPieChartData, PieChartItem, Property, PieChartLevel, SingleColor } from "./types/multi-level-pie-types";
import Gradient from 'javascript-color-gradient';

function getPropertyValueInner<T>(item: PieChartItem, property: Property<T>, data: MultiLevelPieChartData): T | null {
    const level = data.levels[item.level];

    switch (property.source) {
        case 'override': return property.value;
        case 'level': {
            switch (property.name) {
                case 'color': {
                    const siblings = item.parent ? item.parent.children : data.items;
                    const levelColors = getLevelColorsForItems(level, siblings);
                    const itemIndex = siblings.findIndex(x => x.id === item.id);
                    const newColor = itemIndex < levelColors.length ? levelColors[itemIndex] : '#fff';
                    if(newColor === undefined && item.name!=='Placeholder'){
                        debugger;
                    }
                    const singleColor: SingleColor = {type: 'single', value: newColor};
                    return singleColor as T;
                }
            }
            return (level.properties as Record<string, Property<any>>)[property.name]?.value ?? null;
        }
        case 'parent': {
            if (!item.parent) {
                return null;
            }
            return getPropertyValueInner(item.parent, (item.parent.properties)[property.name], data);
        }
        default: return null;
    }
}

export const getPropertyValue = <T,>(item: PieChartItem, property: Property<T>, data: MultiLevelPieChartData): T | null => {
    const value = getPropertyValueInner(item, property, data);
    if (property.name === 'textLineHeight' && (value === null || value === undefined)) {
        return 16 as T;
    }
    return value;
}

const getLevelColorsForItems = (level: PieChartLevel, items: PieChartItem[]) => {
    const color = level.properties.color.value;
    if (!color)
        return [];

    switch (color.type) {
        case 'enumeration': {
            return color.values;
        }
        case 'gradient': {
            return new Gradient()
                .setColorGradient(color.from, color.to)
                .setMidpoint(items.length)
                .getColors();
        }
        case 'single': {
            return items.map(_ => color.value);
        }
        default: return [];
    }

}

export const updateChildrenWithParent = (parent: PieChartItem) => {
    parent.children?.forEach(child => {
        child.parent = parent;
        updateChildrenWithParent(child);
    });
}

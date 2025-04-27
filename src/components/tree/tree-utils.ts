import { DefaultLevelProperties, DefaultTreeItemProperties } from "@/lib/default-values";
import { PieChartItem, PieChartLevel } from "@/lib/types/multi-level-pie-types";
import { NodeApi } from "react-arborist";

export const createNewTreeItem = (rootItems: PieChartItem[], levels: PieChartLevel[], parentItem: PieChartItem | null, name?: string) => {
    const newItemId = createTreeItemId(
        parentItem?.id ?? '',
        parentItem?.children ?? rootItems
    );
    const item: PieChartItem = {
        level: (parentItem?.level ?? -1) + 1,
        parent: parentItem ?? undefined,
        id: newItemId,
        name: name ?? newItemId,
        innerValue: 1,
        absoluteValue: 1,
        children: [],
        properties: DefaultTreeItemProperties(parentItem)
    };

    let level: PieChartLevel | undefined;
    if (item.level > levels.length - 1) {
        level = {
            id: `${levels.length + 1}`,
            innerRadius: (levels.length + 1) * 100,
            outerRadius: (levels.length + 2) * 100,
            properties: DefaultLevelProperties()
        };
    }

    return { item, level };
}

export const createTree = (text: string) => {
    let items: PieChartItem[] = [];
    let levels: PieChartLevel[] = [];
    
    // Split text into lines and filter out empty lines
    const lines = text.split('\n').filter(line => line.trim());
    
    // Stack to keep track of parent items
    const stack: { item: PieChartItem; level: number }[] = [];
    
    lines.forEach(line => {
        // Count leading spaces to determine indentation level
        const indent = line.match(/^\s*/)?.[0].length ?? 0;
        const name = line.trim();
        
        // Pop items from stack until we find the correct parent level
        while (stack.length > 0 && stack[stack.length - 1].level >= indent) {
            stack.pop();
        }
        
        // Create new item
        const parentItem = stack.length > 0 ? stack[stack.length - 1].item : null;
        const { item, level } = createNewTreeItem(items, levels, parentItem, name);
        
        // Add to parent's children or root items
        if (parentItem) {
            parentItem.children.push(item);
        } else {
            items.push(item);
        }
        
        // Add new level if needed
        if (level) {
            levels.push(level);
        }
        
        // Push to stack
        stack.push({ item, level: indent });
    });
    debugger;
    return { items, levels };
}

function createTreeItemId(parentId: string, siblings: { id: string }[]) {
    const maxSiblingId = siblings
        .map((x) => Number(x.id.substring(x.id.lastIndexOf('.') + 1)))
        .reduce((m, x) => Math.max(m, x), 0);
    return `${parentId}${parentId ? '.' : ''}${maxSiblingId + 1}`;
}
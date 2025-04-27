'use client';
import { createContext, useCallback, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import Canvas from '@/components/Canvas';
import { MultiLevelPieChart } from '@/components/charts/pie/multi-level-pie-chart';
import Navbar from '@/components/Navbar';
import {
  MultiLevelPieChartData, PieChartItem, Property, PieChartLevel
} from '@/lib/types/multi-level-pie-types';

import LevelEditor from './level-editor';
import { Levels } from './levels';
import { PieTree } from './tree';
import TreeItemEditor from './tree-item-editor';
import { MultiLevelPieChartDataContext } from '@/components/contexts/MultiLevelPieChartDataContext';
import { updateChildrenWithParent } from '@/lib/pie-chart-item-value';



export default function Page() {
  const [data, setData] = useState<MultiLevelPieChartData>({
    items: [],
    levels: [],
  });


  const [selectedItem, setSelectedItem] = useState<
    | { type: 'treeItem'; item: PieChartItem }
    | { type: 'level'; item: PieChartLevel }
    | null
  >(null);

  const onTreeItemSelect = useCallback(
    (treeItem: PieChartItem | null) =>
      setSelectedItem(treeItem ? { type: 'treeItem', item: treeItem } : null),
    []
  );
  const onLevelSelect = useCallback(
    (level: PieChartLevel | null) =>
      setSelectedItem(level ? { type: 'level', item: level } : null),
    []
  );

  const updateItemData = useCallback(
    (item: PieChartItem) => {
      const newItems = [...data.items];
      const siblingsArray = item.parent ? item.parent.children : newItems;
      const index = siblingsArray.findIndex((x) => x.id === item.id);
      if (index !== -1) {
        siblingsArray.splice(index, 1, item);
        updateChildrenWithParent(item);
        setData({ items: newItems, levels: data.levels });
        setSelectedItem({ item, type: 'treeItem' });
      }
    },
    [data]
  );

  const updateLevelData = useCallback(
    (level: PieChartLevel, property?: Property<any>) => {
      const newLevels = [...data.levels];
      const index = newLevels.findIndex((x) => x.id === level.id);
      if (index !== -1) {
        newLevels.splice(index, 1, level);
        setData({ items: data.items, levels: newLevels });
        setSelectedItem({ item: level, type: 'level' });
      }
    },
    [data]
  );

  const findItemById = useCallback((id: string, items: PieChartItem[]): PieChartItem | null => {
    for (const item of items) {
      if (item.id === id) {
        return item;
      }
      if (item.children.length > 0) {
        const found = findItemById(id, item.children);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }, []);

  const onSectorClick = useCallback((sectorId: string) => {
    const item = findItemById(sectorId, data.items);
    if (item) {
      onTreeItemSelect(item);
    }
  }, [data.items, findItemById, onTreeItemSelect]);

  return (
    <MultiLevelPieChartDataContext.Provider value={data}>
      <main className="h-screen overflow-hidden">
        {/* <Navbar /> */}
        <section className="flex h-full flex-row bg-gray-300">
          <PanelGroup direction="horizontal">
            <Panel defaultSize={25} className="p-2 bg-white">
              <PieTree
                onDataChange={setData}
                onSelectionChange={onTreeItemSelect}
              />
            </Panel>
            <PanelResizeHandle />
            <Panel>
            <Levels
                onSelectionChange={onLevelSelect}
                selectedLevel={
                  selectedItem?.type == 'level' ? selectedItem?.item : null
                }/>
              <MultiLevelPieChart 
                data={data} 
                onSectorClick={onSectorClick}
              />
            </Panel>
            <PanelResizeHandle />
            <Panel defaultSize={25} className="bg-white !overflow-auto">
              {selectedItem && selectedItem.type === 'treeItem' && (
                <TreeItemEditor
                  item={selectedItem.item}
                  level={data.levels[selectedItem.item.level]}
                  onItemUpdated={updateItemData}
                />
              )}
              {selectedItem && selectedItem.type === 'level' && (
                <LevelEditor
                  level={selectedItem.item}
                  onLevelUpdated={updateLevelData}
                  items={data.items.filter(i => i.level == data.levels.indexOf(selectedItem.item))}
                />
              )}
            </Panel>
          </PanelGroup>
        </section>
      </main>
    </MultiLevelPieChartDataContext.Provider>
  );
}

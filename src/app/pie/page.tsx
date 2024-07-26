'use client';
import { useCallback, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import Canvas from '@/components/Canvas';
import { MultiLevelPieChart } from '@/components/charts/pie/multi-level-pie-chart';
import Navbar from '@/components/Navbar';
import {
    MultiLevelPieChartData, PieChartItem, PieChartLevel
} from '@/lib/types/multi-level-pie-types';

import LevelEditor from './level-editor';
import { Levels } from './levels';
import { PieTree } from './tree';
import TreeItemEditor from './tree-item-editor';

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
        setData({ items: newItems, levels: data.levels });
      }
    },
    [data]
  );

  const updateLevelData = useCallback(
    (level: PieChartLevel) => {
      const newLevels = [...data.levels];
      const index = newLevels.findIndex((x) => x.id === level.id);
      if (index !== -1) {
        newLevels.splice(index, 1, level);
        setData({ items: data.items, levels: newLevels });
      }
    },
    [data]
  );

  return (
    <main className="h-screen overflow-hidden">
      {/* <Navbar /> */}
      <section className="flex h-full flex-row bg-gray-300">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={25} className="p-2 bg-white">
            <Levels
              data={data}
              onSelectionChange={onLevelSelect}
              selectedLevel={
                selectedItem?.type == 'level' ? selectedItem?.item : null
              }
            />
            <PieTree
              data={data}
              onDataChange={setData}
              onSelectionChange={onTreeItemSelect}
            />
          </Panel>
          <PanelResizeHandle />
          <Panel>
            <MultiLevelPieChart data={data} />
          </Panel>
          <PanelResizeHandle />
          <Panel defaultSize={25} className="bg-white">
            {selectedItem && selectedItem.type === 'treeItem' && (
              <TreeItemEditor
                item={selectedItem.item}
                onItemUpdated={updateItemData}
              />
            )}
            {selectedItem && selectedItem.type === 'level' && (
              <LevelEditor
                level={selectedItem.item}
                onLevelUpdated={updateLevelData}
              />
            )}
          </Panel>
        </PanelGroup>
      </section>
    </main>
  );
}

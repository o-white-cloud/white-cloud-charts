'use client';
import { useCallback, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { TreeApi } from 'react-arborist';

import { MultiLevelPieChart } from '@/components/charts/pie/multi-level-pie-chart';
import { PieEditorToolbar } from '@/components/pie-editor-toolbar';
import {
  MultiLevelPieChartData, PieChartItem, Property, PieChartLevel
} from '@/lib/types/multi-level-pie-types';

import LevelEditor from './level-editor';
import { Levels } from './levels';
import { PieTree } from '@/components/tree/tree';
import TreeItemEditor from './tree-item-editor';
import { MultiLevelPieChartDataContext } from '@/components/contexts/MultiLevelPieChartDataContext';
import { updateChildrenWithParent } from '@/lib/pie-chart-item-value';
import { recomputeFromLevel, resetSpanFontFamiliesOnLevel, resetSpanFontSizesOnLevel } from '@/lib/pie-data';
import {
  applyLabelCenteringCorrectionsOnLevel,
  measureLabelCenteringCorrectionsForLevel,
} from '@/lib/label-centering';

export default function Page() {
  const treeRef = useRef<TreeApi<PieChartItem> | null>(null);
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
        setData({ ...data, items: newItems, levels: data.levels });
        setSelectedItem({ item, type: 'treeItem' });
      }
    },
    [data]
  );

  const onLevelCalibrate = useCallback((level: PieChartLevel) => {
    const newData = recomputeFromLevel(data, level);
    setData(newData);
  }, [data])

  const onResetSpanFontSizes = useCallback((level: PieChartLevel) => {
    const newData = resetSpanFontSizesOnLevel(data, level);
    setData(newData);
  }, [data]);

  const onResetSpanFontFamilies = useCallback((level: PieChartLevel) => {
    const newData = resetSpanFontFamiliesOnLevel(data, level);
    setData(newData);
  }, [data]);

  const onCenterAllSectorText = useCallback((level: PieChartLevel) => {
    const levelIndex = data.levels.indexOf(level);
    const corrections = measureLabelCenteringCorrectionsForLevel(levelIndex, data);
    const newData = applyLabelCenteringCorrectionsOnLevel(data, level, corrections);
    setData(newData);
  }, [data]);

  const updateLevelData = useCallback(
    (level: PieChartLevel, property?: Property<any>) => {
      const newLevels = [...data.levels];
      const index = newLevels.findIndex((x) => x.id === level.id);
      if (index !== -1) {
        newLevels.splice(index, 1, level);
        setData({ ...data, items: data.items, levels: newLevels });
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
      <main className="flex h-screen flex-col overflow-hidden">
        <PieEditorToolbar onDataChange={setData} treeRef={treeRef} />
        <section className="flex min-h-0 flex-1 flex-row bg-gray-300">
          <PanelGroup direction="horizontal" className="h-full">
            <Panel defaultSize={25} className="flex h-full min-h-0 flex-col bg-white p-2">
              <PieTree
                treeRef={treeRef}
                onDataChange={setData}
                onSelectionChange={onTreeItemSelect}
                selectedItemId={
                  selectedItem?.type === 'treeItem'
                    ? selectedItem.item.id
                    : null
                }
              />
            </Panel>
            <PanelResizeHandle />
            <Panel className="flex min-h-0 flex-col">
            <Levels
                onSelectionChange={onLevelSelect}
                selectedLevel={
                  selectedItem?.type == 'level' ? selectedItem?.item : null
                }/>
              <div className="min-h-0 flex-1">
              <MultiLevelPieChart 
                data={data} 
                onSectorClick={onSectorClick}
              />
              </div>
            </Panel>
            <PanelResizeHandle />
            <Panel defaultSize={25} className="bg-white !overflow-auto">
              {selectedItem && selectedItem.type === 'treeItem' && (
                <TreeItemEditor
                  key={selectedItem.item.id}
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
                  calibrateParentsToThis={onLevelCalibrate}
                  resetSpanFontSizesOnLevel={onResetSpanFontSizes}
                  resetSpanFontFamiliesOnLevel={onResetSpanFontFamilies}
                  centerAllSectorText={onCenterAllSectorText}
                />
              )}
            </Panel>
          </PanelGroup>
        </section>
      </main>
    </MultiLevelPieChartDataContext.Provider>
  );
}

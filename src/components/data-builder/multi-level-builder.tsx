'use client';

import { useCallback, useRef, useState } from 'react';

import {
    MultiLevelPieChartData, PieChartItem, PieChartLevel
} from '@/lib/types/multi-level-pie-types';
import { useTreeData } from '@react-stately/data';

import { Button } from '../ui/button';
import { Tree } from '../ui/tree';
import ItemDialog from './item-dialog';
import { createTreeItemId } from './tree-id';

export interface MultiLevelBuilderProps {
  data: MultiLevelPieChartData;
  onDataChange: (data: MultiLevelPieChartData) => void;
}

export const MultiLevelBuilder: React.FC<MultiLevelBuilderProps> = (props) => {
  const tree = useTreeData<PieChartItem>({
    initialItems: props.data.items,
    getKey: (item) => item.id,
    getChildren: (item) => item.children,
  });

  const [levels, setLevels] = useState<PieChartLevel[]>(props.data.levels);
  const maxLevel = useRef(props.data.levels.length - 1);

  const [dialog, setDialog] = useState<{
    open: boolean;
    item?: PieChartItem;
  }>({ open: false });

  const onItemCreate = useCallback(
    (item: PieChartItem) => {
      setDialog({ open: true, item });
    },
    [setDialog]
  );

  const onItemCreateSubmit = useCallback(
    (item: PieChartItem, name: string, value: number) => {
      const newItem: PieChartItem = {
        level: item.level + 1,
        parent: item,
        id: createTreeItemId(item.id, item.children),
        name: name,
        innerValue: value,
        absoluteValue: 1,
        children: [],
      };
      item.children.push(newItem);
      if (newItem.level > maxLevel.current) {
        maxLevel.current++;
        setLevels([...levels, { innerRadius: maxLevel.current * 200, outerRadius: (maxLevel.current + 1)*200 }]);
      }
      tree.append(item.id, newItem);
      setDialog({ open: false });
    },
    [setDialog, tree, levels]
  );

  const onItemEdit = useCallback((item: any) => {}, []);
  const onItemDelete = useCallback(
    (item: PieChartItem) => {

      tree.remove(item.id);
    },
    [tree]
  );

  const submitData = useCallback(() => {
    props.onDataChange({
      items: tree.items[0].children.map(x => x.value),
      levels
    });
  }, [tree, levels]);

  return (
    <div className="flex flex-col">
      <Tree
        className="min-w-96 flex-1"
        items={tree.items}
        expandedKeys={tree.selectedKeys}
        setExpandedKeys={tree.setSelectedKeys}
        onItemCreate={onItemCreate}
        onItemEdit={onItemEdit}
        onItemDelete={onItemDelete}
      />
      {/* <ul>
        {levels.map((x) => (
          <li key={x.radius}>{x.radius}</li>
        ))}
      </ul> */}
      <Button onClick={submitData}>Generate chart</Button>
      <ItemDialog
        open={dialog.open}
        treeItem={dialog.item}
        onSubmit={onItemCreateSubmit}
        onCancel={() => setDialog({ open: false })}
      />
    </div>
  );
};

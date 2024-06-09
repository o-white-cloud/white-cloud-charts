'use client';

import { Plus, Search } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import {
    CreateHandler, DeleteHandler, NodeApi, RenameHandler, Tree, TreeApi
} from 'react-arborist';

import { Input } from '@/components/ui/input';
import {
    ColorSource, LabelDisplay, MultiLevelPieChartData, PieChartItem, PieChartLevel
} from '@/lib/types/multi-level-pie-types';

import { Button } from '../../components/ui/button';
import Node from './node';

export interface MultiLevelBuilderProps {
  data: MultiLevelPieChartData;
  onDataChange: (data: MultiLevelPieChartData) => void;
  onSelectionChange: (item: PieChartItem | null) => void;
}

function createTreeItemId(parentId: string, siblings: { id: string }[]) {
  const maxSiblingId = siblings
    .map((x) => Number(x.id.substring(x.id.lastIndexOf('.') + 1)))
    .reduce((m, x) => Math.max(m, x), 0);
  return `${parentId}${parentId ? '.' : ''}${maxSiblingId + 1}`;
}

export const PieTree: React.FC<MultiLevelBuilderProps> = (props) => {
  const { data, onDataChange, onSelectionChange } = props;
  const treeRef = useRef<TreeApi<PieChartItem> | null>(null);

  const onRootItemCreate = useCallback(() => {
    treeRef.current?.create({
      index: null,
      parentId: null,
      type: 'leaf',
    });
  }, [treeRef.current]);

  const onItemCreate = useCallback<CreateHandler<PieChartItem>>(
    (args) => {
      const newItems = [...props.data.items];
      const newItemId = createTreeItemId(
        args.parentNode?.data.id ?? '',
        args.parentNode?.data.children ?? newItems
      );
      const newItem: PieChartItem = {
        level: (args?.parentNode?.data.level ?? -1) + 1,
        parent: args.parentNode?.data,
        id: newItemId,
        name: newItemId,
        innerValue: 1,
        absoluteValue: 1,
        children: [],
        labelDisplay: LabelDisplay.Inherit,
        colorSource: ColorSource.Level
      };

      if (args.parentNode) {
        args.parentNode.data.children.push(newItem);
      } else {
        newItems.push(newItem);
      }

      const newLevels = [...props.data.levels];
      if (newItem.level > newLevels.length - 1) {
        newLevels.push({
          id: `${newLevels.length + 1}`,
          innerRadius: (newLevels.length + 1) * 100,
          outerRadius: (newLevels.length + 2) * 100,
          color: {type: 'single', value: '#ffffff'},
          cornerRadius: 0,
          padAngle: 1,
          padRadius: 0,
          strokeColor: '#ffffff',
          strokeWidth: 1
        });
      }

      onDataChange({ items: newItems, levels: newLevels });

      return newItem;
    },
    [data, onDataChange]
  );

  const onItemDelete = useCallback<DeleteHandler<PieChartItem>>(
    (args) => {
      const newItems = [...props.data.items];

      args.nodes.forEach((node) => {
        const parentArray = node.data.parent?.children ?? newItems;

        const index = parentArray.indexOf(node.data);
        parentArray.splice(index, 1);
      });
      props.onDataChange({ items: newItems, levels: props.data.levels });
    },
    [props.data]
  );

  const onItemRename = useCallback<RenameHandler<PieChartItem>>(
    (args) => {
      const newItems = [...props.data.items];
      args.node.data.name = args.name;
      props.onDataChange({ items: newItems, levels: props.data.levels });
    },
    [props.data]
  );

  const onTreeSelectionChanged = useCallback(
    (nodes: NodeApi<PieChartItem>[]) => {
      if (nodes.length) {
        onSelectionChange(nodes[0].data);
      } else {
        onSelectionChange(null);
      }
    },
    [onSelectionChange]
  );

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <Input className='flex-1 h-9' placeholder='Search' startIcon={Search}/>
        <Button
          onClick={onRootItemCreate}
          variant={'outline'}
          className="h-9 self-end m-4"
        >
          <Plus className="h-4 w-4" /> Add root item
        </Button>
      </div>
      <Tree
        className="flex-1"
        width="100%"
        rowHeight={36}
        data={data.items}
        onCreate={onItemCreate}
        onDelete={onItemDelete}
        onRename={onItemRename}
        onSelect={onTreeSelectionChanged}
        ref={treeRef}
      >
        {Node}
      </Tree>
    </div>
  );
};

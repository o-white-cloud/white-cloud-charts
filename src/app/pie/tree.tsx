'use client';

import { Plus } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import {
    CreateHandler, DeleteHandler, NodeApi, RenameHandler, Tree, TreeApi
} from 'react-arborist';

import {
    MultiLevelPieChartData, PieChartItem, PieChartLevel
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
  const {data, onDataChange, onSelectionChange} = props;
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
      };

      if (args.parentNode) {
        args.parentNode.data.children.push(newItem);
      } else {
        newItems.push(newItem);
      }

      const newLevels = [...props.data.levels];
      if (newItem.level > newLevels.length - 1) {
        newLevels.push({
          innerRadius: (newLevels.length + 1) * 100,
          outerRadius: (newLevels.length + 2) * 100,
        });
      }

      props.onDataChange({ items: newItems, levels: newLevels });

      return newItem;
    },
    [props.data]
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

  const onTreeSelectionChanged = useCallback((nodes: NodeApi<PieChartItem>[]) => {
    if(nodes.length) {
      onSelectionChange(nodes[0].data);
    } else {
      onSelectionChange(null);
    }
  }, [onSelectionChange]);

  return (
    <div className="flex flex-col flex-1">
      <Button
        onClick={onRootItemCreate}
        variant={'ghost'}
        className="p-0 w-9 h-9"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Tree
        className='flex-1'
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

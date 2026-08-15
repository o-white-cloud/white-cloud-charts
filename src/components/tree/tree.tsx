'use client';

import { useCallback, useContext, useRef } from 'react';
import useResizeObserver from 'use-resize-observer';
import {
  CreateHandler, DeleteHandler, NodeApi, RenameHandler, Tree, TreeApi
} from 'react-arborist';

import {
  MultiLevelPieChartData, PieChartItem,
  PieChartLevel
} from '@/lib/types/multi-level-pie-types';

import Node from './node';
import { MultiLevelPieChartDataContext } from '@/components/contexts/MultiLevelPieChartDataContext';
import { createNewTreeItem } from './tree-utils';

export interface MultiLevelBuilderProps {
  onDataChange: (data: MultiLevelPieChartData) => void;
  onSelectionChange: (item: PieChartItem | null) => void;
  selectedItemId?: string | null;
  treeRef?: React.MutableRefObject<TreeApi<PieChartItem> | null>;
}

export const PieTree: React.FC<MultiLevelBuilderProps> = (props) => {
  const { onDataChange, onSelectionChange, selectedItemId, treeRef: externalTreeRef } = props;
  const data = useContext(MultiLevelPieChartDataContext);
  const internalTreeRef = useRef<TreeApi<PieChartItem> | null>(null);
  const treeRef = externalTreeRef ?? internalTreeRef;
  const { ref: treeContainerRef, width, height } = useResizeObserver();

  const onItemCreate = useCallback<CreateHandler<PieChartItem>>(
    (args) => {
      const newItems = [...data.items];
      const {item, level} = createNewTreeItem(data.items, data.levels, args.parentNode?.data ?? null);

      if (args.parentNode) {
        args.parentNode.data.children.push(item);
      } else {
        newItems.push(item);
      }

      const newLevels = [...data.levels];
      if(level){
        newLevels.push(level);
      }
      
      onDataChange({ ...data, items: newItems, levels: newLevels });

      return item;
    },
    [data, onDataChange]
  );

  const onItemDelete = useCallback<DeleteHandler<PieChartItem>>(
    (args) => {
      const newItems = [...data.items];

      args.nodes.forEach((node) => {
        const parentArray = node.data.parent?.children ?? newItems;

        const index = parentArray.indexOf(node.data);
        parentArray.splice(index, 1);
      });
      props.onDataChange({ ...data, items: newItems, levels: data.levels });
    },
    [data]
  );

  const onItemRename = useCallback<RenameHandler<PieChartItem>>(
    (args) => {
      const newItems = [...data.items];
      args.node.data.name = args.name;
      props.onDataChange({ ...data, items: newItems, levels: data.levels });
    },
    [data]
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
    <div ref={treeContainerRef} className="h-full min-h-0">
      {height != null && height > 0 && (
        <Tree
          width={width ?? '100%'}
          height={height}
          rowHeight={36}
          data={data.items}
          selection={selectedItemId ?? undefined}
          onCreate={onItemCreate}
          onDelete={onItemDelete}
          onRename={onItemRename}
          onSelect={onTreeSelectionChanged}
          ref={treeRef}
        >
          {Node}
        </Tree>
      )}
    </div>
  );
};

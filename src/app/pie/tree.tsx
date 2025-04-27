'use client';

import { Plus, Search, Save, Upload } from 'lucide-react';
import { useCallback, useContext, useRef, useState } from 'react';
import {
    CreateHandler, DeleteHandler, NodeApi, RenameHandler, Tree, TreeApi
} from 'react-arborist';

import { Input } from '@/components/ui/input';
import {
  LabelAnchorType,
    LabelDisplayType, MultiLevelPieChartData, PieChartItem, PieChartLevel
} from '@/lib/types/multi-level-pie-types';

import { Button } from '../../components/ui/button';
import Node from './node';
import { MultiLevelPieChartDataContext } from '@/components/contexts/MultiLevelPieChartDataContext';
import { DefaultLevelProperties, DefaultTreeItemProperties } from '@/lib/default-values';

export interface MultiLevelBuilderProps {
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
  const { onDataChange, onSelectionChange } = props;
  const data = useContext(MultiLevelPieChartDataContext);
  const treeRef = useRef<TreeApi<PieChartItem> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onRootItemCreate = useCallback(() => {
    treeRef.current?.create({
      index: null,
      parentId: null,
      type: 'leaf',
    });
  }, [treeRef.current]);

  const onItemCreate = useCallback<CreateHandler<PieChartItem>>(
    (args) => {
      const newItems = [...data.items];
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
        properties: DefaultTreeItemProperties(args.parentNode)
      };

      if (args.parentNode) {
        args.parentNode.data.children.push(newItem);
      } else {
        newItems.push(newItem);
      }

      const newLevels = [...data.levels];
      if (newItem.level > newLevels.length - 1) {
        newLevels.push({
          id: `${newLevels.length + 1}`,
          innerRadius: (newLevels.length + 1) * 100,
          outerRadius: (newLevels.length + 2) * 100,
          properties: DefaultLevelProperties()
        });
      }

      onDataChange({ items: newItems, levels: newLevels });

      return newItem;
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
      props.onDataChange({ items: newItems, levels: data.levels });
    },
    [data]
  );

  const onItemRename = useCallback<RenameHandler<PieChartItem>>(
    (args) => {
      const newItems = [...data.items];
      args.node.data.name = args.name;
      props.onDataChange({ items: newItems, levels: data.levels });
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

  const cleanItem = (item: PieChartItem): Omit<PieChartItem, 'parent'> => {
    const clean = { ...item };
    delete clean.parent;
    if (clean.children) {
      clean.children = clean.children.map(child => cleanItem(child));
    }
    return clean;
  };

  const onSave = useCallback(() => {
    // Create a clean copy of the data without circular references
    const cleanData = {
      items: data.items.map(item => cleanItem(item)),
      levels: data.levels
    };

    const jsonData = JSON.stringify(cleanData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pie-chart-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [data]);

  const reconstructParentRelationships = (items: PieChartItem[], parent: PieChartItem | undefined = undefined): PieChartItem[] => {
    return items.map(item => {
      const newItem = { ...item, parent };
      if (newItem.children) {
        newItem.children = reconstructParentRelationships(newItem.children, newItem);
      }
      return newItem;
    });
  };

  const onLoad = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const loadedData = JSON.parse(e.target?.result as string) as MultiLevelPieChartData;
        
        // Reconstruct parent relationships
        const itemsWithParents = reconstructParentRelationships(loadedData.items);
        
        // Update the state with the loaded data
        onDataChange({
          items: itemsWithParents,
          levels: loadedData.levels
        });
      } catch (error) {
        console.error('Error loading file:', error);
        alert('Error loading file. Please make sure it is a valid chart data file.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input so the same file can be selected again
    event.target.value = '';
  }, [onDataChange]);

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center m-4 ml-0">
        {/* <Input className='flex-1 h-9' placeholder='Search' startIcon={Search}/> */}
        <Button
          onClick={onRootItemCreate}
          variant={'outline'}
          className="h-9 self-end mr-4"
        >
          <Plus className="h-4 w-4" /> Add root item
        </Button>
        <Button
          onClick={onSave}
          variant={'outline'}
          className="h-9 self-end mr-1"
          title="Save chart data"
        >
          <Save className="h-4 w-4" />
        </Button>
        <Button
          onClick={onLoad}
          variant={'outline'}
          className="h-9 self-end mr-1"
          title="Load chart data"
        >
          <Upload className="h-4 w-4" />
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />
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

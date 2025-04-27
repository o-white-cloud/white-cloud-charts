import clsx from 'clsx';
import { ChevronDown, ChevronRight, PieChart, Plus, X } from 'lucide-react';
import React from 'react';
import { NodeRendererProps } from 'react-arborist';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PieChartItem } from '@/lib/types/multi-level-pie-types';

export interface NodeProps extends NodeRendererProps<PieChartItem> {}

const Node = (props: NodeProps) => {
  const { node } = props;
  const thumbClassname = clsx({'invisible': node.isLeaf || !node.data.children.length});
  return (
    <div style={props.style} ref={props.dragHandle} className={clsx(
          'h-9 flex flex-row items-center gap-2 group pl-3 pr-1 border-transparent border-2 hover:border-gray-200',
          { ['bg-gray-200']: node.isSelected }
        )}>
      
        {props.node.isOpen ? (
          <ChevronDown size={16} className={thumbClassname} onClick={() => node.isInternal && node.toggle()}/>
        ) : (
          <ChevronRight size={16} className={thumbClassname} onClick={() => node.isInternal && node.toggle()}/>
        )}

        <PieChart size={16} />

        {node.isEditing ? (
          <Input
            type="text"
            className="text-black h-5 p-2 flex-1"
            defaultValue={node.data.name || 'untitled'}
            onFocus={(e) => e.currentTarget.select()}
            onBlur={() => node.reset()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') node.reset();
              if (e.key === 'Enter') node.submit(e.currentTarget.value);
            }}
            autoFocus
          />
        ) : (
          <span className="flex-1 text-ellipsis overflow-hidden" onDoubleClick={(_) => node.edit()}>{node.data.name}</span>
        )}
        <div className="collapse group-hover:visible">
          <Button
            variant="ghost"
            className="w-6 h-6 p-0 mr-1"
            onClick={() =>
              props.tree.create({ parentId: node.id, type: 'leaf' })
            }
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button variant="ghost" className="w-6 h-6 p-0" onClick={() => props.tree.delete(node)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
    </div>
  );
};

export default Node;

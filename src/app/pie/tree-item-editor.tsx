import React from 'react';

import { Input } from '@/components/ui/input';
import { PieChartItem } from '@/lib/types/multi-level-pie-types';

interface TreeItemEditorProps {
  item: PieChartItem | null;
}

const TreeItemEditor = (props: TreeItemEditorProps) => {
  const { item } = props;
  if (!item) {
    return <div>No item selected</div>;
  }
  
  return <div className='flex flex-col'>
    <Input value={item.name}></Input>
    <Input value={item.innerValue}></Input>
  </div>;
};

export default TreeItemEditor;

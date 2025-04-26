import React from 'react';
import { Label } from "@/components/ui/label"
import { LabelAnchorType, LabelDisplayType, PieChartItem, PieChartLevel, SingleColor } from '@/lib/types/multi-level-pie-types';
import { PropertyEditor } from '@/components/editors/property-editor';
import { EnumEditor } from '@/components/editors/enum-editor';
import { Input } from '@/components/ui/input';
import { ColorEditor, SingleColorEditor } from '@/components/editors/color-editor';
import { NumericEditor } from '@/components/editors/numeric-editor';
import { Divider } from '@/components/editors/divider';

interface TreeItemEditorProps {
  item: PieChartItem | null;
  level: PieChartLevel;
  onItemUpdated: (item: PieChartItem) => void;
}

const TreeItemEditor = (props: TreeItemEditorProps) => {
  const { item, level, onItemUpdated } = props;

  if (!item) {
    return <div>No item selected</div>;
  }

  return (
    <div className='p-4'>
      <Label htmlFor="name">Label</Label>
      <Input value={item.name} id="name" onChange={(e) => onItemUpdated({ ...item, name: e.currentTarget.value })} />

      <Label htmlFor='innerValue'>Value</Label>
      <Input id='innerValue' type="number" value={item.innerValue} onChange={(e) => onItemUpdated({ ...item, innerValue: e.currentTarget.valueAsNumber })} />

      <Divider className='mt-6' />

      <PropertyEditor
        level={level}
        item={item}
        property={item.properties.labelDisplay}
        onItemChange={(item) => onItemUpdated(item)} render={(valueProps) => <EnumEditor {...valueProps} options={Object.keys(LabelDisplayType)} />} />

      <PropertyEditor
        level={level}
        item={item}
        property={item.properties.labelAnchor}
        onItemChange={(item) => onItemUpdated(item)} render={(valueProps) => <EnumEditor {...valueProps} options={Object.keys(LabelAnchorType)} />} />


      <PropertyEditor
        level={level}
        item={item}
        property={item.properties.labelDX}
        onItemChange={(item) => onItemUpdated(item)} render={(valueProps) => <NumericEditor {...valueProps} />} />

      <PropertyEditor
        level={level}
        item={item}
        property={item.properties.labelDY}
        onItemChange={(item) => onItemUpdated(item)} render={(valueProps) => <NumericEditor {...valueProps} />} />

      <Divider />

      <PropertyEditor
        level={level}
        item={item}
        property={item.properties.labelFontSize}
        onItemChange={(item) => onItemUpdated(item)} render={(valueProps) => <NumericEditor {...valueProps} />} />

      <Divider />

      <PropertyEditor
        level={level}
        item={item}
        property={item.properties.color}
        onItemChange={(item) => onItemUpdated(item)} render={(valueProps) => <SingleColorEditor {...valueProps} />} />

      <PropertyEditor
        level={level}
        item={item}
        property={item.properties.strokeWidth}
        onItemChange={(item) => onItemUpdated(item)} render={(valueProps) => <NumericEditor {...valueProps} />} />

      <PropertyEditor
        level={level}
        item={item}
        property={item.properties.strokeColor}
        onItemChange={(item) => onItemUpdated(item)} render={(valueProps) => <SingleColorEditor {...valueProps} />} />

    </div>
  );
};

export default TreeItemEditor;

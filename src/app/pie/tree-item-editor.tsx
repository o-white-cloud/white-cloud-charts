import React, { useState } from 'react';
import { Label } from "@/components/ui/label"
import { LabelAnchorType, LabelDisplayType, PieChartItem, PieChartLevel, SingleColor } from '@/lib/types/multi-level-pie-types';
import { DefaultTreeItemProperties } from '@/lib/default-values';
import { PropertyEditor } from '@/components/editors/property-editor';
import { EnumEditor } from '@/components/editors/enum-editor';
import { Input } from '@/components/ui/input';
import { ColorEditor, SingleColorEditor } from '@/components/editors/color-editor';
import { NumericEditor } from '@/components/editors/numeric-editor';
import { Divider } from '@/components/editors/divider';
import { TextSpans } from '@/components/editors/text-spans';
import { Button } from '@/components/ui/button';
import { SplitLabelLinesDialog } from '@/components/split-label-lines-dialog';
import { FoldVertical, Rows3 } from 'lucide-react';

interface TreeItemEditorProps {
  item: PieChartItem | null;
  level: PieChartLevel;
  onItemUpdated: (item: PieChartItem) => void;
}

const TreeItemEditor = (props: TreeItemEditorProps) => {
  const { item, level, onItemUpdated } = props;
  const [splitDialogOpen, setSplitDialogOpen] = useState(false);

  if (!item) {
    return <div>No item selected</div>;
  }

  return (
    <div className='p-4'>
      <Label htmlFor='innerValue'>Value</Label>
      <Input id='innerValue' type="number" value={item.innerValue} onChange={(e) => onItemUpdated({ ...item, innerValue: e.currentTarget.valueAsNumber })} />

      <Label htmlFor="name" className='mt-6'>Main text</Label>
      <div className="flex gap-2 items-center mt-1">
        <Input
          value={item.name}
          id="name"
          className="flex-1 min-w-0"
          onChange={(e) => onItemUpdated({ ...item, name: e.currentTarget.value })}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          title="Split into lines"
          aria-label="Split main text into lines"
          onClick={() => setSplitDialogOpen(true)}
        >
          <Rows3 className="h-4 w-4" />
        </Button>
        {item.labelSpans.length > 1 && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            title="Merge spans into main text"
            aria-label="Merge all spans into main text and remove spans"
            onClick={() => {
              const mergedName = [item.name, ...item.labelSpans.map((s) => s.text)].join('\n');
              onItemUpdated({ ...item, name: mergedName, labelSpans: [] });
            }}
          >
            <FoldVertical className="h-4 w-4" />
          </Button>
        )}
      </div>

      <PropertyEditor
        level={level}
        item={item}
        property={item.properties.textLineHeight ?? DefaultTreeItemProperties(null).textLineHeight}
        onItemChange={(item) => onItemUpdated(item)}
        render={(valueProps) => <NumericEditor {...valueProps} min={1} />}
      />

      <SplitLabelLinesDialog
        open={splitDialogOpen}
        onOpenChange={setSplitDialogOpen}
        item={item}
        onApply={onItemUpdated}
      />

      <TextSpans item={item} onItemUpdated={onItemUpdated} />

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

      <PropertyEditor
        level={level}
        item={item}
        property={item.properties.startRadiusStrokeWidth}
        onItemChange={(item) => onItemUpdated(item)} render={(valueProps) => <NumericEditor {...valueProps} />} />

      <PropertyEditor
        level={level}
        item={item}
        property={item.properties.startRadiusStrokeColor}
        onItemChange={(item) => onItemUpdated(item)} render={(valueProps) => <SingleColorEditor {...valueProps} />} />

      <PropertyEditor
        level={level}
        item={item}
        property={item.properties.endRadiusStrokeWidth}
        onItemChange={(item) => onItemUpdated(item)} render={(valueProps) => <NumericEditor {...valueProps} />} />

      <PropertyEditor
        level={level}
        item={item}
        property={item.properties.endRadiusStrokeColor}
        onItemChange={(item) => onItemUpdated(item)} render={(valueProps) => <SingleColorEditor {...valueProps} />} />

    </div>
  );
};

export default TreeItemEditor;

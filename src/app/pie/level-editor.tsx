import React from 'react';
import { LabelDisplayType, PieChartItem, Property, PieChartLevel, LabelAnchorType } from '@/lib/types/multi-level-pie-types';
import { PropertyEditor } from '@/components/editors/property-editor';
import { EnumEditor } from '@/components/editors/enum-editor';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ColorEditor, SingleColorEditor } from '@/components/editors/color-editor';
import { NumericEditor } from '@/components/editors/numeric-editor';
import { Divider } from '@/components/editors/divider';
import { Button } from '@/components/ui/button';

interface LevelEditorProps {
  level: PieChartLevel | null;
  items: PieChartItem[];
  onLevelUpdated: (item: PieChartLevel, property?: Property<any>) => void;
  calibrateParentsToThis: (level: PieChartLevel) => void;
}



const LevelEditor = (props: LevelEditorProps) => {
  const { level, onLevelUpdated, items } = props;


  if (!level) {
    return <div>No level selected</div>;
  }

  return (
    <div className='p-4'>
      <Label htmlFor="iradius">Level thickness</Label>
      <div className="flex items-center gap-x-4 !mt-0">
        <Input
          id="iradius"
          placeholder="Inner radius "
          type="number"
          value={level.innerRadius}
          onChange={(e) => onLevelUpdated({ ...level, innerRadius: e.currentTarget.valueAsNumber })}
        />
        <span>-</span>
        <Input
          id="oradius"
          placeholder="Outter radius "
          type="number"
          value={level.outerRadius}
          onChange={(e) => onLevelUpdated({ ...level, outerRadius: e.currentTarget.valueAsNumber })}
        />
      </div>

      <PropertyEditor
        level={level}
        property={level.properties.startAngle}
        onLevelChange={(level) => onLevelUpdated(level, level.properties.startAngle)} render={(valueProps) => <NumericEditor {...valueProps} min={-360} max={360} step={10} />} />

      <PropertyEditor
        level={level}
        property={level.properties.padAngle}
        onLevelChange={(level) => onLevelUpdated(level, level.properties.padAngle)} render={(valueProps) => <NumericEditor {...valueProps} min={0} max={0.2} step={0.01} />} />

      <PropertyEditor
        level={level}
        property={level.properties.cornerRadius}
        onLevelChange={(level) => onLevelUpdated(level, level.properties.padAngle)} render={(valueProps) => <NumericEditor {...valueProps} min={0} max={(level.outerRadius - level.innerRadius) / 2} step={10} />} />

      <Divider />

      <PropertyEditor
        level={level}
        property={level.properties.edgeColor}
        onLevelChange={(level) => onLevelUpdated(level, level.properties.edgeColor)} render={(valueProps) => <SingleColorEditor {...valueProps} />} />

      <PropertyEditor
        level={level}
        property={level.properties.edgeThickness}
        onLevelChange={(level) => onLevelUpdated(level, level.properties.edgeThickness)} render={(valueProps) => <NumericEditor {...valueProps} min={0} max={100} step={1} />} />

      <Divider />

      <PropertyEditor
        level={level}
        property={level.properties.color}
        onLevelChange={(level) => onLevelUpdated(level, level.properties.color)} render={(valueProps) => <ColorEditor {...valueProps} />} />

      <PropertyEditor
        level={level}
        property={level.properties.labelDisplay}
        onLevelChange={(level) => onLevelUpdated(level, level.properties.labelDisplay)} render={(valueProps) => <EnumEditor {...valueProps} options={Object.keys(LabelDisplayType)} />} />

      <PropertyEditor
        level={level}
        property={level.properties.labelAnchor}
        onLevelChange={(level) => onLevelUpdated(level, level.properties.labelAnchor)} render={(valueProps) => <EnumEditor {...valueProps} options={Object.keys(LabelAnchorType)} />} />

      <PropertyEditor
        level={level}
        property={level.properties.labelDX}
        onLevelChange={(level) => onLevelUpdated(level, level.properties.labelDX)} render={(valueProps) => <NumericEditor {...valueProps} />} />

      <PropertyEditor
        level={level}
        property={level.properties.labelDY}
        onLevelChange={(level) => onLevelUpdated(level, level.properties.labelDY)} render={(valueProps) => <NumericEditor {...valueProps} />} />

      <Divider />

      <PropertyEditor
        level={level}
        property={level.properties.labelFontSize}
        onLevelChange={(level) => onLevelUpdated(level, level.properties.labelFontSize)} render={(valueProps) => <NumericEditor {...valueProps} />} />

      <Divider />

      <PropertyEditor
        level={level}
        property={level.properties.strokeWidth}
        onLevelChange={(level) => onLevelUpdated(level, level.properties.strokeWidth)} render={(valueProps) => <NumericEditor {...valueProps} />} />

      <PropertyEditor
        level={level}
        property={level.properties.strokeColor}
        onLevelChange={(level) => onLevelUpdated(level, level.properties.strokeColor)} render={(valueProps) => <SingleColorEditor {...valueProps} />} />
      
      <Divider />

      <Button className='mt-4 mb-1' onClick={() => {
        if (props.level) {
          props.calibrateParentsToThis(props.level);
        }
      }}>Equalize sector values</Button>
      <p className='text-sm text-muted-foreground'>All the sectors on this level will be equal. The parent levels will adjust accordingly. Lower levels will continue to work the same way.</p>
    </div>
  );
};

export default LevelEditor;

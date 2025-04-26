import React from 'react';
import { LabelDisplayType, PieChartItem, Property, PieChartLevel } from '@/lib/types/multi-level-pie-types';
import { PropertyEditor } from '@/components/editors/property-editor';
import { EnumEditor } from '@/components/editors/enum-editor';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ColorEditor, SingleColorEditor } from '@/components/editors/color-editor';
import { NumericEditor } from '@/components/editors/numeric-editor';

interface LevelEditorProps {
  level: PieChartLevel | null;
  items: PieChartItem[];
  onLevelUpdated: (item: PieChartLevel, property?: Property<any>) => void;
}



const LevelEditor = (props: LevelEditorProps) => {
  const { level, onLevelUpdated, items } = props;


  if (!level) {
    return <div>No level selected</div>;
  }

  return (
    <div className='p-4'>
      <Label htmlFor="iradius">Sector radius</Label>
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
        property={level.properties.color}
        onLevelChange={(level) => onLevelUpdated(level, level.properties.color)} render={(valueProps) => <ColorEditor {...valueProps} />} />

      <PropertyEditor
        level={level}
        property={level.properties.labelDisplay}
        onLevelChange={(level) => onLevelUpdated(level, level.properties.labelDisplay)} render={(valueProps) => <EnumEditor {...valueProps} options={Object.keys(LabelDisplayType)} />} />

      <PropertyEditor
        level={level}
        property={level.properties.strokeWidth}
        onLevelChange={(level) => onLevelUpdated(level, level.properties.strokeWidth)} render={(valueProps) => <NumericEditor {...valueProps} />} />

      <PropertyEditor
        level={level}
        property={level.properties.strokeColor}
        onLevelChange={(level) => onLevelUpdated(level, level.properties.strokeColor)} render={(valueProps) => <SingleColorEditor {...valueProps} />} />

    </div>
  );
};

export default LevelEditor;

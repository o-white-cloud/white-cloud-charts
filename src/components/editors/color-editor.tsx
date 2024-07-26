import { Plus, X } from 'lucide-react';
import { useCallback } from 'react';

import {
    Color, ColorType, EnumerationColor, GradientColor, SingleColor
} from '@/lib/types/multi-level-pie-types';

import { Button } from '../ui/button';
import { ColorPicker } from '../ui/color-picker';
import { FormDescription } from '../ui/form';
import {
    Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue
} from '../ui/select';

export interface ColorEditorProps<T extends Color = Color> {
  value: T;
  onChange: (value: T) => void;
}

export const ColorEditor: React.FC<ColorEditorProps> = (props) => {
  return (
    <>
      <Select
        value={props.value.type}
        onValueChange={(selectedType) => props.onChange({ type: selectedType as ColorType } as any)}
      >
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Color type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Type of color </SelectLabel>

            <SelectItem value={'single'}>Single</SelectItem>
            <SelectItem value={'enumeration'}>Enumeration</SelectItem>
            <SelectItem value={'gradient'}>Gradient</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      {props.value.type === 'single' && (
        <SingleColorEditor value={props.value} onChange={props.onChange} />
      )}
      {props.value.type === 'enumeration' && (
        <EnumerationColorEditor value={props.value} onChange={props.onChange} />
      )}
      {props.value.type === 'gradient' && (
        <GradientColorEditor value={props.value} onChange={props.onChange} />
      )}
    </>
  );
};

const SingleColorEditor: React.FC<ColorEditorProps<SingleColor>> = (props) => {
  return (
    <ColorPicker
      value={props.value.value}
      onChange={(value) => props.onChange({ type: 'single', value })}
    />
  );
};

const EnumerationColorEditor: React.FC<ColorEditorProps<EnumerationColor>> = (
  props
) => {
  const onColorAdd = useCallback(() => {
    props.onChange({
      type: 'enumeration',
      values: [...(props.value.values ?? []), '#ffffff'],
    });
  }, [props]);

  const onColorChange = useCallback(
    (newColor: string, index: number) => {
      const newColors = [...props.value.values];
      newColors.splice(index, 1, newColor);
      props.onChange({
        type: 'enumeration',
        values: newColors,
      });
    },
    [props]
  );

  const onColorDelete = useCallback(
    (index: number) => {
      const newColors = [...props.value.values];
      newColors.splice(index, 1);
      props.onChange({
        type: 'enumeration',
        values: newColors,
      });
    },
    [props]
  );

  return (
    <div className="flex flex-wrap items-center gap-4">
      {!props.value.values && (
        <FormDescription>Click the plus button to add colors</FormDescription>
      )}
      {props.value.values?.map((c, i) => (
        <div key={i} className="relative">
          <ColorPicker
            value={c}
            onChange={(newColor) => onColorChange(newColor, i)}
          />
          <Button
            variant="destructive"
            className="w-4 h-4 p-0 absolute -right-2 -top-2 z-10"
            onClick={() => onColorDelete(i)}
          >
            <X className="w-2 h-2" />
          </Button>
        </div>
      ))}
      <Button variant="default" className="w-6 h-6 p-0" onClick={onColorAdd}>
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
};

const GradientColorEditor: React.FC<ColorEditorProps<GradientColor>> = (
  props
) => {
  return (
    <div className="flex gap-2">
      <ColorPicker
        value={props.value.to}
        onChange={(newColor) =>
          props.onChange({
            ...props.value,
            to: newColor,
          })
        }
      />
      <ColorPicker
        value={props.value.from}
        onChange={(newColor) =>
          props.onChange({
            ...props.value,
            from: newColor,
          })
        }
      />
    </div>
  );
};

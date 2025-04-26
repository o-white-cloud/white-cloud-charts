import { Plus, X } from 'lucide-react';
import { useCallback } from 'react';

import {
  Color, ColorType, EnumerationColor, GradientColor, SingleColor
} from '@/lib/types/multi-level-pie-types';

import { Button } from '../ui/button';
import { ColorPicker } from '../ui/color-picker';
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue
} from '../ui/select';
import { ValueEditorProps } from './property-editor';

export interface ColorEditorProps<T extends Color = Color> extends ValueEditorProps<T> {
}

export function ColorEditor(props: ColorEditorProps) {
  return (
    <>
      <Select
        value={props.value?.type}
        onValueChange={(selectedType) => {
          let newColor: Color = {type: 'single', value: '#fff'};
          switch(selectedType) {
            case 'single': newColor = {type: 'single', value: '#fff'}; break;
            case 'enumeration': newColor = {type: 'enumeration', values: ['#fff']}; break;
            case 'gradient': newColor = {type: 'gradient', from: '#fff', to: '#000'}; break;
          }
          props.onChange(newColor);
        }}
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
      {props.value?.type === 'single' && (
        <SingleColorEditor value={props.value} onChange={props.onChange} readonly={props.readonly}/>
      )}
      {props.value?.type === 'enumeration' && (
        <EnumerationColorEditor value={props.value} onChange={props.onChange} readonly={props.readonly}/>
      )}
      {props.value?.type === 'gradient' && (
        <GradientColorEditor value={props.value} onChange={props.onChange} readonly={props.readonly}/>
      )}
    </>
  );
};

export const SingleColorEditor: React.FC<ColorEditorProps<SingleColor>> = (props) => {
  return (
    <ColorPicker disabled={props.readonly}
      value={props.value?.value ?? '#fff'}
      onChange={(value) => props.onChange({ type: 'single', value })}
    />
  );
};

export const EnumerationColorEditor: React.FC<ColorEditorProps<EnumerationColor>> = (
  props
) => {
  const onColorAdd = useCallback(() => {
    props.onChange({
      type: 'enumeration',
      values: [...(props.value?.values ?? []), '#ffffff'],
    });
  }, [props]);

  const onColorChange = useCallback(
    (newColor: string, index: number) => {
      const newColors = [...props.value?.values ?? []];
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
      const newColors = [...props.value?.values ?? []];
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
      {!props.value?.values && (
        <span>Click the plus button to add colors</span>
      )}
      {props.value?.values?.map((c, i) => (
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

export const GradientColorEditor: React.FC<ColorEditorProps<GradientColor>> = (
  props
) => {
  return (
    <div className="flex gap-2">
      <ColorPicker
        value={props.value?.to ?? '#fff'}
        onChange={(newColor) =>
          props.onChange({
            to: newColor,
            from: props.value?.from??"#fff",
            type: 'gradient'
          })
        }
      />
      <ColorPicker
        value={props.value?.from ?? '#fff'}
        onChange={(newColor) =>
          props.onChange({
            from: newColor,
            to: props.value?.from??"#fff",
            type: 'gradient'
          })
        }
      />
    </div>
  );
};

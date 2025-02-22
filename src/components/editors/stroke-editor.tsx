import { Control } from 'react-hook-form';

import { Color } from '@/lib/types/multi-level-pie-types';

import { ColorPicker } from '../ui/color-picker';
import { FormControl, FormField, FormItem, FormLabel } from '../ui/form';
import { Input } from '../ui/input';
import { EditorSection } from './editor-section';

export interface StrokeEditorProps {
  formControl: Control<
    {
      strokeColor: string;
      strokeWidth: number;
    },
    any
  >;
}

export const StrokeEditor: React.FC<StrokeEditorProps> = (props) => {
  return (
    <div className='flex gap-2 items-center'>
      <FormField
        control={props.formControl}
        name="strokeWidth"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Stroke</FormLabel>
            <FormControl>
              <Input
                className='w-20'
                placeholder="Width"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
                type="number"
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={props.formControl}
        name="strokeColor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>&nbsp;</FormLabel>
            <FormControl>
              <ColorPicker {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

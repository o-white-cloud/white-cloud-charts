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
    any,
    {
      strokeColor: string;
      strokeWidth: number;
    }
  >;
}

export const StrokeEditor: React.FC<StrokeEditorProps> = (props) => {
  return (
    <div className='flex items-center'>
      <FormField
        control={props.formControl}
        name="strokeWidth"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Stroke width</FormLabel>
            <FormControl>
              <Input
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
            <FormLabel>Stroke color</FormLabel>
            <FormControl>
              <ColorPicker {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

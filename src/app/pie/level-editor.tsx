import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ColorEditor } from '@/components/editors/color-editor';
import { StrokeEditor } from '@/components/editors/stroke-editor';
import { Button } from '@/components/ui/button';
import {
    Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    getEnumKeys, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { LabelDisplay, PieChartItem, PieChartLevel } from '@/lib/types/multi-level-pie-types';
import { zodResolver } from '@hookform/resolvers/zod';

interface LevelEditorProps {
  level: PieChartLevel | null;
  onLevelUpdated: (item: PieChartLevel) => void;
}

const FormSchema = z.object({
  innerRadius: z.number().min(1, {
    message: 'Level inner radius must be at least 1',
  }),
  outerRadius: z.number().min(1, {
    message: 'Level outter radius must be at least 1',
  }),
  color: z.any(),
  padAngle: z.number().min(0).max(1),
  padRadius: z.number(),
  cornerRadius: z.number(),
  strokeWidth: z.number().min(0),
  strokeColor: z.string(),
});

const LevelEditor = (props: LevelEditorProps) => {
  const { level, onLevelUpdated } = props;
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    values: {
      innerRadius: level?.innerRadius ?? 100,
      outerRadius: level?.outerRadius ?? 200,
      color: level?.color,
      padAngle: level?.padAngle ?? 0,
      padRadius: level?.padRadius ?? 0,
      cornerRadius: level?.cornerRadius ?? 0,
      strokeWidth: level?.strokeWidth ?? 0,
      strokeColor: level?.strokeColor ?? '#ffffff',
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const newItem = { ...level, ...data } as PieChartLevel;
    onLevelUpdated(newItem);
  }

  if (!level) {
    return <div>No level selected</div>;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="p-4 w-full space-y-6"
      >
        <FormLabel>Level thickness</FormLabel>
        <div className="flex items-center gap-x-4 !mt-0">
          <FormField
            control={form.control}
            name="innerRadius"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="sector value"
                    {...field}
                    type="number"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Inner radius of the level</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <span className='mb-8'>-</span>
          <FormField
            control={form.control}
            name="outerRadius"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="sector value"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    type="number"
                  />
                </FormControl>
                <FormDescription>Outer radius of the level</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <ColorEditor
                  value={field.value}
                  onChange={(e) => field.onChange(e)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center">
          <FormField
            control={form.control}
            name="padAngle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pad angle</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Pad angle"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    type="number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="padRadius"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pad radius</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Pad radius"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    type="number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cornerRadius"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Corner radius</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Corner radius"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    type="number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <StrokeEditor formControl={form.control as any} />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default LevelEditor;

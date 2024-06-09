import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
    Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    getEnumKeys, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { ColorSource, LabelDisplay, PieChartItem } from '@/lib/types/multi-level-pie-types';
import { zodResolver } from '@hookform/resolvers/zod';

interface TreeItemEditorProps {
  item: PieChartItem | null;
  onItemUpdated: (item: PieChartItem) => void;
}

const FormSchema = z.object({
  name: z.string().min(1, {
    message: 'Sector name must be at least one character long.',
  }),
  innerValue: z.number().min(1, {
    message: 'Sector value must be at least 1',
  }),
  labelDisplay: z.nativeEnum(LabelDisplay),
  colorSource: z.nativeEnum(ColorSource),
});

const TreeItemEditor = (props: TreeItemEditorProps) => {
  const { item, onItemUpdated } = props;
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    values: {
      name: item?.name ?? '',
      innerValue: item?.innerValue ?? 1,
      labelDisplay: item?.labelDisplay ?? LabelDisplay.Inherit,
      colorSource: item?.colorSource ?? ColorSource.Level
    },
    mode: 'onChange',
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const newItem = { ...item, ...data } as PieChartItem;
    onItemUpdated(newItem);
  }

  if (!item) {
    return <div>No item selected</div>;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="p-4 w-full space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="sector name" {...field} />
              </FormControl>
              <FormDescription>
                Name of the sector as it will be appear on the chart.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="innerValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Input placeholder="sector value" {...field} type="number" onChange={(e) => field.onChange(Number(e.target.value))}/>
              </FormControl>
              <FormDescription>
                Value of the sector in relation to its siblings.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="labelDisplay"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label display</FormLabel>
              <FormControl>
                <Select {...field} onValueChange={field.onChange}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Sector label display type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {/* <SelectLabel>Label display</SelectLabel> */}
                      {getEnumKeys(LabelDisplay).map((key) => (
                        <SelectItem key={key} value={LabelDisplay[key]}>
                          {key}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Pie sector label display mode</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="colorSource"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color source</FormLabel>
              <FormControl>
                <Select {...field} onValueChange={field.onChange}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Color source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {/* <SelectLabel>Label display</SelectLabel> */}
                      {getEnumKeys(ColorSource).map((key) => (
                        <SelectItem key={key} value={ColorSource[key]}>
                          {key}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Source of the color for the sector</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default TreeItemEditor;

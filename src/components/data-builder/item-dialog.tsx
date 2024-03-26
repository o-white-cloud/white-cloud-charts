'use client';
import { PropsWithChildren } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { PieChartItem } from '@/lib/types/multi-level-pie-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Label } from '@radix-ui/react-label';

import { Button } from '../ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '../ui/dialog';
import {
    Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage
} from '../ui/form';
import { Input } from '../ui/input';
import { createTreeItemId } from './tree-id';

const formSchema = z.object({
  name: z.string().min(2).max(50),
  innerValue: z.number().nonnegative(),
});

export interface ItemDialogProps {
  open: boolean;
  treeItem: PieChartItem | undefined;
  onSubmit: (treeItem: PieChartItem, name: string, innerValue: number) => void;
  onCancel: () => void;
}

const ItemDialog: React.FC<PropsWithChildren<ItemDialogProps>> = (
  props
) => {
  const { treeItem, open, onSubmit, onCancel } = props;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: props.treeItem ? `Sector ${createTreeItemId(props.treeItem.id, props.treeItem.children)}` : 'New sector',
      innerValue: 1,
    },
  });

  function onSubmitInternal(values: z.infer<typeof formSchema>) {
    if (treeItem) {
      onSubmit(treeItem, values.name, values.innerValue);
    } else {
      onCancel();
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onCancel();
        }
      }}
    >
      {props.children}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New sector</DialogTitle>
          <DialogDescription>
            Add a new sector by defining its name and value.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitInternal)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Name of the sector as it will appear in the chart
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
                    <Input
                      placeholder="shadcn"
                      {...field}
                      type="number"
                      onChange={(e) =>
                        field.onChange(e.currentTarget.valueAsNumber)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Value of the new sector in its level. The value is relative
                    to the other sectors.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
export default ItemDialog;

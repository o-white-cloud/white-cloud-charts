'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { LabelAnchorType, LabelDisplayType, PieChartItem, Property, SingleColor } from '@/lib/types/multi-level-pie-types';
import { useState } from 'react';

interface BulkItemDialogProps {
  onSubmit: (treeAsString: string) => void;
  trigger: React.ReactNode;
}

export function BulkItemDialog({ onSubmit, trigger }: BulkItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim()) return;

    onSubmit(text);
    setText('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Multiple Items</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Enter one item name per line"
            value={text}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
            rows={5}
          />
          <div className="flex justify-end">
            <Button onClick={handleSubmit}>Create Items</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
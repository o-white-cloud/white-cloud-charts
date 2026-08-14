'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';

export interface ApplySpineStrokesDialogProps {
  onApply: (strokeWidth: number) => void;
  trigger: React.ReactNode;
  defaultStrokeWidth?: number;
}

export function ApplySpineStrokesDialog({
  onApply,
  trigger,
  defaultStrokeWidth = 2,
}: ApplySpineStrokesDialogProps) {
  const [open, setOpen] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(defaultStrokeWidth);

  useEffect(() => {
    if (open) {
      setStrokeWidth(defaultStrokeWidth);
    }
  }, [open, defaultStrokeWidth]);

  const handleApply = () => {
    if (!Number.isFinite(strokeWidth) || strokeWidth < 0) {
      return;
    }

    onApply(strokeWidth);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply spine strokes</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-1">
          <Label htmlFor="spine-stroke-width">Start radius stroke width</Label>
          <p className="text-sm text-muted-foreground">
            For each top-level sector, sets the start radius stroke width on
            that sector and along its first-child chain so descendants read as
            one connected wedge.
          </p>
          <Input
            id="spine-stroke-width"
            type="number"
            min={0}
            step={1}
            value={strokeWidth}
            autoFocus
            onChange={(e) => setStrokeWidth(e.currentTarget.valueAsNumber)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApply();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleApply}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

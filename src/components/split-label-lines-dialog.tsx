'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LabelAnchorType, PieChartItem, PieChartItemLabelTextSpan } from '@/lib/types/multi-level-pie-types';
import { useContext, useEffect, useState } from 'react';
import { MultiLevelPieChartDataContext } from '@/components/contexts/MultiLevelPieChartDataContext';
import { getPropertyValue } from '@/lib/pie-chart-item-value';
import { DefaultTreeItemProperties } from '@/lib/default-values';

export interface SplitLabelLinesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: PieChartItem;
  onApply: (item: PieChartItem) => void;
}

function buildSpansFromLines(
  lines: string[],
  lineHeight: number
): PieChartItemLabelTextSpan[] {
  const spans: PieChartItemLabelTextSpan[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    spans.push({
      text: line,
      x: 0,
      y: i * lineHeight,
      color: '#000000',
      fontSize: 12,
      fontWeight: 'normal',
      fontFamily: 'Arial',
      anchor: LabelAnchorType.start,
    });
  }
  return spans;
}

export function SplitLabelLinesDialog({
  open,
  onOpenChange,
  item,
  onApply,
}: SplitLabelLinesDialogProps) {
  const data = useContext(MultiLevelPieChartDataContext);
  const [text, setText] = useState(item.name);

  useEffect(() => {
    if (open) {
      setText(item.name);
    }
  }, [open, item.name]);

  const handleCreateSpans = () => {
    const lines = text.split('\n');
    const name = lines[0] ?? '';
    const prop =
      item.properties.textLineHeight ?? DefaultTreeItemProperties(null).textLineHeight;
    const resolved =
      data != null ? getPropertyValue(item, prop, data) : prop.value;
    const lineHeight = (resolved ?? 16) as number;
    const labelSpans = buildSpansFromLines(lines, lineHeight);
    onApply({ ...item, name, labelSpans });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Split label into lines</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-1">
          <Label htmlFor="split-label-text">One line becomes main text; other lines become spans (Y = line index × text line height).</Label>
          <Textarea
            id="split-label-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[160px] font-mono text-sm"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleCreateSpans}>
            Create spans
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

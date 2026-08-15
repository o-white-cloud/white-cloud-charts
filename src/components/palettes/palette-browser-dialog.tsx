'use client';

import { Palette } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import { PaletteCard } from '@/components/palettes/palette-card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cloneChartData } from '@/lib/chart-data-clone';
import { getAllPalettes } from '@/lib/palettes';
import { applyPalette } from '@/lib/palettes/palette-engine';
import { ChartPalette } from '@/lib/palettes/types';
import { MultiLevelPieChartData } from '@/lib/types/multi-level-pie-types';

export interface PaletteBrowserDialogProps {
  chartData: MultiLevelPieChartData;
  onChartChange: (data: MultiLevelPieChartData) => void;
  trigger?: React.ReactNode;
}

export function PaletteBrowserDialog({
  chartData,
  onChartChange,
  trigger,
}: PaletteBrowserDialogProps) {
  const [open, setOpen] = useState(false);
  const [previewPaletteId, setPreviewPaletteId] = useState<string | null>(null);
  const snapshotRef = useRef<MultiLevelPieChartData | null>(null);
  const committedRef = useRef(false);
  const palettes = getAllPalettes();

  const openDialog = useCallback(() => {
    snapshotRef.current = cloneChartData(chartData);
    setPreviewPaletteId(chartData.paletteId ?? null);
    committedRef.current = false;
    setOpen(true);
  }, [chartData]);

  const previewPalette = useCallback(
    (palette: ChartPalette) => {
      if (!snapshotRef.current) {
        return;
      }
      setPreviewPaletteId(palette.id);
      onChartChange(
        applyPalette(snapshotRef.current, palette, { setPaletteId: false })
      );
    },
    [onChartChange]
  );

  const commitPalette = useCallback(
    (palette: ChartPalette) => {
      if (!snapshotRef.current) {
        return;
      }
      const nextData = applyPalette(snapshotRef.current, palette);
      committedRef.current = true;
      snapshotRef.current = cloneChartData(nextData);
      setPreviewPaletteId(palette.id);
      onChartChange(nextData);
      setOpen(false);
    },
    [onChartChange]
  );

  const handleCancel = useCallback(() => {
    if (snapshotRef.current && !committedRef.current) {
      onChartChange(snapshotRef.current);
    }
    snapshotRef.current = null;
    setPreviewPaletteId(null);
    setOpen(false);
  }, [onChartChange]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        openDialog();
        return;
      }
      if (!committedRef.current) {
        handleCancel();
        return;
      }
      committedRef.current = false;
      snapshotRef.current = null;
      setPreviewPaletteId(null);
      setOpen(false);
    },
    [handleCancel, openDialog]
  );

  const activePaletteId = previewPaletteId ?? chartData.paletteId ?? null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="h-9">
            <Palette className="mr-2 h-4 w-4" />
            Palettes
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Color palettes</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Click a palette to preview it on the chart. Apply to keep the colors
          and update the saved palette selection.
        </p>
        <ScrollArea className="max-h-[55vh] pr-4">
          <div className="grid gap-3 py-1">
            {palettes.map((palette) => (
              <PaletteCard
                key={palette.id}
                palette={palette}
                selected={palette.id === activePaletteId}
                onSelect={previewPalette}
                onApply={commitPalette}
              />
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

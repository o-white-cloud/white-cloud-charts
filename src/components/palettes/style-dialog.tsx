'use client';

import { Palette } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import { PaletteCard } from '@/components/palettes/palette-card';
import { SectorColorAssigner } from '@/components/palettes/sector-color-assigner';
import { SpineStrokePicker } from '@/components/palettes/spine-stroke-picker';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cloneChartData } from '@/lib/chart-data-clone';
import { getAllPalettes, getPalette } from '@/lib/palettes';
import { applyPalette } from '@/lib/palettes/palette-engine';
import { applySpineStrokes } from '@/lib/spine-strokes';
import {
  MultiLevelPieChartData,
  SpineStrokeSetting,
} from '@/lib/types/multi-level-pie-types';

interface ColorDraft {
  paletteId: string;
  sectorColors: Record<string, number>;
}

/**
 * Apply the drafted colors and spine strokes on top of the snapshot.
 * Untouched tabs leave the chart alone, except that a shaded spine is
 * recomputed when colors change because it is derived from them.
 */
function applyStyle(
  snapshot: MultiLevelPieChartData,
  colorDraft: ColorDraft | null,
  strokeDraft: SpineStrokeSetting | null
): MultiLevelPieChartData {
  let next = snapshot;
  const palette = colorDraft && getPalette(colorDraft.paletteId);
  if (palette) {
    next = applyPalette(next, palette, { sectorColors: colorDraft.sectorColors });
  }

  const spine =
    strokeDraft ??
    (palette && snapshot.spineStroke?.color.type === 'shade'
      ? snapshot.spineStroke
      : null);
  if (spine) {
    next = applySpineStrokes(next, spine);
  }
  return next;
}

export interface StyleDialogProps {
  chartData: MultiLevelPieChartData;
  onChartChange: (data: MultiLevelPieChartData) => void;
  trigger?: React.ReactNode;
}

export function StyleDialog({ chartData, onChartChange, trigger }: StyleDialogProps) {
  const [open, setOpen] = useState(false);
  const [colorDraft, setColorDraft] = useState<ColorDraft | null>(null);
  const [strokeDraft, setStrokeDraft] = useState<SpineStrokeSetting | null>(null);
  const snapshotRef = useRef<MultiLevelPieChartData | null>(null);
  const palettes = getAllPalettes();

  const preview = useCallback(
    (nextColors: ColorDraft | null, nextStroke: SpineStrokeSetting | null) => {
      setColorDraft(nextColors);
      setStrokeDraft(nextStroke);
      if (snapshotRef.current) {
        onChartChange(applyStyle(snapshotRef.current, nextColors, nextStroke));
      }
    },
    [onChartChange]
  );

  const close = useCallback(() => {
    snapshotRef.current = null;
    setColorDraft(null);
    setStrokeDraft(null);
    setOpen(false);
  }, []);

  const handleCancel = useCallback(() => {
    if (snapshotRef.current) {
      onChartChange(snapshotRef.current);
    }
    close();
  }, [close, onChartChange]);

  const handleApply = useCallback(() => {
    if (snapshotRef.current) {
      onChartChange(applyStyle(snapshotRef.current, colorDraft, strokeDraft));
    }
    close();
  }, [close, colorDraft, onChartChange, strokeDraft]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        snapshotRef.current = cloneChartData(chartData);
        setOpen(true);
        return;
      }
      handleCancel();
    },
    [chartData, handleCancel]
  );

  const saved = snapshotRef.current ?? chartData;
  const activePaletteId = colorDraft?.paletteId ?? saved.paletteId ?? null;
  const activeSectorColors =
    colorDraft?.sectorColors ??
    (activePaletteId === saved.paletteId ? saved.paletteSectorColors ?? {} : {});
  const activeStroke = strokeDraft ?? saved.spineStroke ?? null;

  const selectPalette = (paletteId: string) => {
    if (colorDraft?.paletteId === paletteId) {
      return;
    }
    const sectorColors =
      paletteId === saved.paletteId ? saved.paletteSectorColors ?? {} : {};
    preview({ paletteId, sectorColors }, strokeDraft);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="h-9">
            <Palette className="mr-2 h-4 w-4" />
            Style
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chart style</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Changes preview on the chart. Apply keeps them; Cancel restores the
          chart.
        </p>
        <Tabs defaultValue="colors">
          <TabsList>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="spine">Spine strokes</TabsTrigger>
          </TabsList>
          <TabsContent value="colors">
            <ScrollArea className="h-[50vh] pr-4">
              <div className="grid gap-3 py-1">
                {palettes.map((palette) => (
                  <PaletteCard
                    key={palette.id}
                    palette={palette}
                    selected={palette.id === activePaletteId}
                    onSelect={(p) => selectPalette(p.id)}
                  >
                    <SectorColorAssigner
                      palette={palette}
                      items={chartData.items}
                      sectorColors={activeSectorColors}
                      onChange={(sectorColors) =>
                        preview({ paletteId: palette.id, sectorColors }, strokeDraft)
                      }
                    />
                  </PaletteCard>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="spine">
            <ScrollArea className="h-[50vh] pr-4">
              <p className="pb-2 text-sm text-muted-foreground">
                Draws a line along the leading edge of each top-level sector and
                its first-child chain, so each wedge reads as one shape. Reapply
                after adding or reordering children.
              </p>
              <SpineStrokePicker
                value={activeStroke}
                onChange={(setting) => preview(colorDraft, setting)}
              />
            </ScrollArea>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            disabled={!colorDraft && !strokeDraft}
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { Palette } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import { PaletteCard } from '@/components/palettes/palette-card';
import { RingStylePicker } from '@/components/palettes/ring-style-picker';
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
import { applyRingStyle } from '@/lib/ring-styles';
import { applySpineStrokes } from '@/lib/spine-strokes';
import {
  MultiLevelPieChartData,
  RingStyleSetting,
  SpineStrokeSetting,
} from '@/lib/types/multi-level-pie-types';

interface ColorDraft {
  paletteId: string;
  sectorColors: Record<string, number>;
}

/** Changes drafted in each tab; null means the tab was not touched. */
interface StyleDrafts {
  colors: ColorDraft | null;
  spine: SpineStrokeSetting | null;
  rings: RingStyleSetting | null;
}

const NO_DRAFTS: StyleDrafts = { colors: null, spine: null, rings: null };

/**
 * Apply the drafted changes on top of the snapshot.
 * Untouched tabs leave the chart alone, except that a shaded spine is
 * recomputed when colors change because it is derived from them.
 */
function applyStyle(
  snapshot: MultiLevelPieChartData,
  drafts: StyleDrafts
): MultiLevelPieChartData {
  let next = snapshot;
  const palette = drafts.colors && getPalette(drafts.colors.paletteId);
  if (palette) {
    next = applyPalette(next, palette, { sectorColors: drafts.colors!.sectorColors });
  }

  const spine =
    drafts.spine ??
    (palette && snapshot.spineStroke?.color.type === 'shade'
      ? snapshot.spineStroke
      : null);
  if (spine) {
    next = applySpineStrokes(next, spine);
  }

  if (drafts.rings) {
    next = applyRingStyle(next, drafts.rings);
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
  const [drafts, setDrafts] = useState<StyleDrafts>(NO_DRAFTS);
  const snapshotRef = useRef<MultiLevelPieChartData | null>(null);
  const palettes = getAllPalettes();

  const preview = useCallback(
    (change: Partial<StyleDrafts>) => {
      const nextDrafts = { ...drafts, ...change };
      setDrafts(nextDrafts);
      if (snapshotRef.current) {
        onChartChange(applyStyle(snapshotRef.current, nextDrafts));
      }
    },
    [drafts, onChartChange]
  );

  const close = useCallback(() => {
    snapshotRef.current = null;
    setDrafts(NO_DRAFTS);
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
      onChartChange(applyStyle(snapshotRef.current, drafts));
    }
    close();
  }, [close, drafts, onChartChange]);

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
  const activePaletteId = drafts.colors?.paletteId ?? saved.paletteId ?? null;
  const activeSectorColors =
    drafts.colors?.sectorColors ??
    (activePaletteId === saved.paletteId ? saved.paletteSectorColors ?? {} : {});
  const activeStroke = drafts.spine ?? saved.spineStroke ?? null;
  const activeRings = drafts.rings ?? saved.ringStyle ?? null;

  const selectPalette = (paletteId: string) => {
    if (drafts.colors?.paletteId === paletteId) {
      return;
    }
    const sectorColors =
      paletteId === saved.paletteId ? saved.paletteSectorColors ?? {} : {};
    preview({ colors: { paletteId, sectorColors } });
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
            <TabsTrigger value="rings">Rings</TabsTrigger>
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
                        preview({ colors: { paletteId: palette.id, sectorColors } })
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
                onChange={(setting) => preview({ spine: setting })}
              />
            </ScrollArea>
          </TabsContent>
          <TabsContent value="rings">
            <ScrollArea className="h-[50vh] pr-4">
              <p className="pb-2 text-sm text-muted-foreground">
                Draws a ring between levels using each level&apos;s outer edge.
                The outermost level&apos;s edge is left unchanged.
              </p>
              <RingStylePicker
                value={activeRings}
                onChange={(setting) => preview({ rings: setting })}
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
            disabled={!drafts.colors && !drafts.spine && !drafts.rings}
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

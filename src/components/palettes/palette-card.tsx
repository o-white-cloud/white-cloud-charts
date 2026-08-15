'use client';

import { Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ChartPalette } from '@/lib/palettes/types';
import { cn } from '@/lib/utils';

import { PaletteBranchPreview, PaletteSwatches } from './palette-preview';

export interface PaletteCardProps {
  palette: ChartPalette;
  selected: boolean;
  onSelect: (palette: ChartPalette) => void;
  onApply: (palette: ChartPalette) => void;
}

export function PaletteCard({
  palette,
  selected,
  onSelect,
  onApply,
}: PaletteCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border p-4 transition-colors',
        selected
          ? 'border-primary bg-primary/5 ring-1 ring-primary'
          : 'border-border bg-background hover:border-primary/40'
      )}
    >
      <button
        type="button"
        className="flex w-full items-start gap-3 text-left"
        onClick={() => onSelect(palette)}
      >
        <PaletteBranchPreview palette={palette} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{palette.name}</h3>
            {selected && (
              <span className="inline-flex items-center gap-1 text-xs text-primary">
                <Check className="h-3.5 w-3.5" aria-hidden />
                Selected
              </span>
            )}
          </div>
          {palette.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {palette.description}
            </p>
          )}
          <PaletteSwatches palette={palette} className="mt-3 flex flex-wrap gap-1" />
        </div>
      </button>
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          variant={selected ? 'default' : 'outline'}
          onClick={() => onApply(palette)}
        >
          {selected ? 'Reapply' : 'Apply'}
        </Button>
      </div>
    </div>
  );
}

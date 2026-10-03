'use client';

import { Check } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { resolveSectorColorIndices } from '@/lib/palettes/palette-engine';
import { ChartPalette } from '@/lib/palettes/types';
import { PieChartItem } from '@/lib/types/multi-level-pie-types';
import { cn } from '@/lib/utils';

export interface SectorColorAssignerProps {
  palette: ChartPalette;
  items: PieChartItem[];
  sectorColors: Record<string, number>;
  onChange: (sectorColors: Record<string, number>) => void;
}

/** Lets the user pick which palette color each top-level sector uses. */
export function SectorColorAssigner({
  palette,
  items,
  sectorColors,
  onChange,
}: SectorColorAssignerProps) {
  const resolved = resolveSectorColorIndices(items, palette, sectorColors);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="border-t pt-3">
      <h4 className="mb-2 text-sm font-medium">Sector colors</h4>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {items.map((item) => {
          const colorIndex = resolved[item.id];
          const color = palette.colors[colorIndex] ?? '#FFFFFF';
          return (
            <Popover key={item.id}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex min-w-0 items-center gap-2 rounded-md border px-2 py-1.5 text-left text-sm hover:bg-accent"
                  title={`Change color for ${item.name}`}
                >
                  <span
                    className="h-5 w-5 shrink-0 rounded-sm border border-black/10"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate">{item.name || 'Untitled'}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto max-w-xs p-2" align="start">
                <div className="flex flex-wrap gap-1">
                  {palette.colors.map((paletteColor, index) => (
                    <button
                      key={`${paletteColor}-${index}`}
                      type="button"
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-sm border border-black/10',
                        index === colorIndex && 'ring-2 ring-primary ring-offset-1'
                      )}
                      style={{ backgroundColor: paletteColor }}
                      title={paletteColor}
                      onClick={() => onChange({ ...resolved, [item.id]: index })}
                    >
                      {index === colorIndex && (
                        <Check className="h-4 w-4 mix-blend-difference text-white" aria-hidden />
                      )}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    </div>
  );
}

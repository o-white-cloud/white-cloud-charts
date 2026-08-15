'use client';

import { getBranchPreviewColors } from '@/lib/palettes/palette-engine';
import { ChartPalette } from '@/lib/palettes/types';

export interface PaletteSwatchesProps {
  palette: ChartPalette;
  className?: string;
}

export function PaletteSwatches({ palette, className }: PaletteSwatchesProps) {
  return (
    <div className={className ?? 'flex flex-wrap gap-1'}>
      {palette.colors.map((color) => (
        <span
          key={color}
          className="h-5 w-5 rounded-sm border border-black/10"
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
    </div>
  );
}

export interface PaletteBranchPreviewProps {
  palette: ChartPalette;
  ancestorColor?: string;
  depthCount?: number;
  size?: number;
}

/** Mini concentric-ring preview using the same descendant-color engine as the chart. */
export function PaletteBranchPreview({
  palette,
  ancestorColor,
  depthCount = 4,
  size = 56,
}: PaletteBranchPreviewProps) {
  const baseColor = ancestorColor ?? palette.colors[0] ?? '#CCCCCC';
  const branchColors = getBranchPreviewColors(baseColor, palette, depthCount);
  const center = size / 2;
  const ringWidth = size / (2 * depthCount);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
      aria-hidden
    >
      {branchColors.map((color, index) => {
        const radius = ringWidth * (index + 1);
        return (
          <circle
            key={`${color}-${index}`}
            cx={center}
            cy={center}
            r={radius}
            fill={color}
            stroke={palette.previewBackground ?? '#FFFFFF'}
            strokeWidth={0.5}
          />
        );
      })}
    </svg>
  );
}

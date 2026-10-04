'use client';

import { Check } from 'lucide-react';

import { ringStylePresets } from '@/lib/ring-styles';
import { RingStyleSetting } from '@/lib/types/multi-level-pie-types';
import { cn } from '@/lib/utils';

const PREVIEW_RING_COLORS = ['#8EAFE7', '#B7CCEF', '#DCE6F7'];
const PREVIEW_RING_WIDTH = 7;

/** Three concentric rings with the setting's edge drawn between them. */
function RingPreview({ setting }: { setting: RingStyleSetting }) {
  const center = 24;
  return (
    <svg width={48} height={48} viewBox="0 0 48 48" className="shrink-0" aria-hidden>
      {PREVIEW_RING_COLORS.map((color, index) => {
        const radius = PREVIEW_RING_WIDTH * (PREVIEW_RING_COLORS.length - index);
        return <circle key={color} cx={center} cy={center} r={radius} fill={color} />;
      })}
      {setting.width > 0 &&
        PREVIEW_RING_COLORS.slice(1).map((color, index) => (
          <circle
            key={`edge-${color}`}
            cx={center}
            cy={center}
            r={PREVIEW_RING_WIDTH * (index + 1) - setting.width / 4}
            fill="none"
            stroke={setting.color}
            strokeWidth={setting.width / 2}
          />
        ))}
    </svg>
  );
}

export interface RingStylePickerProps {
  value: RingStyleSetting | null;
  onChange: (setting: RingStyleSetting) => void;
}

export function RingStylePicker({ value, onChange }: RingStylePickerProps) {
  return (
    <div className="grid gap-2 py-1">
      {ringStylePresets.map(({ name, description, ...setting }) => {
        const selected = value?.presetId === setting.presetId;
        return (
          <button
            key={setting.presetId}
            type="button"
            className={cn(
              'flex items-center gap-3 rounded-lg border p-3 text-left transition-colors',
              selected
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border bg-background hover:border-primary/40'
            )}
            onClick={() => onChange(setting)}
          >
            <RingPreview setting={setting} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{name}</span>
                {selected && <Check className="h-3.5 w-3.5 text-primary" aria-hidden />}
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

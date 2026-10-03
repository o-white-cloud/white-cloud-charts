'use client';

import { Check } from 'lucide-react';

import { ColorPicker } from '@/components/ui/color-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CUSTOM_SPINE_STROKE_ID,
  spineStrokePresets,
} from '@/lib/spine-strokes';
import { SpineStrokeSetting } from '@/lib/types/multi-level-pie-types';
import { cn } from '@/lib/utils';

const PREVIEW_SECTOR_COLOR = '#8EAFE7';
const PREVIEW_SHADE_COLOR = '#5C7196';

/** Two wedges meeting at a spine, drawn with the given stroke setting. */
function SpinePreview({ setting }: { setting: SpineStrokeSetting }) {
  const stroke =
    setting.color.type === 'fixed' ? setting.color.value : PREVIEW_SHADE_COLOR;
  return (
    <svg width={56} height={40} viewBox="0 0 56 40" className="shrink-0" aria-hidden>
      <path d="M4 38 L28 2 L28 38 Z" fill={PREVIEW_SECTOR_COLOR} opacity={0.7} />
      <path d="M28 2 L52 38 L28 38 Z" fill={PREVIEW_SECTOR_COLOR} />
      {setting.width > 0 && (
        <line x1={28} y1={2} x2={28} y2={38} stroke={stroke} strokeWidth={setting.width} />
      )}
    </svg>
  );
}

export interface SpineStrokePickerProps {
  value: SpineStrokeSetting | null;
  onChange: (setting: SpineStrokeSetting) => void;
}

export function SpineStrokePicker({ value, onChange }: SpineStrokePickerProps) {
  const customSetting: SpineStrokeSetting =
    value?.presetId === CUSTOM_SPINE_STROKE_ID
      ? value
      : {
          presetId: CUSTOM_SPINE_STROKE_ID,
          width: value?.width || 2,
          color:
            value?.color.type === 'fixed'
              ? value.color
              : { type: 'fixed', value: '#3F3F3F' },
        };
  const customSelected = value?.presetId === CUSTOM_SPINE_STROKE_ID;

  return (
    <div className="grid gap-2 py-1">
      {[...spineStrokePresets, customSetting].map((setting) => {
        const selected = value?.presetId === setting.presetId;
        const preset = spineStrokePresets.find((p) => p.presetId === setting.presetId);
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
            <SpinePreview setting={setting} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{preset?.name ?? 'Custom'}</span>
                {selected && <Check className="h-3.5 w-3.5 text-primary" aria-hidden />}
              </div>
              <p className="text-sm text-muted-foreground">
                {preset?.description ?? 'Choose your own width and color.'}
              </p>
            </div>
          </button>
        );
      })}
      {customSelected && (
        <div className="flex items-end gap-3 rounded-lg border p-3">
          <div className="grid gap-1.5">
            <Label htmlFor="spine-stroke-width">Width</Label>
            <Input
              id="spine-stroke-width"
              type="number"
              min={0}
              step={1}
              className="w-24"
              value={customSetting.width}
              onChange={(e) => {
                const width = e.currentTarget.valueAsNumber;
                if (Number.isFinite(width) && width >= 0) {
                  onChange({ ...customSetting, width });
                }
              }}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Color</Label>
            <ColorPicker
              value={customSetting.color.type === 'fixed' ? customSetting.color.value : '#3F3F3F'}
              onChange={(color) =>
                onChange({ ...customSetting, color: { type: 'fixed', value: color } })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

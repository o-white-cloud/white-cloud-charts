import { debounce } from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Input } from '../ui/input';
import { ValueEditorProps } from './property-editor';

const DEFAULT_WHEEL_DEBOUNCE_MS = 150;

export type WheelModifier = 'ctrl' | 'alt' | 'meta' | 'shift' | 'any';

export interface NumericEditorOptions {
  min?: number;
  max?: number;
  step?: number;
  /** Enable modifier + scroll to adjust. Default: false */
  wheelAdjust?: boolean;
  /** Debounce delay for onChange while scrolling. Default: 150 */
  wheelDebounceMs?: number;
  /**
   * Required modifier key. Default: 'alt' (Ctrl+wheel is reserved by the browser for zoom).
   */
  wheelModifier?: WheelModifier;
}

function clampValue(
  value: number,
  min?: number,
  max?: number,
  step?: number
): number {
  let v = value;
  if (min !== undefined) {
    v = Math.max(min, v);
  }
  if (max !== undefined) {
    v = Math.min(max, v);
  }
  const s = step ?? 1;
  const precision = s.toString().includes('.')
    ? (s.toString().split('.')[1]?.length ?? 0)
    : 0;
  return Number(v.toFixed(precision));
}

function hasWheelModifier(e: WheelEvent, modifier: WheelModifier): boolean {
  switch (modifier) {
    case 'ctrl':
      return e.ctrlKey;
    case 'alt':
      return e.altKey;
    case 'meta':
      return e.metaKey;
    case 'shift':
      return e.shiftKey;
    case 'any':
      return e.ctrlKey || e.altKey || e.metaKey || e.shiftKey;
  }
}

function wheelAdjustTitle(modifier: WheelModifier): string {
  switch (modifier) {
    case 'ctrl':
      return 'Ctrl + scroll to adjust';
    case 'alt':
      return 'Alt + scroll to adjust';
    case 'meta':
      return 'Cmd + scroll to adjust';
    case 'shift':
      return 'Shift + scroll to adjust';
    case 'any':
      return 'Alt/Shift + scroll to adjust';
  }
}

export const NumericEditor = <T,>(
  props: ValueEditorProps<number> & NumericEditorOptions
) => {
  const {
    min,
    max,
    step = 1,
    readonly,
    onChange,
    value,
    wheelAdjust = false,
    wheelDebounceMs = DEFAULT_WHEEL_DEBOUNCE_MS,
    wheelModifier = 'alt',
  } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const optionsRef = useRef({ min, max, step, wheelModifier });
  optionsRef.current = { min, max, step, wheelModifier };

  const [displayValue, setDisplayValue] = useState<number | undefined>(
    value ?? undefined
  );

  useEffect(() => {
    setDisplayValue(value ?? undefined);
  }, [value]);

  const debouncedOnChange = useMemo(
    () =>
      debounce((newValue: number) => {
        onChangeRef.current(newValue);
      }, wheelDebounceMs),
    [wheelDebounceMs]
  );

  useEffect(() => () => debouncedOnChange.cancel(), [debouncedOnChange]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !wheelAdjust) {
      return;
    }

    const handleWheel = (e: WheelEvent) => {
      const { min, max, step, wheelModifier } = optionsRef.current;
      if (!hasWheelModifier(e, wheelModifier)) {
        return;
      }

      e.preventDefault();
      e.stopImmediatePropagation();

      const direction = e.deltaY < 0 ? 1 : e.deltaY > 0 ? -1 : 0;
      if (direction === 0) {
        return;
      }

      const delta = direction * step;
      setDisplayValue((prev) => {
        const current = prev ?? min ?? 0;
        const next = clampValue(current + delta, min, max, step);
        debouncedOnChange(next);
        return next;
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    return () =>
      el.removeEventListener('wheel', handleWheel, { capture: true });
  }, [wheelAdjust, debouncedOnChange]);

  return (
    <div ref={containerRef} className="w-full">
      <Input
        type="number"
        readOnly={readonly}
        value={displayValue ?? ''}
        min={min}
        step={step}
        max={max}
        title={wheelAdjust ? wheelAdjustTitle(wheelModifier) : undefined}
        onBlur={() => wheelAdjust && debouncedOnChange.flush()}
        onChange={(e) => {
          debouncedOnChange.cancel();
          const next = e.currentTarget.valueAsNumber;
          if (!Number.isNaN(next)) {
            setDisplayValue(next);
            onChange(next);
          }
        }}
      />
    </div>
  );
};

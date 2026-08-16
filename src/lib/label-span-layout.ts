import { PieChartItemLabelTextSpan } from './types/multi-level-pie-types';

/** Stack label spans below the main text using resolved text line height. */
export function layoutLabelSpans(
  spans: PieChartItemLabelTextSpan[] | undefined,
  lineHeight: number
): PieChartItemLabelTextSpan[] {
  return (spans ?? []).map((span, index) => ({
    ...span,
    // Without x, SVG continues each tspan from the previous line's end position.
    x: span.x ?? 0,
    y: (index + 1) * lineHeight,
  }));
}

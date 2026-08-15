import { contrastRatio, getForegroundColor, mixColors } from '@/lib/palettes/color-utils';
import { jewelPalette, softPastelPalette } from '@/lib/palettes/built-in-palettes';
import {
  applyPalette,
  generateDescendantColor,
  getDescendantMixAmount,
  getPaletteColor,
} from '@/lib/palettes/palette-engine';
import { DefaultTreeItemProperties } from '@/lib/default-values';
import {
  MultiLevelPieChartData,
  PieChartItem,
} from '@/lib/types/multi-level-pie-types';

function makeChart(items: PieChartItem[]): MultiLevelPieChartData {
  return {
    levels: [],
    items,
  };
}

function makeItem(
  id: string,
  children: PieChartItem[] = [],
  labelSpans: { text: string; color: string; fontWeight: string; anchor: 'middle' }[] = []
): PieChartItem {
  return {
    id,
    name: id,
    level: 0,
    innerValue: 1,
    absoluteValue: 1,
    labelSpans,
    children,
    properties: DefaultTreeItemProperties(null),
  };
}

describe('palette color utils', () => {
  it('mixes colors toward a target', () => {
    expect(mixColors('#000000', '#FFFFFF', 0.5)).toBe('#808080');
  });

  it('chooses higher-contrast foreground', () => {
    expect(getForegroundColor('#D94B5B', '#FFFFFF', '#202020')).toBe('#FFFFFF');
    expect(getForegroundColor('#F9C6C6', '#FFFFFF', '#202020')).toBe('#202020');
  });

  it('calculates WCAG contrast ratio', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 0);
  });
});

describe('palette engine', () => {
  it('assigns top-level colors by items order', () => {
    const chart = makeChart([
      makeItem('1'),
      makeItem('2'),
      makeItem('3'),
      makeItem('4'),
    ]);

    const result = applyPalette(chart, softPastelPalette);
    expect(result.items[0].properties.color.value?.value).toBe('#E99A9A');
    expect(result.items[1].properties.color.value?.value).toBe('#91D2B8');
    expect(result.items[2].properties.color.value?.value).toBe('#8EAFE7');
    expect(result.items[3].properties.color.value?.value).toBe('#C5A4DF');
  });

  it('cycles palette colors when there are more sectors than colors', () => {
    const chart = makeChart(
      Array.from({ length: 9 }, (_, index) => makeItem(`${index + 1}`))
    );
    const ninth = applyPalette(chart, softPastelPalette).items[8];
    expect(ninth.properties.color.value?.value).toBe(
      getPaletteColor(softPastelPalette, 8)
    );
    expect(ninth.properties.color.value?.value).toBe('#E99A9A');
  });

  it('generates descendants from the ancestor color, not the parent shade', () => {
    const ancestor = '#E99A9A';
    const depth1 = generateDescendantColor(ancestor, 1, softPastelPalette);
    const depth2 = generateDescendantColor(ancestor, 2, softPastelPalette);

    expect(depth1).not.toBe(ancestor);
    expect(depth2).not.toBe(depth1);
    expect(depth2).toBe(
      mixColors(ancestor, softPastelPalette.descendantStrategy.target, 0.52)
    );
  });

  it('uses the same shade for siblings at the same depth', () => {
    const childA = makeItem('1.1');
    const childB = makeItem('1.2');
    const chart = makeChart([makeItem('1', [childA, childB])]);
    const result = applyPalette(chart, softPastelPalette);
    const coloredA = result.items[0].children[0];
    const coloredB = result.items[0].children[1];

    expect(coloredA.properties.color.value?.value).toBe(
      coloredB.properties.color.value?.value
    );
  });

  it('extrapolates mix amounts for deep hierarchies below the max target', () => {
    const deepAmount = getDescendantMixAmount(10, softPastelPalette);
    expect(deepAmount).toBeGreaterThan(0.82);
    expect(deepAmount).toBeLessThanOrEqual(0.89);
  });

  it('sets color source to override and updates label span colors', () => {
    const chart = makeChart([
      makeItem('1', [], [
        { text: 'Label', color: '#000000', fontWeight: '400', anchor: 'middle' },
      ]),
    ]);

    const result = applyPalette(chart, softPastelPalette);
    expect(result.items[0].properties.color.source).toBe('override');
    expect(result.items[0].labelSpans[0].color).not.toBe('#000000');
    expect(result.items[0].properties.labelColor.value?.value).toBe(
      result.items[0].labelSpans[0].color
    );
  });

  it('updates primary label color when there are no spans', () => {
    const chart = makeChart([makeItem('1')]);
    const result = applyPalette(chart, jewelPalette);

    expect(result.items[0].properties.labelColor.source).toBe('override');
    expect(result.items[0].properties.labelColor.value?.value).toBe('#FFFFFF');
  });

  it('persists paletteId when applying', () => {
    const chart = makeChart([makeItem('1')]);
    const result = applyPalette(chart, softPastelPalette);
    expect(result.paletteId).toBe('soft-pastel');
  });

  it('does not change unrelated properties', () => {
    const item = makeItem('1');
    item.innerValue = 42;
    item.properties.labelDX.value = 7;
    const chart = makeChart([item]);

    const result = applyPalette(chart, softPastelPalette);
    expect(result.items[0].innerValue).toBe(42);
    expect(result.items[0].properties.labelDX.value).toBe(7);
  });

  it('handles empty charts without error', () => {
    const result = applyPalette(makeChart([]), softPastelPalette);
    expect(result.items).toEqual([]);
    expect(result.paletteId).toBe('soft-pastel');
  });
});

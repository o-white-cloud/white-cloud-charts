import { DefaultLevelProperties, DefaultTreeItemProperties } from '@/lib/default-values';
import {
  CHART_DATA_SCHEMA_VERSION,
  DEFAULT_CHART_FONT_FAMILY,
  formatFontFamilyStack,
} from '@/lib/chart-typography';
import { migrateChartData, serializeChartData } from '@/lib/chart-data-migration';
import { getPropertyValue } from '@/lib/pie-chart-item-value';
import { resetSpanFontFamiliesOnLevel } from '@/lib/pie-data';
import { collectChartFontFamilies } from '@/lib/svg-font-export';
import {
  LabelAnchorType,
  MultiLevelPieChartData,
  PieChartItem,
  PieChartLevel,
} from '@/lib/types/multi-level-pie-types';

function makeItem(
  id: string,
  level: number,
  labelSpans: PieChartItem['labelSpans'] = [],
  children: PieChartItem[] = []
): PieChartItem {
  return {
    id,
    name: id,
    labelSpans,
    innerValue: 1,
    absoluteValue: 1,
    level,
    children,
    properties: DefaultTreeItemProperties(null),
  };
}

function makeLevel(id: string, innerRadius: number, outerRadius: number): PieChartLevel {
  return {
    id,
    innerRadius,
    outerRadius,
    properties: DefaultLevelProperties(),
  };
}

describe('chart typography defaults', () => {
  it('uses Onest as the default level font family', () => {
    const level = makeLevel('l0', 0, 100);
    expect(level.properties.labelFontFamily.value).toBe(DEFAULT_CHART_FONT_FAMILY);
  });

  it('falls back to Onest when labelFontFamily is unresolved', () => {
    const level = makeLevel('l0', 0, 100);
    const item = makeItem('sector', 0);
    const data: MultiLevelPieChartData = {
      levels: [level],
      items: [item],
    };

    expect(
      getPropertyValue(item, item.properties.labelFontFamily, data)
    ).toBe(DEFAULT_CHART_FONT_FAMILY);
  });

  it('formats font stacks with a sans-serif fallback', () => {
    expect(formatFontFamilyStack('Onest')).toBe('Onest, sans-serif');
  });
});

describe('migrateChartData', () => {
  it('adds labelFontFamily and strips legacy Arial span defaults', () => {
    const legacyLevel = makeLevel('l0', 0, 100);
    delete (legacyLevel.properties as { labelFontFamily?: unknown }).labelFontFamily;

    const item = makeItem('sector', 0, [
      {
        text: 'line two',
        color: '#000',
        fontWeight: 'normal',
        fontFamily: 'Arial',
        anchor: LabelAnchorType.start,
      },
      {
        text: 'custom',
        color: '#000',
        fontWeight: 'normal',
        fontFamily: 'Georgia',
        anchor: LabelAnchorType.start,
      },
    ]);

    const migrated = migrateChartData({
      levels: [legacyLevel],
      items: [item],
    });

    expect(migrated.schemaVersion).toBe(CHART_DATA_SCHEMA_VERSION);
    expect(migrated.levels[0].properties.labelFontFamily.value).toBe(DEFAULT_CHART_FONT_FAMILY);
    expect(migrated.items[0].properties.labelFontFamily.value).toBe(DEFAULT_CHART_FONT_FAMILY);
    expect(migrated.items[0].labelSpans[0].fontFamily).toBeUndefined();
    expect(migrated.items[0].labelSpans[1].fontFamily).toBe('Georgia');
  });

  it('skips migration when schema version is current', () => {
    const level = makeLevel('l0', 0, 100);
    const item = makeItem('sector', 0, [
      {
        text: 'keep me',
        color: '#000',
        fontWeight: 'normal',
        fontFamily: 'Arial',
        anchor: LabelAnchorType.start,
      },
    ]);

    const current = {
      schemaVersion: CHART_DATA_SCHEMA_VERSION,
      levels: [level],
      items: [item],
    };

    const migrated = migrateChartData(current);
    expect(migrated.items[0].labelSpans[0].fontFamily).toBe('Arial');
  });
});

describe('serializeChartData', () => {
  it('writes the current schema version', () => {
    const data: MultiLevelPieChartData = {
      levels: [makeLevel('l0', 0, 100)],
      items: [makeItem('sector', 0)],
    };

    expect(serializeChartData(data).schemaVersion).toBe(CHART_DATA_SCHEMA_VERSION);
  });
});

describe('collectChartFontFamilies', () => {
  it('collects sector and span override families', () => {
    const level = makeLevel('l0', 0, 100);
    const item = makeItem('sector', 0, [
      {
        text: 'override',
        color: '#000',
        fontWeight: 'normal',
        fontFamily: 'Georgia',
        anchor: LabelAnchorType.start,
      },
    ]);

    item.properties.labelFontFamily = {
      ...item.properties.labelFontFamily,
      source: 'override',
      value: 'Roboto',
    };

    const data: MultiLevelPieChartData = {
      levels: [level],
      items: [item],
    };

    expect(collectChartFontFamilies(data).sort()).toEqual(['Georgia', 'Roboto'].sort());
  });
});

describe('resetSpanFontFamiliesOnLevel', () => {
  it('clears font-family overrides only on the selected level', () => {
    const level0 = makeLevel('l0', 0, 100);
    const level1 = makeLevel('l1', 100, 200);

    const childOnLevel1 = makeItem('child', 1, [
      {
        text: 'child span',
        color: '#000',
        fontWeight: 'normal',
        fontFamily: 'Georgia',
        anchor: LabelAnchorType.start,
      },
    ]);

    const rootOnLevel0 = makeItem('root', 0, [
      {
        text: 'root span',
        color: '#000',
        fontWeight: 'normal',
        fontFamily: 'Georgia',
        anchor: LabelAnchorType.start,
      },
    ], [childOnLevel1]);

    const data: MultiLevelPieChartData = {
      levels: [level0, level1],
      items: [rootOnLevel0],
    };

    const result = resetSpanFontFamiliesOnLevel(data, level0);

    expect(result.items[0].labelSpans[0].fontFamily).toBeUndefined();
    expect(result.items[0].children[0].labelSpans[0].fontFamily).toBe('Georgia');
  });
});

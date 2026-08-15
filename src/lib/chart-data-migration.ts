import { DefaultLevelProperties, DefaultTreeItemProperties } from '@/lib/default-values';
import {
  CHART_DATA_SCHEMA_VERSION,
  DEFAULT_CHART_FONT_FAMILY,
  isLegacyGeneratedSpanFont,
} from '@/lib/chart-typography';
import {
  MultiLevelPieChartData,
  PieChartItem,
  PieChartItemProperties,
  PieChartLevel,
  PieChartLevelProperties,
} from '@/lib/types/multi-level-pie-types';

function ensureItemProperties(properties: PieChartItemProperties): PieChartItemProperties {
  const defaults = DefaultTreeItemProperties(null);
  const labelFontFamily = properties.labelFontFamily ?? defaults.labelFontFamily;
  const labelColor = properties.labelColor ?? defaults.labelColor;

  return {
    ...properties,
    labelFontFamily: {
      ...labelFontFamily,
      value: labelFontFamily.value ?? DEFAULT_CHART_FONT_FAMILY,
    },
    labelColor: {
      ...labelColor,
      value: labelColor.value ?? defaults.labelColor.value,
    },
  };
}

function ensureLevelProperties(level: PieChartLevel): PieChartLevel {
  const defaults = DefaultLevelProperties();
  const labelFontFamily =
    level.properties.labelFontFamily ?? defaults.labelFontFamily;

  return {
    ...level,
    properties: {
      ...level.properties,
      labelFontFamily: {
        ...labelFontFamily,
        value: labelFontFamily.value ?? DEFAULT_CHART_FONT_FAMILY,
      },
    } as PieChartLevelProperties,
  };
}

function normalizeSpanFonts(item: PieChartItem): PieChartItem {
  const labelSpans = item.labelSpans.map((span) => {
    if (!isLegacyGeneratedSpanFont(span.fontFamily)) {
      return span;
    }
    const next = { ...span };
    delete next.fontFamily;
    return next;
  });

  return {
    ...item,
    labelSpans,
    properties: ensureItemProperties(item.properties),
    children: item.children.map(normalizeSpanFonts),
  };
}

/** Migrate loaded chart JSON to the current schema (typography inheritance, defaults). */
export function migrateChartData(data: MultiLevelPieChartData): MultiLevelPieChartData {
  if (data.schemaVersion === CHART_DATA_SCHEMA_VERSION) {
    return data;
  }

  const migrated: MultiLevelPieChartData = {
    ...data,
    schemaVersion: CHART_DATA_SCHEMA_VERSION,
    levels: data.levels.map(ensureLevelProperties),
    items: data.items.map(normalizeSpanFonts),
  };

  return migrated;
}

/** Prepare chart data for JSON export with current schema version. */
export function serializeChartData(data: MultiLevelPieChartData): MultiLevelPieChartData {
  return {
    ...data,
    schemaVersion: CHART_DATA_SCHEMA_VERSION,
  };
}

/** Default chart label font family. */
export const DEFAULT_CHART_FONT_FAMILY = 'Onest';

/** CSS font-family stack used on chart labels. */
export const DEFAULT_CHART_FONT_STACK = `${DEFAULT_CHART_FONT_FAMILY}, sans-serif`;

/** Legacy generated span default before inherited typography. */
export const LEGACY_GENERATED_SPAN_FONT_FAMILY = 'Arial';

/** Current chart JSON schema version (increment when migration rules change). */
export const CHART_DATA_SCHEMA_VERSION = 3;

export function formatFontFamilyStack(fontFamily: string): string {
  const trimmed = fontFamily.trim();
  if (!trimmed) {
    return DEFAULT_CHART_FONT_STACK;
  }
  if (trimmed.includes(',')) {
    return trimmed;
  }
  return `${trimmed}, sans-serif`;
}

export function isLegacyGeneratedSpanFont(fontFamily: string | undefined): boolean {
  return fontFamily === LEGACY_GENERATED_SPAN_FONT_FAMILY;
}

export function buildGoogleFontsCssUrl(families: string[]): string {
  const unique = [...new Set(families.map((f) => f.trim()).filter(Boolean))];
  if (unique.length === 0) {
    return `https://fonts.googleapis.com/css2?family=${DEFAULT_CHART_FONT_FAMILY.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
  }
  const familyParams = unique
    .map((family) => `family=${family.replace(/\s+/g, '+')}:wght@400;700`)
    .join('&');
  return `https://fonts.googleapis.com/css2?family=${familyParams}&display=swap`;
}

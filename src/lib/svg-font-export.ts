import { buildGoogleFontsCssUrl } from '@/lib/chart-typography';
import { MultiLevelPieChartData, PieChartItem } from '@/lib/types/multi-level-pie-types';
import { getPropertyValue } from '@/lib/pie-chart-item-value';

function collectFontFamiliesFromItem(
  item: PieChartItem,
  data: MultiLevelPieChartData,
  families: Set<string>
): void {
  const sectorFont = getPropertyValue(
    item,
    item.properties.labelFontFamily,
    data
  );
  if (sectorFont) {
    families.add(sectorFont);
  }

  for (const span of item.labelSpans) {
    if (span.fontFamily) {
      families.add(span.fontFamily);
    }
  }

  item.children.forEach((child) => collectFontFamiliesFromItem(child, data, families));
}

export function collectChartFontFamilies(data: MultiLevelPieChartData): string[] {
  const families = new Set<string>();
  data.items.forEach((item) => collectFontFamiliesFromItem(item, data, families));
  return [...families];
}

const SVG_EXPORT_MARGIN = 5;

function getMaxOuterRadius(data: MultiLevelPieChartData): number {
  return data.levels.reduce(
    (max, level) => Math.max(level.outerRadius, max),
    0
  );
}

/** Reset pan/zoom and crop the cloned SVG so the outer ring fills the export bounds. */
export function prepareSvgForExport(
  svgElement: SVGSVGElement,
  data: MultiLevelPieChartData
): void {
  const zoomGroup = svgElement.querySelector('#zoomG');
  if (zoomGroup) {
    zoomGroup.removeAttribute('transform');
  }

  const maxOuterRadius = getMaxOuterRadius(data);
  if (maxOuterRadius <= 0) {
    return;
  }

  const exportSize = maxOuterRadius * 2 + SVG_EXPORT_MARGIN * 2;
  const center = maxOuterRadius + SVG_EXPORT_MARGIN;
  const oldWidth = Number(svgElement.getAttribute('width')) || exportSize;
  const oldHeight = Number(svgElement.getAttribute('height')) || exportSize;
  const dx = center - oldWidth / 2;
  const dy = center - oldHeight / 2;

  if (zoomGroup && (dx !== 0 || dy !== 0)) {
    zoomGroup.setAttribute('transform', `translate(${dx},${dy})`);
  }

  svgElement.setAttribute('width', String(exportSize));
  svgElement.setAttribute('height', String(exportSize));
  svgElement.setAttribute('viewBox', `0 0 ${exportSize} ${exportSize}`);
}

/** Inject Google Fonts @import into an SVG element so exported files keep label typography. */
export function embedFontsInSvg(svgElement: SVGSVGElement, data: MultiLevelPieChartData): void {
  const families = collectChartFontFamilies(data);
  const cssUrl = buildGoogleFontsCssUrl(families);

  let defs = svgElement.querySelector('defs');
  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svgElement.insertBefore(defs, svgElement.firstChild);
  }

  const existingStyle = defs.querySelector('style[data-chart-fonts]');
  if (existingStyle) {
    existingStyle.remove();
  }

  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.setAttribute('type', 'text/css');
  style.setAttribute('data-chart-fonts', 'true');
  style.textContent = `@import url('${cssUrl}');`;
  defs.appendChild(style);
}

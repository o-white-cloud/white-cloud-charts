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

/** Reset pan/zoom on a cloned SVG so exports show the full chart viewport. */
export function prepareSvgForExport(svgElement: SVGSVGElement): void {
  const zoomGroup = svgElement.querySelector('#zoomG');
  if (zoomGroup) {
    zoomGroup.removeAttribute('transform');
  }
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

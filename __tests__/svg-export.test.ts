/** @jest-environment jsdom */

import { prepareSvgForExport } from '@/lib/svg-font-export';
import { DefaultLevelProperties } from '@/lib/default-values';
import { MultiLevelPieChartData } from '@/lib/types/multi-level-pie-types';

function createSvgWithZoomGroup(transform?: string): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '1990');
  svg.setAttribute('height', '1990');
  const zoomGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  zoomGroup.setAttribute('id', 'zoomG');
  if (transform) {
    zoomGroup.setAttribute('transform', transform);
  }
  svg.appendChild(zoomGroup);
  return svg;
}

function makeExportData(outerRadius: number): MultiLevelPieChartData {
  return {
    items: [],
    levels: [
      {
        id: 'l0',
        innerRadius: 0,
        outerRadius,
        properties: DefaultLevelProperties(),
      },
    ],
  };
}

describe('prepareSvgForExport', () => {
  it('removes pan/zoom transform from the cloned zoom group', () => {
    const svg = createSvgWithZoomGroup('translate(120,80) scale(2)');

    prepareSvgForExport(svg, makeExportData(690));

    const zoomGroup = svg.querySelector('#zoomG');
    expect(zoomGroup).not.toBeNull();
    expect(zoomGroup?.getAttribute('transform')).toBe('translate(-300,-300)');
  });

  it('crops the SVG to the outer ring diameter with a small margin', () => {
    const svg = createSvgWithZoomGroup();

    prepareSvgForExport(svg, makeExportData(690));

    expect(svg.getAttribute('width')).toBe('1390');
    expect(svg.getAttribute('height')).toBe('1390');
    expect(svg.getAttribute('viewBox')).toBe('0 0 1390 1390');
  });

  it('does nothing when the zoom group is missing', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    expect(() => prepareSvgForExport(svg, makeExportData(100))).not.toThrow();
    expect(svg.querySelector('#zoomG')).toBeNull();
    expect(svg.getAttribute('width')).toBe('210');
    expect(svg.getAttribute('height')).toBe('210');
  });
});

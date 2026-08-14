/** @jest-environment jsdom */

import { prepareSvgForExport } from '@/lib/svg-font-export';

function createSvgWithZoomGroup(transform?: string): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const zoomGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  zoomGroup.setAttribute('id', 'zoomG');
  if (transform) {
    zoomGroup.setAttribute('transform', transform);
  }
  svg.appendChild(zoomGroup);
  return svg;
}

describe('prepareSvgForExport', () => {
  it('removes pan/zoom transform from the cloned zoom group', () => {
    const svg = createSvgWithZoomGroup('translate(120,80) scale(2)');

    prepareSvgForExport(svg);

    const zoomGroup = svg.querySelector('#zoomG');
    expect(zoomGroup).not.toBeNull();
    expect(zoomGroup?.getAttribute('transform')).toBeNull();
  });

  it('does nothing when the zoom group is missing', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    expect(() => prepareSvgForExport(svg)).not.toThrow();
    expect(svg.querySelector('#zoomG')).toBeNull();
  });
});

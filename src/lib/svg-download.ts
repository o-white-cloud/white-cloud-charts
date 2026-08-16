import { embedFontsInSvg, prepareSvgForExport } from '@/lib/svg-font-export';
import { MultiLevelPieChartData } from '@/lib/types/multi-level-pie-types';

const chartLogoUrl = '/logo_mop.svg';

export async function downloadChartSvgAsFile(
  data: MultiLevelPieChartData,
  fileName: string
) {
  const svgElement = document.querySelector('.pieRoot svg');
  if (!svgElement) {
    console.error('SVG element not found!');
    return;
  }

  const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
  prepareSvgForExport(clonedSvg, data);
  embedFontsInSvg(clonedSvg, data);

  const logoImage = clonedSvg.querySelector<SVGImageElement>('image[data-chart-logo]');
  if (logoImage) {
    try {
      const logoResponse = await fetch(chartLogoUrl);
      if (!logoResponse.ok) {
        throw new Error(`Logo request failed with status ${logoResponse.status}`);
      }
      const logoSvg = await logoResponse.text();
      logoImage.setAttribute(
        'href',
        `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoSvg)}`
      );
    } catch (error) {
      console.error('Failed to embed the chart logo in the SVG export:', error);
    }
  }

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clonedSvg);

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

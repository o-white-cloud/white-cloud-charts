'use client';
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import { formatFontFamilyStack } from '@/lib/chart-typography';
import { pieLevels } from '@/lib/pie-data';
import { collectChartFontFamilies } from '@/lib/svg-font-export';
import { loadFont } from '@/lib/fonts';
import {
  LabelAnchorType,
  LabelDisplayType, MultiLevelPieChartData, PieChartItem, PieChartItemLabelTextSpan, PieChartLevel, PieSector
} from '@/lib/types/multi-level-pie-types';

export interface MultiLevelPieChartProps {
  data: MultiLevelPieChartData;
  onSectorClick?: (sectorId: string) => void;
}

const sectorIdAttr = 'sector-id';
const arcId = (pieSector: PieSector) => `arc-${pieSector.id}`;
const arcHiddenId = (pieSector: PieSector) => `arc-hidden-${pieSector.id}`;
const textId = (pieSector: PieSector) => `text-${pieSector.id}`;
const textClass = (pieSector: PieSector) => `text-${pieSector.properties?.labelDisplay.value}`;
/** User anchor → SVG text-anchor for radial labels; swaps start/end on the opposite semicircle (same 0°–180° split as dx/transform) so anchoring matches rotation. */
function radialLabelAnchorToSvg(
  userAnchor: LabelAnchorType | null | undefined,
  angleDeg: number
): string {
  const onFirstHalf = angleDeg > 0 && angleDeg <= 180;
  const anchor = userAnchor ?? LabelAnchorType.middle;
  switch (anchor) {
    case LabelAnchorType.middle:
      return 'middle';
    case LabelAnchorType.start:
      return onFirstHalf ? 'start' : 'end';
    case LabelAnchorType.end:
      return onFirstHalf ? 'end' : 'start';
    default:
      return 'middle';
  }
}

/** d3 pie angles: 0 at 12 o'clock, clockwise. True when slice center is on bottom semicircle (3–9 o'clock): path reversal for textPath labels. */
function pathLabelNeedsBottomHalfCorrection(midAngleRad: number): boolean {
  return midAngleRad > Math.PI / 2 && midAngleRad < (3 * Math.PI) / 2;
}

/** Positive labelDY moves the label toward the center → smaller radius. Radius is clamped to the ring. */
function pathLabelRadius(
  level: PieChartLevel,
  labelDY: number | null | undefined
): number {
  const raw = labelDY ?? 0;
  const r = level.outerRadius - raw;
  return Math.max(
    level.innerRadius + 1e-6,
    Math.min(level.outerRadius, r)
  );
}

/**
 * Single arc line for textPath. d3 arc() with inner===outer emits two consecutive A commands
 * (outer then inner); thin annulus uses L between rings. We must not feed textPath both arcs.
 */
function firstArcOnlyFromD3ArcPath(pathStr: string): string | null {
  const normalized = pathStr.replace(/,/g, ' ');
  const beforeLine = /(^.+?)L/.exec(normalized);
  if (beforeLine) {
    return beforeLine[1].trim();
  }
  const firstA = normalized.indexOf('A');
  if (firstA === -1) {
    return null;
  }
  const secondA = normalized.indexOf('A', firstA + 1);
  if (secondA === -1) {
    return normalized.replace(/Z\s*$/i, '').trim();
  }
  return normalized.slice(0, secondA).trim();
}

function radialLabelLocalDx(labelDX: number, angleDeg: number): number {
  return angleDeg > 0 && angleDeg <= 180 ? -labelDX : labelDX;
}

function buildCentroidRadialLabelTransform(
  d: d3.PieArcDatum<PieSector>,
  i: number,
  path: d3.Arc<unknown, d3.PieArcDatum<PieSector>>,
  pieData: d3.PieArcDatum<PieSector>[],
  pieAngle: number[]
): string | null {
  if (!d.data.properties) {
    return null;
  }

  const labelDX = d.data.properties.labelDX?.value ?? 0;
  const labelDY = d.data.properties.labelDY?.value ?? 0;

  switch (d.data.properties.labelDisplay.value) {
    case LabelDisplayType.radial: {
      const p = pieData[i];
      let angle = pieAngle[i];
      if (angle > 0 && angle <= 180) {
        angle = angle - 180;
      }
      const localDx = radialLabelLocalDx(labelDX, pieAngle[i]);
      return `translate(${path.centroid(p as any)}) rotate(${angle + 90}) translate(${localDx}, ${labelDY})`;
    }
    case LabelDisplayType.centroid:
      return `translate(${path.centroid(d as any)}) translate(${labelDX}, ${labelDY})`;
    default:
      return null;
  }
}

let chartZoomTransform = d3.zoomIdentity;

const draw = (
  data: {
    level: PieChartLevel;
    items: PieSector[];
  }[],
  onSectorClick?: (sectorId: string) => void
) => {
  const margin = { top: 40, left: 40, right: 40, bottom: 40 };
  const width =
    data.reduce(
      (max, dataItem) => Math.max(dataItem.level.outerRadius, max),
      0
    ) * 3;
  const height = width;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const existingSvg = d3.select<SVGSVGElement, unknown>('.pieRoot svg').node();
  if (existingSvg) {
    chartZoomTransform = d3.zoomTransform(existingSvg);
  }

  d3.select('#chart').remove();

  const svg = d3
    .select('.pieRoot')
    .append('svg')
    //.attr('viewBox', [0, 0, innerWidth, innerHeight])
    .attr('id', 'chart')
    .attr('width', innerWidth)
    .attr('height', innerHeight);


  const g = svg.append('g')
    .attr('id', 'zoomG');

  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 5]) // Min and max zoom scale
    .on('zoom', (event) => {
      chartZoomTransform = event.transform;
      g.attr('transform', event.transform);
    });

  svg.call(zoom);
  svg.call(zoom.transform, chartZoomTransform);

  const renderedLevels = [...data].filter(Boolean).reverse();
  renderedLevels.forEach((l) => {
    drawPie(l.level, l.items, g, innerWidth, innerHeight, onSectorClick);
  });

  /*
  if (renderedLevels.length > 0) {
    const innermostLevel = renderedLevels.reduce((current, entry) =>
      entry.level.innerRadius < current.level.innerRadius ? entry : current
    );
    const logoRadius = innermostLevel.level.innerRadius > 0
      ? innermostLevel.level.innerRadius
      : innermostLevel.level.outerRadius * 0.3;
    const logoSize = logoRadius * 2.4;

    g.append('image')
      .attr('data-chart-logo', 'true')
      .attr('href', chartLogoUrl)
      .attr('x', innerWidth / 2 - logoSize / 2)
      .attr('y', innerHeight / 2 - logoSize / 2)
      .attr('width', logoSize)
      .attr('height', logoSize)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('pointer-events', 'none');
  }
  */
};

const drawPie = (
  level: PieChartLevel,
  items: PieSector[],
  svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
  innerWidth: number,
  innerHeight: number,
  onSectorClick?: (sectorId: string) => void
) => {
  const selector = `pie${level.innerRadius}`;
  const mainG = svg
    .append('g')
    .attr('transform', `translate(${innerWidth / 2} ${innerHeight / 2})`);
  10;

  const pie = d3
    .pie<PieSector>()
    .sort(null)
    .startAngle((level.properties.startAngle.value ?? 0) * (Math.PI / 180))
    .endAngle((level.properties.startAngle.value ?? 0) * (Math.PI / 180) + 2 * Math.PI)
    .value((record) => record.value);
  const path = d3
    .arc()
    .innerRadius(level.innerRadius)
    .outerRadius(level.outerRadius)
    .padAngle(level.properties.padAngle.value ?? 0)
    .cornerRadius(level.properties.cornerRadius.value ?? 0);
  const pieData = pie(items);
  const pieAngle = pieData.map(function (p) {
    return ((p.startAngle + p.endAngle) / 2 / Math.PI) * 180;
  });

  const handleSectorClick = (
    event: MouseEvent,
    d: d3.PieArcDatum<PieSector>
  ) => {
    event.stopPropagation();
    if (!d.data.placeholder && onSectorClick) {
      onSectorClick(d.data.id);
    }
  };

  // main sector arcs
  mainG
    .selectAll(selector)
    .data(pieData)
    .enter()
    .append('path')
    .attr('id', (d, i) => arcId(d.data))
    .attr('d', path as any)
    .attr(sectorIdAttr, (d) => d.data.id)
    .attr('class', 'arc')
    .attr('fill', (d) =>
      d.data.placeholder ? 'transparent' : d.data.properties?.color.value?.value ?? '#ddd'
    )
    .attr('stroke', (d) => d.data.properties?.strokeColor?.value?.value ?? '#3F3F3F')
    .attr('stroke-width', (d) => d.data.placeholder ? 0 : d.data.properties?.strokeWidth.value ?? 1)
    .style('cursor', (d) => (d.data.placeholder ? null : 'pointer'))
    .style('pointer-events', (d) => (d.data.placeholder ? 'none' : 'auto'))
    .on('click', handleSectorClick)
    .each(function (d) {
      // Hidden path at the label radius (bakes in Delta Y) so textPath arc length matches where text sits
      if (!d || d.data.placeholder || !d.data.properties || d.data.properties.labelDisplay.value !== 'path') {
        return;
      }

      const labelR = pathLabelRadius(level, d.data.properties.labelDY?.value);
      const labelArcGen = d3
        .arc<d3.PieArcDatum<PieSector>>()
        .innerRadius(labelR)
        .outerRadius(labelR)
        .padAngle(level.properties.padAngle.value ?? 0)
        .cornerRadius(0);

      const pathStr = labelArcGen(d as d3.PieArcDatum<PieSector>);
      if (!pathStr) {
        return;
      }

      let newArc = firstArcOnlyFromD3ArcPath(pathStr);
      if (!newArc) {
        return;
      }

      const midAngle = (d.startAngle + d.endAngle) / 2;
      if (pathLabelNeedsBottomHalfCorrection(midAngle)) {
        const startLoc = /M(.*?)A/;
        const middleLoc = /A(.*?)0 0 1/;
        const endLoc = /0 0 1 (.*?)$/;
        const newStart = endLoc.exec(newArc);
        const newEnd = startLoc.exec(newArc);
        const middleSec = middleLoc.exec(newArc);
        if (
          !newStart?.length ||
          !newEnd?.length ||
          !middleSec?.length
        ) {
          return;
        }
        newArc = 'M' + newStart[1] + 'A' + middleSec[1] + '0 0 0 ' + newEnd[1];
      }

      const hiddenPathId = arcHiddenId((d as any).data);
      mainG
        .append('path')
        .attr('id', hiddenPathId)
        .attr('d', newArc)
        .attr('fill', 'none');
    });

  // sector radius edge
  pieData
    .forEach((d, i) => {
      const drawRadialLine = (angle: number, color: string, thickness: number) => {
        //debugger;
        const adjustedAngle = angle;
        const x1 = Math.cos(adjustedAngle) * level.innerRadius;
        const y1 = Math.sin(adjustedAngle) * level.innerRadius;
        const x2 = Math.cos(adjustedAngle) * level.outerRadius;
        const y2 = Math.sin(adjustedAngle) * level.outerRadius;

        mainG.append("line")
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2)
          .attr("stroke", color)
          .attr("stroke-width", thickness)
          .style("pointer-events", "none");
      };

      const startAngle = d.startAngle - Math.PI / 2;//+ (level.properties.startAngle.value ?? 90) * (Math.PI / 180);
      const endAngle = d.endAngle - Math.PI / 2;//+ (level.properties.startAngle.value ?? 90) * (Math.PI / 180);
      if (d.data.properties?.startRadiusStrokeWidth.value) {
        drawRadialLine(startAngle, d.data.properties?.startRadiusStrokeColor.value?.value ?? "#3F3F3F", d.data.properties?.startRadiusStrokeWidth.value ?? 1);
      }
      if (d.data.properties?.endRadiusStrokeWidth.value) {
        drawRadialLine(endAngle, d.data.properties?.endRadiusStrokeColor.value?.value ?? "#3F3F3F", d.data.properties?.endRadiusStrokeWidth.value ?? 1);
      }
    });

  // sector arc edge
  if (level.properties.edgeThickness.value ?? 0 !== 0) {
    const edgeArcs = d3
      .arc()
      .innerRadius(level.outerRadius - (level.properties.edgeThickness.value ?? 0))
      .outerRadius(level.outerRadius)
      .padAngle(level.properties.padAngle.value ?? 0)
      .cornerRadius(level.properties.cornerRadius.value ?? 0);

    mainG
      .selectAll(selector)
      .data(pieData)
      .enter()
      .append('path')
      .attr('class', 'edge')
      .attr('d', edgeArcs as any)
      .attr('fill', (d) =>
        d.data.placeholder ? 'transparent' : level.properties.edgeColor.value?.value ?? '#3F3F3F')
      .attr('stroke', (d) =>
        d.data.placeholder ? 'transparent' : level.properties.edgeColor.value?.value ?? '#3F3F3F')
      .attr('stroke-width', (d) => d.data.placeholder ? 0 : items.reduce((m, i) => Math.max(i.properties?.strokeWidth?.value ?? 0, m), 0))
      .style('pointer-events', (d) => (d.data.placeholder ? 'none' : 'auto'))
      .style('cursor', (d) => (d.data.placeholder ? null : 'pointer'))
      .on('click', handleSectorClick);
  }

  // sector text labels
  mainG
    .selectAll(selector)
    .data(pieData)
    .enter()
    .append('text')
    .attr(sectorIdAttr, (d) => d.data.id)
    .attr('class', (d) => textClass(d.data))
    .style('pointer-events', 'none')
    .text((d) => d.data.placeholder ? null : d.data.name)
    .attr('transform', (d, i) => {
      switch (d.data.properties?.labelDisplay.value) {
        case LabelDisplayType.radial:
        case LabelDisplayType.centroid:
          return buildCentroidRadialLabelTransform(
            d,
            i,
            path as unknown as d3.Arc<unknown, d3.PieArcDatum<PieSector>>,
            pieData,
            pieAngle
          );
        case LabelDisplayType.path:
          return null;
        default:
          return `translate(${path.centroid(d as any)})`;
      }
    })
    .style('text-anchor', (d, i) => {
      switch (d.data.properties?.labelDisplay.value) {
        case LabelDisplayType.radial:
          if (!d.data.properties) {
            return null;
          }
          return radialLabelAnchorToSvg(
            d.data.properties.labelAnchor?.value,
            pieAngle[i]
          );
        case LabelDisplayType.centroid:
          return 'middle';
        default: return null;
      }
    })
    .style('font-size', (d: any) => d.data.properties?.labelFontSize.value)
    .style('font-family', (d: any) =>
      d.data.placeholder || !d.data.properties
        ? null
        : formatFontFamilyStack(d.data.properties.labelFontFamily?.value ?? 'Onest')
    )
    .attr('fill', (d: any) =>
      d.data.placeholder || !d.data.properties
        ? null
        : d.data.properties.labelColor?.value?.value ?? null
    )
    .selectAll("tspan")
    .data((d) => d.data.labelSpans)
    .enter()
    .append("tspan")
    .attr("x", (d) => d.x ?? 0)
    .attr("y", (d) => d.y ?? null)
    .attr("dx", (d) => d.dx ?? null)
    .attr("dy", (d) => d.dy ?? null)
    .attr("fill", (d) => d.color ?? null)
    .text((d: any) => d.text)
    .style('font-weight', (d) => d.fontWeight)
    .style('font-size', (d) => d.fontSize ?? null)
    .style('font-family', (d) => (d.fontFamily ? formatFontFamilyStack(d.fontFamily) : null))

  var sectorsWithPathLabels = items.filter(v => v.properties?.labelDisplay.value == LabelDisplayType.path);

  if (sectorsWithPathLabels.length > 0) {
    mainG
      .selectAll("text")
      .filter(`.${textClass(sectorsWithPathLabels[0])}`)
      .style('dominant-baseline', 'central')
      .style('font-family', (d: any) =>
        d.data.placeholder || !d.data.properties
          ? null
          : formatFontFamilyStack(d.data.properties.labelFontFamily?.value ?? 'Onest')
      )
      .html(null)
      .append("textPath")
      .attr("href", (d: any) => `#${arcHiddenId(d.data)}`)
      .style("text-anchor", (d: any) => d.data.properties.labelAnchor.value)
      .attr("startOffset", "50%")
      .attr('fill', (d: any) => d.data.properties.labelColor?.value?.value ?? null)
      .text((d: any) => (d.data.placeholder ? '' : `${d.data.name}`))
      .selectAll("tspan")
      .data((d: any) => d.data.labelSpans)
      .enter()
      .append("tspan")
      .attr("x", (d: any) => d.x ?? 0)
      .attr("y", (d: any) => d.y)
      .attr("dx", (d: any) => d.dx)
      .attr("dy", (d: any) => d.dy)
      .attr("fill", (d: any) => d.color ?? null)
      .text((d: any) => d.text)
      .style('font-weight', (d: any) => d.fontWeight)
      .style('font-size', (d: any) => d.fontSize ?? null)
      .style('font-family', (d: any) => (d.fontFamily ? formatFontFamilyStack(d.fontFamily) : null))
  }
};

export const MultiLevelPieChart: React.FC<MultiLevelPieChartProps> = (
  props
) => {
  const { data, onSectorClick } = props;
  const onSectorClickRef = useRef(onSectorClick);
  onSectorClickRef.current = onSectorClick;

  useEffect(() => {
    if (data.levels.length > 0) {
      draw(pieLevels(data), (sectorId) => onSectorClickRef.current?.(sectorId));
    }
  }, [data]);

  useEffect(() => {
    const families = collectChartFontFamilies(data);
    families.forEach((family) => {
      loadFont(family).catch((error) => {
        console.error(`Failed to preload chart font ${family}:`, error);
      });
    });
  }, [data]);

  return <div className="pieRoot h-full min-h-0 w-full" />;
};

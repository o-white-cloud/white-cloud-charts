'use client';
import * as d3 from 'd3';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { pieLevels } from '@/lib/pie-data';
import {
  LabelDisplayType, MultiLevelPieChartData, PieChartItem, PieChartLevel, PieSector
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

  d3.select('#chart').remove();

  const svg = d3
    .select('.pieRoot')
    .append('svg')
    //.attr('viewBox', [0, 0, innerWidth, innerHeight])
    .attr('id', 'chart')
    .attr('width', innerWidth)
    .attr('height', innerHeight);


  const g = svg.append('g')
    .attr('id', 'zoomG')
    .attr('transform', 'translate(0,0)');

  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 5]) // Min and max zoom scale
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  svg.call(zoom);

  data.reverse().map((l) => {
    drawPie(l.level, l.items, g, innerWidth, innerHeight, onSectorClick);
  });
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
    .attr('stroke', (d) => d.data.properties?.strokeColor?.value?.value ?? '#000')
    .attr('stroke-width', (d) => d.data.placeholder ? 0 : d.data.properties?.strokeWidth.value ?? 1)
    .style('cursor', 'pointer')
    .on('click', (event, d) => {
      if (!d.data.placeholder && onSectorClick) {
        onSectorClick(d.data.id);
      }
    })
    .each(function (d, i) { // create hidden arc paths on which labels can be placed
      if (!d || d.data.placeholder || !d.data.properties || d.data.properties.labelDisplay.value !== 'path') {
        return; // skip placeholder sectors and the ones that don't have path labels 
      }

      // get the full path of the main sector
      const firstArcSection = /(^.+?)L/;
      const thisArc = firstArcSection.exec(d3.select(this).attr("d"));

      if (!thisArc || thisArc.length == 0) {
        return;
      }
      let newArc = thisArc[1];
      newArc = newArc.replace(/,/g, " ");

      // if the sector is on the bottom half of the pie, we need to invert the path(so that labels don't appear upside-down)
      if (d.endAngle > 90 * Math.PI / 180) {

        var startLoc = /M(.*?)A/;

        var middleLoc = /A(.*?)0 0 1/;

        var endLoc = /0 0 1 (.*?)$/;
        //Flip the direction of the arc by switching the start and end point
        //and using a 0 (instead of 1) sweep flag
        var newStart = endLoc.exec(newArc);
        var newEnd = startLoc.exec(newArc);
        var middleSec = middleLoc.exec(newArc);
        if (!newStart || newStart.length == 0 ||
          !newEnd || newEnd.length == 0 ||
          !middleSec || middleSec.length == 0
        ) {
          return;
        }
        //Build up the new arc notation, set the sweep-flag to 0
        newArc = "M" + newStart[1] + "A" + middleSec[1] + "0 0 0 " + newEnd[1];
      }//if

      const hiddenPathId = arcHiddenId((d as any).data);
      // add the hidden path to the svg
      mainG.append("path")
        .attr("id", hiddenPathId)
        .attr("d", newArc)
        .attr("fill", "none")
        //.attr('stroke', "red")
        //.attr('stroke-width', 1)
        ;
    });

  // sector radius edge
  pieData
    .forEach((d, i) => {
      const drawRadialLine = (angle: number, color: string, thickness: number) => {
        //debugger;
        const adjustedAngle = angle ;
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
          .attr("stroke-width", thickness);
      };

      const startAngle = d.startAngle -Math.PI / 2;//+ (level.properties.startAngle.value ?? 90) * (Math.PI / 180);
      const endAngle = d.endAngle -Math.PI / 2;//+ (level.properties.startAngle.value ?? 90) * (Math.PI / 180);
      if (d.data.properties?.startRadiusStrokeWidth.value) {
        drawRadialLine(startAngle, d.data.properties?.startRadiusStrokeColor.value?.value ?? "#000", d.data.properties?.startRadiusStrokeWidth.value ?? 1);
      }
      if (d.data.properties?.endRadiusStrokeWidth.value) {
        drawRadialLine(endAngle, d.data.properties?.endRadiusStrokeColor.value?.value ?? "#000", d.data.properties?.endRadiusStrokeWidth.value ?? 1);
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
        d.data.placeholder ? 'transparent' : level.properties.edgeColor.value?.value ?? '#000')
      .attr('stroke', (d) =>
        d.data.placeholder ? 'transparent' : level.properties.edgeColor.value?.value ?? '#000')
      .attr('stroke-width', (d) => d.data.placeholder ? 0 : items.reduce((m, i) => Math.max(i.properties?.strokeWidth?.value ?? 0, m), 0));
  }

  // sector text labels
  mainG
    .selectAll(selector)
    .data(pieData)
    .enter()
    .append('text')
    .attr(sectorIdAttr, (d) => d.data.id)
    .attr('class', (d) => textClass(d.data))
    .attr('dy', (d: any) => {
      if (!d.data.properties) {
        return null;
      }
      switch (d.data.properties.labelDisplay.value) {
        case LabelDisplayType.path:
          return (d.endAngle > 90 * Math.PI / 180 ? d.data.properties?.labelDY.value * (-1) * 0.3/* for some reason this is needed to align properly*/ : d.data.properties?.labelDY.value);
        default: return d.data.properties?.labelDY.value;
      }

    })
    .attr('x', (d: any) => {
      if(d.data.placeholder || !d.data.properties) {
        return null;
      }
      switch (d.data.properties.labelDisplay.value) {
        case LabelDisplayType.radial:
          return (d.endAngle <= 180 * Math.PI / 180 ? d.data.properties?.labelDX.value * (-1) : d.data.properties?.labelDX.value);
        default: return d.data.properties?.labelDX.value;
      }
    })
    .text((d) => d.data.placeholder ? null : d.data.name)
    .attr('transform', (d, i) => {
      switch (d.data.properties?.labelDisplay.value) {
        case LabelDisplayType.radial: {
          const p = pieData[i];
          let angle = pieAngle[i];
          if (angle > 0 && angle <= 180) {
            //rotation depends on the angle
            angle = angle - 180;
          }
          return `translate(${path.centroid(p as any)}) rotate(${angle + 90
            } 0 0) `;
        }
        case LabelDisplayType.centroid:
          return `translate(${path.centroid(d as any)})`;
        case LabelDisplayType.path:
          return null;
        default: return `translate(${path.centroid(d as any)})`;
      }

    })
    .style('text-anchor', (d, i) => {
      switch (d.data.properties?.labelDisplay.value) {
        case LabelDisplayType.radial: {

          const p = pieData[i];
          const angle = pieAngle[i];
          if (angle > 0 && angle <= 180) {
            //text-anchor depends on the angle
            return 'start';
          }
          return 'end';
        }
        case LabelDisplayType.centroid:
          return 'middle';
        default: return null;
      }
    })
    .style('font-size', (d: any) => d.data.properties?.labelFontSize.value);

  var sectorsWithPathLabels = items.filter(v => v.properties?.labelDisplay.value == LabelDisplayType.path);

  if (sectorsWithPathLabels.length > 0) {
    mainG
      .selectAll("text")
      .filter(`.${textClass(sectorsWithPathLabels[0])}`)
      .html(null)
      .append("textPath")
      .attr("href", (d: any) => `#${arcHiddenId(d.data)}`)
      .style("text-anchor", (d: any) => d.data.properties.labelAnchor.value)
      .attr("startOffset", "50%")
      .text((d: any) => (d.data.placeholder ? '' : `${d.data.name}`))
  }
};

export const MultiLevelPieChart: React.FC<MultiLevelPieChartProps> = (
  props
) => {
  const { data, onSectorClick } = props;
  const chartData = pieLevels(data);

  useEffect(() => {
    if (data.levels.length > 0) {
      draw(chartData, onSectorClick);
    }
  }, [chartData, onSectorClick]);

  const onDownload = () => {
    const svgElement = document.querySelector('.pieRoot svg');
    if (!svgElement) {
      console.error('SVG element not found!');
      return;
    }

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'chart.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <div className="h-full w-full flex flex-1 flex-col items-center p-1 red">
      <div className='w-full ml-4 mt-5 flex flex-row space-x-4 items-center'>
        <Button
          variant={'outline'}
          onClick={() =>
            d3.select('#zoomG').attr('transform', 'translate(0,0) scale(1)')
          }
        >
          Reset zoom
        </Button>
        <Button variant={'outline'} onClick={onDownload}>
          Download
        </Button>
      </div>
      <div className="pieRoot h-full w-full "></div>
    </div>
  );
};

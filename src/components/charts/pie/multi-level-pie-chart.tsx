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
  }[]
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
    drawPie(l.level, l.items, g, innerWidth, innerHeight);
  });
};

const drawPie = (
  level: PieChartLevel,
  items: PieSector[],
  svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
  innerWidth: number,
  innerHeight: number
) => {
  const selector = `pie${level.innerRadius}`;
  const mainG = svg
    .append('g')
    .attr('transform', `translate(${innerWidth / 2} ${innerHeight / 2})`);
  10;

  const pie = d3
    .pie<PieSector>()
    .sort(null)
    .value((record) => record.value);
  const path = d3
    .arc()
    .innerRadius(level.innerRadius)
    .outerRadius(level.outerRadius)
    .padAngle(level.padAngle)
    .padRadius(level.padRadius)
    .cornerRadius(level.cornerRadius);
  const pieData = pie(items);
  const pieAngle = pieData.map(function (p) {
    return ((p.startAngle + p.endAngle) / 2 / Math.PI) * 180;
  });


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
    .attr('stroke-width', (d) => d.data.placeholder ? 0 : d.data.properties?.strokeWidth.value ?? 1
    )
    .each(function (d, i) {
      if (!d) {
        return;
      }
      const firstArcSection = /(^.+?)L/;
      const thisArc = firstArcSection.exec(d3.select(this).attr("d"));
      
      if (!thisArc || thisArc.length == 0) {
        return;
      }
      let newArc = thisArc[1];
      newArc = newArc.replace(/,/g, " ");
      const hiddenPathId = arcHiddenId((d as any).data);
      
      mainG.append("path")
        .attr("id", hiddenPathId)
        .attr("d", newArc)
        .attr("fill", "none")
        //.attr('stroke', "red")
        //.attr('stroke-width', 1)
        ;
    });

  mainG
    .selectAll(selector)
    .data(pieData)
    .enter()
    .append('text')
    .attr(sectorIdAttr, (d) => d.data.id)
    .attr('class', (d) => textClass(d.data))
    .attr('dy', (d: any) => d.data.properties.labelDY.value)
    .attr('x', (d: any) => d.data.properties.labelDX.value)
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
    .style('font-size', (d: any) => d.data.properties.labelFontSize.value);

  var sectorsWithPathLabels = items.filter(v => v.properties?.labelDisplay.value == LabelDisplayType.path);

  if (sectorsWithPathLabels.length > 0) {
    mainG
      .selectAll("text")
      .filter(`.${textClass(sectorsWithPathLabels[0])}`)
      .html(null)
      .append("textPath")
      .attr("href", (d: any) => `#${arcHiddenId(d.data)}`)
      .style("text-anchor", (d: any) => d.data.properties.labelAnchor.value)
      .attr("startOffset","50%")
      .text((d: any) => (d.data.placeholder ? '' : `${d.data.name}`))
  }
};

export const MultiLevelPieChart: React.FC<MultiLevelPieChartProps> = (
  props
) => {
  const data = pieLevels(props.data);

  useEffect(() => {
    if (props.data.levels.length > 0) {
      draw(data);
    }
  }, [data]);

  return (
    <div className="h-full w-full flex flex-1 flex-col items-center p-1 red">

      <button
        onClick={() =>
          d3.select('#zoomG').attr('transform', 'translate(0,0) scale(1)')
        }
      >
        Reset zoom
      </button>
      <div className="pieRoot h-full w-full "></div>
    </div>
  );
};

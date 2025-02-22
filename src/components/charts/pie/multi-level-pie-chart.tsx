'use client';
import * as d3 from 'd3';
import Gradient from 'javascript-color-gradient';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { pieLevels } from '@/lib/pie-data';
import {
    ColorSource, LabelDisplay, MultiLevelPieChartData, PieChartItem, PieChartLevel, PieSector
} from '@/lib/types/multi-level-pie-types';

export interface MultiLevelPieChartProps {
  data: MultiLevelPieChartData;
}

const levelEnumColors: Record<string, any> = {};

const sectorColor = (
  sector: PieSector,
  level: PieChartLevel,
  sectorsInLevel: PieSector[]
): string => {
  switch (sector.colorSource) {
    case ColorSource.Explicit:
      return sector.colorValue ?? '#ffffff';
    case ColorSource.Level:
      switch (level.color.type) {
        case 'single':
          return level.color.value;
        case 'gradient':
        case 'enumeration':
          return levelEnumColors[level.id](sector.id) as string;
        default:
          return '#ffffff';
      }
    default:
      return '#ffffff';
  }
};

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

  const zoom = d3.zoom().scaleExtent([0.1, 10]).on('zoom', zoomed);

  const svg = d3
    .select('.pieRoot')
    .append('svg')
    .attr('viewBox', [0, 0, innerWidth, innerHeight])
    .attr('id', 'chart')
    .attr('width', innerWidth)
    .attr('height', innerHeight);

  svg.call(zoom as any).call(zoom.transform as any, d3.zoomIdentity);
  function zoomed(e: any) {
    d3.select('#chart').attr('transform', e.transform);
  }

  data.reverse().map((l) => {
    drawPie(l.level, l.items, svg, innerWidth, innerHeight);
  });
};

const drawPie = (
  level: PieChartLevel,
  items: PieSector[],
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
  innerWidth: number,
  innerHeight: number
) => {
  const selector = `pie${level.innerRadius}`;
  const mainG = svg
    .append('g')
    .attr('transform', `translate(${innerWidth / 2} ${innerHeight / 2})`);
  10;

  switch (level.color.type) {
    case 'enumeration':
      levelEnumColors[level.id] = d3
        .scaleOrdinal()
        .domain(d3.extent(items, (d, i) => i) as unknown as string)
        .range(level.color.values);
      break;
    case 'gradient':
      const colorArr = new Gradient()
        .setColorGradient(level.color.from, level.color.to)
        .setMidpoint(items.length)
        .getColors();
      levelEnumColors[level.id] = d3
        .scaleOrdinal()
        .domain(d3.extent(items, (d, i) => i) as unknown as string)
        .range(colorArr);
  }

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

  const labelFontSize = 10;
  var radius = Math.min(innerWidth, innerHeight) / 2 - 50;
  const labelValRadius = radius * 0.8 - labelFontSize * 0.35;
  const labelValRadius1 = radius * 0.8 + labelFontSize * 0.35;

  mainG
    .append('def')
    .append('path')
    .attr('id', 'label-path-1')
    .attr(
      'd',
      `m0 ${-labelValRadius} a${labelValRadius} ${labelValRadius} 0 1,1 -0.01 0`
    );
  mainG
    .append('def')
    .append('path')
    .attr('id', 'label-path-2')
    .attr(
      'd',
      `m0 ${-labelValRadius1} a${labelValRadius1} ${labelValRadius1} 0 1,0 0.01 0`
    );

  const arch = mainG
    .selectAll(selector)
    .data(pieData)
    .enter()
    .append('g')
    .attr('class', 'arc')
    .attr('fill', (d) =>
      d.data.placeholder ? 'transparent' : sectorColor(d.data, level, items)
    )
    .attr('stroke', (d) => (d.data.placeholder ? 0 : level.strokeColor))
    .attr('stroke-width', (d) =>
      d.data.placeholder ? 'transparent' : level.strokeWidth
    );

  arch.append('path').attr('d', path as any);

  mainG
    .selectAll(selector)
    .data(pieData)
    .enter()
    .append('text')
    .text((d) => (d.data.placeholder ? '' : d.data.name))
    .attr('transform', (d, i) => {
      if (d.data.labelDisplay === LabelDisplay.Radial) {
        const p = pieData[i];
        let angle = pieAngle[i];
        if (angle > 0 && angle <= 180) {
          //rotation depends on the angle
          angle = angle - 180;
        }
        return `translate(${path.centroid(p as any)}) rotate(${
          angle + 90
        } 0 0) `;
      }
      return `translate(${path.centroid(d as any)})`;
    })
    // .attr('startOffset', function (d, i) {
    //   const p = pieData[i];
    //   const angle = pieAngle[i];
    //   let percent = ((p.startAngle + p.endAngle) / 2 / 2 / Math.PI) * 100;
    //   if (angle > 90 && angle <= 270) {
    //     //calculate the correct percent for each path respectively
    //     return 100 - percent + '%';
    //   }
    //   return percent + '%';
    // })
    .style('text-anchor', (d, i) => {
      if (d.data.labelDisplay === LabelDisplay.Radial) {
        const p = pieData[i];
        const angle = pieAngle[i];
        if (angle > 0 && angle <= 180) {
          //text-anchor depends on the angle
          return 'start';
        }
        return 'end';
      }
      return 'middle';
    })
    .style('font-size', 17);
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
    <div className="flex flex-1 flex-row items-center p-1">
      <div className="pieRoot">
        <Button
          onClick={() =>
            d3.select('#chart').attr('transform', 'translate(0,0) scale(1)')
          }
        >
          Reset zoom
        </Button>
      </div>
    </div>
  );
};

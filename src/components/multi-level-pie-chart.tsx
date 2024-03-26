'use client';
import * as d3 from 'd3';
import { useEffect, useMemo, useState } from 'react';

import { pieLevels } from '@/lib/pie-data';
import {
    MultiLevelPieChartData, PieChartItem, PieChartLevel, PieSector
} from '@/lib/types/multi-level-pie-types';

export interface MultiLevelPieChartProps {
  data: MultiLevelPieChartData;
}

const draw = (
  data: {
    level: PieChartLevel;
    items: PieSector[];
  }[],
  width: number,
  height: number
) => {
  const margin = { top: 40, left: 40, right: 40, bottom: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(width, height) / 2;
  d3.select('#chart').remove();

  const svg = d3
    .select('.pieRoot')
    .append('svg')
    .attr('id', 'chart')
    .attr('width', innerWidth)
    .attr('height', innerHeight);

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

  const color = d3
    .scaleOrdinal()
    .domain(d3.extent(items, (d) => d.name) as unknown as string)
    .range(d3.schemeCategory10);

  const pie = d3
    .pie<PieSector>()
    .sort(null)
    .value((record) => record.value);
  const path = d3
    .arc()
    .innerRadius(level.innerRadius)
    .outerRadius(level.outerRadius);
  const pieData = pie(items);
  
  const arch = mainG
    .selectAll(selector)
    .data(pieData)
    .enter()
    .append('g')
    .attr('class', 'arc')
    .attr('fill', (d) => d.data.placeholder ? 'transparent' : color(d.data.id) as string);

  arch.append('path').attr('d', path as any);

  mainG
    .selectAll(selector)
    .data(pieData)
    .enter()
    .append('text')
    .text((d) => (d.data.placeholder ? '' : d.data.name))
    .attr('transform', (d) => `translate(${path.centroid(d as any)})`)
    .style('text-anchor', 'middle')
    .style('font-size', 17);
};

export const MultiLevelPieChart: React.FC<MultiLevelPieChartProps> = (
  props
) => {
  const [height, setHeight] = useState(1000);
  const [width, setWidth] = useState(1000);

  const data = pieLevels(props.data);
  useEffect(() => {
    if (props.data.levels.length > 0) {
      draw(data, width, height);
    }
  }, [data]);

  return (
    <div className="flex flex-1 flex-row items-center p-24">
      <div className="pieRoot"></div>
    </div>
  );
};

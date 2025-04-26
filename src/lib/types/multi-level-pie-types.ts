import { LucideIcon } from 'lucide-react';

export interface MultiLevelPieChartData {
  levels: PieChartLevel[];
  items: PieChartItem[];
}

export interface PieChartItemProperties extends Record<string, Property<any>> {
  color: Property<SingleColor>,
  labelDisplay: Property<LabelDisplayType>,
  labelAnchor: Property<LabelAnchorType>,
  labelDX: Property<number>,
  labelDY: Property<number>,
  labelFontSize: Property<number>,
  strokeWidth: Property<number>,
  strokeColor: Property<SingleColor>,
}

export interface PieChartItem {
  id: string;
  name: string;
  innerValue: number;
  absoluteValue: number;
  level: number;
  parent?: PieChartItem;
  children: PieChartItem[];
  icon?: LucideIcon;
  properties: PieChartItemProperties;
}

export interface PieChartLevelProperties extends Omit<PieChartItemProperties, 'color'> {
  color: Property<Color>
}

export interface PieChartLevel {
  id: string;
  innerRadius: number;
  outerRadius: number;
  color: Color;
  padAngle: number;
  padRadius: number;
  cornerRadius: number;
  strokeWidth: number;
  strokeColor: string;

  properties: PieChartLevelProperties;
}

export interface Property<T> {
  source: 'override' | 'parent' | 'level';
  value: T | null,
  label: string,
  name: string,
  description: string
}

export interface PieSectorProperties extends PieChartItemProperties {
}

export interface PieSector {
  id: string;
  name: string;
  value: number;
  placeholder: boolean;
  properties: PieSectorProperties | null;
}

export type ColorType = 'single' | 'gradient' | 'enumeration';
interface ColorBase {
  type: ColorType;
}

export interface SingleColor extends ColorBase {
  type: 'single';
  value: string;
}

export interface GradientColor extends ColorBase {
  type: 'gradient';
  from: string;
  to: string;
}

export interface EnumerationColor extends ColorBase {
  type: 'enumeration';
  values: string[];
}

export type Color =
  | SingleColor
  | GradientColor
  | EnumerationColor;

export enum LabelDisplayType {
  'centroid' = 'centroid',
  'radial' = 'radial',
  'path' = 'path'
}

export enum LabelAnchorType {
  'start' = 'start',
  'middle' = 'middle',
  'end' = 'end'
}
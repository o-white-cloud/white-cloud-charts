import { LucideIcon } from 'lucide-react';

export interface MultiLevelPieChartData {
  levels: PieChartLevel[];
  items: PieChartItem[];
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
}

export interface PieChartItem {
  colorValue?: string;
  colorSource: ColorSource;
  id: string;
  name: string;
  innerValue: number;
  absoluteValue: number;
  level: number;
  parent?: PieChartItem;
  children: PieChartItem[];
  icon?: LucideIcon;
  labelDisplay: LabelDisplay;
}

export interface PieSector {
  strokeWidth: number;
  strokeColor: string;
  id: string;
  name: string;
  value: number;
  placeholder: boolean;
  labelDisplay: LabelDisplay;
  colorSource: ColorSource;
  colorValue?: string;
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

export enum ColorSource {
  Level = 'level',
  Explicit = 'explicit',
}

export enum LabelDisplay {
  Inherit = 'inherit',
  Centroid = 'centroid',
  Radial = 'rounded',
  Path = 'path',
}

import { LucideIcon } from 'lucide-react';

export interface MultiLevelPieChartData {
  /** Optional schema version for migration on load. */
  schemaVersion?: number;
  /** ID of the most recently applied color palette. */
  paletteId?: string;
  /** Top-level item id → index into the applied palette's colors. */
  paletteSectorColors?: Record<string, number>;
  /** Most recently applied spine stroke style. */
  spineStroke?: SpineStrokeSetting;
  /** Most recently applied ring style (edges between levels). */
  ringStyle?: RingStyleSetting;
  levels: PieChartLevel[];
  items: PieChartItem[];
}

export type SpineStrokeColor =
  | { type: 'fixed'; value: string }
  /** Darker shade of each sector's own color. */
  | { type: 'shade' };

export interface SpineStrokeSetting {
  /** Preset id, or 'custom'. */
  presetId: string;
  width: number;
  color: SpineStrokeColor;
}

export interface RingStyleSetting {
  presetId: string;
  width: number;
  color: string;
}

export interface PieChartItemProperties extends Record<string, Property<any>> {
  color: Property<SingleColor>,
  labelColor: Property<SingleColor>,
  labelDisplay: Property<LabelDisplayType>,
  labelAnchor: Property<LabelAnchorType>,
  labelDX: Property<number>,
  labelDY: Property<number>,
  labelFontSize: Property<number>,
  labelFontFamily: Property<string>,
  textLineHeight: Property<number>,
  strokeWidth: Property<number>,
  strokeColor: Property<SingleColor>,
  startRadiusStrokeWidth: Property<number>,
  endRadiusStrokeWidth: Property<number>,
  startRadiusStrokeColor: Property<SingleColor>,
  endRadiusStrokeColor: Property<SingleColor>
}

export interface PieChartItemLabelTextSpan {
  color: string;
  /** When omitted, inherits the sector's resolved label font size. */
  fontSize?: number;
  text: string;
  fontWeight: string;
  /** When omitted, inherits the sector's resolved label font family. */
  fontFamily?: string;
  x?: number;
  y?: number;
  dx?: number;
  dy?: number;
  anchor: LabelAnchorType;
}

export interface PieChartItem {
  id: string;
  name: string;
  labelSpans: PieChartItemLabelTextSpan[];
  innerValue: number;
  absoluteValue: number;
  level: number;
  parent?: PieChartItem;
  children: PieChartItem[];
  icon?: LucideIcon;
  properties: PieChartItemProperties;
}

export interface PieChartLevelProperties extends Omit<PieChartItemProperties, 'color'> {
  color: Property<Color>,
  edgeColor: Property<SingleColor>,
  edgeThickness: Property<number>,
  startAngle: Property<number>,
  padAngle: Property<number>
  cornerRadius: Property<number>
}

export interface PieChartLevel {
  id: string;
  innerRadius: number;
  outerRadius: number;
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
  labelSpans: PieChartItemLabelTextSpan[];
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
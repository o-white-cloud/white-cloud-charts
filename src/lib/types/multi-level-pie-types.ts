import { LucideIcon } from 'lucide-react';

export interface MultiLevelPieChartData {
    levels: PieChartLevel[];
    items: PieChartItem[];
  }
  
  export interface PieChartLevel {
    innerRadius: number;
    outerRadius: number;
  }
  
  export interface PieChartItem {
    id: string;
    name: string;
    innerValue: number;
    absoluteValue: number;
    level: number;
    parent?: PieChartItem;
    children: PieChartItem[];
    icon?: LucideIcon
  }

  export interface PieSector {
    id: string;
    name: string;
    value: number;
    placeholder: boolean;
  }
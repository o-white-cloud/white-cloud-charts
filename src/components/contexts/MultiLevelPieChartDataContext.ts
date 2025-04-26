import { MultiLevelPieChartData } from "@/lib/types/multi-level-pie-types";
import { createContext } from "react";

export const MultiLevelPieChartDataContext = createContext<MultiLevelPieChartData>({ items: [], levels: [] });
# White Cloud Charts — AI overview

## What it is

**White Cloud Charts** is a **Next.js** and **React** app for building **concentric (multi-level) pie charts** from **hierarchical data**. Each tree depth maps to a **ring**; **d3** (`d3.pie`, `d3.arc`, zoom) renders the SVG. Users edit the hierarchy and styling in the UI and can export the chart as SVG.

## Tech stack

- **Next.js 15**, **React 18**, **TypeScript**, **Tailwind CSS**
- **d3** v7 for chart geometry and interaction
- **react-arborist** for the data tree UI; **react-resizable-panels** for layout
- **Radix UI**-style primitives (shadcn-style components under `src/components/ui/`)
- **react-hook-form**, **zod**, **use-immer**, **lodash**, **javascript-color-gradient** (level-based colors)

## Entry points

| Area | Location |
|------|----------|
| Home (link to app) | `src/app/page.tsx` |
| Main editor & chart | `src/app/pie/page.tsx` |
| Chart drawing | `src/components/charts/pie/multi-level-pie-chart.tsx` |
| Tree editor | `src/components/tree/tree.tsx` |

## Data model

- **`MultiLevelPieChartData`** (`src/lib/types/multi-level-pie-types.ts`): `items` (tree roots) + `levels` (one **PieChartLevel** per ring: inner/outer radius, angles, padding, colors, edges).
- **`PieChartItem`**: tree node with `innerValue` / `absoluteValue`, `level`, parent/children, labels (`labelSpans`), and **properties** (colors, label layout, strokes). Properties use **`Property<T>`** with `source`: `override` | `parent` | `level`.
- **`pieLevels`** (`src/lib/pie-data.ts`) flattens the tree by level, inserts **Placeholder** leaves when a branch stops early but deeper rings exist, then computes slice **values** so each ring partitions correctly under parents.
- **`getPropertyValue`** (`src/lib/pie-chart-item-value.ts`) resolves colors (including gradient/enumeration per sibling) and inheritance.
- **`recomputeFromLevel`** recalibrates inner values from a chosen level.

## UI layout (`/pie`)

Three columns: **tree** (left) → **levels list + chart** (center) → **inspector** (right: item or level editor). **`MultiLevelPieChartDataContext`** supplies read-only data to descendants; the pie page holds state and updates.

## Tests

- Jest: e.g. `__tests__/multi-level-pie-data.test.ts`

## Scripts

- `npm run dev` — development server  
- `npm run build` / `npm start` — production  
- `npm run lint` — ESLint  
- `npm test` — Jest  

When behavior or architecture changes meaningfully, keep this file aligned so future sessions stay accurate.

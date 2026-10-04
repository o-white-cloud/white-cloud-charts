# White Cloud Charts

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

- **`MultiLevelPieChartData`** (`src/lib/types/multi-level-pie-types.ts`): `items` (tree roots) + `levels` (one **PieChartLevel** per ring: inner/outer radius, angles, padding, colors, edges). Optional `schemaVersion` for JSON migration; optional `paletteId` for the last applied color palette and `paletteSectorColors` (top-level item id → palette color index, chosen per sector in the palette dialog; unassigned sectors take the next unused color via `resolveSectorColorIndices`), `spineStroke` (last applied spine stroke style) and `ringStyle` (last applied ring style).
- **`PieChartItem`**: tree node with `innerValue` / `absoluteValue`, `level`, parent/children, labels (`labelSpans`), and **properties** (colors, label layout, strokes, typography). Properties use **`Property<T>`** with `source`: `override` | `parent` | `level`.
- **Label typography**: `labelFontFamily` and `labelFontSize` inherit level → parent → sector override. Span `fontFamily` / `fontSize` are optional overrides. Default chart font is **Onest** (`src/lib/chart-typography.ts`).
- **`pieLevels`** (`src/lib/pie-data.ts`) flattens the tree by level, inserts **Placeholder** leaves when a branch stops early but deeper rings exist, then computes slice **values** so each ring partitions correctly under parents.
- **`getPropertyValue`** (`src/lib/pie-chart-item-value.ts`) resolves colors (including gradient/enumeration per sibling) and inheritance.
- **`migrateChartData`** / **`serializeChartData`** (`src/lib/chart-data-migration.ts`) normalize legacy chart JSON and version exports.
- **Color palettes** (`src/lib/palettes/`): registry of built-in palettes, generic palette engine (descendant shading, foreground contrast), and the **Style** dialog (`src/components/palettes/style-dialog.tsx`) with Colors, Spine strokes and Rings tabs; one Apply commits all of them. Spec: `docs/Generic Chart Color Palette System — Implementation Requirements.md`. To add palettes from reference images, use the `add-palette` skill (`.claude/skills/add-palette/`) and its scripts in `scripts/palettes/`.
- **Spine strokes** (`src/lib/spine-strokes.ts`): presets that set the start-radius stroke along each top-level sector's first-child chain. Independent of palettes, except the `shade` color is recomputed when colors change.
- **Ring styles** (`src/lib/ring-styles.ts`): presets that set `edgeColor`/`edgeThickness` on every level except the outermost, drawing rings between levels.
- SVG export embeds Google Fonts used by labels (`src/lib/svg-font-export.ts`).
- **`recomputeFromLevel`** recalibrates inner values from a chosen level.

## UI layout (`/pie`)

Three columns: **tree** (left) → **levels list + chart** (center) → **inspector** (right: item or level editor). **`MultiLevelPieChartDataContext`** supplies read-only data to descendants; the pie page holds state and updates.

## Tests

- Jest, tests in `__tests__/` (data model, palettes, typography, label layout, SVG export). Verify changes with `npm run lint` and `npm test`.

## Scripts

- `npm run dev` — development server  
- `npm run build` / `npm start` — production  
- `npm run lint` — ESLint  
- `npm test` — Jest  

## Maintaining this file

If you change architecture, major dependencies, or primary entry points, update this file so future sessions stay accurate.

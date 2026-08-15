# Generic Chart Color Palette System

## 1. Objective

Implement a reusable, extensible color palette system for hierarchical radial charts.

The feature must allow a user to:

1. Maintain a collection of predefined palettes.
2. Add additional palettes in the future without changing the chart-coloring algorithm.
3. Browse available palettes visually in the application.
4. Select a palette for the chart currently being edited.
5. Apply that palette to the chart automatically.
6. Assign palette colors to the chart's top-level sectors.
7. Generate descendant colors automatically from each top-level sector's assigned color.
8. Automatically choose readable foreground/text colors.
9. Reapply or switch palettes at any time.

The implementation must be generic. No coloring logic should contain hardcoded conditions such as `if palette === "Pastel"`.

A palette must be data/configuration consumed by a generic palette engine.

---

# 2. Existing Chart Structure

The existing saved chart JSON uses a recursive hierarchy:

```text
items
 ├─ level 0 item
 │   ├─ children: level 1 items
 │   │   └─ children: level 2 items
 │   └─ properties
 │       └─ color
 ├─ level 0 item
 ...
```

Nodes contain fields such as:

```json
{
  "level": 0,
  "id": "1",
  "name": "Auto",
  "children": [],
  "properties": {
    "color": {
      "description": "Color of the pie sector",
      "label": "Color",
      "name": "color",
      "source": "override",
      "value": {
        "type": "single",
        "value": "#F6A6A6"
      }
    }
  }
}
```

The current example has:

- four top-level sectors at `level: 0`
- children at `level: 1`
- grandchildren at `level: 2`

The current chart demonstrates the intended inheritance behavior:

```text
Level 0:
strong/base ancestor color

Level 1:
lighter variation of ancestor

Level 2:
lighter variation again
```

For example:

```text
#F6A6A6
    ↓
#F9C6C6
    ↓
#F7DEE1
```

The palette feature must not assume that charts always have exactly three levels. It must traverse `children` recursively and work for arbitrary hierarchy depth.

---

# 3. Fundamental Palette Concept

A palette defines the colors available to **top-level sectors**.

For example:

```ts
{
  id: "soft-pastel",
  name: "Soft Pastel",
  colors: [
    "#E99A9A",
    "#91D2B8",
    "#8EAFE7",
    "#C5A4DF",
    "#E7B482",
    "#83C6C5",
    "#D8C77A",
    "#D69AB7"
  ]
}
```

The palette does NOT need to contain a separate color for every node in the chart.

Instead:

```text
palette color
      ↓
level-0 sector
      ↓
descendant-color algorithm
      ↓
level 1
      ↓
level 2
      ↓
level 3...
```

This separation is important.

The application should have:

```text
Palette Definition
        +
Palette Application Engine
        +
Descendant Color Generator
        +
Foreground Contrast Generator
```

These should be independent concepts.

---

# 4. Palette Model

Create a reusable palette model.

Conceptually:

```ts
interface ChartPalette {
  id: string;
  name: string;

  description?: string;

  colors: string[];

  descendantStrategy: {
    type: "mix";
    target: string;
    amounts: number[];
  };

  foregroundStrategy: {
    type: "auto";
    light: string;
    dark: string;
  };

  previewBackground?: string;
}
```

The exact TypeScript structure may be adapted to the existing application architecture.

The important requirement is that new palettes can be added declaratively.

For example, adding:

```ts
{
  id: "new-palette",
  name: "My New Palette",
  colors: [...]
}
```

must automatically make the new palette:

- available to the palette engine
- visible in the palette selection UI
- selectable
- applicable to charts

without requiring another `switch`, `if`, or palette-specific component.

---

# 5. Palette Registry

Create a central palette registry.

Conceptually:

```ts
const palettes: ChartPalette[] = [
  softPastelPalette,
  vibrantPalette,
  earthPalette,
  dreamyPalette,
  nordicPalette,
  jewelPalette
];
```

All parts of the application must obtain palettes from this registry rather than defining their own palette lists.

This includes:

- palette browser UI
- palette picker
- chart editor
- palette preview
- palette application service
- saved palette references

A palette should be identified by stable `id`, not by its display name.

For example:

```text
soft-pastel
vibrant
earth
dreamy
nordic
jewel
```

Names may change later without breaking saved charts.

---

# 6. Initial Built-In Palettes

Implement the following initial palette collection.

Each should contain **8 ancestor colors** so charts with more than four primary sectors are supported.

## 6.1 Soft Pastel

```text
#E99A9A
#91D2B8
#8EAFE7
#C5A4DF
#E7B482
#83C6C5
#D8C77A
#D69AB7
```

Style:

- gentle
- desaturated
- therapeutic
- calm
- similar to the current chart

This should be the initial/default palette unless an existing application default makes another choice preferable.

---

## 6.2 Vibrant

```text
#D94B5B
#168C72
#3568C8
#7651C9
#D97732
#167E99
#B74583
#788B32
```

Style:

- saturated
- energetic
- high contrast
- appropriate for white foreground labels on darker sectors

---

## 6.3 Earth

```text
#B8614B
#7D8A56
#C18B63
#547463
#C49A4A
#896979
#71858A
#8B6958
```

Style:

- natural
- grounded
- warm
- organic

---

## 6.4 Dreamy

```text
#9298DA
#BA8FC8
#D99AAF
#83B5CE
#78C2B5
#A986A5
#9F83CF
#738BB8
```

Style:

- introspective
- soft
- slightly surreal
- lavender / blue / pink / aqua

---

## 6.5 Nordic

```text
#597A8A
#75968C
#A97971
#817B9B
#B28B58
#668D9C
#8C9970
#A36F82
```

Style:

- restrained
- editorial
- sophisticated
- professional

---

## 6.6 Jewel

```text
#A83F55
#237A63
#315A9D
#694A91
#B56B32
#277887
#9B477A
#687536
```

Style:

- rich
- premium
- high contrast
- deeper than Vibrant

---

# 7. Mapping Palette Colors to Top-Level Sectors

The elements directly inside:

```ts
chart.items
```

represent the top-level sectors in the current data structure.

Palette colors must be assigned sequentially according to their array order.

Example:

```text
items[0] → palette.colors[0]
items[1] → palette.colors[1]
items[2] → palette.colors[2]
items[3] → palette.colors[3]
...
```

Do NOT assign colors based on:

- sector name
- sector ID
- number of children
- angular size
- `innerValue`
- `absoluteValue`

The order of `items` is the authoritative assignment order.

---

# 8. Charts With More Sectors Than Palette Colors

The system must behave safely if:

```text
number of level-0 sectors > palette.colors.length
```

For the first version, colors may cycle:

```ts
palette.colors[index % palette.colors.length]
```

However, the code should isolate this behavior in a function such as:

```ts
getPaletteColor(palette, sectorIndex)
```

so that a more sophisticated overflow strategy can be implemented later without changing the rest of the palette engine.

Do not allow palette application to crash because a chart contains more top-level sectors than anticipated.

---

# 9. Descendant Color Generation

Every level-0 sector becomes the color ancestor for its entire subtree.

Example:

```text
Level 0: Rose
 ├─ Level 1: lighter Rose
 │   └─ Level 2: still lighter Rose
 ├─ Level 1: lighter Rose
 │   └─ Level 2: still lighter Rose
```

Siblings at the same hierarchy depth under the same top-level ancestor should receive the same generated shade by default.

The color represents the **branch identity**, while lightness represents **hierarchy depth**.

---

# 10. Descendant Algorithm

Do not manipulate RGB brightness independently.

Generate descendants by blending the top-level ancestor color toward a target color.

For light themes, that target will normally be white:

```text
#FFFFFF
```

Recommended default progression:

```text
relative depth 0 → 0% mix
relative depth 1 → 27% toward target
relative depth 2 → 52% toward target
relative depth 3 → 70% toward target
relative depth 4 → 82% toward target
```

Conceptually:

```ts
mix(baseColor, targetColor, amount)
```

Important: all descendants must be generated from the **original top-level ancestor color**, not recursively from the already-lightened parent.

Use:

```text
level 2 = mix(level0, white, 52%)
```

rather than:

```text
level 2 = mix(level1, white, 52%)
```

This prevents accumulated rounding and unpredictable color drift.

---

# 11. Arbitrary Hierarchy Depth

The palette engine must not contain assumptions such as:

```ts
if (level === 0)
if (level === 1)
if (level === 2)
```

Instead determine relative depth recursively.

For depths beyond the explicitly configured values, derive a safe value that approaches but never becomes indistinguishable from the background.

For example, values may asymptotically approach approximately:

```text
88–90% mix toward target
```

Do not allow deep descendants to become pure white if the background is white.

The exact extrapolation can be chosen during implementation, but it must:

- be deterministic
- remain visually associated with the ancestor
- avoid becoming invisible
- work at arbitrary depth

---

# 12. Applying Colors to Existing Chart JSON

When applying the palette to a sector, update:

```ts
item.properties.color.source
```

to:

```text
"override"
```

and:

```ts
item.properties.color.value.value
```

to the calculated hex color.

For example:

```json
{
  "color": {
    "description": "Color of the pie sector",
    "label": "Color",
    "name": "color",
    "source": "override",
    "value": {
      "type": "single",
      "value": "#E99A9A"
    }
  }
}
```

Do not replace the entire `color` property if that would discard existing metadata.

Prefer updating only:

```ts
source
value.value
```

This is consistent with the existing chart structure.

---

# 13. Preserve Unrelated Properties

Applying a palette must change only properties that are explicitly part of the palette feature.

It must NOT reset or modify unrelated data such as:

```text
innerValue
absoluteValue

labelAnchor
labelDisplay
labelDX
labelDY
labelFontSize
labelFontFamily

strokeWidth
strokeColor

startRadiusStrokeWidth
endRadiusStrokeWidth

innerRadius
outerRadius

padAngle
cornerRadius
startAngle

textLineHeight
```

Manual label positioning in particular must survive palette changes.

---

# 14. Automatic Foreground / Label Color

A palette may contain colors dark enough that black labels are inappropriate.

Therefore foreground color must be determined automatically from the **actual final sector background color**.

Provide two foreground candidates:

```text
dark foreground: #202020
light foreground: #FFFFFF
```

Calculate contrast against the generated sector color and select whichever provides better accessibility/readability.

Do not define:

```text
Vibrant = always white
Pastel = always black
```

because descendants of a Vibrant sector may become light enough to require dark text.

Instead:

```text
ancestor dark → white foreground
lighter descendant → possibly dark foreground
```

The decision must happen per rendered/generated sector color.

---

# 15. Existing `labelSpans` Foreground Color

Existing chart data contains foreground colors inside structures such as:

```json
"labelSpans": [
  {
    "text": "...",
    "color": "#000000"
  }
]
```

The palette implementation must inspect the existing label-rendering flow and determine whether `labelSpans[].color` is the authoritative persisted foreground color.

If it is, palette application must update those colors to the calculated foreground color.

If label foreground is generated elsewhere by the renderer, use the renderer's existing abstraction instead.

Do not introduce two competing sources of truth for foreground color.

Regardless of the internal implementation, switching palettes must visibly update label foreground colors whenever necessary for contrast.

---

# 16. Separation From Stroke Styling

For the first version, palette application should primarily control:

- sector background colors
- generated descendant colors
- label foreground colors when required for contrast

Do not automatically change chart geometry.

Stroke styling should remain independent unless explicitly added to palette metadata later.

The architecture should nevertheless leave room for future palette metadata such as:

```ts
strokeColor
majorStrokeColor
backgroundColor
centerBackgroundColor
```

without requiring a redesign.

---

# 17. Palette Selection UI

Add a dedicated palette selection experience in the chart-editing UI.

The user must be able to:

1. open the palette selector while working on a chart
2. see every registered palette
3. visually understand each palette without opening it
4. identify the currently selected palette
5. select another palette
6. apply it to the current chart

The UI must be generated from the palette registry.

Do not manually create one component per palette.

---

# 18. Palette Browser / Page

Provide a visual palette browser.

Depending on the current application navigation, this can be:

- a dedicated page
- a panel/dialog accessible from the chart editor
- or both, if that fits the existing architecture

The important requirement is that users can visually inspect all palettes before choosing one.

Suggested layout:

```text
Color Palettes

┌────────────────────────────┐
│ Soft Pastel                │
│ ● ● ● ● ● ● ● ●            │
│ Calm, soft, therapeutic    │
│                  [Apply]   │
└────────────────────────────┘

┌────────────────────────────┐
│ Vibrant                    │
│ ● ● ● ● ● ● ● ●            │
│ Bright and energetic       │
│                  [Apply]   │
└────────────────────────────┘

...
```

Each palette card should show:

- palette name
- optional short description
- all ancestor colors
- selected state
- Apply/Select interaction

---

# 19. Palette Preview

A palette card must show the actual palette colors.

At minimum use adjacent swatches:

```text
████ ████ ████ ████ ████ ████ ████ ████
```

A preferable enhancement is to also show a small hierarchical/radial preview demonstrating how descendants will lighten.

However, the preview must use the same descendant-color function as the real chart.

Do not duplicate the color-generation algorithm inside the preview UI.

Both preview and real chart must call the same shared utility/service.

---

# 20. Current Chart Context

The palette selector must operate against the chart currently being edited.

The expected user flow is:

```text
Open chart
   ↓
Open Palettes
   ↓
See palette options
   ↓
Select "Earth"
   ↓
Apply
   ↓
Current chart immediately updates
```

The user should not need to export/reimport JSON or manually color sectors.

---

# 21. Live Preview vs Explicit Apply

Preferred UX:

When the user clicks a palette card, preview the palette immediately on the active chart.

Then provide:

```text
Apply
Cancel
```

or equivalent behavior.

If the application's current state architecture makes reversible preview unnecessarily complex, the first version may apply immediately when the user selects the palette.

In either implementation:

- changing palettes must be quick
- the chart should visibly update without page reload
- undo/history integration should follow the application's existing editing behavior

Do not introduce an independent undo system only for palettes.

---

# 22. Persist Selected Palette

The chart should store the identity of the palette that was last intentionally applied.

For example, if there is an appropriate chart-level metadata structure:

```json
{
  "paletteId": "soft-pastel"
}
```

or:

```json
{
  "appearance": {
    "paletteId": "soft-pastel"
  }
}
```

Use the location most consistent with the existing application architecture.

Do not infer the palette later by comparing hex colors.

The palette ID should explicitly indicate:

```text
this chart currently uses Soft Pastel
```

The existing chart schema is currently versioned (`schemaVersion: 2`), so any persisted schema change must follow the application's existing schema-version/migration strategy.

---

# 23. Palette Application Is Destructive to Existing Sector Colors

Applying a palette is an explicit recoloring action.

Therefore it is acceptable for it to replace existing manual sector-color overrides.

When the user selects and applies a palette:

```text
all sector background colors in the hierarchy
→ recalculated from the chosen palette
```

This should be consistent and deterministic.

Do not attempt to preserve arbitrary old sector colors while simultaneously applying a new palette.

The user explicitly choosing **Apply Palette** means:

> recolor this chart using this palette.

---

# 24. Manual Editing After Applying a Palette

After a palette has been applied, users must still be able to manually edit individual sector colors using the application's existing controls.

The palette is not a permanent binding that prevents manual customization.

Therefore:

```text
Apply palette
    ↓
generated colors stored in sector properties
    ↓
user may manually modify individual sectors afterward
```

This matches the existing override-based data model.

---

# 25. Palette State After Manual Color Changes

The stored `paletteId` means:

> this is the palette most recently applied to the chart.

It does NOT necessarily guarantee:

> every sector still exactly matches the palette.

Do not continually reapply palette colors after individual manual edits.

Palette application should occur only because of an explicit user action.

---

# 26. Reapplying the Same Palette

Users should be allowed to reapply the currently selected palette.

This is useful if they:

1. apply a palette
2. manually change several sector colors
3. decide they want to reset everything to the palette

Therefore the active palette card may still expose:

```text
Reapply
```

or equivalent functionality.

---

# 27. Palette Service / Utility Layer

Implement palette logic outside React/UI components.

Conceptually there should be reusable operations similar to:

```ts
getPalette(id)

getPaletteColor(palette, topLevelIndex)

generateDescendantColor(
  ancestorColor,
  relativeDepth,
  palette
)

getForegroundColor(backgroundColor)

applyPalette(chart, palette)
```

Names may differ.

The important architectural requirement is:

**React components should orchestrate the feature, not contain the color algorithm.**

---

# 28. Expected Recursive Application Logic

Conceptually:

```ts
for each topLevelItem in chart.items:

    ancestorColor =
        getPaletteColor(
            palette,
            topLevelItemIndex
        )

    colorNode(
        topLevelItem,
        ancestorColor,
        depth = 0
    )
```

And recursively:

```ts
colorNode(node, ancestorColor, depth):

    background =
        generateDescendantColor(
            ancestorColor,
            depth,
            palette
        )

    set node.properties.color.value.value
    set node.properties.color.source = "override"

    foreground =
        getForegroundColor(background)

    apply foreground where appropriate

    for each child:
        colorNode(
            child,
            ancestorColor,
            depth + 1
        )
```

Notice that `ancestorColor` remains unchanged during recursion.

---

# 29. Do Not Use Node's Stored `level` as the Only Source of Relative Depth

The current JSON has:

```text
level 0
level 1
level 2
```

but the palette algorithm should preferably derive depth through traversal from each root.

This makes the feature resilient if:

- hierarchy levels are recalculated
- trees are moved
- imported charts contain unusual values
- another chart representation uses equivalent hierarchy with different level metadata

The stored `level` may be used as validation or where required by the existing chart engine, but the palette algorithm should fundamentally understand parent/child hierarchy.

---

# 30. Palette Addition Workflow

Adding a future palette should require roughly:

1. Create palette data.
2. Register/export it in the palette registry.
3. Nothing else.

Example:

```ts
export const oceanPalette = {
    id: "ocean",
    name: "Ocean",
    description: "Cool blues, teals and aquatic greens.",
    colors: [
        ...
    ],
    descendantStrategy: ...
};
```

After registration, the palette must automatically appear in the UI.

This requirement is important.

There must be no need to separately modify:

```text
PalettePage.tsx
PalettePicker.tsx
ChartEditor.tsx
applyPalette.ts
```

every time a palette is added.

---

# 31. Future Custom/User-Created Palettes

Do not implement a complete custom palette editor unless one already fits naturally into the application.

However, design the model so that a future feature could allow users to create:

```text
Custom Palette
Name
Color 1
Color 2
Color 3
...
```

and pass it into the same palette application engine.

Built-in palettes and future custom palettes should ideally implement the same palette interface.

---

# 32. Future Dark Palettes

The first implementation must not assume:

```text
descendants always move toward white
```

The palette model should specify its descendant target.

For example:

```ts
descendantStrategy: {
    type: "mix",
    target: "#FFFFFF"
}
```

A future dark palette could instead use another target or another strategy.

This is why the mix target belongs to palette configuration rather than being hardcoded globally.

---

# 33. Accessibility

Foreground selection should use a proper luminance/contrast calculation rather than a simplistic rule such as:

```ts
if red + green + blue > 400
```

Use an established WCAG relative-luminance/contrast calculation or an existing suitable color utility already present in the project.

The generated foreground should prioritize readability.

---

# 34. Color Utility Library

Before adding a new dependency, inspect the existing project.

If a suitable existing color utility library is already installed, use it.

Otherwise either:

- implement the small required color operations locally, or
- introduce a lightweight, well-maintained color utility if justified.

Required operations are limited primarily to:

```text
HEX parsing
color mixing
relative luminance
contrast ratio
HEX serialization
```

Do not introduce a large styling dependency only for palette handling.

---

# 35. Palette Selector Visual State

The active palette should be visually identifiable.

For example:

```text
✓ Soft Pastel
```

or with a selected border/background.

The state should correspond to the saved/current `paletteId`.

A card should also support keyboard navigation and normal accessible button behavior.

---

# 36. Empty and Edge Cases

Handle at least the following safely.

### Chart has no items

Palette may be selected but no sector transformation occurs.

No error.

### One top-level sector

Use `palette.colors[0]`.

### Fewer sectors than colors

Use only the necessary first colors.

### More sectors than colors

Use the configured overflow strategy.

### Sector has no children

Color it normally.

### Very deep hierarchy

Continue generating progressively lighter descendants without reaching unusable white.

### Missing `properties.color`

Use existing chart/property creation utilities if such utilities already exist.

Do not assume all imported nodes are perfectly formed.

---

# 37. Existing Level Defaults

The chart JSON also contains a top-level `levels` collection defining default properties for each ring.

These level defaults currently include their own `properties.color` values.

Palette application should primarily recolor **individual sector nodes**, since the desired effect depends on which top-level ancestor owns each descendant.

Do not attempt to implement branch-specific palette coloring only through `levels[].properties.color`, because all sectors on a level would then inherit the same color.

Existing level-level color defaults may remain unchanged unless the current renderer requires otherwise.

---

# 38. Performance

Palette application is a recursive O(n) operation over chart nodes.

It should recolor the entire hierarchy in one transformation/update rather than triggering a separate global state update for every sector.

Preferred conceptual approach:

```text
current chart
    ↓
single recursive transformation
    ↓
updated chart
    ↓
single editor/state update
```

Avoid hundreds of React state updates on larger charts.

---

# 39. Immutability

Follow the application's existing state-management conventions.

If chart state is immutable, palette application must return a new chart structure without mutating the existing object.

If the application already uses an immutable-state helper such as Immer, integrate with that instead of introducing a conflicting pattern.

---

# 40. Undo / Redo

Applying an entire palette should ideally register as **one editing action**.

The user experience should be:

```text
Apply Earth palette
↓
Undo once
↓
entire previous coloring restored
```

It should not require an undo for every individual sector.

Use the application's existing undo/history mechanism.

---

# 41. Scope of First Version

The initial feature should include:

- generic palette model
- palette registry
- six built-in palettes
- recursive palette application
- descendant shade generation
- automatic foreground contrast
- palette browser/picker
- application to the current chart
- selected palette persistence
- ability to switch/reapply palettes
- preservation of unrelated chart properties

Do NOT unnecessarily expand the first version into:

- full theme editor
- cloud palette marketplace
- per-branch palette selection
- gradient editor
- custom user palette designer
- automatic AI palette generation

The architecture should permit future extension without requiring those features now.

---

# 42. Acceptance Criteria

The feature is complete when all of the following are true.

- [ ] The application contains a generic `ChartPalette` model or equivalent.
- [ ] Palettes are stored in a central registry.
- [ ] Six initial palettes are available.
- [ ] Each initial palette supports at least eight top-level sector colors.
- [ ] A palette UI displays all registered palettes automatically.
- [ ] Each palette has a clear visual preview.
- [ ] The currently selected palette is identifiable.
- [ ] A palette can be selected and applied to the chart currently being edited.
- [ ] Top-level sectors receive palette colors according to `items` order.
- [ ] Descendants use shades derived from their top-level ancestor.
- [ ] The algorithm handles arbitrary recursion depth.
- [ ] Color generation is shared between preview and chart application.
- [ ] Sector colors are saved into `properties.color.value.value`.
- [ ] Applied sector color properties have `source: "override"`.
- [ ] Existing unrelated sector properties remain untouched.
- [ ] Appropriate light/dark label foreground is chosen automatically.
- [ ] Vibrant/Jewel charts can use white text where contrast requires it.
- [ ] Lighter descendants automatically switch to dark foreground where necessary.
- [ ] Applying a palette updates the chart without reloading the page.
- [ ] Switching palettes recolors the whole chart consistently.
- [ ] Reapplying the same palette resets manual sector-color changes.
- [ ] Manual sector editing remains possible after palette application.
- [ ] Applying a palette is treated as one undoable editor operation where the existing history architecture supports it.
- [ ] The selected palette ID is persisted with the chart.
- [ ] Charts with more top-level sectors than palette colors do not fail.
- [ ] Adding another palette requires adding/registering palette configuration rather than changing palette logic or UI components.

---

# 43. Implementation Principle

The core principle of this feature is:

> **A palette describes visual intent; the palette engine understands chart hierarchy.**

Do not make palettes aware of specific charts, item IDs, names, or fixed hierarchy sizes.

Do not make the chart renderer aware of individual palette names.

The architecture should remain:

```text
Palette Registry
      ↓
Selected Palette
      ↓
Generic Palette Engine
      ↓
Hierarchical Chart
      ↓
Calculated Sector + Foreground Colors
```

This ensures that future palettes can be introduced as configuration rather than as new application features.
---
name: add-palette
description: Add new built-in color palettes to White Cloud Charts from reference images (in palette_images/) or hex lists. Use when the user asks to add a palette, gives an image of a color palette, or names images to turn into palettes.
---

# Add a color palette

Built-in palettes live in `src/lib/palettes/built-in-palettes.ts` and are registered in `src/lib/palettes/index.ts`. Never hand-edit these for a new palette; use the script, which appends the palette, registers it in all three lists in `index.ts`, preserves line endings, and rejects duplicate ids and malformed hexes:

```sh
node scripts/palettes/add-palette.mjs <id> "<Name>" "<Description>" HEX HEX ...
```

## Conventions (agreed with the user)

- **Color order:** exactly as in the image, top to bottom (or the image's own numbering). Do not reorder.
- **Name:** use the title printed on the image if it has one (e.g. "Ocean Jewels"). Otherwise a short descriptive name of the scene (e.g. "Lotus Pond", "Blue Budgie"). Kebab-case id from the name.
- **Description:** one short sentence about the colors/scene. If the image has a tagline (e.g. "Deep • Calm • Mysterious"), work it in. No creator credit (e.g. @caitiecolors) — not required.
- **No commentary:** don't flag dark colors, similar neighbors, or suggest reordering. Just add the palette as it is.
- **All palettes go in `built-in-palettes.ts`** — no separate files.

## Workflow per image

1. Read the image from `palette_images/` (ignored by git). Images already done have a `done_` prefix.
2. Get the hexes:
   - **Hex labels clearly legible:** use them as printed.
   - **Labels small or hard to read:** read them, then verify against the swatch pixels with `sample-colors.mjs` (direct points on each swatch). Rendered swatches are often a few units off from their labels; small consistent drift means the label is right. A large mismatch means a misread — re-read or ask.
   - **No hex codes at all** (e.g. flower images whose petals only have color names): don't look up generic hexes for the names — invented names like "Cobalt Dream" have none, and standard values (Fuchsia `#FF00FF`) don't match the photo. Sample each petal instead (below) and end the description with `Sampled from petal photo.`
3. Run `add-palette.mjs`.
4. Rename the image with a `done_` prefix (`palette_images/done_IMG_1234.JPG`).
5. After a batch: `npx tsc --noEmit -p .` (only `src/` errors matter; `__tests__` type noise is pre-existing) and `npx jest __tests__/built-in-palettes.test.ts` (checks unique ids and valid hexes).

If an image is unclear in a way these rules don't cover, stop and ask the user rather than guessing. In a batch, finish the others and report skipped images at the end.

## Sampling colors from an image

```sh
node scripts/palettes/sample-colors.mjs palette_images/IMG_1234.JPG --info   # actual pixel size
node scripts/palettes/sample-colors.mjs spec.json                             # sample
```

Coordinates must be in the image's actual pixels (`--info`); the image you view may be scaled. Write the spec to the scratchpad, not the repo.

- **Swatches:** `{"image": "...", "half": 6, "points": [["1", x, y], ...]}` with each point inside a swatch, clear of its label text.
- **Petal/radial images:** `{"image": "...", "center": [cx, cy], "points": [["Petal name", labelX, labelY], ...], "check": "<scratchpad>/check.jpg"}`. List petals **clockwise starting from the top petal** (or follow the image's numbering). Each point is the label's position; the script samples spots on both sides of the label (default offsets `-0.28, 0.25, 0.42` toward the center) and takes the median, avoiding the label text and the shadow near the center.
- Always open the `check` image to confirm every numbered spot sits on the right petal/swatch before adding the palette. The script prints a ready-to-paste `Hexes:` line.

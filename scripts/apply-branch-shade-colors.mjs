/**
 * One pastel per root branch; siblings share the same color; each depth is
 * lighter (mix toward white) than the parent. Re-run: node scripts/apply-branch-shade-colors.mjs
 */
import fs from 'fs';
import { fileURLToPath } from 'url';

const inputPath = fileURLToPath(new URL('../charts/adult_sanatos.json', import.meta.url));
const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

/** Pastels aligned with reference: pink, mint, sky blue, lavender (file order: roots 1–4). */
const ROOT_PASTELS = [
  '#F6A6A6', // Auto-direcționare — salmon / light pink
  '#A8E6CF', // Auto-reglare — mint
  '#A0C4FF', // Conectare — sky blue
  '#D7B4F3', // Transcendenta — lavender
];

const MIX_TOWARD_WHITE = 0.26;

function hexToRgb(hex) {
  const n = hex.replace('#', '');
  return [
    parseInt(n.slice(0, 2), 16),
    parseInt(n.slice(2, 4), 16),
    parseInt(n.slice(4, 6), 16),
  ];
}

function rgbToHex(r, g, b) {
  const clamp = (x) => Math.max(0, Math.min(255, Math.round(x)));
  return `#${[r, g, b]
    .map((x) => clamp(x).toString(16).padStart(2, '0'))
    .join('')}`;
}

function mixTowardWhite(parentHex, t) {
  const [r, g, b] = hexToRgb(parentHex);
  return rgbToHex(r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t);
}

function setColorOverride(item, hex) {
  const base = item.properties?.color ?? {};
  item.properties.color = {
    ...base,
    description: base.description ?? 'Color of the pie sector',
    label: base.label ?? 'Color',
    name: 'color',
    source: 'override',
    value: { type: 'single', value: hex },
  };
}

function paintBranch(node, parentColor, rootBase) {
  const color =
    parentColor === null ? rootBase : mixTowardWhite(parentColor, MIX_TOWARD_WHITE);
  setColorOverride(node, color);
  node.children?.forEach((ch) => paintBranch(ch, color, rootBase));
}

data.items.forEach((root, i) => {
  const base = ROOT_PASTELS[i % ROOT_PASTELS.length];
  paintBranch(root, null, base);
});

fs.writeFileSync(inputPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Updated', inputPath);

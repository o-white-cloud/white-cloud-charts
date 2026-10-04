/**
 * Append a built-in palette and register it in the palette index.
 * Usage: node scripts/palettes/add-palette.mjs <id> "<Name>" "<Description>" HEX HEX ...
 * Example: node scripts/palettes/add-palette.mjs lotus-pond "Lotus Pond" "Magenta lotus..." 741353 E9409B
 */
import fs from 'fs';
import { fileURLToPath } from 'url';

const [id, name, description, ...colors] = process.argv.slice(2);
if (!id || !name || !description || colors.length === 0) {
  console.error('Usage: node scripts/palettes/add-palette.mjs <id> "<Name>" "<Description>" HEX HEX ...');
  process.exit(1);
}

const hexes = colors.map((c) => `#${c.replace('#', '').toUpperCase()}`);
const invalid = hexes.filter((h) => !/^#[0-9A-F]{6}$/.test(h));
if (invalid.length > 0) {
  console.error(`Invalid hex colors: ${invalid.join(', ')}`);
  process.exit(1);
}

const varName = `${id.replace(/-(\w)/g, (_, c) => c.toUpperCase())}Palette`;
const palettesPath = fileURLToPath(new URL('../../src/lib/palettes/built-in-palettes.ts', import.meta.url));
const indexPath = fileURLToPath(new URL('../../src/lib/palettes/index.ts', import.meta.url));

/** Edit a file with LF line endings internally, preserving CRLF if the file uses it. */
function edit(path, fn) {
  const raw = fs.readFileSync(path, 'utf8');
  const crlf = raw.includes('\r\n');
  const next = fn(raw.replace(/\r\n/g, '\n'));
  fs.writeFileSync(path, crlf ? next.replace(/\n/g, '\r\n') : next);
}

const withVarName = (body) =>
  [...body.trim().split(/,\s*/).filter(Boolean), varName]
    .sort()
    .map((x) => `  ${x},\n`)
    .join('');

edit(palettesPath, (s) => {
  if (s.includes(`id: '${id}'`)) {
    throw new Error(`A palette with id '${id}' already exists`);
  }
  return `${s.replace(/\n*$/, '\n')}
export const ${varName} = createPalette({
  id: '${id}',
  name: '${name.replace(/'/g, "\\'")}',
  description: '${description.replace(/'/g, "\\'")}',
  colors: [
${hexes.map((h) => `    '${h}',`).join('\n')}
  ],
});
`;
});

edit(indexPath, (s) =>
  s
    .replace(/(import \{\n)([\s\S]*?)(\} from '\.\/built-in-palettes';)/, (m, a, b, c) => a + withVarName(b) + c)
    .replace(/(export \{\n)([\s\S]*?)(\};\s*$)/, (m, a, b, c) => a + withVarName(b) + c)
    .replace(/,\n\];/, `,\n  ${varName},\n];`)
);

console.log(`Added ${varName} (${hexes.join(' ')})`);

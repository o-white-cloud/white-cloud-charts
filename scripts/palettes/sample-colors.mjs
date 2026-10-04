/**
 * Sample colors from an image, for verifying small hex labels or for images
 * that show colors without hex codes.
 *
 * Usage:
 *   node scripts/palettes/sample-colors.mjs <image> --info
 *   node scripts/palettes/sample-colors.mjs <spec.json>
 *
 * Spec (coordinates are in the image's actual pixels, see --info):
 * {
 *   "image": "palette_images/IMG_1234.JPG",
 *   "points": [["Name", x, y], ...],
 *   "center": [x, y],              // optional, see below
 *   "offsets": [-0.28, 0.25, 0.42],// optional, used with center
 *   "half": 10,                    // optional, patch half-size in px
 *   "check": "path/to/check.jpg"   // optional, writes the image with sample spots marked
 * }
 *
 * Without "center", each point is sampled directly. With "center" (e.g. a
 * flower's center), each point is a label position and the color is the
 * median of patches at label + t * (center - label) for each offset t, so the
 * label text and the shadow near the center are avoided.
 */
import fs from 'fs';
import sharp from 'sharp';

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: node scripts/palettes/sample-colors.mjs <image> --info | <spec.json>');
  process.exit(1);
}

if (process.argv[3] === '--info') {
  const { width, height } = await sharp(arg).metadata();
  console.log(`${width} x ${height}`);
  process.exit(0);
}

const spec = JSON.parse(fs.readFileSync(arg, 'utf8'));
const half = spec.half ?? 10;
const offsets = spec.center ? spec.offsets ?? [-0.28, 0.25, 0.42] : [0];
const { data, info } = await sharp(spec.image).raw().toBuffer({ resolveWithObject: true });

const toHex = (rgb) => `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
const median = (values) => values.sort((a, b) => a - b)[values.length >> 1];

const spotsFor = ([, x, y]) =>
  offsets.map((t) =>
    spec.center
      ? [Math.round(x + t * (spec.center[0] - x)), Math.round(y + t * (spec.center[1] - y))]
      : [x, y]
  );

const results = spec.points.map((point) => {
  const channels = [[], [], []];
  for (const [x, y] of spotsFor(point)) {
    for (let dx = -half; dx <= half; dx++) {
      for (let dy = -half; dy <= half; dy++) {
        const px = Math.min(info.width - 1, Math.max(0, x + dx));
        const py = Math.min(info.height - 1, Math.max(0, y + dy));
        const i = (py * info.width + px) * info.channels;
        for (let k = 0; k < 3; k++) channels[k].push(data[i + k]);
      }
    }
  }
  return [point[0], toHex(channels.map(median))];
});

results.forEach(([name, hex], i) => console.log(`${i + 1}. ${name} ${hex}`));
console.log(`\nHexes: ${results.map(([, hex]) => hex.slice(1)).join(' ')}`);

if (spec.check) {
  const marks = spec.points
    .flatMap((point, i) => spotsFor(point).map(([x, y]) => [x, y, i + 1]))
    .map(
      ([x, y, n]) =>
        `<rect x="${x - half}" y="${y - half}" width="${2 * half}" height="${2 * half}" fill="none" stroke="#000" stroke-width="3"/>` +
        `<rect x="${x - half}" y="${y - half}" width="${2 * half}" height="${2 * half}" fill="none" stroke="#fff" stroke-width="1"/>` +
        `<text x="${x + half + 4}" y="${y + 6}" font-size="22" font-weight="bold" fill="#000" stroke="#fff" stroke-width="1">${n}</text>`
    )
    .join('');
  await sharp(spec.image)
    .composite([{ input: Buffer.from(`<svg width="${info.width}" height="${info.height}">${marks}</svg>`) }])
    .jpeg()
    .toFile(spec.check);
  console.log(`Check image: ${spec.check}`);
}

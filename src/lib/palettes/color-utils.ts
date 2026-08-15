const HEX_PATTERN = /^#?([0-9a-fA-F]{6})$/;

export function parseHex(hex: string): [number, number, number] {
  const match = HEX_PATTERN.exec(hex.trim());
  if (!match) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const value = match[1];
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

export function toHex(r: number, g: number, b: number): string {
  const clamp = (channel: number) =>
    Math.max(0, Math.min(255, Math.round(channel)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((channel) => channel.toString(16).padStart(2, '0').toUpperCase())
    .join('')}`;
}

/** Mix two colors. `amount` 0 = base, 1 = target. */
export function mixColors(base: string, target: string, amount: number): string {
  const t = Math.max(0, Math.min(1, amount));
  const [r1, g1, b1] = parseHex(base);
  const [r2, g2, b2] = parseHex(target);
  return toHex(
    r1 + (r2 - r1) * t,
    g1 + (g2 - g1) * t,
    b1 + (b2 - b1) * t
  );
}

function srgbToLinear(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2.x relative luminance for sRGB hex colors. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/** WCAG contrast ratio between two colors. */
export function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function getForegroundColor(
  backgroundColor: string,
  light: string,
  dark: string
): string {
  const lightContrast = contrastRatio(light, backgroundColor);
  const darkContrast = contrastRatio(dark, backgroundColor);
  return lightContrast >= darkContrast ? light : dark;
}

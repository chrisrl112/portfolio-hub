import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Fonts for the OG raster (ph-37). Satori needs the actual font BYTES — and it
 * supports TTF / OTF / WOFF but NOT woff2. The @fontsource-variable packages the
 * site loads ship woff2 only, so here we pull the matching single-weight WOFF
 * files from the static @fontsource/* packages (dev deps). Single static weights
 * also sidestep Satori's lack of variable-axis interpolation, so the OG card
 * renders the exact weights the design system calls for:
 *   - Space Grotesk 600 -> display / headline / project name
 *   - Inter 400 (normal + italic) -> tagline / sub copy
 *   - JetBrains Mono 600 -> eyebrow / status pill / footer stamp
 */

type Font = {
  name: string;
  data: Buffer;
  weight: 400 | 500 | 600 | 700;
  style: 'normal' | 'italic';
};

function load(pkgFile: string): Buffer {
  // Read from node_modules at the repo root. The OG endpoint runs only at build
  // time (`astro build`/`preview`), where CWD is the project root — and the code
  // is bundled into dist/, so a module-relative path would not resolve.
  return readFileSync(resolve(process.cwd(), 'node_modules', pkgFile));
}

export const ogFonts: Font[] = [
  {
    name: 'Space Grotesk',
    data: load('@fontsource/space-grotesk/files/space-grotesk-latin-600-normal.woff'),
    weight: 600,
    style: 'normal',
  },
  {
    name: 'Inter',
    data: load('@fontsource/inter/files/inter-latin-400-normal.woff'),
    weight: 400,
    style: 'normal',
  },
  {
    name: 'Inter',
    data: load('@fontsource/inter/files/inter-latin-400-italic.woff'),
    weight: 400,
    style: 'italic',
  },
  {
    name: 'JetBrains Mono',
    data: load('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-600-normal.woff'),
    weight: 600,
    style: 'normal',
  },
];

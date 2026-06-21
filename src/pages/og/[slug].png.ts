import type { APIRoute } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getProjects } from '@lib/manifests';
import { ogTemplate } from '@lib/og-template';
import { ogFonts } from '@lib/og-fonts';

export const prerender = true;

const projects = getProjects();

// One PNG per route: the umbrella ("home") card + one per manifest slug.
export function getStaticPaths() {
  return [
    { params: { slug: 'home' } },
    ...projects.map((p) => ({ params: { slug: p.slug } })),
  ];
}

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  const project = projects.find((p) => p.slug === slug);
  const data = slug === 'home' || !project ? ({ home: true } as const) : project;

  // Satori renders the constrained JSX/CSS tree to SVG (text -> glyph paths, so
  // resvg needs no fonts); Resvg rasterizes that SVG -> PNG at 1200×630.
  const svg = await satori(ogTemplate(data) as never, {
    width: 1200,
    height: 630,
    fonts: ogFonts.map((f) => ({
      name: f.name,
      data: f.data,
      weight: f.weight,
      style: f.style,
    })),
  });

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
    .render()
    .asPng();

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};

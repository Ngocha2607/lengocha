/**
 * Rasterises scripts/og.svg into public/seo/og.png.
 *
 * The OG card is a static raster, so it does not use the site's webfont —
 * sharp renders SVG text with system fonts and Plus Jakarta Sans is not
 * installed system-wide. Segoe UI / Arial stand in; both cover the Vietnamese
 * diacritics in the name, which is the only hard requirement.
 *
 * Run with: node scripts/build-og.mjs
 */
import sharp from "sharp";

const info = await sharp("scripts/og.svg", { density: 200 })
  .resize(1200, 630)
  .png({ compressionLevel: 9 })
  .toFile("public/seo/og.png");

console.log(`og.png ${info.width}x${info.height} ${Math.round(info.size / 1024)}KB`);

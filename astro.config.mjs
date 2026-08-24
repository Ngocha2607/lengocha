import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";
import node from "@astrojs/node";

import { SITE } from "./src/consts";

/**
 * The Vercel adapter has no preview entrypoint, so `astro preview` cannot serve
 * the on-demand routes. Set LOCAL_PROD=1 to build against the Node adapter
 * instead and get a real production server locally — the Web Vitals readout in
 * the footer is meaningless on the dev server, so it has to be measured here.
 */
const localProd = process.env.LOCAL_PROD === "1";

export default defineConfig({
  site: SITE.url,

  /**
   * Static by default, so every page ships as prerendered HTML with no
   * framework runtime. `/` and `/writing/[slug]` opt out with
   * `prerender = false` because their content comes from Notion, and ISR then
   * caches the rendered HTML for an hour — the same contract the Next version
   * had with `revalidate = 3600`, so a newly published post still appears
   * without a redeploy.
   */
  output: "static",

  adapter: localProd
    ? node({ mode: "standalone" })
    : vercel({
        isr: { expiration: 3600 },
        /**
         * `/` is on-demand rendered, so without this the project screenshots
         * would be resized by sharp inside the serverless function on every
         * cache miss. Hand it to Vercel's image CDN instead.
         */
        imageService: true,
        /**
         * Vercel only serves widths listed here, and the adapter silently
         * snaps anything else to the nearest one. The default list starts at
         * 640, so `widths={[480, 800]}` was being dropped and every screenshot
         * would have been served at 1920px into a 480px slot. Declare the
         * widths the layout actually asks for.
         */
        imagesConfig: {
          sizes: [480, 800, 1200],
          domains: [],
          remotePatterns: [],
        },
      }),


  fonts: [
    {
      // Headings, labels and every number. Carries the brutalist voice.
      name: "IBM Plex Mono",
      cssVariable: "--font-plex",
      provider: fontProviders.google(),
      weights: [400, 700],
      // Vietnamese is not optional here: article titles and the site owner's
      // name both need the diacritics. Verified both families ship the subset.
      subsets: ["latin", "latin-ext", "vietnamese"],
      fallbacks: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
    },
    {
      // Body copy. Long prose in a mono face is hostile to read.
      name: "Geist",
      cssVariable: "--font-geist",
      provider: fontProviders.google(),
      weights: [400, 700],
      subsets: ["latin", "latin-ext", "vietnamese"],
      fallbacks: ["ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
    },
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});

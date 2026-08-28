import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // output: "standalone",

  images: {
    /**
     * Next 16 narrowed `images.qualities` from "anything" to `[75]`, and a
     * `quality` prop outside the list is COERCED to the nearest allowed value
     * rather than rejected. Nothing warns: the build stays green and the image
     * is silently served at 75.
     *
     * 90 is here for the pre-loader wallpaper, which is dark and smooth enough
     * that 75 bands visibly. See `BG_QUALITY` in PreLoader.tsx.
     */
    qualities: [75, 90],

    /**
     * The ONLY remote image host this site is allowed to use, and it exists for
     * exactly one reason: the Writing window reads its posts live from Notion,
     * and their cover images live in the owner's Vercel Blob store.
     *
     * Everything else on this site is same-origin by design — verified by
     * sweeping every window and counting 0 foreign requests. Writing is the
     * deliberate exception, because live content is the point of it.
     *
     * These are public blob URLs, not Notion's signed `file` URLs, so they do
     * not expire. Adding a host here is what makes `next/image` accept them at
     * all; without it the component throws rather than rendering.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qgat4v5hrepgvc3n.public.blob.vercel-storage.com",
        pathname: "/writings/**",
      },
    ],
  },
};

export default nextConfig;

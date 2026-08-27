import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // output: "standalone",

  images: {
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

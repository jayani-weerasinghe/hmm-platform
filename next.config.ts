import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // mediainfo.js's Node build reads its .wasm file via `fs.readFileSync`
  // relative to its own __dirname — a pattern that breaks under Next's
  // default webpack bundling on Vercel (the .wasm can end up missing from
  // the traced serverless function bundle, or __dirname stops pointing at
  // the real node_modules path). Marking it external keeps it as a plain
  // require() resolved from the real node_modules at runtime, so Vercel's
  // output file tracing picks up the actual .wasm asset correctly.
  serverExternalPackages: ["mediainfo.js"],
  experimental: {
    serverActions: {
      // Matches this Supabase project's actual Storage file size limit
      // (50MB, confirmed via the Management API) — raising this without
      // also raising that limit would just move the failure point, not
      // fix it. Default is 1MB, which was silently far below the 100MB
      // the Resources upload UI used to claim.
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;

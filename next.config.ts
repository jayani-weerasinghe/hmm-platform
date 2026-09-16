import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

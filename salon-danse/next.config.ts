import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Les photos (jusqu'à 2 Mo) passent par une server action : la limite par défaut (1 Mo) est trop basse.
  experimental: {
    serverActions: { bodySizeLimit: "5mb" },
  },
};

export default nextConfig;

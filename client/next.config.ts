import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
  },

  webpack(config) {
    config.plugins.push(
      new (require("webpack")).DefinePlugin({
        "import.meta.env": JSON.stringify(process.env),
      })
    );
    return config;
  },
};

export default nextConfig;

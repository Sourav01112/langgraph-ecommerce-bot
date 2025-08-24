// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   env: {
//     NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
//   },

//   webpack(config) {
//     config.plugins.push(
//       new (require("webpack")).DefinePlugin({
//         "import.meta.env": JSON.stringify(process.env),
//       })
//     );
//     return config;
//   },
// };

// export default nextConfig;


// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    const { DefinePlugin } = require("webpack");

    config.plugins.push(
      new DefinePlugin({
        // define each client-exposed variable explicitly
        "import.meta.env.NEXT_PUBLIC_API_BASE": JSON.stringify(process.env.NEXT_PUBLIC_API_BASE ?? ""),
        "import.meta.env.NEXT_PUBLIC_API_URL": JSON.stringify(process.env.NEXT_PUBLIC_API_URL ?? ""),
        "import.meta.env.NEXT_PUBLIC_APP_ENV": JSON.stringify(process.env.NEXT_PUBLIC_APP_ENV ?? ""),
      })
    );
    return config;
  },
};

export default nextConfig;

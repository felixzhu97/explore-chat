/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  compiler: {
    emotion: {
      sourceMap: true,
      autoLabel: "dev-only",
      labelFormat: "[local]",
      importMap: {
        "@/src/shared/utils/emotion": {
          styled: {
            canonicalImport: ["@emotion/styled", "default"],
            styledBaseImport: ["@emotion/styled", "default"],
          },
        },
      },
    },
  },
};

export default nextConfig;

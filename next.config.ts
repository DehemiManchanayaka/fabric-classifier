import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude native node modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        canvas: false,
        '@tensorflow/tfjs-node': false,
        '@mapbox/node-pre-gyp': false,
        sharp: false,
      };
    }

    // Handle .node files (native modules)
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    // Ignore problematic files from node-pre-gyp
    config.module.rules.push({
      test: /node_modules\/@mapbox\/node-pre-gyp/,
      use: 'null-loader',
    });

    return config;
  },
  
  // Mark server-only packages as external
  experimental: {
    serverComponentsExternalPackages: ['@tensorflow/tfjs-node', 'sharp', 'canvas'],
  },
};

export default nextConfig;
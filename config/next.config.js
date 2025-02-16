/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    API_URL: 'http://localhost:3333/api',
  },
  experimental: {
    esmExternals: true,
    largePageDataBytes: 128 * 1000,
  },
  serverRuntimeConfig: {
    // Will only be available on the server side
    apiUrl: 'http://localhost:3333/api',
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    apiUrl: 'http://localhost:3333/api',
  },
  // Explicitly set pages directory
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  distDir: '.next',
  poweredByHeader: false,
  compress: true,
  optimizeFonts: true,
  // Increase memory limit for large data processing
  webpack: (config, { isServer }) => {
    // Increase memory limit for webpack
    if (!isServer) {
      config.optimization.moduleIds = 'deterministic';
      config.optimization.runtimeChunk = 'single';
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 0,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1];
              return `npm.${packageName.replace('@', '')}`;
            },
          },
        },
      };
    }

    // Handle emotion
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@emotion/core': '@emotion/react',
        'emotion-theming': '@emotion/react',
      };
    }

    return config;
  },
}

module.exports = nextConfig

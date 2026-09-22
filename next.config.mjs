/** @type {import('next').NextConfig} */
const isCapacitor = process.env.CAPACITOR_BUILD === 'true' || process.env.BUILD_TARGET === 'android';
const isGitHubActions = !isCapacitor && process.env.GITHUB_ACTIONS === 'true';

const nextConfig = {
  output: 'export',
  basePath: isGitHubActions ? '/miftah-tools' : '',
  assetPrefix: isGitHubActions ? '/miftah-tools/' : '',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      encoding: false,
      'onnxruntime-node': false,
      sharp: false,
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      canvas: false,
      encoding: false,
      'onnxruntime-node': false,
      sharp: false,
    };
    return config;
  },
};

export default nextConfig;

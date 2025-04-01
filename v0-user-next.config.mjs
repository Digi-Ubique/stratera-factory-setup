/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable the dev indicators (the "N" icon in the bottom left)
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
}

export default nextConfig


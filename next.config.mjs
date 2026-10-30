/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['ffmpeg-static'],
  outputFileTracingIncludes: {
    '/api/domain-payment': ['./.env'],
    '/api/payment-test': ['./.env'],
    '/api/sales/uploads/complete': ['./node_modules/ffmpeg-static/ffmpeg'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dkmdvhzdixefykoojhgt.supabase.co',
        pathname: '/storage/v1/object/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
    ],
    // Keep optimized show artwork cached so Vercel does not repeatedly
    // re-fetch the multi-megabyte originals from Supabase.
    minimumCacheTTL: 604800,
  },
}
export default nextConfig

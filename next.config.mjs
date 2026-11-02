/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['ffmpeg-static'],
  outputFileTracingIncludes: {
    '/api/domain-payment': ['./.env'],
    '/api/payment-test': ['./.env'],
    '/api/sales/uploads/complete': ['./node_modules/ffmpeg-static/ffmpeg'],
  },
  images: { unoptimized: true },
}
export default nextConfig

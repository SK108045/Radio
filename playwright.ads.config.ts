import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: 'ad-placements.spec.ts',
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:3143',
    viewport: { width: 1366, height: 900 },
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    } : {},
  },
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3143',
    url: 'http://127.0.0.1:3143',
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_AD_ZONE_PLAYER: '900000001',
      NEXT_PUBLIC_AD_ZONE_FEED: '900000002',
      NEXT_PUBLIC_AD_ZONE_FOOTER: '900000003',
    },
  },
})

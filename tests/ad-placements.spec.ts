import { test, expect, type Page } from '@playwright/test'

// Never contact the ad server or record live impressions during automated QA.
async function mockProvider(page: Page, fillInline = false) {
  await page.route('https://mixes.casacam.net/**', route => route.abort())
  await page.route(/https:\/\/[^/]*ftd\.agency\//, async route => {
    if (!route.request().url().endsWith('/libs/e.js')) return route.abort()
    await route.fulfill({ contentType: 'application/javascript', body: `
      (function () {
        var requests = [];
        function Network(id, options) {
          if (Network.zones[id]) return Network.zones[id];
          this.div = document.getElementById(id);
          Network.zones[id] = this;
          requests.push(options.id);
          document.documentElement.dataset.providerRequests = JSON.stringify(requests);
          if (options.id === 1892228828) {
            var banner = document.createElement('div');
            banner.id = 'mock-catfish';
            banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;height:88px;background:#222;color:white;z-index:40';
            var close = document.createElement('button');
            close.textContent = 'Close test advertisement';
            close.onclick = function () { banner.remove(); };
            banner.appendChild(close);
            this.div.appendChild(banner);
          } else if (${fillInline}) {
            var creative = document.createElement('iframe');
            creative.title = 'Test inline advertisement';
            creative.width = '300'; creative.height = '100';
            this.div.appendChild(creative);
          }
        }
        Network.zones = {};
        window.ABN = Network;
      })();
    ` })
  })
}

const requests = (page: Page) => page.locator('html').getAttribute('data-provider-requests').then(value => JSON.parse(value || '[]') as number[])

test('one anchor persists through navigation, and dismissal releases player clearance', async ({ page }) => {
  await mockProvider(page)
  await page.goto('/')
  await expect(page.locator('#mock-catfish')).toBeVisible()
  await expect.poll(() => page.locator('html').evaluate(el => el.style.getPropertyValue('--catfish-height'))).toBe('88px')
  expect((await page.locator('[data-radio-bar]').boundingBox())!.y + (await page.locator('[data-radio-bar]').boundingBox())!.height).toBeLessThan(812)
  await page.getByRole('link', { name: 'Shows', exact: true }).first().click()
  await expect(page).toHaveURL('/shows')
  await expect(page.locator('#zone_1892228828')).toHaveCount(1)
  expect((await requests(page)).filter(id => id === 1892228828)).toHaveLength(1)
  await page.getByRole('button', { name: 'Close test advertisement' }).click()
  await expect.poll(() => page.locator('html').evaluate(el => el.style.getPropertyValue('--catfish-height'))).toBe('0px')
  await expect(page.locator('[data-radio-bar]')).toHaveCSS('bottom', '20px')
})

test('inline slots lazy load, fall back honestly, and fit a narrow viewport', async ({ page }) => {
  await mockProvider(page)
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/')
  await expect(page.locator('[data-ad-slot]')).toHaveCount(3)
  await expect.poll(async () => (await requests(page)).length).toBe(1)
  const slot = page.locator('[data-ad-slot="player"]')
  await slot.scrollIntoViewIfNeeded()
  await expect.poll(async () => (await requests(page)).includes(900000001)).toBe(true)
  await expect(slot).toHaveAttribute('data-ad-status', 'house')
  await expect(slot.getByText('RIENG promotion')).toBeVisible()
  const bounds = (await slot.boundingBox())!
  expect(bounds.x).toBeGreaterThanOrEqual(0)
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(360)
  const radio = (await page.locator('[data-radio-bar]').boundingBox())!
  expect(radio.x).toBeGreaterThanOrEqual(0)
  expect(radio.x + radio.width).toBeLessThanOrEqual(360)
  expect(radio.y + radio.height).toBeLessThan(712)
  await page.locator('[data-ad-slot="feed"]').scrollIntoViewIfNeeded()
  await expect.poll(async () => (await requests(page)).includes(900000002)).toBe(true)
  await page.locator('[data-ad-slot="footer"]').scrollIntoViewIfNeeded()
  await expect.poll(async () => (await requests(page)).includes(900000003)).toBe(true)
  expect((await requests(page)).filter(id => id === 1892228828)).toHaveLength(1)
})

test('filled inline creative replaces the house promotion and is labelled as an ad', async ({ page }) => {
  await mockProvider(page, true)
  await page.goto('/')
  const slot = page.locator('[data-ad-slot="player"]')
  await slot.scrollIntoViewIfNeeded()
  await expect(slot).toHaveAttribute('data-ad-status', 'filled')
  await expect(slot.getByText('Advertisement', { exact: true })).toBeVisible()
  await expect(slot.getByRole('link')).toBeHidden()
})

test('blocked provider preserves the radio and labelled house promotions', async ({ page }) => {
  await page.route(/https:\/\/[^/]*ftd\.agency\//, route => route.abort())
  await page.route('https://mixes.casacam.net/**', route => route.abort())
  await page.goto('/')
  const slot = page.locator('[data-ad-slot="player"]')
  await slot.scrollIntoViewIfNeeded()
  await expect(slot).toHaveAttribute('data-ad-status', 'house')
  await expect(page.locator('[data-radio-bar]')).toHaveCSS('bottom', '20px')
  await expect(slot.getByRole('link')).toBeVisible()
})

test('payment route renders no advertising', async ({ page }) => {
  await mockProvider(page)
  await page.goto('/domain-payment')
  await expect(page.locator('[data-ad-slot], #zone_1892228828, #rieng-ad-network')).toHaveCount(0)
})

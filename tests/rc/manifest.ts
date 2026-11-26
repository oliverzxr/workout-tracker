import { expect } from '@playwright/test';
import type { APIRequestContext, Page } from '@playwright/test';

export const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export async function scanManifest(page: Page, request: APIRequestContext) {
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBeTruthy();
  const url = new URL(href!, page.url());
  const response = await request.get(url.href);
  expect(response.ok()).toBe(true);
  const manifest = await response.json() as { icons: { src: string; sizes: string }[]; scope: string; start_url: string };
  expect(new URL(manifest.start_url, url).href).toBe(new URL(manifest.scope, url).href);
  for (const item of manifest.icons) {
    const icon = await request.get(new URL(item.src, url).href);
    expect(icon.ok()).toBe(true);
    const image = await icon.body();
    expect(image.subarray(0, 8)).toEqual(PNG_SIGNATURE);
    const [width, height] = item.sizes.split('x').map(Number);
    expect(image.readUInt32BE(16)).toBe(width);
    expect(image.readUInt32BE(20)).toBe(height);
  }
  return manifest;
}

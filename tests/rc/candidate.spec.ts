import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { PNG_SIGNATURE, scanManifest } from './manifest';

const realApp = 'http://127.0.0.1:4217/';
const headings = [
  ['inicio', 'Área de treino'],
  ['rotinas', 'Rotinas'],
  ['historico', 'Histórico'],
  ['progresso', 'Progresso'],
] as const;

async function verifyA11y(page: Page, label: string) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) })), label).toEqual([]);
}

async function fit(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

test('navegação, legibilidade e alvos de toque em telas preenchidas e vazias', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, 'indexedDB', { get() { throw new Error('A demo tentou acessar IndexedDB'); } });
  });
  const size = info.project.name;
  for (const [slug, heading] of headings) {
    await page.goto('/demo.html#/' + slug);
    await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();
    await fit(page);
    if (process.env.CAPTURE_RC) await capture(page, size, slug);
    await verifyA11y(page, slug);
  }
  await page.goto('/demo.html?state=active#/treino');
  const bench = page.getByRole('region', { name: 'Supino reto', exact: true });
  await expect(bench.getByText(/62,5 kg × 8/).first()).toBeVisible();
  await expect(page.getByRole('timer')).toBeVisible();
  await fit(page);
  if (process.env.CAPTURE_RC) await capture(page, size, 'treino-ativo');
  await verifyA11y(page, 'treino ativo');
  const complete = bench.getByRole('button', { name: 'Concluir série 3' });
  const box = await complete.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);
  await page.getByRole('button', { name: 'Adicionar exercício' }).click();
  const picker = page.getByRole('dialog', { name: 'Adicionar exercício' });
  await expect(picker).toBeVisible();
  await verifyA11y(page, 'catálogo durante o treino');
  await picker.getByRole('button', { name: 'Fechar' }).click();
  await page.getByRole('navigation', { name: 'Ir para exercício' }).getByRole('button', { name: /Remada baixa/ }).click();
  await expect(page.getByRole('region', { name: 'Remada baixa', exact: true })).toBeFocused();
  await page.setViewportSize({ width: size === 'mobile' ? 320 : 768, height: 720 });
  await fit(page);
  await page.goto('/demo.html?state=empty');
  await expect(page.getByRole('button', { name: 'Iniciar treino livre' })).toBeVisible();
  await fit(page);
  await verifyA11y(page, 'início vazio');
  if (process.env.CAPTURE_RC && size === 'mobile') await capture(page, size, 'inicio-vazio');
  await page.getByRole('button', { name: 'Iniciar treino livre' }).click();
  await expect(page.getByRole('button', { name: 'Adicionar exercício' })).toBeVisible();
  await fit(page);
  if (process.env.CAPTURE_RC && size === 'mobile') await capture(page, size, 'treino-vazio');
  expect(errors).toEqual([]);
});

test('PWA serve os ícones e mantém IndexedDB, backup e CSV consistentes offline', async ({ browserName, page, context }, info) => {
  await page.goto(realApp);
  await expect(page.getByRole('heading', { name: 'Área de treino' })).toBeVisible();
  const manifest = await scanManifest(page, context.request);
  expect(manifest).toMatchObject({ display: 'standalone', theme_color: '#000000', background_color: '#000000' });
  expect(manifest.icons).toEqual(expect.arrayContaining([
    expect.objectContaining({ sizes: '192x192' }),
    expect.objectContaining({ sizes: '512x512', purpose: 'maskable' }),
  ]));
  const apple = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
  const appleResponse = await context.request.get(new URL(apple!, page.url()).href);
  expect(appleResponse.ok()).toBe(true);
  const icon = await appleResponse.body();
  expect(icon.subarray(0, 8)).toEqual(PNG_SIGNATURE);
  expect(icon.readUInt32BE(16)).toBe(180);
  expect(icon.readUInt32BE(20)).toBe(180);

  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  if (browserName === 'chromium') {
    const cdp = await context.newCDPSession(page);
    expect((await cdp.send('Page.getInstallabilityErrors')).installabilityErrors).toEqual([]);
    await cdp.detach();
  }
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Sem conexão')).toBeVisible();
  await page.getByRole('button', { name: 'Iniciar treino livre' }).click();
  await page.getByRole('button', { name: 'Adicionar exercício' }).click();
  const picker = page.getByRole('dialog', { name: 'Adicionar exercício' });
  await picker.getByRole('textbox', { name: 'Buscar exercício' }).fill('Supino reto');
  await picker.getByRole('button', { name: /^Supino reto/ }).click();
  const bench = page.getByRole('region', { name: 'Supino reto', exact: true });
  await bench.getByRole('textbox', { name: 'Carga série 1' }).fill('42,5');
  await bench.getByRole('textbox', { name: 'Reps série 1' }).fill('8');
  await bench.getByRole('textbox', { name: 'RIR série 1' }).fill('2');
  await expect(page.getByText('Salvo neste dispositivo')).toBeVisible();
  await page.reload();
  await expect(bench.getByRole('textbox', { name: 'Carga série 1' })).toHaveValue('42,5');
  await bench.getByRole('button', { name: 'Concluir série 1' }).click();
  await expect(page.getByRole('timer')).toBeVisible();
  await page.getByRole('button', { name: 'Finalizar treino' }).click();
  await expect(page.getByRole('cell', { name: '42,5 kg' })).toBeVisible();
  await page.getByRole('button', { name: 'Ajustes', exact: true }).click();
  await verifyA11y(page, 'ajustes da PWA');
  if (process.env.CAPTURE_RC) await capture(page, info.project.name, 'ajustes-offline');
  const backupPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar backup JSON' }).click();
  const backup = await backupPromise;
  const backupBytes = await readFile((await backup.path())!);
  expect(JSON.parse(backupBytes.toString('utf8')).data.workouts[0].exercises[0].sets[0]).toMatchObject({ grams: 42500, reps: 8, rir: 2 });
  const csvPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar histórico em CSV' }).click();
  const csv = await csvPromise;
  expect(await readFile((await csv.path())!, 'utf8')).toContain('"Supino reto","1","Série válida","42.5","8","2"');

  const restored = await page.context().browser()!.newPage();
  try {
    await restored.goto(realApp + '#/ajustes');
    await expect(restored.getByRole('button', { name: 'Restaurar backup' })).toBeVisible();
    restored.once('dialog', dialog => dialog.accept());
    await restored.locator('input[type=file]').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: backupBytes });
    await expect(restored.getByRole('status')).toHaveText('Backup restaurado.');
    await restored.getByRole('button', { name: 'Histórico', exact: true }).click();
    await restored.getByRole('button', { name: /Treino livre/ }).click();
    await expect(restored.getByRole('cell', { name: '42,5 kg' })).toBeVisible();
  } finally {
    await restored.close();
  }
});

async function capture(page: Page, size: string, screen: string) {
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.screenshot({ path: 'docs/screenshots/rc/' + size + '-' + screen + '.png', scale: 'css', animations: 'disabled' });
}

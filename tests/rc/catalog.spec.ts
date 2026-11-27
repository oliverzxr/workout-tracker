import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

const benchDetail = '#/exercicio/catalog%3Abench';
const realApp = 'http://127.0.0.1:4217' + (process.env.VITE_BASE_PATH || '/');
const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function loaded(image: Locator) {
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
}

async function inspect(page: Page, name: string, capture?: string) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const result = await new AxeBuilder({ page }).withTags(tags).analyze();
  expect(result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) })), name).toEqual([]);
  if (capture && process.env.CAPTURE_RC) {
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.screenshot({ path: 'docs/screenshots/rc/' + capture + '.png', scale: 'css', animations: 'disabled', fullPage: !capture.startsWith('mobile-') });
  }
}

test('catálogo, busca brasileira, demonstração, créditos e histórico individual', async ({ page }, info) => {
  await page.goto('/demo.html#/exercicios');
  await expect(page.getByRole('heading', { name: 'Catálogo de exercícios' })).toBeVisible();
  const search = page.getByRole('textbox', { name: 'Buscar exercício' });
  await search.fill('supino');
  const bench = page.getByRole('button', { name: /^Supino reto Peitoral/ });
  await loaded(bench.locator('img'));
  await inspect(page, 'catálogo', info.project.name + '-catalogo');
  await search.fill('supino plano');
  await page.getByRole('combobox', { name: 'Grupo muscular' }).selectOption('triceps');
  await page.getByRole('combobox', { name: 'Equipamento' }).selectOption('dumbbell');
  await expect(page.getByText('Nenhum exercício encontrado.')).toBeVisible();
  await page.getByRole('combobox', { name: 'Equipamento' }).selectOption('barbell');
  await bench.click();
  await expect(page.getByRole('heading', { name: 'Supino reto' })).toBeVisible();
  await inspect(page, 'detalhe', info.project.name + '-exercicio');
  await page.getByText('Quadros de execução', { exact: true }).click();
  await loaded(page.getByRole('img', { name: /Posição inicial/ }));
  await loaded(page.getByRole('img', { name: /Posição final/ }));
  await expect(page.getByText('62,5', { exact: false }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Histórico do exercício' })).toBeVisible();
  await expect(page.getByText('Peitoral maior', { exact: true })).toBeVisible();
  await inspect(page, 'detalhe com quadros abertos');
  if (info.project.name === 'mobile' && process.env.CAPTURE_RC) {
    await page.getByRole('heading', { name: 'Evolução por exercício' }).evaluate(element => element.scrollIntoView());
    await page.screenshot({ path: 'docs/screenshots/rc/mobile-exercicio-progresso.png', scale: 'css', animations: 'disabled' });
  }
  await page.getByText('Créditos das ilustrações').click();
  await expect(page.getByRole('link', { name: 'CC BY-SA 3.0' })).toBeVisible();
  await page.getByText('Superior A', { exact: true }).first().click();
  await expect(page.getByRole('cell', { name: '62,5 kg' }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Volume por treino', exact: true }).click();
  await expect(page.getByRole('img', { name: 'Volume por treino', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 320, height: 700 });
  await inspect(page, 'detalhe a 320 px, créditos e histórico expandidos');
  await page.getByRole('button', { name: 'Catálogo de exercícios' }).click();
  await expect(search).toHaveValue('supino plano');
  await expect(page.getByRole('combobox', { name: 'Grupo muscular' })).toHaveValue('triceps');
});

test('reabre quadros e detalhes offline e mantém o seletor de treino sem imagens', async ({ page, context }) => {
  await page.goto(realApp);
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Sem conexão')).toBeVisible();
  await page.evaluate(hash => { location.hash = hash; }, benchDetail);
  await page.getByText('Quadros de execução', { exact: true }).click();
  await loaded(page.getByRole('img', { name: /Posição inicial/ }));
  await loaded(page.getByRole('img', { name: /Posição final/ }));
  await page.evaluate(() => { location.hash = '#/exercicio/catalog%3Acable-kickback'; });
  await expect(page.getByText('Ilustração indisponível para este exercício.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Extensão de quadril no cabo' })).toBeVisible();
  await page.getByRole('button', { name: 'Início', exact: true }).click();
  await page.getByRole('button', { name: 'Iniciar treino livre' }).click();
  await page.getByRole('button', { name: 'Adicionar exercício' }).click();
  const picker = page.getByRole('dialog', { name: 'Adicionar exercício' });
  await picker.getByRole('textbox', { name: 'Buscar exercício' }).fill('supino plano');
  await expect(picker.locator('img')).toHaveCount(0);
  await picker.getByRole('button', { name: /^Supino reto/ }).click();
  await expect(page.getByRole('region', { name: 'Supino reto', exact: true })).toBeVisible();
});

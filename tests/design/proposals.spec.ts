import { expect, test } from '@playwright/test';
import type { Page, TestInfo } from '@playwright/test';
import { directions } from '../../src/review/directions';

const screens = [
  ['inicio', 'Início', '.review-home'],
  ['rotinas', 'Rotinas', '.routine-plan'],
  ['historico', 'Histórico', '.session-line'],
  ['progresso', 'Progresso', '.progress-chart .chart'],
] as const;

async function capture(page: Page, info: TestInfo, direction: string, screen: string) {
  if (!process.env.CAPTURE_DESIGN) return;
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'docs/revisao-visual/capturas/' + direction + '/' + info.project.name + '-' + screen + '.jpg',
    type: 'jpeg', quality: 88, scale: 'css', animations: 'disabled' });
}

async function fits(page: Page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

for (const direction of Object.keys(directions)) {
  test(direction + ' navega pelas cinco telas e registra uma série', async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      Object.defineProperty(window, 'indexedDB', {
        get() { throw new Error('A demonstração tentou usar IndexedDB'); },
      });
    });
    const url = '/design.html?direction=' + direction;
    await page.goto(url);
    for (const [slug, label, selector] of screens) {
      if (slug !== 'inicio') {
        await page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('button', { name: label, exact: true }).click();
      }
      await expect(page.locator(selector).first()).toBeVisible();
      await fits(page);
      await capture(page, info, direction, slug);
      if (process.env.CAPTURE_DESIGN && info.project.name === 'mobile' && slug === 'progresso') {
        await page.locator('.progress-chart').evaluate(element => element.scrollIntoView({ block: 'start' }));
        await capture(page, info, direction, 'progresso-detalhe');
      }
    }

    await page.goto(url + '&state=active#/treino');
    const bench = page.getByRole('region', { name: 'Supino reto', exact: true });
    await expect(bench.getByText(/62,5 kg × 8/).first()).toBeVisible();
    await expect(page.getByRole('timer')).toBeVisible();
    if (info.project.name === 'mobile') {
      await expect(page.getByRole('navigation', { name: 'Navegação principal' })).toBeHidden();
    }
    await fits(page);
    await capture(page, info, direction, 'treino');

    await bench.getByRole('textbox', { name: 'Carga série 3' }).fill('67,5');
    await bench.getByRole('button', { name: 'Concluir série 3' }).click();
    const expandCompleted = () => bench.getByText('Séries concluídas (3)', { exact: true }).click();
    if (direction === 'cadencia') await expandCompleted();
    await expect(bench.getByRole('button', { name: 'Reabrir série 3' })).toBeVisible();
    if (direction === 'cadencia') {
      const queue = page.getByRole('region', { name: 'Ordem dos exercícios' });
      await queue.getByRole('button', { name: /Remada baixa/ }).click();
      await expect(page.getByRole('region', { name: 'Remada baixa', exact: true })).toBeVisible();
      await expect(bench).toBeHidden();
      await queue.getByRole('button', { name: /Supino reto/ }).click();
      await expandCompleted();
      await expect(bench.getByRole('textbox', { name: 'Carga série 3' })).toHaveValue('67,5');
    }
    await page.getByRole('button', { name: 'Sair da sessão' }).click();
    await page.getByRole('button', { name: 'Retomar treino', exact: true }).click();
    if (direction === 'cadencia') await expandCompleted();
    await expect(bench.getByRole('textbox', { name: 'Carga série 3' })).toHaveValue('67,5');
    await page.getByRole('button', { name: 'Finalizar treino' }).click();
    await expect(page.getByRole('cell', { name: '67,5 kg' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test(direction + ' oferece uma ação útil nos estados vazios', async ({ page }, info) => {
    const url = '/design.html?direction=' + direction + '&state=empty';
    await page.goto(url);
    await expect(page.getByRole('button', { name: 'Iniciar treino livre' })).toBeVisible();
    await expect(page.getByText('Os dias de treino aparecem aqui após a primeira sessão.')).toBeVisible();
    if (info.project.name === 'mobile') await capture(page, info, direction, 'inicio-vazio');
    await page.getByRole('button', { name: 'Iniciar treino livre' }).click();
    await expect(page.getByText('Adicione um exercício para começar a registrar suas séries.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Adicionar exercício' })).toBeVisible();
    if (info.project.name === 'mobile') await capture(page, info, direction, 'treino-vazio');
    await page.getByRole('button', { name: 'Sair da sessão' }).click();
    const navigation = page.getByRole('navigation', { name: 'Navegação principal' });
    await navigation.getByRole('button', { name: 'Rotinas' }).click();
    await expect(page.getByRole('button', { name: 'Nova rotina' })).toBeVisible();
    if (info.project.name === 'mobile') await capture(page, info, direction, 'rotinas-vazio');
    await navigation.getByRole('button', { name: 'Histórico' }).click();
    await expect(page.getByRole('button', { name: 'Treinar', exact: true }).last()).toBeVisible();
    if (info.project.name === 'mobile') await capture(page, info, direction, 'historico-vazio');
    await navigation.getByRole('button', { name: 'Progresso' }).click();
    await expect(page.getByText('A evolução aparece após registrar a primeira série válida.')).toBeVisible();
    if (info.project.name === 'mobile') await capture(page, info, direction, 'progresso-vazio');
    await page.setViewportSize({ width: info.project.name === 'mobile' ? 320 : 824, height: 730 });
    await fits(page);
  });
}

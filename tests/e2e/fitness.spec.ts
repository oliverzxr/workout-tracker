import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('registra porções, metas e peso offline e preserva os dados ao recarregar', async ({ page, context }) => {
  await page.goto('/#/nutricao');
  await expect(page.getByRole('heading', { name: 'Nutrição', exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Registrar alimento' }).click();
  await page.getByRole('button', { name: 'Alimento personalizado' }).click();
  await page.getByLabel('Nome do alimento').fill('Aveia de teste');
  await page.getByLabel('Calorias (kcal)').fill('360');
  await page.getByLabel('Proteínas (g)').fill('15');
  await page.getByLabel('Carboidratos (g)').fill('60');
  await page.getByLabel('Gorduras (g)').fill('7');
  await page.getByLabel('Gramas por porção (opcional)').fill('40');
  await page.getByRole('button', { name: 'Salvar alimento' }).click();
  await page.getByLabel('Quantidade').fill('1,5');
  await page.getByLabel('Unidade').selectOption('serving');
  await page.getByRole('button', { name: 'Salvar registro' }).click();
  await expect(page.getByText('60 g · 216 kcal')).toBeVisible();
  await page.getByRole('button', { name: 'Metas nutricionais' }).click();
  await page.getByLabel('Calorias (kcal)').fill('2200');
  await page.getByLabel('Proteínas (g)').fill('120');
  await page.getByLabel('Carboidratos (g)').fill('260');
  await page.getByLabel('Gorduras (g)').fill('70');
  await page.getByRole('button', { name: 'Salvar metas' }).click();
  await expect(page.getByText('Meta 2.200')).toBeVisible();
  const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(audit.violations.map(item => item.id)).toEqual([]);
  await page.getByRole('button', { name: 'Corpo', exact: true }).click();
  await page.getByRole('button', { name: 'Registrar medida' }).click();
  await page.getByLabel('Valor (kg)').fill('79,2');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.getByRole('cell', { name: '79,2 kg', exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: /Editar medida de/ }).click();
  await page.getByLabel('Valor (kg)').fill('78,9');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.getByRole('cell', { name: '78,9 kg', exact: true }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByRole('cell', { name: '78,9 kg', exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Nova medida' }).click();
  await page.getByLabel('Nome da medida (cm)').fill('Cintura de teste');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await page.getByRole('combobox', { name: 'Medida', exact: true }).selectOption({ label: 'Cintura de teste' });
  await page.getByRole('button', { name: 'Registrar medida' }).click();
  await page.getByLabel('Valor (cm)').fill('86');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.getByRole('cell', { name: '86 cm' })).toBeVisible();
  await page.getByRole('button', { name: 'Definir objetivo' }).click();
  await page.getByLabel('Meta (cm)').fill('84');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.getByText('84 cm', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Nutrição', exact: true }).click();
  await expect(page.getByText('60 g · 216 kcal')).toBeVisible();
});

test.describe('respostas controladas do catálogo', () => {
  test.use({ serviceWorkers: 'block' });

  test('busca produtos, distingue rótulos incompletos e oferece registro manual na falha', async ({ page }) => {
    const food = { name: 'Produto de teste', serving: null, nutrition: { kcal: 200, protein: 2, carbs: 30, fat: 6 }, source: { kind: 'off', barcode: '7891000100103' } };
    await page.route('**/api/foods?*', route => route.request().url().includes('indisponivel')
      ? route.fulfill({ status: 502, json: { error: 'upstream' } })
      : route.fulfill({ json: [{ barcode: '7891000100103', name: food.name, food: route.request().url().includes('aveia') ? null : food, lookup: route.request().url().includes('aveia') }, { barcode: '12345678', name: 'Sem rótulo', food: null }] }));
    await page.goto('/#/nutricao');
    await page.getByRole('button', { name: 'Registrar alimento' }).click();
    const lookup = page.getByLabel('Nome ou código de barras');
    await lookup.fill('aveia');
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    await expect(page.getByText(/Rótulo incompleto/)).toBeVisible();
    await page.getByRole('button', { name: /Produto de teste/ }).click();
    await page.getByLabel('Quantidade').fill('100');
    await page.getByRole('button', { name: 'Salvar registro' }).click();
    await expect(page.getByRole('dialog', { name: 'Registrar alimento' })).toBeHidden();
    await expect(page.getByRole('region', { name: 'Refeições' }).getByRole('link', { name: 'Open Food Facts' })).toBeVisible();
    await page.getByRole('button', { name: 'Registrar alimento' }).click();
    await lookup.fill('indisponivel');
    await lookup.press('Enter');
    await expect(page.getByRole('alert')).toContainText('Busca indisponível');
    await expect(page.getByRole('button', { name: 'Alimento personalizado' })).toBeEnabled();
  });
});

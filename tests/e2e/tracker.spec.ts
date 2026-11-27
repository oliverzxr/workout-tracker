import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function go(page: Page, label: string) {
  await page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('button', { name: label, exact: true }).click();
}

async function pick(page: Page, name: string) {
  await page.getByRole('button', { name: 'Adicionar exercício', exact: true }).click();
  await page.getByRole('textbox', { name: 'Buscar exercício' }).fill(name);
  await page.getByRole('dialog').last().getByRole('button', { name: new RegExp('^' + name + ' ') }).click();
}

async function set(page: Page, name: string, index: number, load: string, reps: string, rir = '') {
  const exercise = page.getByRole('region', { name, exact: true });
  await exercise.getByRole('textbox', { name: 'Carga série ' + index }).fill(load);
  await exercise.getByRole('textbox', { name: 'Reps série ' + index }).fill(reps);
  await exercise.getByRole('textbox', { name: 'RIR série ' + index }).fill(rir);
  await exercise.getByRole('button', { name: 'Concluir série ' + index }).click();
}

async function noOverflow(page: Page) {
  const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(fits).toBe(true);
}

test('cria rotina, reordena, registra aquecimento, retoma e edita histórico', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Área de treino' })).toBeVisible();
  await page.getByRole('button', { name: 'Criar rotina', exact: true }).click();
  await page.getByRole('textbox', { name: 'Nome da rotina' }).fill('Parte superior');
  await pick(page, 'Remada baixa');
  await pick(page, 'Supino reto');
  await page.getByRole('button', { name: 'Subir Supino reto 2' }).click();
  await page.getByRole('spinbutton', { name: 'Séries planejadas Supino reto 1' }).fill('2');
  await page.getByRole('spinbutton', { name: 'Séries planejadas Remada baixa 2' }).fill('1');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await go(page, 'Início');
  if (process.env.CAPTURE_SCREENSHOTS && info.project.name === 'chromium-desktop') {
    await page.screenshot({ path: 'docs/screenshots/inicio.png', fullPage: true });
  }
  await page.getByRole('button', { name: 'Iniciar rotina Parte superior' }).click();
  await expect(page.getByRole('heading', { name: 'Treino em andamento' })).toBeVisible();
  await expect(page.locator('.workout-exercises h2')).toHaveText(['Supino reto', 'Remada baixa']);
  await page.getByRole('button', { name: 'Opções Supino reto', exact: true }).click();
  await page.getByRole('dialog').getByRole('spinbutton').fill('45');
  await page.getByRole('dialog').getByRole('button', { name: 'Salvar' }).click();
  const bench = page.getByRole('region', { name: 'Supino reto' });
  await bench.getByRole('button', { name: 'Opções série 1 · Série válida' }).click();
  await page.getByRole('dialog').getByRole('combobox').selectOption('warmup');
  await page.getByRole('dialog').getByRole('button', { name: 'Fechar' }).click();
  await set(page, 'Supino reto', 1, '12,5', '10');
  await expect(page.getByRole('timer')).toHaveText(/^00:4[0-5]$/);
  await set(page, 'Supino reto', 2, '25.5', '8', '2');
  await bench.getByRole('button', { name: 'Opções série 2 · Série válida' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Mover para cima' }).click();
  await expect(bench.getByRole('textbox', { name: 'Carga série 1' })).toHaveValue('25.5');
  await page.getByRole('button', { name: 'Opções Remada baixa', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Mover para cima' }).click();
  await expect(page.locator('.workout-exercises h2')).toHaveText(['Remada baixa', 'Supino reto']);
  const row = page.getByRole('region', { name: 'Remada baixa' });
  await row.getByRole('textbox', { name: 'Carga série 1' }).fill('32,5');
  await expect(page.getByText('Salvo neste dispositivo')).toBeVisible();
  await page.reload();
  await expect(row.getByRole('textbox', { name: 'Carga série 1' })).toHaveValue('32,5');
  await expect(bench.getByRole('button', { name: 'Reabrir série 2' })).toBeVisible();
  await set(page, 'Remada baixa', 1, '32,5', '12', '0');
  await noOverflow(page);
  await page.getByRole('button', { name: 'Finalizar treino' }).click();
  await expect(page.getByRole('heading', { name: 'Parte superior' })).toBeVisible();
  await expect(page.getByText('594', { exact: false }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  await row.getByRole('button', { name: 'Reabrir série 1' }).click();
  await set(page, 'Remada baixa', 1, '35', '10', '0');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.getByText('554', { exact: false }).first()).toBeVisible();
  await go(page, 'Progresso');
  await expect(page.getByRole('row', { name: 'Peitoral 1 204 kg' })).toBeVisible();
  await expect(page.getByRole('row', { name: 'Costas 1 350 kg' })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Carga por treino' })).toBeVisible();
  await noOverflow(page);
  await go(page, 'Rotinas');
  await page.getByRole('button', { name: 'Começar' }).click();
  await expect(bench.getByText('25,5 kg × 8')).toBeVisible();
  await bench.getByRole('button', { name: 'Copiar série anterior' }).click();
  await expect(bench.getByRole('textbox', { name: 'Carga série 1' })).toHaveValue('25,5');
  await bench.getByRole('textbox', { name: 'Carga série 1' }).fill('27,5');
  await bench.getByRole('button', { name: 'Concluir série 1' }).click();
  await expect(page.getByRole('timer')).toBeVisible();
  await expect(page.getByText('Salvo neste dispositivo')).toBeVisible();
  if (process.env.CAPTURE_SCREENSHOTS && info.project.name === 'webkit-iphone') {
    await page.evaluate(() => window.scrollTo(0, 70));
    await page.screenshot({ path: 'docs/screenshots/treino-iphone.png', scale: 'css' });
  }
  await page.getByRole('button', { name: 'Finalizar treino' }).click();
  await expect(page.getByRole('heading', { name: 'Parte superior' })).toBeVisible();
  await go(page, 'Progresso');
  await page.getByRole('combobox', { name: 'Exercício' }).selectOption({ label: 'Supino reto' });
  await expect(page.locator('.chart circle')).toHaveCount(2);
  await expect(page.getByText('27,5', { exact: false }).first()).toBeVisible();
  if (process.env.CAPTURE_SCREENSHOTS && info.project.name === 'chromium-desktop') {
    await page.screenshot({ path: 'docs/screenshots/progresso.png', fullPage: true });
  }
  expect(errors).toEqual([]);
});

test('recarrega a PWA e finaliza um treino sem conexão', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Área de treino' })).toBeVisible();
  const manifest = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(manifest).toBeTruthy();
  const response = await context.request.get(new URL(manifest!, page.url()).href);
  const metadata = await response.json();
  expect(metadata).toMatchObject({ lang: 'pt-BR', display: 'standalone' });
  expect(metadata.icons.map((icon: { sizes: string }) => icon.sizes)).toContain('512x512');
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Sem conexão')).toBeVisible();
  await page.getByRole('button', { name: 'Iniciar treino livre' }).click();
  await pick(page, 'Elevação lateral');
  const entry = page.getByRole('region', { name: 'Elevação lateral' });
  await entry.getByRole('button', { name: 'Concluir série 1' }).click();
  await expect(page.getByRole('alert')).toContainText('Informe carga');
  await set(page, 'Elevação lateral', 1, '7,5', '10', '3');
  await expect(page.getByText('Salvo neste dispositivo')).toBeVisible();
  await page.reload();
  await expect(entry.getByRole('button', { name: 'Reabrir série 1' })).toBeVisible();
  await page.getByRole('button', { name: 'Finalizar treino' }).click();
  await expect(page.getByRole('heading', { name: 'Treino livre' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '7,5 kg' })).toBeVisible();
});

test('oferece atalho para o conteúdo e permite sair do diálogo pelo teclado', async ({ page, browserName }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Área de treino' })).toBeVisible();
  const skip = page.getByRole('link', { name: 'Ir para o conteúdo' });
  if (browserName === 'webkit') {
    // The emulated iPhone does not model hardware keyboard traversal settings.
    await skip.focus();
  } else {
    await page.keyboard.press('Tab');
  }
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await page.getByRole('button', { name: 'Criar rotina' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('gerencia catálogo e restaura um backup em um contexto novo', async ({ page, browser }, info) => {
  await page.goto('/');
  await go(page, 'Rotinas');
  await page.getByRole('button', { name: 'Gerenciar exercícios' }).click();
  await page.getByRole('button', { name: 'Novo exercício' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: 'Nome' }).fill('Remada de teste');
  await dialog.getByRole('combobox', { name: 'Grupo muscular' }).selectOption('back');
  await dialog.getByRole('combobox', { name: 'Equipamento' }).selectOption('band');
  await dialog.getByRole('spinbutton').fill('30');
  await dialog.getByRole('button', { name: 'Salvar', exact: true }).click();
  await page.getByRole('textbox', { name: 'Buscar exercício' }).fill('remada de teste');
  await page.getByRole('button', { name: 'Arquivar Remada de teste' }).click();
  await expect(page.getByText('Nenhum exercício encontrado.')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Mostrar arquivados' }).check();
  await page.getByRole('button', { name: 'Reativar Remada de teste' }).click();
  await go(page, 'Ajustes');
  await expect(page.getByText(/Exporte backups regularmente/)).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar backup JSON' }).click();
  const backup = await download;
  const file = info.outputPath('backup.json');
  await backup.saveAs(file);
  const target = await browser.newPage({ baseURL: page.url() });
  try {
    await target.goto('/');
    await go(target, 'Ajustes');
    await target.getByLabel('Restaurar backup', { exact: true }).setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{}') });
    await expect(target.getByRole('alert')).toContainText('Seus dados foram preservados.');
    target.once('dialog', prompt => prompt.accept());
    await target.getByLabel('Restaurar backup', { exact: true }).setInputFiles(file);
    await expect(target.getByRole('status')).toHaveText('Backup restaurado.');
    await go(target, 'Rotinas');
    await target.getByRole('button', { name: 'Gerenciar exercícios' }).click();
    await target.getByRole('textbox', { name: 'Buscar exercício' }).fill('remada de teste');
    await expect(target.getByText('Costas · Elástico')).toBeVisible();
    const csv = target.waitForEvent('download');
    await go(target, 'Ajustes');
    await target.getByRole('button', { name: 'Exportar histórico em CSV' }).click();
    expect((await csv).suggestedFilename()).toMatch(/\.csv$/);
  } finally {
    await target.close();
  }
});

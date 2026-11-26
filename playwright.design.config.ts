import { defineConfig, devices } from '@playwright/test';

const url = 'http://127.0.0.1:4218';
export default defineConfig({
  testDir: './tests/design',
  use: { baseURL: url, trace: 'retain-on-failure', locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' },
  reporter: 'list',
  workers: 2,
  webServer: {
    command: 'npm exec -- vite preview --mode design --host 127.0.0.1 --port 4218 --strictPort',
    url: url + '/design.html', reuseExistingServer: !process.env.CI, timeout: 30000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
    { name: 'mobile', use: { ...devices['iPhone 15'], viewport: { width: 393, height: 750 } } },
  ],
});

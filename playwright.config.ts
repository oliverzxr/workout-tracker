import { defineConfig, devices } from '@playwright/test';

const url = 'http://127.0.0.1:4217';
export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: url, trace: 'retain-on-failure' },
  reporter: 'list',
  workers: 2,
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4217 --strictPort', url, reuseExistingServer: !process.env.CI, timeout: 30000 },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit-iphone', use: { ...devices['iPhone 15'] } },
  ],
});

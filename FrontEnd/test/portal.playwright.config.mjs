import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: ".",
  testMatch: "portal.spec.mjs",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: "http://127.0.0.1:5174",
    browserName: "chromium",
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "node test/portal-server.mjs",
      cwd: new URL("../../API", import.meta.url).pathname,
      url: "http://127.0.0.1:3100/",
      timeout: 60000,
      reuseExistingServer: false,
    },
    {
      command: "npm run dev -- --port 5174 --strictPort",
      cwd: new URL("..", import.meta.url).pathname,
      env: { API_PROXY_TARGET: "http://127.0.0.1:3100" },
      url: "http://127.0.0.1:5174/",
      timeout: 30000,
      reuseExistingServer: false,
    },
  ],
});

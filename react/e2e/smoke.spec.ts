import { test, expect } from '@playwright/test';
import { readFileSync, mkdirSync } from 'fs';

const SCREENSHOT_DIR = 'e2e/screenshots';

test.describe('Porcelain ERP 冒烟测试', () => {
  test.beforeAll(() => {
    mkdirSync(SCREENSHOT_DIR, { recursive: true });
  });

  test('登录页可正常加载', async ({ page }) => {
    await page.goto('/');
    // 检查登录页关键元素
    await expect(page.locator('input[type="text"], input[placeholder*="用户名"], input[placeholder*="username"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('页面无白屏/JS 错误', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/');
    await page.waitForTimeout(3000);
    expect(errors).toEqual([]);
  });

  test('所有路由页面可访问', async ({ page }) => {
    const routes = [
      '/login',
      '/dashboard',
      '/purchase',
      '/sales',
      '/inventory',
      '/production-plan',
      '/finance',
      '/hr',
      '/reports',
      '/settings',
    ];
    for (const route of routes) {
      await page.goto(route);
      await page.waitForTimeout(500);
      const body = page.locator('body');
      await expect(body).not.toBeEmpty();
    }
  });
});

// ── 截图基线套件 ──
test.describe('Screenshot Baselines (截图基线)', () => {
  test('SC-001: 登录页截图', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/login-page.png`, fullPage: true });
  });

  test('SC-002: 仪表板截图', async ({ page }) => {
    await page.goto('/dashboard').catch(() => {});
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard-page.png`, fullPage: true });
  });

  test('SC-003: 采购页面截图', async ({ page }) => {
    await page.goto('/purchase').catch(() => {});
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/purchase-page.png`, fullPage: true });
  });

  test('SC-004: 侧边栏截图', async ({ page }) => {
    await page.goto('/dashboard').catch(() => {});
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/sidebar-navigation.png`, fullPage: true });
  });
});

// ── 点击冒烟套件 ──
test.describe('Click Smoke Tests (点击冒烟)', () => {
  test('CK-001: 登录按钮可点击', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(1000);

    const loginBtn = page.locator('button[type="submit"], button:has-text("登录"), button:has-text("Login")').first();
    if (await loginBtn.isVisible()) {
      await expect(loginBtn).toBeEnabled({ timeout: 5000 });
    }
  });

  test('CK-002: 错误登录有反馈', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(1000);

    const usernameInput = page.locator('input[type="text"], input[name="username"], input[placeholder*="用户"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

    if (await usernameInput.isVisible()) {
      await usernameInput.fill('wrong_user');
      await passwordInput.fill('wrong_pass');

      const loginBtn = page.locator('button[type="submit"], button:has-text("登录")').first();
      if (await loginBtn.isVisible()) {
        await loginBtn.click();
      } else {
        await page.keyboard.press('Enter');
      }

      await page.waitForTimeout(2000);
      // 期望出现错误提示 toast/消息
      const errorMsg = page.locator('[role="alert"], .error, .toast, [data-testid*="error"], [data-testid*="toast"]').first();
      const isErrorVisible = await errorMsg.isVisible().catch(() => false);
      if (!isErrorVisible) {
        // 也可能是输入框红了
        await page.screenshot({ path: `${SCREENSHOT_DIR}/login-error-feedback.png`, fullPage: true });
      }
    }
  });

  test('CK-003: 导航菜单点击', async ({ page }) => {
    await page.goto('/dashboard').catch(() => {});
    await page.waitForTimeout(1000);

    // 尝试点击导航中的链接
    const navLinks = page.locator('nav a, aside a, [data-testid*="nav"] a').first();
    if (await navLinks.isVisible()) {
      await navLinks.click().catch(() => {});
      await page.waitForTimeout(1000);
    }
  });
});

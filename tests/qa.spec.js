import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// DESKTOP TESTS
// ---------------------------------------------------------------------------
test.describe('Desktop', () => {

  test('page loads and has a title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
  });

  test('no broken images', async ({ page }) => {
    await page.goto('/');
    const images = await page.locator('img').all();
    for (const img of images) {
      const naturalWidth = await img.evaluate(el => el.naturalWidth);
      expect(naturalWidth, `Image broken: ${await img.getAttribute('src')}`).toBeGreaterThan(0);
    }
  });

  test('contact section exists', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#contacto')).toBeAttached();
  });

  test('phone link present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href^="tel:"]').first()).toBeVisible();
  });

  test('email link present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href^="mailto:"]').first()).toBeVisible();
  });

  test('primary CTA links to #contacto', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('.btn-primary').first();
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute('href');
    expect(href).toContain('contacto');
  });

  test('no broken internal anchor links', async ({ page }) => {
    await page.goto('/');
    const anchors = await page.locator('a[href^="#"]').all();
    for (const anchor of anchors) {
      const href = await anchor.getAttribute('href');
      if (!href || href === '#') continue;
      const id = href.slice(1);
      const exists = await page.locator(`#${id}`).count();
      expect(exists, `Anchor ${href} points to missing element`).toBeGreaterThan(0);
    }
  });

  test('form fields present and focusable', async ({ page }) => {
    await page.goto('/');
    await page.locator('#contacto').scrollIntoViewIfNeeded();
    for (const selector of ['#nome', '#email', '#telefone']) {
      const field = page.locator(selector);
      if (await field.count() > 0) {
        await field.focus();
        await expect(field).toBeFocused();
      }
    }
  });

  test('no horizontal overflow', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflow, 'Page has horizontal scroll').toBe(false);
  });

});

// ---------------------------------------------------------------------------
// MOBILE TESTS (skip on desktop viewport)
// ---------------------------------------------------------------------------
test.describe('Mobile', () => {
  test.skip(({ viewport }) => !viewport || viewport.width > 600, 'Mobile tests only');

  test('hamburger button is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hamburger')).toBeVisible();
  });

  test('nav links are hidden initially', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-links')).toBeHidden();
  });

  test('hamburger opens mobile menu', async ({ page }) => {
    await page.goto('/');
    await page.locator('#hamburger').click();
    await expect(page.locator('#mobileMenu')).toHaveClass(/open/);
  });

  test('mobile menu closes on link click', async ({ page }) => {
    await page.goto('/');
    await page.locator('#hamburger').click();
    await page.locator('#mobileMenu a').first().click();
    await expect(page.locator('#mobileMenu')).not.toHaveClass(/open/);
  });

  test('no horizontal overflow on mobile', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflow, 'Mobile page has horizontal scroll').toBe(false);
  });

  test('contact section reachable on mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#contacto')).toBeAttached();
  });

});

const { test, expect } = require('@playwright/test');

test.describe('Match Meter Quick Tests', () => {
  const appUrl = 'file:///C:/Users/surro/Downloads/AI_Projects/MatchMeter/index.html';

  test.beforeEach(async ({ page }) => {
    await page.goto(appUrl);
    await page.waitForLoadState('networkidle');
  });

  test('Basic functionality test', async ({ page }) => {
    // Check if page loads
    await expect(page).toHaveTitle('Match Meter - 매치미터');
    
    // Check main elements exist
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#name1')).toBeVisible();
    await expect(page.locator('#name2')).toBeVisible();
    await expect(page.locator('#calculateButton')).toBeVisible();
    
    // Test basic calculation
    await page.fill('#name1', '김민수');
    await page.fill('#name2', '이영희');
    await page.click('#calculateButton');
    
    // Wait for result
    await page.waitForTimeout(4000);
    
    // Check result appears
    await expect(page.locator('#result .score-percentage')).toBeVisible();
    await expect(page.locator('#explanation .line')).toHaveCountGreaterThan(0);
  });

  test('Language toggle test', async ({ page }) => {
    // Initial Korean state
    await expect(page.locator('#toggleText')).toContainText('EN');
    
    // Toggle to English
    await page.click('#languageToggle');
    await expect(page.locator('#toggleText')).toContainText('KR');
    await expect(page.locator('#subtitle')).toContainText('Name Compatibility Calculator');
    
    // Toggle back to Korean
    await page.click('#languageToggle');
    await expect(page.locator('#toggleText')).toContainText('EN');
    await expect(page.locator('#subtitle')).toContainText('매치미터');
  });

  test('Input validation test', async ({ page }) => {
    // Test empty input error
    await page.click('#calculateButton');
    await expect(page.locator('#result')).toContainText('두 이름을 모두 입력해주세요!');
    
    // Test single input error
    await page.fill('#name1', '김민수');
    await page.click('#calculateButton');
    await expect(page.locator('#result')).toContainText('두 이름을 모두 입력해주세요!');
  });
});
const { test, expect } = require('@playwright/test');

test.describe('MatchMeter Quick Validation Tests', () => {
  const appUrl = 'file:///C:/Users/surro/Downloads/AI_Projects/MatchMeter/index.html';

  test.beforeEach(async ({ page }) => {
    await page.goto(appUrl);
    await page.waitForLoadState('networkidle');
  });

  test('should load page with Korean as default', async ({ page }) => {
    await expect(page).toHaveTitle('Match Meter - 매치미터');
    await expect(page.locator('#subtitle')).toContainText('매치미터');
    await expect(page.locator('#toggleText')).toContainText('EN');
  });

  test('should toggle language successfully', async ({ page }) => {
    // Initial Korean state
    await expect(page.locator('#toggleText')).toContainText('EN');
    
    // Click to switch to English
    await page.click('#languageToggle');
    await expect(page.locator('#toggleText')).toContainText('KR');
    await expect(page.locator('#subtitle')).toContainText('Name Compatibility Calculator');
  });

  test('should show error for empty input', async ({ page }) => {
    await page.click('#calculateButton');
    await expect(page.locator('#result')).toContainText('두 이름을 모두 입력해주세요!');
  });

  test('should calculate Korean names', async ({ page }) => {
    await page.fill('#name1', '김민수');
    await page.fill('#name2', '이영희');
    await page.click('#calculateButton');
    
    // Wait for calculation to complete
    await page.waitForTimeout(5000);
    
    // Should show result
    await expect(page.locator('#result .score-percentage')).toBeVisible();
    const stepCount = await page.locator('#explanation .line').count();
    expect(stepCount).toBeGreaterThan(0);
  });

  test('should calculate English names', async ({ page }) => {
    // Switch to English
    await page.click('#languageToggle');
    
    await page.fill('#name1', 'John');
    await page.fill('#name2', 'Jane');
    await page.click('#calculateButton');
    
    // Wait for calculation to complete
    await page.waitForTimeout(5000);
    
    // Should show result
    await expect(page.locator('#result .score-percentage')).toBeVisible();
    await expect(page.locator('#strokeInfo')).toBeVisible();
  });

  test('should display share button after calculation', async ({ page }) => {
    await page.fill('#name1', '김민수');
    await page.fill('#name2', '이영희');
    await page.click('#calculateButton');
    
    await page.waitForTimeout(5000);
    
    await expect(page.locator('.share-button')).toBeVisible();
    await expect(page.locator('.share-button-text')).toContainText('결과 공유하기');
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.fill('#name1', '김민수');
    await page.fill('#name2', '이영희');
    await page.tap('#calculateButton'); // Use tap for mobile
    
    await page.waitForTimeout(5000);
    
    await expect(page.locator('#result .score-percentage')).toBeVisible();
  });

  test('should handle special characters gracefully', async ({ page }) => {
    await page.fill('#name1', '김민수!@#');
    await page.fill('#name2', '이영희$%^');
    await page.click('#calculateButton');
    
    await page.waitForTimeout(5000);
    
    // Should handle gracefully and show some result
    await expect(page.locator('#result .score-percentage')).toBeVisible();
  });

  test('should maintain state when switching languages after calculation', async ({ page }) => {
    // Calculate in Korean
    await page.fill('#name1', '김민수');
    await page.fill('#name2', '이영희');
    await page.click('#calculateButton');
    await page.waitForTimeout(5000);
    
    const koreanScore = await page.locator('#result .score-percentage').textContent();
    
    // Switch to English
    await page.click('#languageToggle');
    
    // Score should remain the same
    await expect(page.locator('#result .score-percentage')).toContainText(koreanScore);
    
    // Share button should update to English
    await expect(page.locator('.share-button-text')).toContainText('Share Results');
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through elements
    await page.keyboard.press('Tab'); // Skip link
    await page.keyboard.press('Tab'); // Language toggle
    await expect(page.locator('#languageToggle')).toBeFocused();
    
    await page.keyboard.press('Tab'); // First input
    await expect(page.locator('#name1')).toBeFocused();
    
    await page.keyboard.press('Tab'); // Second input
    await expect(page.locator('#name2')).toBeFocused();
  });
});
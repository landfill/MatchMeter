const { test, expect } = require('@playwright/test');

test.describe('Match Meter E2E Tests', () => {
  const appUrl = 'file:///C:/Users/surro/Downloads/AI_Projects/MatchMeter/index.html';

  test.beforeEach(async ({ page }) => {
    await page.goto(appUrl);
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
  });

  test.describe('1. Page Loading and Initial State', () => {
    test('should load page successfully with Korean as default language', async ({ page }) => {
      // Check page title
      await expect(page).toHaveTitle('Match Meter - 매치미터');
      
      // Check main title is visible
      await expect(page.locator('h1')).toContainText('Match Meter');
      
      // Check subtitle is in Korean
      await expect(page.locator('#subtitle')).toContainText('매치미터 - 이름으로 알아보는 궁합 지수');
      
      // Check language toggle shows "EN" (indicating current language is Korean)
      await expect(page.locator('#toggleText')).toContainText('EN');
      
      // Check input labels are in Korean
      await expect(page.locator('#label1')).toContainText('📝 첫 번째 이름');
      await expect(page.locator('#label2')).toContainText('📝 두 번째 이름');
      
      // Check calculate button is in Korean
      await expect(page.locator('#calculateButton')).toContainText('Match 측정하기');
    });

    test('should have all required UI elements visible', async ({ page }) => {
      // Check skip link for accessibility
      await expect(page.locator('.skip-link')).toBeAttached();
      
      // Check language toggle button
      await expect(page.locator('#languageToggle')).toBeVisible();
      
      // Check input fields
      await expect(page.locator('#name1')).toBeVisible();
      await expect(page.locator('#name2')).toBeVisible();
      
      // Check calculate button
      await expect(page.locator('#calculateButton')).toBeVisible();
      
      // Check result section exists (initially empty)
      await expect(page.locator('#result')).toBeAttached();
      
      // Check progress bar exists
      await expect(page.locator('.mobile-progress-bar')).toBeVisible();
    });

    test('should have proper accessibility attributes', async ({ page }) => {
      // Check aria labels
      await expect(page.locator('#languageToggle')).toHaveAttribute('aria-label', '언어 변경 (현재: 한국어)');
      await expect(page.locator('#calculateButton')).toHaveAttribute('aria-label', '입력한 두 이름의 궁합 점수를 계산합니다');
      
      // Check input field accessibility
      await expect(page.locator('#name1')).toHaveAttribute('aria-required', 'true');
      await expect(page.locator('#name2')).toHaveAttribute('aria-required', 'true');
      await expect(page.locator('#name1')).toHaveAttribute('aria-invalid', 'false');
      await expect(page.locator('#name2')).toHaveAttribute('aria-invalid', 'false');
      
      // Check progress bar accessibility
      await expect(page.locator('.mobile-progress-bar')).toHaveAttribute('role', 'progressbar');
      await expect(page.locator('.mobile-progress-bar')).toHaveAttribute('aria-valuemin', '0');
      await expect(page.locator('.mobile-progress-bar')).toHaveAttribute('aria-valuemax', '100');
    });
  });

  test.describe('2. Language Toggle Functionality', () => {
    test('should toggle between Korean and English', async ({ page }) => {
      // Initial state should be Korean
      await expect(page.locator('#toggleText')).toContainText('EN');
      await expect(page.locator('#subtitle')).toContainText('매치미터');
      
      // Click language toggle
      await page.click('#languageToggle');
      
      // Should switch to English
      await expect(page.locator('#toggleText')).toContainText('KR');
      await expect(page.locator('#subtitle')).toContainText('Match Meter - Name Compatibility Calculator');
      await expect(page.locator('#label1')).toContainText('👽 Your Name');
      await expect(page.locator('#label2')).toContainText('🤖 Their Name');
      await expect(page.locator('#calculateButton')).toContainText('Calculate Match');
      
      // Click again to switch back to Korean
      await page.click('#languageToggle');
      
      // Should be back to Korean
      await expect(page.locator('#toggleText')).toContainText('EN');
      await expect(page.locator('#subtitle')).toContainText('매치미터');
      await expect(page.locator('#label1')).toContainText('📝 첫 번째 이름');
    });

    test('should update placeholders when language is toggled', async ({ page }) => {
      // Check Korean placeholders
      await expect(page.locator('#name1')).toHaveAttribute('placeholder', '예: 김하늘');
      await expect(page.locator('#name2')).toHaveAttribute('placeholder', '예: 박바다');
      
      // Switch to English
      await page.click('#languageToggle');
      
      // Check English placeholders
      await expect(page.locator('#name1')).toHaveAttribute('placeholder', 'e.g: Donald Trump');
      await expect(page.locator('#name2')).toHaveAttribute('placeholder', 'e.g: Elon Musk');
    });

    test('should update accessibility attributes when language is toggled', async ({ page }) => {
      // Check Korean accessibility attributes
      await expect(page.locator('#languageToggle')).toHaveAttribute('aria-label', '언어 변경 (현재: 한국어)');
      
      // Switch to English
      await page.click('#languageToggle');
      
      // Check English accessibility attributes
      await expect(page.locator('#languageToggle')).toHaveAttribute('aria-label', 'Change language (Current: English)');
      await expect(page.locator('#calculateButton')).toHaveAttribute('aria-label', 'Calculate compatibility score for the entered names');
    });
  });

  test.describe('3. Input Field Validation', () => {
    test('should accept Korean names', async ({ page }) => {
      await page.fill('#name1', '김민수');
      await page.fill('#name2', '이영희');
      
      // Check values are properly set
      await expect(page.locator('#name1')).toHaveValue('김민수');
      await expect(page.locator('#name2')).toHaveValue('이영희');
    });

    test('should accept English names', async ({ page }) => {
      // Switch to English first
      await page.click('#languageToggle');
      
      await page.fill('#name1', 'John Smith');
      await page.fill('#name2', 'Jane Doe');
      
      // Check values are properly set
      await expect(page.locator('#name1')).toHaveValue('John Smith');
      await expect(page.locator('#name2')).toHaveValue('Jane Doe');
    });

    test('should show error when trying to calculate with empty inputs', async ({ page }) => {
      // Try to calculate without filling inputs
      await page.click('#calculateButton');
      
      // Should show error message
      await expect(page.locator('#result')).toContainText('두 이름을 모두 입력해주세요!');
    });

    test('should show error when only one name is filled', async ({ page }) => {
      await page.fill('#name1', '김민수');
      // Leave name2 empty
      
      await page.click('#calculateButton');
      
      // Should show error message
      await expect(page.locator('#result')).toContainText('두 이름을 모두 입력해주세요!');
    });

    test('should handle names with spaces', async ({ page }) => {
      await page.fill('#name1', '김 민 수');
      await page.fill('#name2', '이 영 희');
      
      await page.click('#calculateButton');
      
      // Should proceed with calculation (spaces should be handled)
      // Wait for calculation to complete
      await page.waitForTimeout(3000);
      
      // Check that result is displayed (not error message)
      const resultText = await page.locator('#result').textContent();
      expect(resultText).not.toContain('두 이름을 모두 입력해주세요!');
    });
  });

  test.describe('4. Core Calculation Functionality', () => {
    test('should calculate Korean name compatibility', async ({ page }) => {
      await page.fill('#name1', '김민수');
      await page.fill('#name2', '이영희');
      
      await page.click('#calculateButton');
      
      // Wait for calculation animation to complete
      await page.waitForTimeout(3000);
      
      // Check that calculation steps are displayed
      const stepCount = await page.locator('#explanation .line').count();
      expect(stepCount).toBeGreaterThan(0); // Should show calculation steps
      
      // Check that result is displayed
      await expect(page.locator('#result .score-percentage')).toBeVisible();
      await expect(page.locator('#result .message-positive')).toBeVisible();
      await expect(page.locator('#result .message-negative')).toBeVisible();
      
      // Check that progress bar is updated
      const progressBar = page.locator('#bar');
      const width = await progressBar.getAttribute('style');
      expect(width).toContain('width:');
      expect(width).not.toContain('width: 0');
    });

    test('should calculate English name compatibility', async ({ page }) => {
      // Switch to English
      await page.click('#languageToggle');
      
      await page.fill('#name1', 'John');
      await page.fill('#name2', 'Jane');
      
      await page.click('#calculateButton');
      
      // Wait for calculation animation to complete
      await page.waitForTimeout(3000);
      
      // Check that calculation steps are displayed
      const stepCount = await page.locator('#explanation .line').count();
      expect(stepCount).toBeGreaterThan(0); // Should show calculation steps
      
      // Check that result is displayed with English messages
      await expect(page.locator('#result .score-percentage')).toBeVisible();
      
      // Check stroke info is displayed for English
      await expect(page.locator('#strokeInfo')).toBeVisible();
      await expect(page.locator('#strokeInfoText')).toContainText('English letters calculated by uppercase strokes');
    });

    test('should calculate mixed Korean-English names', async ({ page }) => {
      await page.fill('#name1', '김John');
      await page.fill('#name2', 'Jane이');
      
      await page.click('#calculateButton');
      
      // Wait for calculation animation to complete
      await page.waitForTimeout(3000);
      
      // Should handle mixed names and show result
      await expect(page.locator('#result .score-percentage')).toBeVisible();
    });

    test('should reset previous results before new calculation', async ({ page }) => {
      // First calculation
      await page.fill('#name1', '김민수');
      await page.fill('#name2', '이영희');
      await page.click('#calculateButton');
      await page.waitForTimeout(3000);
      
      // Verify first result exists
      await expect(page.locator('#result .score-percentage')).toBeVisible();
      
      // Clear and do second calculation
      await page.fill('#name1', '');
      await page.fill('#name2', '');
      await page.fill('#name1', '박철수');
      await page.fill('#name2', '김영미');
      await page.click('#calculateButton');
      
      // Should clear previous results immediately
      await page.waitForTimeout(500);
      
      // Previous results should be cleared
      const explanationContent = await page.locator('#explanation').innerHTML();
      expect(explanationContent).toBe('');
      
      // Wait for new calculation
      await page.waitForTimeout(3000);
      
      // New result should be displayed
      await expect(page.locator('#result .score-percentage')).toBeVisible();
    });
  });

  test.describe('5. Result Display and Animation', () => {
    test('should display calculation steps with proper timing', async ({ page }) => {
      await page.fill('#name1', '김민수');
      await page.fill('#name2', '이영희');
      
      await page.click('#calculateButton');
      
      // Check that steps appear progressively
      await page.waitForTimeout(500);
      const firstStepCount = await page.locator('#explanation .line').count();
      expect(firstStepCount).toBeGreaterThan(0);
      
      await page.waitForTimeout(500);
      const secondStepCount = await page.locator('#explanation .line').count();
      expect(secondStepCount).toBeGreaterThanOrEqual(firstStepCount);
      
      await page.waitForTimeout(500);
      const finalStepCount = await page.locator('#explanation .line').count();
      expect(finalStepCount).toBeGreaterThanOrEqual(secondStepCount);
    });

    test('should display result with proper structure', async ({ page }) => {
      await page.fill('#name1', '김민수');
      await page.fill('#name2', '이영희');
      
      await page.click('#calculateButton');
      await page.waitForTimeout(3000);
      
      // Check result structure
      await expect(page.locator('#result .result-container')).toBeVisible();
      await expect(page.locator('#result .score-text')).toBeVisible();
      await expect(page.locator('#result .score-percentage')).toBeVisible();
      await expect(page.locator('#result .message-positive')).toBeVisible();
      await expect(page.locator('#result .message-negative')).toBeVisible();
      
      // Check that score text includes both names
      await expect(page.locator('#result .score-text')).toContainText('김민수');
      await expect(page.locator('#result .score-text')).toContainText('이영희');
    });

    test('should update progress bar with correct percentage', async ({ page }) => {
      await page.fill('#name1', '김민수');
      await page.fill('#name2', '이영희');
      
      await page.click('#calculateButton');
      await page.waitForTimeout(3000);
      
      // Get the percentage from result
      const percentageText = await page.locator('#result .score-percentage').textContent();
      const percentage = parseInt(percentageText.replace('%', ''));
      
      // Check that progress bar matches
      const progressBar = page.locator('.mobile-progress-bar');
      const ariaValueNow = await progressBar.getAttribute('aria-valuenow');
      expect(parseInt(ariaValueNow)).toBe(percentage);
      
      // Check bar width
      const bar = page.locator('#bar');
      const style = await bar.getAttribute('style');
      expect(style).toContain(`width: ${percentage}%`);
    });

    test('should display appropriate messages for different score ranges', async ({ page }) => {
      // Test with names that should give a high score
      await page.fill('#name1', '가');
      await page.fill('#name2', '가');
      
      await page.click('#calculateButton');
      await page.waitForTimeout(3000);
      
      // Should show some result
      await expect(page.locator('#result .message-positive')).toBeVisible();
      await expect(page.locator('#result .message-negative')).toBeVisible();
      
      // Messages should contain appropriate emojis
      const positiveMessage = await page.locator('#result .message-positive').textContent();
      const negativeMessage = await page.locator('#result .message-negative').textContent();
      
      expect(positiveMessage).toContain('✅');
      expect(negativeMessage).toContain('⚠️');
    });
  });

  test.describe('6. Share Functionality', () => {
    test('should display share button after calculation', async ({ page }) => {
      await page.fill('#name1', '김민수');
      await page.fill('#name2', '이영희');
      
      await page.click('#calculateButton');
      await page.waitForTimeout(3000);
      
      // Share button should appear after calculation
      await expect(page.locator('.share-button')).toBeVisible();
      await expect(page.locator('.share-button-text')).toContainText('결과 공유하기');
    });

    test('should update share button text when language is changed', async ({ page }) => {
      // Calculate result first
      await page.fill('#name1', '김민수');
      await page.fill('#name2', '이영희');
      await page.click('#calculateButton');
      await page.waitForTimeout(3000);
      
      // Verify Korean share button
      await expect(page.locator('.share-button-text')).toContainText('결과 공유하기');
      
      // Switch to English
      await page.click('#languageToggle');
      
      // Share button text should update
      await expect(page.locator('.share-button-text')).toContainText('Share Results');
    });
  });

  test.describe('7. Accessibility Features', () => {
    test('should support keyboard navigation', async ({ page }) => {
      // Tab through focusable elements
      await page.keyboard.press('Tab'); // Skip link
      await page.keyboard.press('Tab'); // Language toggle
      await expect(page.locator('#languageToggle')).toBeFocused();
      
      await page.keyboard.press('Tab'); // First name input
      await expect(page.locator('#name1')).toBeFocused();
      
      await page.keyboard.press('Tab'); // Second name input
      await expect(page.locator('#name2')).toBeFocused();
      
      await page.keyboard.press('Tab'); // Calculate button
      await expect(page.locator('#calculateButton')).toBeFocused();
    });

    test('should allow form submission with Enter key', async ({ page }) => {
      await page.fill('#name1', '김민수');
      await page.focus('#name2');
      await page.fill('#name2', '이영희');
      
      // Press Enter in second input should trigger calculation
      await page.keyboard.press('Enter');
      
      // Should start calculation
      await page.waitForTimeout(1000);
      await expect(page.locator('#explanation .line')).toHaveCount(1);
    });

    test('should support skip link functionality', async ({ page }) => {
      // Focus skip link (initially off-screen)
      await page.keyboard.press('Tab');
      
      // Skip link should be visible when focused
      const skipLink = page.locator('.skip-link');
      await expect(skipLink).toBeFocused();
      
      // Pressing Enter should jump to main content
      await page.keyboard.press('Enter');
      await expect(page.locator('#main-content')).toBeFocused();
    });

    test('should have proper ARIA live regions', async ({ page }) => {
      // Result section should have aria-live
      await expect(page.locator('#result')).toHaveAttribute('aria-live', 'polite');
      
      // Fill names and calculate
      await page.fill('#name1', '김민수');
      await page.fill('#name2', '이영희');
      await page.click('#calculateButton');
      
      // Wait for calculation
      await page.waitForTimeout(3000);
      
      // Results section should have role="region"
      await expect(page.locator('.mobile-results-section')).toHaveAttribute('role', 'region');
    });
  });

  test.describe('8. Mobile Responsiveness', () => {
    test('should work properly on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check that mobile-specific classes are working
      await expect(page.locator('.mobile-container')).toBeVisible();
      await expect(page.locator('.mobile-input-section')).toBeVisible();
      
      // Test input on mobile
      await page.fill('#name1', '김민수');
      await page.fill('#name2', '이영희');
      await page.click('#calculateButton');
      
      await page.waitForTimeout(3000);
      
      // Should still work on mobile
      await expect(page.locator('#result .score-percentage')).toBeVisible();
    });

    test('should handle touch interactions', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Simulate touch events
      await page.tap('#name1');
      await page.fill('#name1', '김민수');
      
      await page.tap('#name2');
      await page.fill('#name2', '이영희');
      
      await page.tap('#calculateButton');
      
      await page.waitForTimeout(3000);
      await expect(page.locator('#result .score-percentage')).toBeVisible();
    });
  });

  test.describe('9. Error Handling and Edge Cases', () => {
    test('should handle very long names', async ({ page }) => {
      const longName1 = '김'.repeat(50);
      const longName2 = '이'.repeat(50);
      
      await page.fill('#name1', longName1);
      await page.fill('#name2', longName2);
      
      await page.click('#calculateButton');
      await page.waitForTimeout(5000); // Allow extra time for long calculation
      
      // Should still produce a result
      await expect(page.locator('#result .score-percentage')).toBeVisible();
    });

    test('should handle special characters gracefully', async ({ page }) => {
      await page.fill('#name1', '김민수!@#');
      await page.fill('#name2', '이영희$%^');
      
      await page.click('#calculateButton');
      await page.waitForTimeout(3000);
      
      // Should handle gracefully (may filter out special chars)
      await expect(page.locator('#result .score-percentage')).toBeVisible();
    });

    test('should handle numbers in names', async ({ page }) => {
      await page.fill('#name1', '김민수123');
      await page.fill('#name2', '이영희456');
      
      await page.click('#calculateButton');
      await page.waitForTimeout(3000);
      
      // Should handle gracefully
      await expect(page.locator('#result .score-percentage')).toBeVisible();
    });
  });

  test.describe('10. Performance and Reliability', () => {
    test('should handle rapid successive calculations', async ({ page }) => {
      const names = [
        ['김민수', '이영희'],
        ['박철수', '김영미'],
        ['최진우', '한소영']
      ];
      
      for (const [name1, name2] of names) {
        await page.fill('#name1', '');
        await page.fill('#name2', '');
        await page.fill('#name1', name1);
        await page.fill('#name2', name2);
        await page.click('#calculateButton');
        await page.waitForTimeout(500); // Don't wait for full animation
      }
      
      // Final calculation should complete properly
      await page.waitForTimeout(3000);
      await expect(page.locator('#result .score-percentage')).toBeVisible();
    });

    test('should maintain state consistency during language switching', async ({ page }) => {
      // Fill names
      await page.fill('#name1', '김민수');
      await page.fill('#name2', '이영희');
      
      // Calculate
      await page.click('#calculateButton');
      await page.waitForTimeout(3000);
      
      // Get Korean result
      const koreanResult = await page.locator('#result .score-percentage').textContent();
      
      // Switch language
      await page.click('#languageToggle');
      
      // Result should remain the same percentage
      await expect(page.locator('#result .score-percentage')).toContainText(koreanResult);
      
      // But messages should be in English now
      const positiveMessage = await page.locator('#result .message-positive').textContent();
      // Should not contain Korean characters
      expect(positiveMessage).not.toMatch(/[가-힣]/);
    });
  });
});
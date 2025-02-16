import { test, expect } from '@playwright/test';

test.describe('Birth Time Calculation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('completes birth time calculation successfully', async ({ page }) => {
    // Fill in birth details
    await page.fill('[data-testid="birth-date-input"]', '1990-01-01');
    await page.fill('[data-testid="birth-location-input"]', 'New York, USA');
    await page.fill('[data-testid="birth-time-range-start"]', '12:00');
    await page.fill('[data-testid="birth-time-range-end"]', '14:00');

    // Answer questionnaire
    await page.click('[data-testid="start-questionnaire"]');
    
    // Complete all questions
    const questions = await page.locator('[data-testid="question-item"]').all();
    for (const question of questions) {
      await question.locator('input[type="radio"]').first().click();
      await page.click('[data-testid="next-question"]');
    }

    // Calculate birth time
    await page.click('[data-testid="calculate-button"]');

    // Wait for results
    await expect(page.locator('[data-testid="result-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="confidence-score"]')).toBeVisible();

    // Verify results format
    const birthTime = await page.locator('[data-testid="calculated-birth-time"]').textContent();
    expect(birthTime).toMatch(/^\d{2}:\d{2}$/);

    // Check chart elements
    await expect(page.locator('[data-testid="planet-sun"]')).toBeVisible();
    await expect(page.locator('[data-testid="planet-moon"]')).toBeVisible();
    await expect(page.locator('[data-testid="ascendant-line"]')).toBeVisible();

    // Verify PDF report generation
    await page.click('[data-testid="generate-report"]');
    const download = await page.waitForEvent('download');
    expect(download.suggestedFilename()).toMatch(/birth-time-report.*\.pdf$/);
  });

  test('handles validation errors appropriately', async ({ page }) => {
    // Try to calculate without required fields
    await page.click('[data-testid="calculate-button"]');
    
    // Check error messages
    await expect(page.locator('[data-testid="birth-date-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="birth-location-error"]')).toBeVisible();
    
    // Fill invalid data
    await page.fill('[data-testid="birth-date-input"]', 'invalid-date');
    await expect(page.locator('[data-testid="birth-date-error"]')).toHaveText('Please enter a valid date');
  });

  test('persists data between sessions', async ({ page }) => {
    // Fill data
    await page.fill('[data-testid="birth-date-input"]', '1990-01-01');
    await page.fill('[data-testid="birth-location-input"]', 'New York, USA');
    
    // Reload page
    await page.reload();
    
    // Verify data persisted
    await expect(page.locator('[data-testid="birth-date-input"]')).toHaveValue('1990-01-01');
    await expect(page.locator('[data-testid="birth-location-input"]')).toHaveValue('New York, USA');
  });
}); 
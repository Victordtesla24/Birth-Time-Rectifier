import { test, expect } from '@playwright/test';

test.describe('Birth Time Rectification Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('complete birth time rectification process', async ({ page }) => {
        // Step 1: Enter birth data
        await test.step('Enter birth data', async () => {
            await page.fill('[data-testid="birth-date-input"]', '1990-01-01');
            await page.fill('[data-testid="birth-time-input"]', '12:00');
            await page.fill('[data-testid="latitude-input"]', '0');
            await page.fill('[data-testid="longitude-input"]', '0');
            await page.fill('[data-testid="timezone-input"]', 'UTC');
            
            await page.click('[data-testid="submit-birth-data"]');
            
            // Verify data was accepted
            await expect(page.locator('[data-testid="birth-chart"]')).toBeVisible();
        });

        // Step 2: Answer questionnaire
        await test.step('Complete questionnaire', async () => {
            // Physical characteristics
            await page.fill('[data-testid="height-input"]', '180');
            await page.selectOption('[data-testid="build-select"]', 'Athletic');
            await page.selectOption('[data-testid="complexion-select"]', 'Fair');
            await page.click('[data-testid="next-button"]');

            // Life events
            await page.click('[data-testid="add-event-button"]');
            await page.fill('[data-testid="event-type-input"]', 'career');
            await page.fill('[data-testid="event-date-input"]', '2010-01-01');
            await page.fill('[data-testid="event-description-input"]', 'Started new job');
            await page.click('[data-testid="save-event-button"]');
            await page.click('[data-testid="next-button"]');

            // Verify questionnaire completion
            await expect(page.locator('[data-testid="questionnaire-complete"]')).toBeVisible();
        });

        // Step 3: View analysis results
        await test.step('View analysis results', async () => {
            // Check confidence visualization
            await expect(page.locator('[data-testid="confidence-meter"]')).toBeVisible();
            
            // Check ML insights
            await expect(page.locator('[data-testid="ml-insights"]')).toBeVisible();
            
            // Check predicted time
            const predictedTime = page.locator('[data-testid="predicted-time"]');
            await expect(predictedTime).toBeVisible();
            const timeText = await predictedTime.textContent();
            expect(timeText).toMatch(/^\d{2}:\d{2}$/);
            
            // Check confidence score
            const confidenceScore = page.locator('[data-testid="confidence-score"]');
            await expect(confidenceScore).toBeVisible();
            const scoreText = await confidenceScore.textContent();
            const score = parseFloat(scoreText!);
            expect(score).toBeGreaterThan(0);
            expect(score).toBeLessThanOrEqual(1);
        });

        // Step 4: Interact with visualization
        await test.step('Interact with visualization', async () => {
            // Test zoom controls
            await page.click('[data-testid="zoom-in-button"]');
            await page.click('[data-testid="zoom-out-button"]');
            
            // Test planet interaction
            await page.hover('[data-testid="planet-sun"]');
            await expect(page.locator('[data-testid="planet-tooltip"]')).toBeVisible();
            
            await page.click('[data-testid="planet-sun"]');
            await expect(page.locator('[data-testid="planet-details"]')).toBeVisible();
        });

        // Step 5: Check accessibility features
        await test.step('Verify accessibility features', async () => {
            // Test keyboard navigation
            await page.keyboard.press('Tab');
            const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
            expect(focusedElement).toBeTruthy();
            
            // Test screen reader announcements
            await expect(page.locator('[role="alert"]')).toBeVisible();
            
            // Test high contrast mode
            await page.click('[data-testid="high-contrast-toggle"]');
            await expect(page.locator('body')).toHaveAttribute('data-theme', 'high-contrast');
        });
    });

    test('handles invalid birth data gracefully', async ({ page }) => {
        // Enter invalid date
        await page.fill('[data-testid="birth-date-input"]', 'invalid-date');
        await page.click('[data-testid="submit-birth-data"]');
        
        // Check error message
        await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
        await expect(page.locator('[data-testid="error-message"]')).toHaveText('Invalid date format. Use YYYY-MM-DD');
        
        // Enter invalid time
        await page.fill('[data-testid="birth-date-input"]', '1990-01-01');
        await page.fill('[data-testid="birth-time-input"]', '25:00');
        await page.click('[data-testid="submit-birth-data"]');
        
        // Check error message
        await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
        await expect(page.locator('[data-testid="error-message"]')).toHaveText('Invalid time format. Use HH:mm (24-hour)');
    });

    test('saves and restores progress', async ({ page }) => {
        // Enter initial data
        await page.fill('[data-testid="birth-date-input"]', '1990-01-01');
        await page.fill('[data-testid="birth-time-input"]', '12:00');
        await page.click('[data-testid="submit-birth-data"]');
        
        // Refresh page
        await page.reload();
        
        // Verify data is restored
        await expect(page.locator('[data-testid="birth-date-input"]')).toHaveValue('1990-01-01');
        await expect(page.locator('[data-testid="birth-time-input"]')).toHaveValue('12:00');
    });
}); 
import { test, expect } from '@playwright/test';
import { mockChartData } from '../fixtures/mockChartData';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('Birth Time Calculation Flow', () => {
  test('successfully calculates birth time and displays results', async ({ page }) => {
    // Fill in birth details
    await page.getByLabel('Birth Date').fill('1990-01-01');
    await page.getByLabel('Birth Location').fill('New York, NY, USA');
    await page.getByRole('option', { name: 'New York, NY, USA' }).click();

    // Answer questionnaire
    await page.getByRole('button', { name: 'Start Questionnaire' }).click();

    // Answer multiple choice question
    await page.getByLabel('Were you born in the morning, afternoon, or night?')
      .selectOption('afternoon');

    // Answer slider question
    await page.getByLabel('How confident are you about this information?')
      .fill('80');

    // Submit questionnaire
    await page.getByRole('button', { name: 'Calculate Birth Time' }).click();

    // Wait for calculation to complete
    await expect(page.getByTestId('calculation-progress')).toBeVisible();
    await expect(page.getByTestId('calculation-result')).toBeVisible();

    // Verify results
    const birthTime = await page.getByTestId('calculated-birth-time').textContent();
    expect(birthTime).toMatch(/^\d{2}:\d{2}$/);

    const confidence = await page.getByTestId('calculation-confidence').textContent();
    expect(parseFloat(confidence)).toBeGreaterThan(0);
    expect(parseFloat(confidence)).toBeLessThanOrEqual(1);

    // Check birth chart visualization
    await expect(page.getByTestId('birth-chart-svg')).toBeVisible();
    await expect(page.getByTestId('planet-sun')).toBeVisible();
    await expect(page.getByTestId('house-1')).toBeVisible();

    // Generate and download PDF report
    await page.getByRole('button', { name: 'Generate Report' }).click();
    const download = await page.waitForEvent('download');
    expect(download.suggestedFilename()).toContain('birth-time-report');
  });

  test('displays validation errors for missing required fields', async ({ page }) => {
    // Try to submit without required fields
    await page.getByRole('button', { name: 'Start Questionnaire' }).click();

    // Check for validation errors
    await expect(page.getByText('Birth date is required')).toBeVisible();
    await expect(page.getByText('Birth location is required')).toBeVisible();

    // Fill birth date but leave location empty
    await page.getByLabel('Birth Date').fill('1990-01-01');
    await page.getByRole('button', { name: 'Start Questionnaire' }).click();

    // Check that location error persists
    await expect(page.getByText('Birth location is required')).toBeVisible();
  });

  test('persists data between page reloads', async ({ page }) => {
    // Fill in birth details
    await page.getByLabel('Birth Date').fill('1990-01-01');
    await page.getByLabel('Birth Location').fill('New York, NY, USA');
    await page.getByRole('option', { name: 'New York, NY, USA' }).click();

    // Reload the page
    await page.reload();

    // Verify data persists
    await expect(page.getByLabel('Birth Date')).toHaveValue('1990-01-01');
    await expect(page.getByLabel('Birth Location')).toHaveValue('New York, NY, USA');
  });
}); 
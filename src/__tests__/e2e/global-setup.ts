import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
    const { baseURL, storageState } = config.projects[0].use;
    
    // Setup authentication state if needed
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    if (baseURL) {
        await page.goto(baseURL);
        
        // Add any authentication setup here if needed
        // For example:
        // await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL);
        // await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD);
        // await page.click('button[type="submit"]');
        
        // Save authentication state
        if (storageState) {
            await page.context().storageState({ path: storageState as string });
        }
    }
    
    await browser.close();
}

export default globalSetup; 
import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
    // Clean up any test artifacts
    const testResultsDir = path.join(process.cwd(), 'test-results');
    if (fs.existsSync(testResultsDir)) {
        const files = fs.readdirSync(testResultsDir);
        for (const file of files) {
            if (file.endsWith('.failed.txt')) {
                fs.unlinkSync(path.join(testResultsDir, file));
            }
        }
    }
    
    // Clean up any test data
    // For example:
    // await cleanupTestDatabase();
    // await cleanupTestStorage();
    
    // Reset any environment changes
    process.env.TEST_MODE = undefined;
}

export default globalTeardown; 
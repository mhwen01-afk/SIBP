const { chromium } = require('playwright');
const { GenerateSession } = require('./session.js');

async function createBrowserSession() {
    const browser = await chromium.launch({ 
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--window-size=1280,720'
        ]
    });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 } 
    });
    const page = await context.newPage();
    const sessionData = await GenerateSession();

    return { browser, context, page, sessionData };
}

module.exports = createBrowserSession;
const { chromium } = require('playwright');
const { GenerateSession } = require('./session.js');

async function createBrowserSession() {
    const browser = await chromium.launch({ 
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--window-size=1280,720',
            '--force-device-scale-factor=1',
            '--disable-web-security',
            '--run-all-compositor-stages-before-draw',
            '--disable-features=TranslateUI'
        ]
    });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }, 
        deviceScaleFactor: 1
    });
    const page = await context.newPage();

    await page.addInitScript(()=>{
      window.requestAnimationFrame = (cb) => setTimeout(cb, 16);
    });

    const sessionData = await GenerateSession();

    return { browser, context, page, sessionData };
}

module.exports = createBrowserSession;
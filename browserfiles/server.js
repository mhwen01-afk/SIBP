const { chromium } = require('playwright');
const { GenerateSession } = require('./session.js');


async function createBrowserSession() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    const sessionData = await GenerateSession();
    

    return { browser, context, page, sessionData };
}

module.exports = createBrowserSession;
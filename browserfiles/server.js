const { chromium } = require('playwright');
const { GenerateSession } = require('./session.js');


async function createBrowserSession() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    const sessionData = await GenerateSession();
    page.on("framenavigated", async frame => {
        if (frame === page.mainFrame()) {
            const url = frame.url();

    // Send updated title + DOM after redirect
            ws.send(JSON.stringify({
              type: "loaded",
              title: await page.title(),
              url: url
            }));

        const domTree = await page.evaluate(() => {
            function serialize(node) {
                return {
                  tag: node.nodeType === 1 ? node.tagName : null,
                  attrs: node.nodeType === 1
                    ? Object.fromEntries([...node.attributes].map(a => [a.name, a.value]))
                   : {},
                     text: node.nodeType === 3 ? node.textContent : null,
                 children: [...node.childNodes].map(serialize)
                };
            }
        return serialize(document.body);
        });

    ws.send(JSON.stringify({
      type: "dom-full",
      tree: domTree
    }));
  }
});

    return { browser, context, page, sessionData };
}

module.exports = createBrowserSession;
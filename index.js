process.on("exit", code => {
  console.error("PROCESS EXITED WITH CODE:", code);
});
let LINK = '';
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });
const createBrowserSession = require("./browserfiles/session");
const userMap = ['a4ae1', 'n2ty2', 'r3et3', 'sl6y4', 't4pe2', '3kya5', '73me6', '9jpo7', '3esa8', '32ma9', '8wda10', '1jaa11', '24ch12', '3gal13', '7eaa14', '8lro15', '6#an16', '0ke157', '3msi18', '4sea19', 'd1ax20'];

async function getSessionAndPage(){
    const session = await createBrowserSession();
   const page = session.page;
   return {session, page};
}

wss.on("connection", ws => {
  console.log("Client connected");
   
    ws.on("message", message => {
        const data = JSON.parse(message);
        if (data.type === "navlink"){
            LINK = data.link;
            console.log("Received link:", LINK);
            await page.goto(data.link);
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
                type: "loaded",
                title: await page.title(),
                dom: domTree
            }));
        }
        if(data.type === "login"){
            const entercode = data.code;

        }
        if(data.inputType === "click"){
            page.mouse.click(data.x, data.y);
        }
        if(data.inputType === "keydown"){
            page.keyboard.press(data.key);
        }
        if (data.inputType === "input") {
            await page.evaluate(({path, value}) => {
                let node = document.body;
                for (const index of path) {
                  node = node.childNodes[index];
                }
                node.value = value;
                node.dispatchEvent(new Event("input", { bubbles: true }));
            }, data);
        }
        if(data.inputType === "scroll"){
            await page.evaluate(({x, y}) => {
                window.scrollTo(x, y);
            }, data);
        }
        if(data.inputType === "keyup"){
            page.keyboard.up(data.key);
        }
    });
});

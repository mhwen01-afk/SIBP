process.on("exit", code => {
  console.error("PROCESS EXITED WITH CODE:", code);
});
let LINK = '';
const WebSocket = require("ws");
const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });
console.log("WebSocket server listening on", PORT);
const createBrowserSession = require("./browserfiles/server.js");
const userMap = ['a4ae1', 'n2ty2', 'r3et3', 'sl6y4', 't4pe2', '3kya5', '73me6', '9jpo7', '3esa8', '32ma9', '8wda10', '1jaa11', '24ch12', '3gal13', '7eaa14', '8lro15', '6#an16', '0ke157', '3msi18', '4sea19', 'd1ax20'];



wss.on("connection",  async (socket)   =>  {
    //BUFFER SYSTEM TO AVOID MISSING MESSAGES DURING ASYNC SETUP
    const messageQueue = [];
    const bufferMessage = (msg) => messageQueue.push(msg);
    socket.on("message", bufferMessage);


    // --------------------------------------------------
    // SET UP BROWSER SESSION
    // --------------------------------------------------


    console.log("Client connected");
    const session = await createBrowserSession();
    console.log("Browser session created");
    const page = session.page;
    console.log("Page obtained from session");

    
    

    for (const msg of messageQueue) {
        await HandleMessage(msg);
    }
    socket.off("message", bufferMessage);
    socket.on("message", HandleMessage); 
    
    let capturing = false;
    const frameInterval = setInterval(async () => {
    if (capturing) return;
        capturing = true;
        try {
            const buffer = await page.screenshot({ type: "jpeg", quality: 80 });
            const base64 = buffer.toString('base64');
            socket.send(JSON.stringify({ type: "frame", data: base64 }));
        } catch (e) {
            clearInterval(frameInterval); // ← stop the interval if screenshot fails
        } finally {
           capturing = false; // ← use finally so capturing always resets
        }
    }, 18);

    async function HandleMessage(message){
        console.log("Message From Client. Type: ", message.type);
        const data = JSON.parse(message);
        if (data.type === "navlink"){
            console.log("Navigating to link: ", data.link);
            LINK = data.link;
            console.log("Received link:", LINK);
            await page.goto(data.link);
            console.log("Page loaded");
            
        }
        if(data.type === "login"){
            const entercode = data.code;

        }
        if(data.inputType === "click"){
            await page.mouse.click(data.x, data.y);
            await page.evaluate(({x,y}) => {
                const element = document.elementFromPoint(x, y);
                element.click();
            }, data);
            console.log("Mouse click at: ", data.x, ", ", data.y);
        }
        if(data.inputType === "keydown"){
            await page.keyboard.press(data.key);
            console.log("Key down: ", data.key);
        }
       
        if(data.inputType === "scroll"){
            await page.evaluate(({x, y}) => {
                window.scrollTo(x, y);
            }, data);
        }
        if(data.inputType === "keyup"){
            await page.keyboard.up(data.key);
            console.log("Key up: ", data.key);
        }
    };
    socket.on("close", () => {
        clearInterval(frameInterval);
        session.browser.close();
    });
});

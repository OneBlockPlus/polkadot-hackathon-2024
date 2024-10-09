import store from "./store-esm.js";

// from content.js to popup.js
chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'port-from-content') {
        port.onMessage.addListener((data) => {
            console.log('background.js received message from content.js:', data);
            
            // port.postMessage({msg: 'Data received'});

            if (data.type === "req" && data.content) {
                handleMsg(data).then(d => {
                    port.postMessage(d);//send to content.js
                });
            }
        });
    }
});

function handleMsg(data) {
    return new Promise((resolve, reject) => {
        console.log('background.js handleMsg:', data);
        if (data.way == "popup") {
            store.set("sendMessage",data);
            chrome.action.openPopup();
            let unsub= store.sub('background','sendMessage',(v)=>{
                resolve(v);
                unsub();
            });
            
        } else if (data.way == "hi") {
            setTimeout(() => {
                resolve({ msg: 'hi' });
            }, 2000);
        }
    });
}

console.log('backgroup init');
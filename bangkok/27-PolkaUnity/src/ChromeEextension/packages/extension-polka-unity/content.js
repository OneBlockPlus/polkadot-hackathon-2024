// long connect
let port = chrome.runtime.connect({ name: 'port-from-content' });
// port.postMessage({ msg: 'Hello from content script' });
//from backgroup,sent to html
port.onMessage.addListener((msg) => {
    window.postMessage(msg, "*");//send to html
});

window.addEventListener("message", async (event) => {
    console.log("content received message1:", event);
    let data = event.data;
    if (event.source !== window || !data || data.type == "res") return;
    console.log("content received message:", data);
    const cb = (content) => {
        window.postMessage({ msgId: data.msgId, type: "res", content }, "*");
    };
    if (data.way == "background"||data.way == "popup") {
        port.postMessage(data);//send to backgroup.js
        // chrome.runtime.sendMessage(data);
        // await chrome.runtime.sendMessage(data);
    } else if (data.way == "store-get") {
        let value=await store.get(data.content.key);
        cb({ value});
    } else if (data.way == "store-set") {
        let key = data.content.key;
        let value = data.content.value;
        store.set(key,value);
    } else {
        cb({ id: 1, name: "test" });
    }
    return true;
});
store.sub('content','hi',console.log);

window.onload = function () {
    $('#change').html('<h1>ok</h1>');
}



// long connect
let port = chrome.runtime.connect({ name: 'port-from-content' });
// port.postMessage({ msg: 'Hello from content script' });
//from backgroup,sent to html
port.onMessage.addListener((msg) => {
    window.postMessage(msg, "*");//send to html
});

window.addEventListener("message", async (event) => {
    let data = event.data;
    if (event.source !== window || !data || data.type == "res") return;
    console.log("content received message:", data);
    const cb = (content) => {
        window.postMessage({ msgId: data.msgId, type: "res", content }, "*");
    };
    if (data.way == "background" || data.way == "popup") {
        port.postMessage(data);//send to backgroup.js
        // chrome.runtime.sendMessage(data);
        // await chrome.runtime.sendMessage(data);
    } else if (data.way == "store-get") {
        let value = await store.get(data.content.key);
        cb({ value });
    } else if (data.way == "store-set") {
        let key = data.content.key;
        let value = data.content.value;
        store.set(key, value);
    } else {
        cb({ id: 1, name: "test" });
    }
    return true;
});
store.sub('content', 'hi', console.log);

window.onload = function () {
    let html =/* html */`
        <style>
            .my-btn-rom{
                display:flex;
                flex-direction:row;
                align-items:flex-end;
                justify-content:center;
                gap:10px;
                height:300px;
                padding-bottom:30px;
                background-image:url(https://pbs.twimg.com/media/GZ0ZRvtaEAA3Dn0?format=jpg&name=small);
                background-size:100%;
                button{
                    width: 20%;
                    height: 40px;
                    background-color: #03A9F4;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    text-align: center;
                    color: #fff;
                    box-shadow: 0 0 7px #00000063;
                    &:hover{
                        background-color:#0082bd;
                    }
                }
            }
        </style>
        <div class="my-btn-rom">
            <button id="btn001">Send Me 20</button>
            <button id="btn002">Send Me 80</button>
            <button id="btn003">Mint NFT</button>
        </div>
    `;
    setTimeout(() => {
        $($('a[href="https://t.co/6P6Dh1zMEl"]')[0]).parent().html(html);
        $("#btn001").click(function () {
            port.postMessage({
                msgId: "msg-" + new Date().getTime(),
                type: "req",
                way: "popup",
                content: { sourMessage: 'transfer' }
            });
        });
        $("#btn002").click(function () {
            port.postMessage({
                msgId: "msg-" + new Date().getTime(),
                type: "req",
                way: "popup",
                content: { sourMessage: 'transfer' }
            });
        });
        $("#btn003").click(function () {
            port.postMessage({
                msgId: "msg-" + new Date().getTime(),
                type: "req",
                way: "popup",
                content: { sourMessage: 'mint' }
            });
        });
    }, 3000);

}



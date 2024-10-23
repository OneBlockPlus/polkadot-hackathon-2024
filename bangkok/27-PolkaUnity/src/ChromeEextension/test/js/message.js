let allMsg = {};
export default function initMsg(cb) {
    window.addEventListener("message", (event) => {
        console.log("message.js receive message1", event);
        let data = event.data;
        if (event.source !== window || !data || data.type == 'req') return;
        console.log("message.js receive message", data || event);
        if (data.msgId && data.type == "res") {
            let resolve = allMsg[data.msgId];
            if (resolve && data.content) {
                resolve(data.content);
                delete allMsg[data.msgId];
            }
        }
        return true;
    });
    return (way, data) => {
        return new Promise((resolve, reject) => {
            let json = {
                msgId: "msg-" + new Date().getTime(),
                type: "req",
                way,
                content: data
            };
            allMsg[json.msgId] = resolve;
            window.postMessage(json, "*");
        });
    }
}
let store= {
    set, get, remove, clear, sub
}
let subKeys = null;
function sub(from, key, cb) {
    if (!subKeys) {
        subKeys = {};
        chrome.storage.onChanged.addListener(function (changes) {
            for (var k in changes) {
                var storageChange = changes[k];
                console.log(`Storage key ${k} changed:${storageChange.oldValue}=>${storageChange.newValue}`);
                if (subKeys[k]) {
                    Object.keys(subKeys[k]).forEach(t => subKeys[k][t](storageChange.newValue));
                }
            }
        });
    }
    if (!subKeys[key]) {
        subKeys[key] = {};
    }
    subKeys[key][from]=cb;
    return () => {
        delete subKeys[key][from];
    }
}

function set(key, value) {
    let obj = {};
    obj[key] = value;
    chrome.storage.local.set(obj);
}
function remove(key) {
    chrome.storage.local.remove(key);
}
function clear() {
    chrome.storage.local.clear();
}
async function get(key) {
    let v = await chrome.storage.local.get(key);
    if (v) {
        return v[key];
    }
    return null;
}
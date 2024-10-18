export default {
    set, get, remove, clear, sub
}
let subKeys = null;

let listener = null, store = null;
if (chrome?.storage) {
    listener = chrome.storage.onChanged.addListener;
    store = chrome.storage.local;
} else {
    listener = function (cb) {
        window.addEventListener('storage', function (event) {
            let obj = {};
            obj[event.key] = {};
            obj[event.key].oldValue = event.oldValue;
            obj[event.key].newValue = event.newValue;
            cb(obj);
        });
    };
    store = {
        set: function (key, value) {
            window.localStorage.setItem(key, JSON.stringify(value));
        },
        get: function (key) {
            return JSON.parse(window.localStorage.getItem(key));
        },
        remove: window.localStorage.removeItem,
        clear: window.localStorage.clear
    };
}
function sub(from, key, cb) {
    if (!subKeys) {
        subKeys = {};
        listener(function (changes) {
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
    subKeys[key][from] = cb;
    return () => {
        delete subKeys[key][from];
    }
}

function set(key, value) {
    let obj = {};
    obj[key] = value;
    store.set(obj);
}
function remove(key) {
    store.remove(key);
}
function clear() {
    store.clear();
}
async function get(key) {
    let v = await store.get(key);
    if (v) {
        return v[key];
    }
    return null;
}
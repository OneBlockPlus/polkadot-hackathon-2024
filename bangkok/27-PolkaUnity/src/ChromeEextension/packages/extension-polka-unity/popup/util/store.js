export default { get, set, remove, clear };

let keyPre = "wallet-";

function get(key) {
  let json = localStorage.getItem(keyPre + key);
  try {
    json = JSON.parse(json);
  } catch (e) {
    console.log(e);
  }
  return json;
}
function set(key, value) {
  localStorage.setItem(keyPre + key, JSON.stringify(value));
}
function remove(key) {
  localStorage.removeItem(keyPre + key);
}
function clear() {
  localStorage.clear();
}

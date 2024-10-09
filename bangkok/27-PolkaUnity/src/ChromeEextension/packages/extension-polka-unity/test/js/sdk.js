import initMsg from "./message.js";
import store from "./store.js";
let send=initMsg();

export default {
    sign
}
function sign(sourMessage){
    return send("popup",{sourMessage});
}
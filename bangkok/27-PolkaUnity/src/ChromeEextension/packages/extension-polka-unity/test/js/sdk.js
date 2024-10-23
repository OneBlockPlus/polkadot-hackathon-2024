import initMsg from "./message.js";
import store from "./store.js";
let send=initMsg();

export default {
    sign,mint,transfer
}
function sign(){
    return send("popup",{sourMessage:"sign"});
}
function mint(){
    return send("popup",{sourMessage:'mint'});
}
function transfer(){
    return send("popup",{sourMessage:'transfer'});
}
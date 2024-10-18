import store from "../util/store-esm.js";
// import store from "../util/store.js";

window.onload = async function () {
  store.get("sendMessage").then(data => {
    let t = data?.content?.sourMessage;
    if (t == "mint" || t == 'sign') {
      nav('block', 'block', 'main');
    } else if(t=='transfer'){
      nav('none', 'none', 'transfer');
    }else{
      nav('block', 'block', 'main');
    }
  });
}
function nav(showHeaer, showNav, contentId) {
  $("#hader").css({ display: showHeaer });
  $("#nav").css({ display: showNav });
  $("#" + contentId).css({ display: "block" });
}

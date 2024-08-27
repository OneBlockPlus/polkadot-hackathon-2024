export  function  useSpacebar(fn) {
    // let self = this;
    let code = 0;
    let code2 = 0;

    //空格32
    document.onkeydown = function(e) {
        let evn = e || event;
        let key = evn.keyCode || evn.which || evn.charCode;
      if(key===32){
          e.preventDefault()
          //按下空格
          fn()
      }
    }
}
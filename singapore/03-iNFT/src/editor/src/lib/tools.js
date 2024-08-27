const self = {
  stamp: () => {
    return new Date().getTime();
  },
  rand: (m, n) => {
    return Math.round(Math.random() * (m - n) + n);
  },
  char: (n, pre) => {
    n = n || 7;
    pre = pre || "";
    for (let i = 0; i < n; i++)
      pre +=
        i % 2
          ? String.fromCharCode(self.rand(65, 90))
          : String.fromCharCode(self.rand(97, 122));
    return pre;
  },
  shorten: (addr, n) => {
    if (n === undefined) n = 10;
    return addr.substr(0, n) + "..." + addr.substr(addr.length - n, n);
  },
  copy: (arr_obj) => {
    return JSON.parse(JSON.stringify(arr_obj));
  },
  clone:(obj)=>{
    return JSON.parse(JSON.stringify(obj));
  },
  clean: (arr) => {
    return Array.from(new Set(arr));
  },
  tail: (str, n) => {
    return str.substr(0, n) + "...";
  },
  empty: (obj) => {
    if (JSON.stringify(obj) === "{}") return true;
    return false;
  },
  toDate: (stamp) => {
    return new Date(stamp).toLocaleString();
  },
  device: () => {
    return {
      width: window.screen.width,
      height: window.screen.height,
      rate: window.devicePixelRatio,
    }
  },
  toF: (a, fix) => {
    fix = fix || 3; return parseFloat(a.toFixed(fix))
  },
  download: (filename, text, type) => {
    var element = document.createElement("a");

    switch (type) {
      case "image":
        element.setAttribute("href", text);
        break;

      default:
        element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
        break;
    }

    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();
    document.body.removeChild(element);
  },
  getImageSize: (bs64, ck) => {
    const img = new Image();
    img.src = bs64;
    img.onload = (e) => {
      return ck && ck(img.width, img.height);
    }
  },
  
  toHex:(d,len)=>{
    const str=d.toString(16);
    if(len===undefined) return str;
    let pre="";
    for(let i=0;i<len-str.length;i++){
      pre=pre+"0";
    }
    return pre+str;
  },
};

module.exports = self;
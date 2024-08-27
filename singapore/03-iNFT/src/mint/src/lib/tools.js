const self = {
  stamp: () => {
    return new Date().getTime();
  },
  day:()=>{
    const dt = new Date();
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
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
  copy:(arr_obj)=>{
    return JSON.parse(JSON.stringify(arr_obj));
  },
  clone:(arr)=>{
    return JSON.parse(JSON.stringify(arr));
  },
  clean:(arr)=>{
    return Array.from(new Set(arr));
  },
  tail:(str,n)=>{
    return str.substr(0, n) + "...";
  },
  empty: (obj) => {
    if (JSON.stringify(obj) === "{}") return true;
    return false;
  },
  toUp:(word)=>{
    if (!word) return "";
    return word.charAt(0).toUpperCase() + word.slice(1);
  },
  toDate: (stamp) => {
    return new Date(stamp).toLocaleString();
  },
  toF: (a,fix)=>{
    fix=fix||3;return parseFloat(a.toFixed(fix))
  },
  download:(filename,text,type)=>{
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
  u8ToHex: (u8array) => {
    return Array.prototype.map.call(u8array, function (byte) {
      return ("0" + (byte & 0xFF).toString(16)).slice(-2);
    }).join("");
  },
  hexToU8: (hexString) => {
    if (hexString.length % 2 !== 0) {
      throw new Error("Hex string must have an even number of characters");
    }
    const u8array = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
      u8array[i / 2] = parseInt(hexString.substr(i, 2), 16);
    }
    return u8array;
  },
  device:()=>{
    // const con = document.getElementById("minter");
    // var computedStyle = window.getComputedStyle(con);

    // var marginTop = parseFloat(computedStyle.marginTop);
    // var marginRight = parseFloat(computedStyle.marginRight);
    // var marginBottom = parseFloat(computedStyle.marginBottom);
    // var marginLeft = parseFloat(computedStyle.marginLeft);

    return {
      //margin:[marginTop,marginRight,marginBottom,marginLeft],
      width:window.screen.width,
      height:window.screen.height,
      rate:window.devicePixelRatio,
    }
  },
};

export default self;
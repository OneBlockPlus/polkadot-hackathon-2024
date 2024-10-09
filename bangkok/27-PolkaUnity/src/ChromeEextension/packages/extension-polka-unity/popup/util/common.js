function strTrim(str) {
  str = str.replace(/(^\s*)|(\s*$)/g, "");
  return str;
}
function sleep(minisec, showLog) {
  return new Promise((resolve, reject) => {
    if (showLog) {
      console.log(
        moment().format("YYYY-MM-DD HH:mm"),
        "sleep" + (minisec / 1000).toString() + "s."
      );
    }
    setTimeout(function () {
      resolve();
    }, minisec);
  });
}
function getQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function loadScript(url, callback) {
  var script = document.createElement("script");
  script.type = "text/javascript";
  if (typeof callback != "undefined") {
    if (script.readyState) {
      script.onreadystatechange = function () {
        if (script.readyState == "loaded" || script.readyState == "complete") {
          script.onreadystatechange = null;
          callback();
        }
      };
    } else {
      script.onload = function () {
        callback();
      };
    }
  }
  script.src = url;
  document.body.appendChild(script);
}
function isEmpty(value) {
  var result = false;
  console.log(typeof value);
  switch (typeof value) {
    case "string":
      result = value == "";
      break;
    case "undefined":
      result = true;
      break;
    case "number":
      result = false;
      break;
    case "object":
      var tmp = JSON.stringify(value);
      result = tmp == "{}" || tmp == "[]" ? true : false;
      break;
  }
  return result;
}
function treeToArray(tree) {
  let tree2 = JSON.parse(JSON.stringify(tree));
  let reArray = [];
  function getChildren(arr, pid) {
    arr.forEach((t) => {
      t.pid = pid;
      let tmp = t.children;
      reArray.push(t);
      if (tmp && Array.isArray(tmp) && tmp.length > 0) {
        getChildren(tmp, t.id);
      }
    });
  }
  getChildren(tree2, 0);
  reArray.forEach((t) => {
    delete t.children;
  });
  return reArray;
}
function arrayToTree(arr) {
  let arr2 = JSON.parse(JSON.stringify(arr));
  let reTree = arr2.filter((t) => t.pid == 0);
  function getChildren(list) {
    list.forEach((t) => {
      t.children = arr2.filter((a) => a.pid == t.id);
      if (t.children.length) {
        getChildren(t.children);
      }
    });
  }
  getChildren(reTree);
  return reTree;
}
function findTreeNodeById(tree, id) {
  for (let t of tree) {
    if (t.id == id) {
      return t;
    }
    if (t.children && t.children.length) {
      let result = findTreeNodeById(t.children, id);
      if (result) {
        return result;
      }
    }
  }
  return null;
}
function findTreeNodeById2(tree, id2) {
  for (let t of tree) {
    if (t.id2 == id2) {
      return t;
    }
    if (t.children && t.children.length) {
      let result = findTreeNodeById2(t.children, id2);
      if (result) {
        return result;
      }
    }
  }
  return null;
}
function ajax(url, params, method) {
  let key = cache.get("aes-key") || "12345678A2345678";
  return this.ajaxSour(url, { sign: AES.encrypt(JSON.stringify(params), key) }, method);
}
function ajaxSour(url, params, method) {
  return new Promise((resolve, reject) => {
    let p = {
      type: method ? method : params ? "POST" : "GET",
      url: url,
      beforeSend: function (request) {
        request.setRequestHeader("token", cache.get('token'));
      },
      success: function (str) {
        if (str && typeof str == "string") {
          str = JSON.parse(str);
        }
        if (str.sign) {
          try {
            let key = cache.get("aes-key");
            let o = AES.decrypt(str.sign, key);
            str = JSON.parse(o);
          } catch (e) {
            str = { msg: "error" }
          }
        }
        resolve(str);
      },
      error: function (e) {
        reject(e);
      },
    };
    if (params) {
      p.data = params;
    }
    $.ajax(p);
  });
}
function md5(txt) {
  return CryptoJS.MD5(txt).toString();
}
function aesEncrypt(txt, secret) {
  let ciphertext = CryptoJS.AES.encrypt(txt, secret).toString();
  //   console.log("ciphertext", ciphertext);
  return ciphertext;
}
function aesDecrypt(txt, secret) {
  var bytes = CryptoJS.AES.decrypt(txt, secret);
  var originalText = bytes.toString(CryptoJS.enc.Utf8);
  //   console.log("originalText", originalText);
  return originalText;
}
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toGMTString();
  document.cookie = cname + "=" + cvalue + "; " + expires;
}
function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i].trim();
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
let keyPre = "notebook-";
const cache = {
  get: function (key) {
    let json = localStorage.getItem(keyPre + key);
    try {
      json = JSON.parse(json);
    } catch (e) {
      console.log(e);
    }
    return json;
  },
  set: function (key, value) {
    localStorage.setItem(keyPre + key, JSON.stringify(value));
  },
  del: function (key) {
    localStorage.removeItem(keyPre + key);
  },
  remove: function (key) {
    localStorage.removeItem(keyPre + key);
  },
  clear: function () {
    localStorage.clear();
  }
};
function replacepos(text, start, stop, replacetext) {
  mystr = text.substring(0, start) + replacetext + text.substring(stop - 1);
  return mystr;
}
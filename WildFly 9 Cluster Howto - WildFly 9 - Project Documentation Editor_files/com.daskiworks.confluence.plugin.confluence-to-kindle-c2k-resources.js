/*
 Copyright (c) 2013 Vlastimil Elias. All rights reserved.
*/
(
	function k(){
		window.$SendToKindle&&window.$SendToKindle.Widget?$SendToKindle.Widget.init({"content":"#content>.wiki-content"}):setTimeout(k,500);
	}
)();

/*
 Copyright (c) 2013 Amazon.com, Inc. All rights reserved.
*/
'use strict';var $SendToKindle = $SendToKindle ? $SendToKindle : window.$SendToKindle = {platformInfo:{name:"widget", version:"1.0", platform:"widget", ref:"wdg", metrics:"emit-metrics"}};
$SendToKindle.Widget = {WIDGET_HOST:"https://www.amazon.com", XHR_TIMEOUT:1E4, META:{metatag:{title:'meta[name\x3d"title"]', author:'meta[name\x3d"author"]'}, general:{title:".instapaper_title", author:'a[rel\x3d"author"]'}, microformat:{title:".entry-title", author:".byline \x3e .fn", published:"time[pubdate]"}, microdata:{title:'[itemprop~\x3d"name"]', author:'[itemprop~\x3d"author"]', published:'[itemprop~\x3d"datePublished"]'}, opengraph:{title:'meta[property\x3d"og:title"]', author:'meta[property\x3d"og:article:author"]', 
published:'meta[property\x3d"og:article:published_time"]'}}, ieVersion:NaN, config:{content:"", exclude:"", pagination:"", asin:""}, relay:null, id:"", pages:0, init:function(a) {
  window.addEventListener ? window.addEventListener("message", $SendToKindle.Widget.listener, !1) : window.attachEvent("onmessage", $SendToKindle.Widget.listener);
  if(a) {
    for(var b = {}, c = ["title", "author", "published"], d = 0;d < c.length;d++) {
      a[c[d]] && "string" === typeof a[c[d]] && (b[c[d]] = a[c[d]])
    }
    $SendToKindle.Widget.META.custom = b;
    c = ["content", "exclude", "pagination"];
    for(b = 0;b < c.length;b++) {
      "string" === typeof a[c[b]] && ($SendToKindle.Widget.config[c[b]] = a[c[b]])
    }
    "[object Array]" === Object.prototype.toString.call(a.exclude) && ($SendToKindle.Widget.config.exclude = a.exclude.join(","));
    $SendToKindle.Widget.config.asin = a.asin ? a.asin : ""
  }
  if(a = window.navigator.userAgent.match(/MSIE (\d+)[\.\d]+/)) {
    $SendToKindle.Widget.ieVersion = window.parseInt(a[1], 10)
  }
  if(8 === $SendToKindle.Widget.ieVersion) {
    $SendToKindle.Widget.byteMapping = {};
    for(a = 0;256 > a;a++) {
      for(c = 0;256 > c;c++) {
        $SendToKindle.Widget.byteMapping[String.fromCharCode(a + 256 * c)] = String.fromCharCode(a) + String.fromCharCode(c)
      }
    }
    a = document.createElement("script");
    a.type = "text/vbscript";
    a.text = 'Function ieBinaryToArrayByteStr(binary)\r\n    ieBinaryToArrayByteStr \x3d CStr(binary)\r\nEnd Function\r\nFunction ieBinaryToArrayByteStrLast(binary)\r\n    Dim lastIndex\r\n    lastIndex \x3d LenB(binary)\r\n    If lastIndex mod 2 Then\r\n        ieBinaryToArrayByteStrLast \x3d Chr(AscB(MidB(binary, lastIndex, 1)))\r\n    Else\r\n        ieBinaryToArrayByteStrLast \x3d ""\r\n    End If\r\nEnd Function';
    document.body.appendChild(a)
  }
  $SendToKindle.Widget.ieVersion && (a = document.createElement("iframe"), a.src = $SendToKindle.Widget.WIDGET_HOST + "/gp/sendtokindle/widget-relay?url\x3d" + encodeURIComponent(window.location.href), a.style.display = "none", document.body.appendChild(a), $SendToKindle.Widget.relay = a.contentWindow);
  a = document.getElementsByClassName ? document.getElementsByClassName("kindleWidget") : document.getElementsByTagName("*");
  for(c = 0;c < a.length;c++) {
    /(^|\s)kindleWidget(\s|$)/.test(a[c].className) && (a[c].id = $SendToKindle.Widget.randomID(), a[c].onclick = $SendToKindle.Widget.trigger)
  }
}, trigger:function(a) {
  a = a || window.event;
  a.stopPropagation ? a.stopPropagation() : a.cancelBubble = !0;
  for(a = a.target || a.srcElement;!a.id;) {
    a = a.parentElement
  }
  $SendToKindle.Widget.id = a.id;
  Object.keys || (Object.keys = function(a) {
    if(a !== Object(a)) {
      throw new TypeError("Object.keys called on a non-object");
    }
    var b = [], e;
    for(e in a) {
      Object.prototype.hasOwnProperty.call(a, e) && b.push(e)
    }
    return b
  });
  Array.prototype.forEach || (Array.prototype.forEach = function(a, b) {
    if("[object Function]" !== Object.prototype.toString.call(a)) {
      throw new TypeError(a + " is not a function");
    }
    for(var e = 0, g = this.length;e < g;e++) {
      a.call(b || this, this[e], e, this)
    }
  });
  if(8 > $SendToKindle.Widget.ieVersion || !$SendToKindle.Widget.ieVersion) {
    a = window.screen.availWidth / 2 - 287.5;
    var b = window.screen.availHeight / 2 - 262.5;
    $SendToKindle.Widget.relay = window.open($SendToKindle.Widget.WIDGET_HOST + "/gp/sendtokindle/widget-popup?url\x3d" + encodeURIComponent(window.location.href) + ($SendToKindle.Widget.config.asin ? "\x26asin\x3d" + $SendToKindle.Widget.config.asin : ""), "_blank", "location\x3d1,menubar\x3d0,resizable\x3d1,scrollbars\x3d0,status\x3d0,toolbar\x3d0,width\x3d575,height\x3d525,left\x3d" + a + ",top\x3d" + b)
  }else {
    $SendToKindle.Widget.relay.postMessage(JSON.stringify({type:"request", asin:$SendToKindle.Widget.config.asin ? $SendToKindle.Widget.config.asin : void 0}), $SendToKindle.Widget.WIDGET_HOST)
  }
  return false;
}, randomID:function() {
  var a;
  do {
    var b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz", c = Math.floor(15 * Math.random()) + 15;
    a = b[Math.floor(Math.random() * b.length)];
    for(b += "0123456789-_";c--;) {
      a += b[Math.floor(Math.random() * b.length)]
    }
  }while(document.getElementById(a));
  return a
}, listener:function(a) {
  if(/amazon.com$/i.test(a.origin)) {
    var b = JSON.parse(a.data);
    "ready" === b.type && ($SendToKindle.Widget.log("Starting extraction on " + window.location.href), b = {type:"metrics"}, ["microformat", "microdata", "opengraph"].forEach(function(a) {
      Object.keys($SendToKindle.Widget.META[a]).forEach(function(d) {
        try {
          b[a] = b[a] || Boolean(document.querySelector($SendToKindle.Widget.META[a][d]))
        }catch(e) {
          $SendToKindle.Widget.log("Meta selector failed: " + $SendToKindle.Widget.META[a][d])
        }
      })
    }), $SendToKindle.Widget.relay.postMessage(JSON.stringify(b), $SendToKindle.Widget.WIDGET_HOST), a = $SendToKindle.Widget.findContainer(document.body), $SendToKindle.Widget.collectMeta(a), $SendToKindle.Widget.extractContent(a, document))
  }
}, collectMeta:function(a) {
  var b = {title:document.title, author:window.location.hostname, published:""};
  /\d{4}\W\d{1,2}\W\d{1,2}/.test(window.location.pathname) && (b.published = window.location.pathname.match(/\d{4}\W\d{1,2}\W\d{1,2}/)[0]);
  var c;
  Object.keys($SendToKindle.Widget.META).forEach(function(d) {
    Object.keys($SendToKindle.Widget.META[d]).forEach(function(e) {
      try {
        if(c = a.querySelector($SendToKindle.Widget.META[d][e]) || document.querySelector($SendToKindle.Widget.META[d][e])) {
          b[e] = c.getAttribute("datetime") || c.content || c.textContent || c.innerText || b[e]
        }
      }catch(g) {
        $SendToKindle.Widget.log("Meta selector failed: " + $SendToKindle.Widget.META[d][e])
      }
    })
  });
  b.type = "meta";
  b.url = window.location.href;
  $SendToKindle.Widget.relay.postMessage(JSON.stringify(b), $SendToKindle.Widget.WIDGET_HOST)
}, extractContent:function(a, b) {
  var c;
  if($SendToKindle.Widget.config.pagination) {
    c = b.querySelector($SendToKindle.Widget.config.pagination);
    do {
      if(c) {
        c.href ? c = c.href : (c = c.querySelectorAll("[href]"), 1 === c.length ? c = c[0] : ($SendToKindle.Widget.log("Pagination selector found " + c.length + " links, but expected one."), c = void 0))
      }else {
        break
      }
    }while("string" !== typeof c)
  }
  a = $SendToKindle.Widget.filter(a);
  for(var d = a.querySelectorAll("img"), e = 0;e < d.length;e++) {
    d[e].src ? (d[e].src = d[e].getAttribute("data-src") || d[e].getAttribute("data-original") || d[e].src, $SendToKindle.Widget.downloadImage(d[e].src)) : d[e].parentElement.removeChild(d[e])
  }
  d = a.querySelectorAll("[src]");
  for(e = 0;e < d.length;e++) {
    d[e].setAttribute("alt", d[e].src), d[e].removeAttribute("src")
  }
  d = a.querySelectorAll("a[href]");
  for(e = 0;e < d.length;e++) {
    d[e].href = $SendToKindle.Widget.makeUrlAbsolute(d[e].href)
  }
  $SendToKindle.Widget.relay.postMessage(JSON.stringify({type:"content", html:a.innerHTML}), $SendToKindle.Widget.WIDGET_HOST);
  c && 30 > $SendToKindle.Widget.pages++ ? $SendToKindle.Widget.downloadPage(c) : $SendToKindle.Widget.relay.postMessage(JSON.stringify({type:"finished"}), $SendToKindle.Widget.WIDGET_HOST)
}, makeUrlAbsolute:function(a) {
  if(a) {
    if(/^\/\//.test(a)) {
      a = window.location.protocol + a
    }else {
      if(!/^(http|https|mailto:|#.+)/i.test(a)) {
        var b = window.location.pathname.match(/([\w\-\/]+)(\/\w+\.\w+)?$/i), b = ((b ? b[1] : window.location.pathname) || window.location.pathname) + "/";
        "/" !== a[0] && (a = b + a);
        a = (window.location.origin || window.location.protocol + "//" + window.location.host) + a
      }
    }
  }
  return a
}, findContainer:function(a) {
  var b;
  if($SendToKindle.Widget.config.content) {
    try {
      b = a.querySelectorAll($SendToKindle.Widget.config.content);
      if(1 === b.length) {
        return $SendToKindle.Widget.extractStyle(b[0])
      }
      $SendToKindle.Widget.log("Found article " + b.length + " candiates! Looking for one containing the button.");
      for(var c = 0;c < b.length;c++) {
        if(b[c].querySelector("#" + $SendToKindle.Widget.id)) {
          return $SendToKindle.Widget.extractStyle(b[c])
        }
      }
      for(b = a.querySelector("#" + $SendToKindle.Widget.id);b = b.parentNode;) {
        var d = b.querySelectorAll($SendToKindle.Widget.config.content);
        if(1 === d.length) {
          return $SendToKindle.Widget.extractStyle(d[0])
        }
        if(1 < d.length) {
          break
        }
      }
      $SendToKindle.Widget.log("Could not find article content using custom selector: " + $SendToKindle.Widget.config.content)
    }catch(e) {
      $SendToKindle.Widget.log("Content selector failed: " + $SendToKindle.Widget.config.content)
    }
  }
  c = ['[itemprop~\x3d"articleBody"]', ".entry-content", ".instapaper_body"];
  for(d = 0;d < c.length;d++) {
    if(b = a.querySelectorAll(c[d]), b.length) {
      a = document.createElement("div");
      for(c = 0;c < b.length;c++) {
        a.appendChild($SendToKindle.Widget.extractStyle(b[c]))
      }
      return a
    }
  }
  $SendToKindle.Widget.log("Article content not found.");
  throw Error("Article content not found.");
}, filter:function(a) {
  var b = "";
  $SendToKindle.Widget.config.exclude && (b = $SendToKindle.Widget.config.exclude);
  Object.keys($SendToKindle.Widget.META).forEach(function(a) {
    Object.keys($SendToKindle.Widget.META[a]).forEach(function(c) {
      b += "," + $SendToKindle.Widget.META[a][c]
    })
  });
  b += ",aside,audio,button,cite,del,embed,footer,form,frame,frameset,header,iframe,input,ins,menu,meta,nav,noframes,noscript,object,script,select,source,style,textarea,video,.kindleWidget,.entry-unrelated";
  b = b.replace(/^,/, "");
  try {
    for(var c = a.querySelectorAll(b), d = 0, e = c.length;d < e;d++) {
      try {
        c[d].parentNode.removeChild(c[d])
      }catch(g) {
        $SendToKindle.Widget.log("Attempted nested removal.")
      }
    }
  }catch(f) {
    $SendToKindle.Widget.log("Exclusion selector failed: " + b)
  }
  return a
}, extractStyle:function(a) {
  a = $SendToKindle.Widget.safeClone(a);
  for(var b = a.querySelectorAll("*"), c = 0, d = b.length;c < d;c++) {
    var e = window.getComputedStyle ? window.getComputedStyle(b[c], null) : b[c].currentStyle;
    e.fontWeight && (400 > e.fontWeight ? b[c].style.fontWeight = "lighter" : 400 < e.fontWeight ? b[c].style.fontWeight = "bold" : 400 !== e.fontWeight && !/normal/i.test(e.fontWeight) && (b[c].style.fontWeight = e.fontWeight));
    /normal/i.test(e.fontStyle) || (b[c].style.fontStyle = e.fontStyle);
    /none/i.test(e.textDecoration) || (b[c].style.textDecoration = e.textDecoration);
    !/disc/i.test(e.listStyleType) && !/decimal/i.test(e.listStyleType) && (b[c].style.listStyleType = e.listStyleType)
  }
  return a
}, downloadPage:function(a) {
  var b = new XMLHttpRequest;
  b.open("GET", a, !0);
  b.timeout = $SendToKindle.Widget.XHR_TIMEOUT;
  b.onreadystatechange = function() {
    if(4 === b.readyState && 200 === b.status) {
      var a = b.responseText.match(/(.*<\s*body[^>]*>)/i), d = b.responseText.indexOf(a[0]) + a[0].length, e = b.responseText.lastIndexOf("\x3c/body\x3e"), a = document.createElement("div");
      a.innerHTML = b.responseText.substring(d, e);
      d = $SendToKindle.Widget.findContainer(a);
      $SendToKindle.Widget.extractContent(d, a)
    }else {
      4 === b.readyState && $SendToKindle.Widget.relay.postMessage(JSON.stringify({type:"finished"}), $SendToKindle.Widget.WIDGET_HOST)
    }
  };
  b.ontimeout = function() {
    $SendToKindle.Widget.relay.postMessage(JSON.stringify({type:"finished"}), $SendToKindle.Widget.WIDGET_HOST)
  };
  b.send()
}, downloadImage:function(a, b) {
  a = $SendToKindle.Widget.makeUrlAbsolute(a);
  var c = function() {
    $SendToKindle.Widget.relay.postMessage(JSON.stringify({type:"image", status:"failure", url:b || a}), $SendToKindle.Widget.WIDGET_HOST)
  }, d = new XMLHttpRequest;
  try {
    d.open("GET", a, !0)
  }catch(e) {
    c();
    return
  }
  d.timeout = $SendToKindle.Widget.XHR_TIMEOUT;
  d.ontimeout = c;
  d.responseType = "arraybuffer";
  d.onreadystatechange = function() {
    if(4 === d.readyState && 200 === d.status) {
      var e = d.getResponseHeader("Content-Type").replace(/jpg/, "jpeg"), f;
      if(/^(image|application)\//i.test(e)) {
        if("undefined" !== typeof ArrayBuffer && d.response instanceof ArrayBuffer) {
          f = new Uint8Array(d.response);
          for(var k = "", h = 0, l = f.length;h < l;h++) {
            k += String.fromCharCode(f[h])
          }
          f = window.btoa(k)
        }else {
          9 === $SendToKindle.Widget.ieVersion ? f = $SendToKindle.Widget.encode64((new VBArray(d.responseBody)).toArray()) : 8 === $SendToKindle.Widget.ieVersion ? f = $SendToKindle.Widget.encode64($SendToKindle.Widget.ieConvert(d.responseBody)) : d.response instanceof String && (f = $SendToKindle.Widget.encode64(String(d.response)))
        }
        $SendToKindle.Widget.relay.postMessage(JSON.stringify({type:"image", status:"success", url:b || a, data:"data:" + e + ";base64," + f}), $SendToKindle.Widget.WIDGET_HOST)
      }else {
        c()
      }
    }else {
      4 === d.readyState && 0 === d.status ? (e = a.match(/\/([^\/]+)\//)[1], e !== window.location.host ? $SendToKindle.Widget.downloadImage(a.replace(e, document.location.host), a) : c()) : 4 === d.readyState && c()
    }
  };
  d.send()
}, ieConvert:function(a) {
  var b = ieBinaryToArrayByteStr(a);
  a = ieBinaryToArrayByteStrLast(a);
  return b.replace(/[\s\S]/g, function(a) {
    return $SendToKindle.Widget.byteMapping[a]
  }) + a
}, safeClone:function(a) {
  var b = document.createDocumentFragment().appendChild(document.createElement("div"));
  b.innerHTML = a.outerHTML || (new XMLSerializer).serializeToString(a);
  return b.firstChild
}, log:function(a) {
  console && console.log(a);
  $SendToKindle.Widget.relay.postMessage(JSON.stringify({type:"log", msg:a}), $SendToKindle.Widget.WIDGET_HOST)
}, encode64:function(a) {
  for(var b = "", c = a.length, d = 0;d < c;) {
    var e, g, f;
    "string" === typeof a ? (e = a.charCodeAt(d++), g = a.charCodeAt(d++), f = a.charCodeAt(d++)) : (e = a[d++], g = a[d++], f = a[d++]);
    var k = e >> 2;
    e = (e & 3) << 4 | g >> 4;
    var h = (g & 15) << 2 | f >> 6, l = f & 63;
    isNaN(g) ? h = l = 64 : isNaN(f) && (l = 64);
    b += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\x3d"[k] + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\x3d"[e] + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\x3d"[h] + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\x3d"[l]
  }
  return b
}};


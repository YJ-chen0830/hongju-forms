/* 儒鴻 / 宏儒 表格中心 — 共用模組 */
(function(global){
  "use strict";

  var BRANDS = {
    "儒鴻結構土木技師事務所": {
      brandName:"儒鴻結構土木技師事務所",
      brandEng:"JU HONG STRUCTURAL & CIVIL ENGINEER OFFICE",
      brandEmail:"service@hongju.com.tw", taxId:"88760791",
      logoSrc:"logo-j-mark.png", logoLight:"logo-j-mark-light.png"
    },
    "宏儒營造有限公司": {
      brandName:"宏儒營造有限公司",
      brandEng:"HONG JU CONSTRUCTION CO., LTD.",
      brandEmail:"service@hongju.com.tw", taxId:"89795586",
      logoSrc:"logo-h-mark.png", logoLight:"logo-h-mark-light.png"
    }
  };
  var ADDR = "台中市豐原區南村路 19 號";
  var TEL  = "TEL 04-2520-5003　FAX 04-2520-6399";
  var PHONE = "04-2520-5003";
  var FAX = "04-2520-6399";

  function fmt(n){ return Number(n||0).toLocaleString("en-US"); }

  function esc(s){
    return String(s==null?"":s).replace(/[&<>"]/g,function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];
    });
  }

  // 阿拉伯數字 → 國字大寫金額
  function cjk(n){
    n = Math.round(Number(n)||0);
    if(n===0) return "零";
    var D=["零","壹","貳","參","肆","伍","陸","柒","捌","玖"], U=["","拾","佰","仟"], G=["","萬","億","兆"];
    function groupStr(part){ var str="",pend=false,started=false;
      for(var u=3;u>=0;u--){ var d=Math.floor(part/Math.pow(10,u))%10;
        if(d===0){ if(started) pend=true; } else { if(pend){str+="零";pend=false;} str+=D[d]+U[u]; started=true; } }
      return str; }
    var groups=[], m=n; while(m>0){ groups.push(m%10000); m=Math.floor(m/10000); }
    var s="";
    for(var g=groups.length-1;g>=0;g--){ var part=groups[g]; if(part===0) continue;
      if(s!=="" && part<1000) s+="零"; s+=groupStr(part)+G[g]; }
    return s.replace(/零+/g,"零").replace(/零$/,"")||"零";
  }

  // localStorage helpers — 各表格傳入自己的 key
  function makeStore(curKey, savedKey, defaultFn){
    return {
      loadCur: function(){ try{ var s=JSON.parse(localStorage.getItem(curKey)); return (s&&typeof s==="object")?s:defaultFn(); }catch(e){ return defaultFn(); } },
      saveCur: function(state){ try{ localStorage.setItem(curKey, JSON.stringify(state)); }catch(e){} },
      loadSaved: function(){ try{ return JSON.parse(localStorage.getItem(savedKey))||{}; }catch(e){ return {}; } },
      writeSaved: function(o){ try{ localStorage.setItem(savedKey, JSON.stringify(o)); }catch(e){} }
    };
  }

  global.HJ = { BRANDS:BRANDS, ADDR:ADDR, TEL:TEL, PHONE:PHONE, FAX:FAX, fmt:fmt, esc:esc, cjk:cjk, makeStore:makeStore };
})(window);

/* 手機版：編輯 / 預覽 切換列（套用所有表格頁） */
(function(){
  function init(){
    if(!document.querySelector(".app") || !document.querySelector(".panel") || !document.querySelector(".stage")) return;
    if(document.querySelector(".mtabs")) return;
    var mq = window.matchMedia("(max-width:860px)");
    var bar = document.createElement("div");
    bar.className = "mtabs";
    bar.innerHTML = '<button type="button" data-m="edit">\u270F\uFE0F \u7DE8\u8F2F</button><button type="button" data-m="preview">\u{1F4C4} \u9810\u89BD</button>';
    document.body.appendChild(bar);
    function setMode(m){
      document.body.classList.toggle("m-edit", m==="edit");
      document.body.classList.toggle("m-preview", m==="preview");
      var btns = bar.querySelectorAll("button");
      for(var i=0;i<btns.length;i++){ btns[i].classList.toggle("on", btns[i].getAttribute("data-m")===m); }
      window.scrollTo(0,0);
    }
    bar.addEventListener("click", function(e){
      var b = e.target.closest ? e.target.closest("button") : null;
      if(b) setMode(b.getAttribute("data-m"));
    });
    function apply(){
      if(mq.matches){
        if(!document.body.classList.contains("m-edit") && !document.body.classList.contains("m-preview")) setMode("edit");
      } else {
        document.body.classList.remove("m-edit","m-preview");
      }
    }
    apply();
    if(mq.addEventListener) mq.addEventListener("change", apply); else if(mq.addListener) mq.addListener(apply);
  }
  if(document.readyState!=="loading") init(); else document.addEventListener("DOMContentLoaded", init);
})();

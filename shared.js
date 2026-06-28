/* 儒鴻 / 宏儒 表格中心 — 共用模組 */
(function(global){
  "use strict";

  var BRANDS = {
    "儒鴻結構土木技師事務所": {
      brandName:"儒鴻結構土木技師事務所",
      brandEng:"JU HONG STRUCTURAL & CIVIL ENGINEER OFFICE",
      brandEmail:"service@hongju.com.tw", taxId:"88760791",
      logoSrc:"assets/logo-j-mark.png", logoLight:"assets/logo-j-mark-light.png"
    },
    "宏儒營造有限公司": {
      brandName:"宏儒營造有限公司",
      brandEng:"HONG JU CONSTRUCTION CO., LTD.",
      brandEmail:"service@hongju.com.tw", taxId:"89795586",
      logoSrc:"assets/logo-h-mark.png", logoLight:"assets/logo-h-mark-light.png"
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

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

  // ---- 共用版面片段（工務表單）----
  function docHeader(cfg, titleZh, titleEn, metaRows){
    var meta = (metaRows||[]).map(function(r){
      var color = r[2]||"#322F27", weight = r[3]||"600";
      return '<div style="color:#6B6557;">'+r[0]+'</div><div style="color:'+color+';font-weight:'+weight+';font-variant-numeric:tabular-nums;">'+esc(r[1])+'</div>';
    }).join("");
    return '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:24px;padding-bottom:14px;border-bottom:1.5px solid #0A1A33;">'+
      '<div style="display:flex;gap:13px;align-items:flex-start;min-width:0;">'+
        '<img src="'+cfg.logoSrc+'" alt="logo" style="height:44px;width:auto;display:block;flex:none;margin-top:2px;">'+
        '<div style="min-width:0;"><div style="font-weight:700;font-size:18px;color:#0A1A33;line-height:1.2;">'+esc(cfg.brandName)+'</div>'+
        '<div style="font-family:Archivo,sans-serif;font-weight:600;font-size:8px;letter-spacing:0.06em;color:#8C8576;margin-top:3px;">'+esc(cfg.brandEng)+'</div>'+
        '<div style="font-size:10.5px;color:#6B6557;line-height:1.7;margin-top:8px;"><div>'+ADDR+'　'+TEL+'</div></div></div>'+
      '</div>'+
      '<div style="flex:none;text-align:right;">'+
        '<div style="font-family:\'Noto Serif TC\',serif;font-weight:600;font-size:26px;color:#0A1A33;letter-spacing:0.12em;padding-left:0.12em;">'+titleZh+'</div>'+
        '<div style="font-family:Archivo,sans-serif;font-size:9px;font-weight:600;letter-spacing:0.2em;color:#9A7B2A;text-transform:uppercase;margin-top:2px;">'+titleEn+'</div>'+
        '<div style="display:inline-grid;grid-template-columns:auto auto;gap:5px 12px;margin-top:11px;font-size:11px;text-align:left;">'+meta+'</div>'+
      '</div>'+
    '</div>';
  }
  function projectBlock(projectName, cols){
    var n=cols.length;
    var cells=cols.map(function(c,i){
      var br=i<n-1?'border-right:1px solid #E2DDD1;':'';
      return '<div style="padding:9px 13px;'+br+'"><div style="font-size:10px;color:#9A7B2A;font-weight:600;">'+c[0]+'</div><div style="font-size:12px;color:#322F27;margin-top:3px;">'+(esc(c[1])||"—")+'</div></div>';
    }).join("");
    return '<div style="margin-top:14px;border:1px solid #E2DDD1;border-radius:4px;overflow:hidden;background:#F8F6F0;">'+
      (projectName!=null?'<div style="padding:9px 13px;border-bottom:1px solid #E2DDD1;"><div style="font-size:10px;color:#9A7B2A;font-weight:600;">工程名稱</div><div style="font-size:12.5px;color:#0A1A33;font-weight:600;margin-top:3px;">'+(esc(projectName)||"—")+'</div></div>':'')+
      '<div style="display:grid;grid-template-columns:repeat('+n+',1fr);">'+cells+'</div>'+
    '</div>';
  }
  function sectionLbl(txt){
    return '<div style="font-family:Archivo,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.18em;color:#9A7B2A;text-transform:uppercase;margin:16px 0 8px;display:flex;align-items:center;gap:8px;"><span style="width:16px;height:2px;background:#C9A24A;display:inline-block;"></span>'+txt+'</div>';
  }
  function signRow(cols){
    var cells=cols.map(function(c){
      return '<div style="border:1px solid #E2DDD1;border-radius:4px;padding:11px 14px 13px;'+(c.bg?'background:#F8F6F0;':'')+'"><div style="font-size:11px;color:#9A7B2A;font-weight:600;">'+c.role+'</div><div style="font-size:11.5px;color:#0A1A33;margin-top:4px;min-height:15px;">'+(esc(c.name||"")||"　")+'</div><div style="height:42px;"></div><div style="font-size:10px;color:#6B6557;border-top:1px dashed #D8D2C4;padding-top:5px;">'+(c.foot||"簽章 / 日期")+'</div></div>';
    }).join("");
    return '<div style="display:grid;grid-template-columns:repeat('+cols.length+',1fr);gap:14px;">'+cells+'</div>';
  }
  function footer(cfg, note){
    return '<div style="margin-top:16px;padding-top:10px;border-top:1px solid #E2DDD1;display:flex;justify-content:space-between;align-items:center;"><div style="font-family:Archivo,sans-serif;font-size:8.5px;font-weight:600;letter-spacing:0.14em;color:#ADA796;text-transform:uppercase;">'+esc(cfg.brandEng)+'</div><div style="font-size:9.5px;color:#ADA796;letter-spacing:0.08em;">'+note+'</div></div>';
  }
  function box(label){ return '<span style="display:inline-block;width:12px;height:12px;border:1.5px solid #0A1A33;border-radius:2px;vertical-align:-1px;margin-right:5px;"></span>'+(label||""); }

  global.HJ = { BRANDS:BRANDS, ADDR:ADDR, TEL:TEL, PHONE:PHONE, FAX:FAX, fmt:fmt, esc:esc, cjk:cjk, makeStore:makeStore,
    docHeader:docHeader, projectBlock:projectBlock, sectionLbl:sectionLbl, signRow:signRow, footer:footer, box:box };
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

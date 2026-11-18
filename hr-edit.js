/* 宏儒營造 人事表單 — 線上編輯共用模組
 * 用法：在表單頁 </body> 前加 <script src="hr-edit.js" data-form="employment-cert"></script>
 * 功能：直接點文字編輯、自動儲存、命名另存多份、複製／刪除列、勾選框、還原範本、列印。
 * 資料只存在本機瀏覽器（localStorage），可在表格中心「匯出備份」帶到別台電腦。
 */
(function(){
  "use strict";
  var me = document.currentScript;
  var FORM = (me && me.getAttribute("data-form")) || location.pathname.split("/").pop().replace(/\.html$/,"");
  var CUR = "hj_hr_" + FORM + "_current";
  var SAVED = "hj_hr_" + FORM + "_saved";
  var papers = Array.prototype.slice.call(document.querySelectorAll(".f-paper"));
  if(!papers.length) return;

  // ---------- 樣式 ----------
  var css = document.createElement("style");
  css.textContent =
    ".hx-bar{position:sticky;top:0;z-index:50;background:#0A1A33;color:#fff;font-family:'Noto Sans TC',sans-serif;box-shadow:0 4px 16px rgba(10,26,51,.25);}" +
    ".hx-in{max-width:1180px;margin:0 auto;padding:9px 18px;display:flex;flex-wrap:wrap;align-items:center;gap:8px;}" +
    ".hx-back{color:#D9B96E;text-decoration:none;font-size:12.5px;font-weight:600;margin-right:6px;white-space:nowrap;}" +
    ".hx-tt{font-weight:700;font-size:14px;margin-right:auto;white-space:nowrap;}" +
    ".hx-btn{font-family:inherit;font-size:12.5px;font-weight:600;border-radius:6px;padding:7px 11px;cursor:pointer;border:1px solid rgba(255,255,255,.25);background:transparent;color:#fff;white-space:nowrap;}" +
    ".hx-btn:hover{border-color:#D9B96E;color:#D9B96E;}" +
    ".hx-btn.on{background:#C9A24A;border-color:#C9A24A;color:#0A1A33;}" +
    ".hx-btn.gold{background:#C9A24A;border-color:#C9A24A;color:#0A1A33;}" +
    ".hx-btn:disabled{opacity:.35;cursor:default;}" +
    ".hx-sel{font-family:inherit;font-size:12.5px;border-radius:6px;padding:6px 8px;border:1px solid rgba(255,255,255,.25);background:#16294a;color:#fff;max-width:200px;}" +
    ".hx-st{font-size:11.5px;color:#B8C2D3;min-width:84px;}" +
    ".hx-tip{max-width:1180px;margin:0 auto;padding:0 18px 8px;font-size:11.5px;color:#B8C2D3;}" +
    ".hx-tip b{color:#D9B96E;font-weight:600;}" +
    ".hx-edit [contenteditable=true]{outline:none;}" +
    ".hx-edit .f-pad:hover{box-shadow:inset 0 0 0 1px rgba(201,162,74,.35);}" +
    ".hx-edit .f-pad *:focus{background:rgba(201,162,74,.10);}" +
    ".hx-edit .f-box{cursor:pointer;}" +
    ".f-box.hx-on{background:#0A1A33;position:relative;}" +
    ".f-box.hx-on::after{content:'';position:absolute;left:3.5px;top:0.5px;width:4px;height:8px;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg);}" +
    ".hx-cur{box-shadow:0 0 0 2px rgba(201,162,74,.75) !important;}" +
    ".hx-toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);background:#0A1A33;color:#fff;font:600 13px 'Noto Sans TC',sans-serif;padding:10px 16px;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,.25);opacity:0;transition:opacity .2s;z-index:60;pointer-events:none;}" +
    ".hx-toast.show{opacity:1;}" +
    "@media print{.hx-bar,.hx-toast{display:none !important;}.hx-cur{box-shadow:none !important;}.hx-edit .f-pad:hover{box-shadow:none !important;}.hx-edit .f-pad *:focus{background:none !important;}}";
  document.head.appendChild(css);

  // ---------- 範本快照 ----------
  var TEMPLATE = papers.map(function(p){ return p.innerHTML; });
  function hash(s){ var h=0,i; for(i=0;i<s.length;i++){ h=((h<<5)-h+s.charCodeAt(i))|0; } return String(h); }
  var THASH = hash(TEMPLATE.join("\u0001"));

  function read(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch(e){ return null; } }
  function write(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); return true; }catch(e){ return false; } }

  function snapshot(){
    return papers.map(function(p){
      var c = p.cloneNode(true);
      Array.prototype.forEach.call(c.querySelectorAll("[contenteditable]"),function(n){ n.removeAttribute("contenteditable"); });
      Array.prototype.forEach.call(c.querySelectorAll(".hx-cur"),function(n){ n.classList.remove("hx-cur"); });
      return c.innerHTML;
    });
  }
  function apply(htmls){
    if(!htmls || htmls.length !== papers.length) return false;
    papers.forEach(function(p,i){ p.innerHTML = htmls[i]; });
    setEditable(editing);
    return true;
  }

  // ---------- 工具列 ----------
  var title = (document.title||"").split("·")[0].trim();
  var bar = document.createElement("div");
  bar.className = "hx-bar";
  bar.innerHTML =
    '<div class="hx-in">' +
      '<a class="hx-back" href="index.html">← 表格中心</a>' +
      '<span class="hx-tt">' + title + '</span>' +
      '<button class="hx-btn" id="hx-edit">✎ 編輯中</button>' +
      '<button class="hx-btn" id="hx-dup" title="複製游標所在的列／條文">＋ 複製此列</button>' +
      '<button class="hx-btn" id="hx-del" title="刪除游標所在的列／條文">－ 刪除此列</button>' +
      '<select class="hx-sel" id="hx-list"><option value="">— 已儲存的版本 —</option></select>' +
      '<button class="hx-btn" id="hx-save">另存</button>' +
      '<button class="hx-btn" id="hx-rm" title="刪除選取的已存版本">刪除版本</button>' +
      '<button class="hx-btn" id="hx-reset">還原範本</button>' +
      '<button class="hx-btn gold" id="hx-print">列印 / 存 PDF</button>' +
      '<span class="hx-st" id="hx-st"></span>' +
    '</div>' +
    '<div class="hx-tip">直接點選紙面上的文字即可修改，<b>自動儲存在這台電腦的瀏覽器</b>。點方框可勾選；游標放在表格列或條文內可「複製此列／刪除此列」。開立給員工的每一份，建議用「另存」命名（例如：王大明_在職證明_1151118）。</div>';
  document.body.insertBefore(bar, document.body.firstChild);

  var $ = function(id){ return document.getElementById(id); };
  var toastEl = document.createElement("div"); toastEl.className="hx-toast"; document.body.appendChild(toastEl);
  var tt; function toast(m){ toastEl.textContent=m; toastEl.classList.add("show"); clearTimeout(tt); tt=setTimeout(function(){toastEl.classList.remove("show");},1800); }
  function status(m){ $("hx-st").textContent = m; }

  // ---------- 編輯模式 ----------
  var editing = true;
  function setEditable(on){
    papers.forEach(function(p){
      Array.prototype.forEach.call(p.querySelectorAll(".f-pad"),function(pad){
        if(on) pad.setAttribute("contenteditable","true"); else pad.removeAttribute("contenteditable");
        pad.setAttribute("spellcheck","false");
      });
    });
    document.body.classList.toggle("hx-edit", on);
    $("hx-edit").classList.toggle("on", on);
    $("hx-edit").textContent = on ? "✎ 編輯中" : "✎ 開始編輯";
    $("hx-dup").disabled = !on; $("hx-del").disabled = !on;
  }
  $("hx-edit").addEventListener("click", function(){ editing=!editing; setEditable(editing); });

  // ---------- 自動計算（薪資明細表：data-sum / data-total / data-net / data-cjk） ----------
  function cjk(n){
    var neg=n<0; n=Math.abs(Math.round(n)); if(n===0) return "零";
    var D=["零","壹","貳","參","肆","伍","陸","柒","捌","玖"], U=["","拾","佰","仟"], G=["","萬","億","兆"];
    function grp(part){ var s="",pend=false,st=false; for(var u=3;u>=0;u--){ var d=Math.floor(part/Math.pow(10,u))%10; if(d===0){ if(st) pend=true; } else { if(pend){s+="零";pend=false;} s+=D[d]+U[u]; st=true; } } return s; }
    var gs=[],m=n; while(m>0){ gs.push(m%10000); m=Math.floor(m/10000); }
    var s=""; for(var g=gs.length-1;g>=0;g--){ var part=gs[g]; if(part===0) continue; if(s!=="" && part<1000) s+="零"; s+=grp(part)+G[g]; }
    return (neg?"負":"")+(s.replace(/零+/g,"零").replace(/零$/,"")||"零");
  }
  function num(t){ var v=parseFloat(String(t).replace(/[^0-9.\-]/g,"")); return isNaN(v)?0:v; }
  function fmt(n){ return Math.round(n).toLocaleString("en-US"); }
  function recalc(){
    var boxes=document.querySelectorAll("[data-sum]"); if(!boxes.length) return;
    var tot={};
    Array.prototype.forEach.call(boxes,function(box){
      var k=box.getAttribute("data-sum"), sum=0;
      Array.prototype.forEach.call(box.querySelectorAll(".f-row"),function(r){ var sp=r.querySelectorAll("span"); if(sp.length) sum+=num(sp[sp.length-1].textContent); });
      tot[k]=sum;
      var t=document.querySelector('[data-total="'+k+'"]'); if(t && t.textContent!==fmt(sum)) t.textContent=fmt(sum);
    });
    var net=(tot.earn||0)+(tot.ded||0);
    var ne=document.querySelector("[data-net]"); if(ne){ var v="NT$ "+fmt(net); if(ne.textContent!==v) ne.textContent=v; }
    var ce=document.querySelector("[data-cjk]"); if(ce){ var c="新臺幣 "+cjk(net)+" 元整"; if(ce.textContent!==c) ce.textContent=c; }
  }
  papers.forEach(function(p){ p.addEventListener("input", function(e){
    var t=e.target; if(t && t.closest && (t.closest("[data-total]")||t.closest("[data-net]")||t.closest("[data-cjk]"))) return;
    recalc();
  }); });

  // ---------- 自動儲存 ----------
  var timer=null;
  function saveCur(){
    var ok = write(CUR, {v:1, t:Date.now(), tpl:THASH, html:snapshot()});
    status(ok ? "已自動儲存" : "⚠ 無法儲存");
  }
  function queueSave(){ status("儲存中…"); clearTimeout(timer); timer=setTimeout(saveCur, 500); }
  papers.forEach(function(p){ p.addEventListener("input", queueSave); });

  // ---------- 勾選框 ----------
  document.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest(".f-box");
    if(b && editing && b.closest(".f-paper")){ b.classList.toggle("hx-on"); queueSave(); e.preventDefault(); }
  });

  // ---------- 目前列 ----------
  var ROW = "tr, .f-row, .f-art, li, .f-chk, .f-grid > div";
  var cur = null;
  function pickRow(node){
    var el = node && (node.nodeType===1 ? node : node.parentElement);
    var r = el && el.closest ? el.closest(ROW) : null;
    if(r && !r.closest(".f-paper")) r=null;
    if(cur && cur!==r) cur.classList.remove("hx-cur");
    cur = r; if(cur && editing) cur.classList.add("hx-cur");
  }
  document.addEventListener("selectionchange", function(){
    var s = window.getSelection(); if(s && s.anchorNode) pickRow(s.anchorNode);
  });
  $("hx-dup").addEventListener("click", function(){
    if(!cur){ toast("請先把游標放在要複製的列或條文內"); return; }
    var c = cur.cloneNode(true); c.classList.remove("hx-cur");
    cur.parentNode.insertBefore(c, cur.nextSibling);
    renumber(cur.parentNode); recalc(); queueSave(); toast("已複製一列");
  });
  $("hx-del").addEventListener("click", function(){
    if(!cur){ toast("請先把游標放在要刪除的列或條文內"); return; }
    var parent = cur.parentNode, sibs = parent.querySelectorAll(":scope > " + cur.tagName.toLowerCase());
    if(sibs.length<=1){ toast("最後一列不能刪除"); return; }
    if(!confirm("確定刪除這一列？")) return;
    parent.removeChild(cur); cur=null; renumber(parent); recalc(); queueSave(); toast("已刪除");
  });
  // 條文編號（第 X 條）自動重排
  var CN="零一二三四五六七八九十";
  function cnum(n){ if(n<=10) return CN[n]; if(n<20) return "十"+(n%10?CN[n%10]:""); return CN[Math.floor(n/10)]+"十"+(n%10?CN[n%10]:""); }
  function renumber(parent){
    var arts = parent.querySelectorAll(":scope > .f-art");
    if(!arts.length) return;
    Array.prototype.forEach.call(arts,function(a,i){
      var no = a.querySelector(".f-artno"); if(!no) return;
      if(/第.+條/.test(no.textContent)) no.textContent = no.textContent.replace(/第.+?條/, "第"+cnum(i+1)+"條");
      else if(/^\s*\d+\s*$/.test(no.textContent)) no.textContent = String(i+1);
    });
  }

  // ---------- 多份版本 ----------
  function savedAll(){ return read(SAVED) || {}; }
  function refreshList(sel){
    var o = savedAll(), names = Object.keys(o).sort(function(a,b){ return (o[b].t||0)-(o[a].t||0); });
    var s = $("hx-list");
    s.innerHTML = '<option value="">— 已儲存的版本（' + names.length + '）—</option>' +
      names.map(function(n){ return '<option>'+n.replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];})+'</option>'; }).join("");
    if(sel) s.value = sel;
  }
  $("hx-save").addEventListener("click", function(){
    var d=new Date(), pad=function(n){return (n<10?"0":"")+n;};
    var def = title + "_" + (d.getFullYear()-1911) + pad(d.getMonth()+1) + pad(d.getDate());
    var name = prompt("這一份要存成什麼名稱？", $("hx-list").value || def);
    if(!name) return; name = name.trim(); if(!name) return;
    var o = savedAll();
    if(o[name] && !confirm("「"+name+"」已存在，要覆蓋嗎？")) return;
    o[name] = {t:Date.now(), tpl:THASH, html:snapshot()};
    if(write(SAVED,o)){ refreshList(name); toast("已另存：" + name); } else toast("⚠ 儲存空間不足");
  });
  $("hx-list").addEventListener("change", function(){
    var n=this.value; if(!n) return;
    var r = savedAll()[n]; if(!r) return;
    if(!confirm("載入「"+n+"」？目前畫面的內容會被取代（目前內容已自動儲存，可先另存）。")) { this.value=""; return; }
    if(apply(r.html)){ saveCur(); toast("已載入：" + n); }
  });
  $("hx-rm").addEventListener("click", function(){
    var n=$("hx-list").value; if(!n){ toast("請先在下拉選單選一個版本"); return; }
    if(!confirm("刪除已存版本「"+n+"」？")) return;
    var o=savedAll(); delete o[n]; write(SAVED,o); refreshList(); toast("已刪除版本");
  });
  $("hx-reset").addEventListener("click", function(){
    if(!confirm("還原成空白範本？目前畫面的內容會清除（已另存的版本不受影響）。")) return;
    apply(TEMPLATE); try{ localStorage.removeItem(CUR); }catch(e){}
    $("hx-list").value=""; status("已還原範本"); toast("已還原範本");
  });
  $("hx-print").addEventListener("click", function(){
    if(cur){ cur.classList.remove("hx-cur"); }
    if(document.activeElement) document.activeElement.blur();
    window.print();
  });

  // ---------- 啟動 ----------
  var last = read(CUR);
  if(last && last.html && apply(last.html)){
    status("已載入上次內容");
    if(last.tpl && last.tpl !== THASH) toast("範本已更新；按「還原範本」可改用新版");
  }
  setEditable(true);
  refreshList();
})();

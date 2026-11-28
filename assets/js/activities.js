/* الأنشطة: الخرائط التفاعلية، لعبة الذاكرة، لعبة التصنيف، ورقة العمل، مقاطع الفيديو، سجل الفصل، حجم الخط */
(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s);};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
function ar(n){ return String(n).replace(/[\u0660-\u0669\u06F0-\u06F9]/g,function(d){ var c=d.charCodeAt(0); return String(c>=0x06F0?c-0x06F0:c-0x0660); }); }
function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i];a[i]=a[j];a[j]=t; } return a; }
function sg(k){ return window.signSVG ? window.signSVG(k) : ""; }
function isPhone(){ return window.innerWidth<700; }
function store(k,v){ try{ if(v===undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); }catch(e){ return null; } }
function pg(n){ return "ص "+ar(n); }

/* ===== حجم الخط ===== */
var FS=[0.9,1,1.1,1.2,1.35,1.5,1.7], fsI=3;
function fsApply(i, silent){
  fsI=Math.max(0,Math.min(FS.length-1,i));
  document.documentElement.style.setProperty("--fs", FS[fsI]);
  var v=$("#fsval"); if(v) v.textContent=ar(Math.round(FS[fsI]*100))+"٪";
  var m=$("#fsm"), p=$("#fsp"); if(m) m.disabled=fsI===0; if(p) p.disabled=fsI===FS.length-1;
  if(!silent){ store("trf_fs", fsI); try{ window.dispatchEvent(new Event("resize")); }catch(e){} }
}
function fsInit(){
  var host=$("#fsctl"), s=store("trf_fs");
  fsI=(typeof s==="number") ? s : (isPhone()?1:3);
  if(host){
    host.innerHTML='<span class="fsl">حجم الخط</span><button type="button" class="fsb" id="fsm" aria-label="تصغير الخط">A−</button><span id="fsval" class="fsv"></span><button type="button" class="fsb" id="fsp" aria-label="تكبير الخط">A+</button>';
    $("#fsm").onclick=function(){ fsApply(fsI-1); };
    $("#fsp").onclick=function(){ fsApply(fsI+1); };
  }
  fsApply(fsI, true);
}

/* ===== سجل الفصل (localStorage) ===== */
var LK="trf_classlog_v1";
var ACTS=[["content","الشرح"],["sim","المحاكاة"],["map","الخريطة التفاعلية"],["memory","لعبة الذاكرة"],["sort","لعبة التصنيف"],["sheet","ورقة العمل"],["video","مقاطع الفيديو"],["quiz","الاختبار"]];
function curClass(d){ return d.classes.filter(function(c){ return c.id===d.cur; })[0]; }
function logGet(){
  var d=store(LK);
  if(!d || !d.classes || !d.classes.length) d={classes:[{id:"c1",name:"الفصل 1",groups:["الفصل كاملًا"]}],cur:"c1",grp:"الفصل كاملًا",marks:{}};
  if(!d.marks) d.marks={};
  if(!curClass(d)) d.cur=d.classes[0].id;
  var c=curClass(d); if(!c.groups.length) c.groups=["الفصل كاملًا"];
  if(c.groups.indexOf(d.grp)<0) d.grp=c.groups[0];
  return d;
}
function logSave(d){ store(LK,d); }
function mkey(d,lid,act,grp,cid){ return (cid||d.cur)+"|"+(grp||d.grp)+"|"+lid+"|"+act; }
function fmtDate(ts){ var t=new Date(ts); return ar(t.getDate())+"/"+ar(t.getMonth()+1); }
function mark(lid,act,on,grp){ var d=logGet(), k=mkey(d,lid,act,grp); if(on===false) delete d.marks[k]; else d.marks[k]=Date.now(); logSave(d); refreshLog(); }
function logBtn(lid,act){ return '<button type="button" class="btn sm logbtn" data-l="'+lid+'" data-a="'+act+'">✔ سجّل في سجل الفصل</button>'; }
function bindLogBtn(root){
  $$(".logbtn",root).forEach(function(b){ b.onclick=function(){ mark(+b.getAttribute("data-l"), b.getAttribute("data-a"), true); var d=logGet(); b.textContent="✔ سُجّل: "+curClass(d).name+" – "+d.grp; b.disabled=true; }; });
}
var lpHost=null, lpL=null;
function refreshLog(){ if(lpHost && lpHost.isConnected) logPanel(lpHost, lpL, true); }
function classOpts(d){ return d.classes.map(function(c){ return '<option value="'+c.id+'"'+(c.id===d.cur?' selected':'')+'>'+c.name+'</option>'; }).join(""); }
function groupOpts(d){ return curClass(d).groups.map(function(g){ return '<option'+(g===d.grp?' selected':'')+'>'+g+'</option>'; }).join(""); }
function logPanel(host, L, keep){
  lpHost=host; lpL=L;
  var old=host.querySelector("details"), open=keep && old && old.open;
  var d=logGet(), c=curClass(d);
  var done=ACTS.filter(function(a){ return d.marks[mkey(d,L.id,a[0])]; }).length;
  host.innerHTML='<details class="logp"'+(open?' open':'')+'><summary>📋 سجل الفصل لهذا الدرس <span class="lg-sum">'+c.name+' – '+d.grp+': '+ar(done)+' من '+ar(ACTS.length)+'</span></summary>'+
    '<div class="lg-in"><div class="lg-sel"><label>الفصل <select class="lg-c">'+classOpts(d)+'</select></label><label>المجموعة <select class="lg-g">'+groupOpts(d)+'</select></label><a class="btn sm" href="#/log">فتح سجل الفصل كاملًا</a></div>'+
    '<div class="lg-acts">'+ACTS.map(function(a){ var ts=d.marks[mkey(d,L.id,a[0])]; return '<label class="lg-a'+(ts?' on':'')+'"><input type="checkbox" data-a="'+a[0]+'"'+(ts?' checked':'')+'> '+a[1]+(ts?' <small>'+fmtDate(ts)+'</small>':'')+'</label>'; }).join("")+'</div></div></details>';
  $(".lg-c",host).onchange=function(){ var d=logGet(); d.cur=this.value; d.grp=curClass(d).groups[0]; logSave(d); logPanel(host,L,true); };
  $(".lg-g",host).onchange=function(){ var d=logGet(); d.grp=this.value; logSave(d); logPanel(host,L,true); };
  $$(".lg-acts input",host).forEach(function(i){ i.onchange=function(){ mark(L.id, i.getAttribute("data-a"), i.checked); }; });
}
function viewLog(app, crumbs){
  var d=logGet(), c=curClass(d);
  var cols=c.groups;
  var rows=LESSONS.map(function(L){
    return ACTS.map(function(a,ai){
      return '<tr>'+(ai===0?'<th rowspan="'+ACTS.length+'" class="lg-l" style="--c:'+L.color+'">'+L.title+'</th>':'')+'<td class="lg-an">'+a[1]+'</td>'+
        cols.map(function(g){ var ts=d.marks[mkey(d,L.id,a[0],g)]; return '<td class="lg-cell'+(ts?' on':'')+'"><button type="button" data-l="'+L.id+'" data-a="'+a[0]+'" data-g="'+g+'" aria-pressed="'+(ts?'true':'false')+'">'+(ts?'✔ '+fmtDate(ts):'—')+'</button></td>'; }).join("")+'</tr>';
    }).join("");
  }).join("");
  var total=LESSONS.length*ACTS.length;
  var foot='<tr class="lg-pc"><th colspan="2">نسبة الإنجاز</th>'+cols.map(function(g){ var n=0; LESSONS.forEach(function(L){ ACTS.forEach(function(a){ if(d.marks[mkey(d,L.id,a[0],g)]) n++; }); }); return '<td>'+ar(Math.round(n/total*100))+'٪</td>'; }).join("")+'</tr>';
  app.innerHTML=crumbs('<span>›</span><span>سجل الفصل</span>')+'<div class="wrap logview"><h1 class="pg-t">سجل الفصل</h1>'+
    '<p class="lead-s">سجل بسيط لمتابعة إنجاز الفصل أو المجموعات في كل درس. يُحفظ على هذا الجهاز فقط (داخل المتصفح)، ولا يُرسل إلى أي مكان.</p>'+
    '<div class="lg-mgr no-print"><div class="lg-box"><h3>الفصول</h3><label>الفصل الحالي <select id="lgc">'+classOpts(d)+'</select></label>'+
      '<div class="lg-row"><input id="lgcn" type="text" placeholder="اسم الفصل (مثال: 10/3)" maxlength="30"><button type="button" class="btn sm pri" id="lgadd">إضافة فصل</button><button type="button" class="btn sm" id="lgren">تغيير اسم الفصل الحالي</button><button type="button" class="btn sm" id="lgdel">حذف الفصل الحالي</button></div></div>'+
    '<div class="lg-box"><h3>المجموعات في '+c.name+'</h3><div class="lg-groups">'+c.groups.map(function(g,gi){ return '<span class="lg-gchip">'+g+(c.groups.length>1?'<button type="button" data-gi="'+gi+'" aria-label="حذف المجموعة">×</button>':'')+'</span>'; }).join("")+'</div>'+
      '<div class="lg-row"><input id="lggn" type="text" placeholder="اسم المجموعة (مثال: المجموعة الأولى)" maxlength="30"><button type="button" class="btn sm pri" id="lggadd">إضافة مجموعة</button></div></div></div>'+
    '<div class="lg-tblw"><table class="lg-tbl"><caption>'+c.name+' – اضغط على الخانة لتسجيل النشاط أو إلغائه</caption><thead><tr><th>الدرس</th><th>النشاط</th>'+cols.map(function(g){ return '<th>'+g+'</th>'; }).join("")+'</tr></thead><tbody>'+rows+'</tbody><tfoot>'+foot+'</tfoot></table></div>'+
    '<div class="lg-tools no-print"><button type="button" class="btn pri" id="lgprint">🖨 طباعة السجل</button><button type="button" class="btn" id="lgclear">مسح علامات هذا الفصل</button></div></div>';
  function re(){ viewLog(app, crumbs); }
  $("#lgc").onchange=function(){ var d=logGet(); d.cur=this.value; d.grp=curClass(d).groups[0]; logSave(d); re(); };
  $("#lgadd").onclick=function(){ var n=$("#lgcn").value.trim(); if(!n) { $("#lgcn").focus(); return; } var d=logGet(); var id="c"+Date.now(); d.classes.push({id:id,name:n,groups:["الفصل كاملًا"]}); d.cur=id; d.grp="الفصل كاملًا"; logSave(d); re(); };
  $("#lgren").onclick=function(){ var n=$("#lgcn").value.trim(); if(!n){ $("#lgcn").focus(); return; } var d=logGet(); curClass(d).name=n; logSave(d); re(); };
  $("#lgdel").onclick=function(){ var d=logGet(); if(d.classes.length<2){ alert("يجب أن يبقى فصل واحد على الأقل."); return; } if(!confirm("حذف «"+curClass(d).name+"» وكل علاماته؟")) return; var cid=d.cur; d.classes=d.classes.filter(function(x){ return x.id!==cid; }); Object.keys(d.marks).forEach(function(k){ if(k.indexOf(cid+"|")===0) delete d.marks[k]; }); d.cur=d.classes[0].id; logSave(d); re(); };
  $("#lggadd").onclick=function(){ var n=$("#lggn").value.trim(); if(!n){ $("#lggn").focus(); return; } var d=logGet(), c=curClass(d); if(c.groups.indexOf(n)<0) c.groups.push(n); logSave(d); re(); };
  $$(".lg-gchip button",app).forEach(function(b){ b.onclick=function(){ var d=logGet(), c=curClass(d), g=c.groups[+b.getAttribute("data-gi")]; if(!confirm("حذف المجموعة «"+g+"»؟")) return; c.groups=c.groups.filter(function(x){ return x!==g; }); Object.keys(d.marks).forEach(function(k){ if(k.indexOf(d.cur+"|"+g+"|")===0) delete d.marks[k]; }); logSave(d); re(); }; });
  $$(".lg-cell button",app).forEach(function(b){ b.onclick=function(){ var d=logGet(), k=mkey(d,+b.getAttribute("data-l"),b.getAttribute("data-a"),b.getAttribute("data-g")); if(d.marks[k]) delete d.marks[k]; else d.marks[k]=Date.now(); logSave(d); re(); }; });
  $("#lgprint").onclick=function(){ window.print(); };
  $("#lgclear").onclick=function(){ var d=logGet(); if(!confirm("مسح كل علامات «"+curClass(d).name+"»؟")) return; Object.keys(d.marks).forEach(function(k){ if(k.indexOf(d.cur+"|")===0) delete d.marks[k]; }); logSave(d); re(); };
}

/* ===== أدوات الرسم للخرائط (رسوم موضحة من صحائف مشتركة) ===== */
var SKIN="#d9a77a";
var SPRP="assets/img/sprites/", VEHP="assets/img/vehicles/";
function href(src){ return ' href="'+src+'" xlink:href="'+src+'" '; }
function IM(src,x,y,w,h){ return '<image'+href(src)+' x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" preserveAspectRatio="xMidYMid meet"/>'; }
function g(x,y,inner,extra){ return '<g transform="translate('+x+','+y+')'+(extra||"")+'">'+inner+'</g>'; }
function carSrc(col){
  var c=(col||"").toLowerCase();
  if(/00897b|2e7d32|00695c/.test(c)) return SPRP+"car_player.png";
  if(/0d47a1|1565c0|1a237e|283c/.test(c)) return SPRP+"car_navy.png";
  if(/ff6d00|ef6c00|e65100|ff8/.test(c)) return SPRP+"car_orange.png";
  if(/fafafa|ffffff|#fff|eceff|f5f5/.test(c)) return SPRP+"car_white.png";
  if(/8d6e63|7b8794|9e9e|90a4ae|78909c/.test(c)) return SPRP+"car_silver.png";
  var n=0; for(var i=0;i<c.length;i++) n+=c.charCodeAt(i);
  return SPRP+["car_white","car_silver","car_navy","car_orange","car_player"][n%5]+".png";
}
function car(x,y,ang,col,len,extra){
  len=len||72; var h=len, w=len*0.48;
  return g(x,y,IM(carSrc(col),-w/2,-h/2,w,h)+(extra||""), ' rotate('+((+ang||0)+90)+')');
}
function bus(x,y,ang){
  return g(x,y,IM(VEHP+"bus_top.png",-23,-70,46,140),' rotate('+((+ang||0)+90)+')');
}
function fig(src,x,y,s,h0,w0){
  s=s||1; var h=(h0||112)*s, w=h*((w0||0.42));
  return IM(src, x-w/2, y-h, w, h);
}
function man(x,y,s,shirt){ return fig(SPRP+"man.png",x,y,s,118,247/602); }
function woman(x,y,s){ return fig(SPRP+"woman.png",x,y,s,110,206/573); }
function officer(x,y,s){ return fig(SPRP+"officer.png",x,y,s,118,247/595); }
function cyclist(x,y,s){ s=s||1; var h=110*s, w=h*(351/597); return IM(SPRP+"cyclist.png",x-w/2,y-h,w,h); }
function sgInner(k){ return sg(k).replace(/^<svg[^>]*>/,"").replace(/<\/svg>\s*$/,""); }
function sign(k,x,y,s,pole){
  s=s||48; pole=pole==null?26:pole;
  return (pole?'<rect x="'+(x-2)+'" y="'+(y+s/2)+'" width="4" height="'+(pole+s/2)+'" fill="#78909c"/>':'')+
    '<svg x="'+(x-s/2)+'" y="'+(y-s/2)+'" width="'+s+'" height="'+s+'" viewBox="0 0 100 100">'+sgInner(k)+'</svg>';
}
function palm(x,y){
  var n=1+Math.abs((x*3+y*5)|0)%4, sz=96;
  return IM(SPRP+"palm"+n+".png", x-sz/2, y-sz/2, sz, sz);
}
function bldg(x,y,w,h,col){
  var n=1+Math.abs((x*13+y*7)|0)%5;
  return IM(SPRP+"house"+n+".png", x, y, w, h);
}
function zebraH(x,y0,y1,w){ var o=""; for(var y=y0+4;y<y1-8;y+=18) o+='<rect x="'+x+'" y="'+y+'" width="'+(w||56)+'" height="10" fill="#fff"/>'; return o; }
function zebraV(y,x0,x1,h){ var o=""; for(var x=x0+4;x<x1-8;x+=18) o+='<rect x="'+x+'" y="'+y+'" width="10" height="'+(h||50)+'" fill="#fff"/>'; return o; }
function dashH(y,x0,x1,col){ return '<line x1="'+x0+'" y1="'+y+'" x2="'+x1+'" y2="'+y+'" stroke="'+(col||"#fff")+'" stroke-width="4" stroke-dasharray="26 18"/>'; }
function solidH(y,x0,x1,col){ return '<line x1="'+x0+'" y1="'+y+'" x2="'+x1+'" y2="'+y+'" stroke="'+(col||"#fff")+'" stroke-width="4"/>'; }
function curbH(x,y,w,cls){ var c={c1:["#111","#fafafa"],c2:["#111","#fdd835"],c3:["#fafafa","#1e64c8"]}[cls], o=""; for(var i=0;i*20<w;i++) o+='<rect x="'+(x+i*20)+'" y="'+y+'" width="'+Math.min(20,w-i*20)+'" height="8" fill="'+c[i%2]+'"/>'; return o; }
function tlightV(x,y,on){ on=on||"r"; return g(x,y,IM(SPRP+"tlight_v.png",-16,-52,32,120)+'<circle cy="-24" r="7" fill="'+(on==="r"?"#ff1744":"#5a1d1d")+'"/><circle cy="0" r="7" fill="'+(on==="y"?"#ffd600":"#5d4c10")+'"/><circle cy="24" r="7" fill="'+(on==="g"?"#00e676":"#14532d")+'"/>'); }
function tlightH(x,y,on){ on=on||"g"; return g(x,y,IM(SPRP+"tlight_h.png",-42,-18,84,40)+'<circle cx="-24" r="7" fill="'+(on==="r"?"#ff1744":"#5a1d1d")+'"/><circle cx="0" r="7" fill="'+(on==="y"?"#ffd600":"#5d4c10")+'"/><circle cx="24" r="7" fill="'+(on==="g"?"#00e676":"#14532d")+'"/>'); }
function tlightP(x,y){ return g(x,y,IM(SPRP+"tlight_p.png",-16,-40,32,100)+'<circle cy="-12" r="7" fill="#ff1744"/><circle cy="12" r="7" fill="#00e676"/>'); }
function arrowUp(x,y,ang){ return g(x,y,'<path d="M-5 22 V-4 H-12 L0 -22 L12 -4 H5 V22 Z" fill="#fff"/>',' rotate('+(ang||0)+')'); }
function tri(x,y){ return g(x,y,'<path d="M0 -14 L13 9 H-13 Z" fill="none" stroke="#e53935" stroke-width="4" stroke-linejoin="round"/>'); }
function cone(x,y){ return IM(SPRP+"cone1.png", x-16, y-34, 32, 38); }
function label(x,y,t,size,col){ return '<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="'+(size||18)+'" font-weight="700" fill="'+(col||"#333")+'" class="m-lbl">'+t+'</text>'; }
var NOTE="مخطط توضيحي مرسوم (ليس خريطة حقيقية)";

/* ===== الخرائط التفاعلية (النصوص من الكتاب مع رقم الصفحة) ===== */
var MAPS={};
MAPS[1]={title:"شارع في الحي", hint:"اضغط على الدوائر المرقّمة لتقرأ السلوك المروري الصحيح من الكتاب.",
 art:function(){
  var o='<rect width="1000" height="600" fill="#efe7d6"/>';
  o+=bldg(20,30,120,150,"#e8d5b0")+bldg(300,50,150,130,"#f1dfc0")+bldg(470,20,110,160,"#e3cfa6")+bldg(680,40,140,140,"#ead7b4")+bldg(860,60,120,120,"#f3e2c4");
  o+=palm(170,190)+palm(610,190)+palm(840,190);
  o+='<rect x="0" y="196" width="1000" height="44" fill="#d6d0c4"/><rect x="0" y="236" width="1000" height="6" fill="#9e9e9e"/>';
  o+='<rect x="0" y="242" width="1000" height="156" fill="#5b6066"/>'+dashH(320,0,1000);
  o+='<rect x="0" y="372" width="1000" height="26" fill="#2e7d3266"/>'+solidH(372,0,1000,"#fff")+label(330,392,"مسار الدراجات",15,"#fff");
  o+='<rect x="0" y="398" width="1000" height="6" fill="#9e9e9e"/><rect x="0" y="404" width="1000" height="44" fill="#d6d0c4"/>';
  o+=bldg(330,470,170,120,"#f1dfc0")+bldg(560,480,120,110,"#e8d5b0")+bldg(890,470,100,120,"#ead7b4")+palm(720,520)+palm(60,540);
  /* جسر المشاة */
  o+='<rect x="168" y="170" width="58" height="290" fill="#b0bec5" stroke="#78909c" stroke-width="3"/><rect x="168" y="170" width="6" height="290" fill="#78909c"/><rect x="220" y="170" width="6" height="290" fill="#78909c"/>'+label(197,166,"جسر المشاة",15);
  o+=man(197,300,0.9,"#e3f2fd");
  /* معبر المشاة */
  o+=zebraH(570,244,396,56)+woman(598,330,1);
  o+=sign("pedCross",650,212,40,0);
  /* مركبات */
  o+=car(300,358,0,"#1e88e5")+'<g transform="translate(330,322)"><rect x="-14" y="-24" width="28" height="22" rx="4" fill="#263238"/><path d="M-9 -8 L-2 -18 L4 -12 L10 -20" stroke="#4fc3f7" stroke-width="2.5" fill="none"/></g>';
  o+=car(500,358,0,"#8e24aa",72,'<rect x="-20" y="2" width="12" height="11" rx="3" fill="#1565c0"/>');
  o+=car(410,282,180,"#43a047");
  o+=car(790,262,180,"#ef6c00")+man(812,306,0.9)+man(770,236,0.85,"#e8eaf6");
  o+=bus(880,356,0)+'<rect x="930" y="404" width="56" height="8" fill="#1e64c8"/>';
  o+=cyclist(120,392,0.9);
  o+=sign("speed80",960,218,44,0);
  return o;
 },
 hs:[
  {x:300,y:358,t:"التركيز التام (حاضر الذهن)",d:"على قائد المركبة أن يكون بحالة تركيز تام أثناء القيادة عند استخدامه لتطبيقات الملاحة المختلفة، وفهم كيفية دمج هذه التقنية مع القيادة الآمنة دون أن تتحول إلى مصدر خطر أو تشتت.",pg:3},
  {x:410,y:282,t:"المسؤولية الذاتية وتأمين النفس",d:"التزام بارتداء حزام الأمان قبل الانطلاق، والتأكد من التزام جميع الركاب به.",pg:3},
  {x:812,y:300,t:"النزول الآمن من المركبة (قائد المركبة)",d:"مغادرتك للسيارة من جهة الشارع تتطلب يقظة تامة، انظر في المرايا الجانبية والداخلية للتأكد من خلو الطريق من المركبات أو الدراجات القادمة.",pg:3},
  {x:770,y:222,t:"النزول الآمن من المركبة (الراكب)",d:"يجب على الراكب أن يلتزم بمغادرة السيارة من الاتجاه الآمن، وفتح الباب بحذر بعد التأكد من توفر الأمان، والخروج بسرعة ثم إغلاق الباب فورًا لضمان عدم إعاقة حركة السير أو التعرض للخطر.",pg:5},
  {x:500,y:358,t:"الالتزام بحدود المركبة",d:"البقاء داخل مقصورة السيارة، ووضع الأطفال في مقاعد الأمان المخصصة لهم في الخلف.",pg:5},
  {x:880,y:356,t:"المظهر الحضاري في النقل العام",d:"الجلوس بهدوء داخل الباصات، وعدم إزعاج الركاب الآخرين أو الوقوف في الممرات.",pg:5},
  {x:598,y:300,t:"السلوكيات الواجبة على المشاة",d:"المشاة هم الطرف الأكثر عرضة لخطر الحوادث المرورية، لذا فإن وعيهم والتزامهم بإجراءات السلامة يمثلان خط الدفاع الأول لحماية حياتهم، وذلك من خلال استخدام المسارات الآمنة والعبور من الأماكن المخصصة لهم مثل الخطوط وجسور المشاة.",pg:5},
  {x:197,y:440,t:"جسور المشاة",d:"العبور من الأماكن المخصصة للمشاة مثل الخطوط وجسور المشاة.",pg:5},
  {x:120,y:362,t:"راكبو الدراجات",d:"السير في اتجاه حركة المرور وليس عكسها، والالتزام بالمسار المخصص للدراجات (الجانب الأيمن لنهر الطريق) وعدم التنقل بالدراجة بين المركبات. والالتزام التام بارتداء الخوذة على الرأس فهي خط الدفاع الأول والوحيد لحماية الرأس عند السقوط أو الاصطدام.",pg:6},
  {x:960,y:218,t:"التزام حدود السرعة",d:"السرعة ليست مجرد رقم على لوحة القيادة، بل هي قوة تصادمية تزداد بشكل مرعب كلما زادت السرعة. وحرصًا على سلامة كل مستخدمي الطريق قامت الإدارة العامة للمرور بتحديد الحد الأقصى للسرعة على الطرق العامة والفرعية.",pg:4},
  {x:650,y:212,t:"احترام الأنظمة المرورية",d:"الالتزام بمدلول العلامات المرورية والخطوط الأرضية والإشارات الضوئية.",pg:4}
 ]};

MAPS[2]={title:"الطريق السريع والدوار", hint:"علامات إرشادية وتحذيرية وتنظيمية على طريق سريع وطريق فرعي. اضغط على كل علامة لتقرأ مدلولها من الكتاب.",
 art:function(){
  var o='<rect width="1000" height="600" fill="#eee5cf"/>';
  o+='<rect x="0" y="120" width="1000" height="150" fill="#5b6066"/>'+solidH(124,0,1000)+solidH(266,0,1000)+dashH(170,0,1000)+dashH(218,0,1000);
  o+=car(150,145,0,"#1e88e5")+car(560,195,0,"#e53935")+car(840,243,0,"#43a047");
  /* المخرج إلى الدوار */
  o+='<path d="M660 266 Q760 300 790 380" stroke="#5b6066" stroke-width="54" fill="none"/>';
  /* لوحة إرشادية خضراء معلقة */
  o+='<rect x="300" y="18" width="8" height="104" fill="#78909c"/><rect x="692" y="18" width="8" height="104" fill="#78909c"/><rect x="300" y="18" width="400" height="8" fill="#78909c"/>';
  o+='<rect x="320" y="28" width="210" height="80" rx="8" fill="#1b7a3a" stroke="#fff" stroke-width="3"/><rect x="540" y="28" width="150" height="80" rx="8" fill="#1b7a3a" stroke="#fff" stroke-width="3"/>';
  o+='<rect x="460" y="40" width="54" height="32" rx="5" fill="#fff"/><text x="487" y="64" text-anchor="middle" font-size="22" font-weight="800" fill="#1b7a3a">40</text>'+label(395,64,"الأحمدي",24,"#fff")+'<path d="M425 82 V102 M415 92 L425 82 L435 92" stroke="#fff" stroke-width="4" fill="none"/>';
  o+='<rect x="630" y="38" width="48" height="28" rx="5" fill="#fff"/><text x="654" y="59" text-anchor="middle" font-size="20" font-weight="800" fill="#1b7a3a">6</text>'+label(588,58,"الجهراء",17,"#fff")+label(600,82,"المسيلة",17,"#fff")+label(615,102,"500 م",15,"#fff");
  o+=sign("speed80",60,70,50,0)+sign("camera",770,70,50,0);
  /* إرشادية */
  o+=sign("fuel",90,312,44,22)+sign("hospital",190,312,44,22)+sign("museum",290,312,44,22)+sign("parking",390,312,44,22);
  /* الطريق الفرعي والدوار */
  o+='<rect x="0" y="420" width="760" height="74" fill="#5b6066"/>'+dashH(457,0,700);
  o+='<rect x="808" y="0" width="0" height="0"/><rect x="790" y="494" width="70" height="106" fill="#5b6066"/><rect x="880" y="330" width="120" height="70" fill="#5b6066"/>';
  o+='<circle cx="830" cy="440" r="104" fill="#5b6066"/><circle cx="830" cy="440" r="50" fill="#7cb342" stroke="#fff" stroke-width="4"/>'+palm(830,456);
  o+='<rect x="310" y="494" width="70" height="106" fill="#5b6066"/><rect x="310" y="494" width="70" height="6" fill="#fff"/>';
  o+=cone(200,470)+cone(230,470)+cone(260,470)+sign("works",150,530,42,14);
  o+=sign("pedAhead",470,530,42,14)+sign("hump",560,530,42,14)+sign("noparking",650,530,42,14);
  o+=sign("stop",420,560,40,0)+sign("yield",700,390,40,14)+sign("roundabout",620,390,40,14)+sign("noentry",960,300,40,0);
  o+=car(100,475,0,"#8e24aa")+car(345,560,-90,"#00897b");
  return o;
 },
 hs:[
  {x:505,y:66,t:"علامة إرشادية على الطريق السريع",d:"علامة إرشادية توضح السير على طريق رقم (40) باتجاه مدينة الأحمدي مع وجود مخرج على بعد (500) متر يؤدي إلى الطريق رقم (6) والذي يؤدي إلى منطقة الجهراء أو منطقة المسيلة.",pg:12},
  {x:90,y:312,t:"وقود (علامة إرشادية)",d:"العلامات الإرشادية تُستخدم لتوجيه مستخدمي الطريق وتزويدهم بالمعلومات المهمة عن الطرق والخدمات والمرافق مثل المستشفيات ومحطات الوقود ومواقف الانتظار.",pg:10},
  {x:190,y:312,t:"مستشفى (علامة إرشادية)",d:"تحتوي العلامات الإرشادية الأخرى بصفة عامة على رسائل أو رموز باللون الأسود على رقعة بيضاء تحيط بها خلفية زرقاء.",pg:10},
  {x:290,y:312,t:"الأماكن السياحية والمتاحف",d:"ومؤخرًا ظهرت علامات إرشادية جديدة تدل على الأماكن السياحية والمتاحف في الدولة وهي ذات أشكال مستطيلة على خلفية بنية اللون.",pg:10},
  {x:390,y:312,t:"مواقف انتظار (علامة إرشادية)",d:"وتتخذ معظم العلامات الإرشادية شكلًا مستطيلًا، وهي تحتوي على رسائل وأسهم باللون الأبيض على خلفية زرقاء أو خضراء أو صفراء.",pg:10},
  {x:470,y:530,t:"أمامك معبر للمشاة (تحذيرية)",d:"وتستعمل هذه العلامات لتنبيه مستخدمي الطريق لبيان نوع الطريق وحالته، وتوضع هذه العلامات قبل نقطة الخطر وعلى مسافات مناسبة، بحيث يمكن رؤيتها في الليل والنهار، ويستعمل لها الشكل المثلث الأحمر بأرضية بيضاء.",pg:13},
  {x:560,y:530,t:"أمامك مطبات (تحذيرية)",d:"«كل المثلثات الحمراء تعني تحذير».",pg:13},
  {x:770,y:70,t:"احذر أمامك كاميرا",d:"وهناك استثناء على هذه القواعد فيما يختص بالعلامات التحذيرية: تدل علامة «احذر أمامك كاميرا» بأهمية خاصة فيما يتعلق بتحذير قائدي المركبات.",pg:13},
  {x:620,y:390,t:"أمامك دوران (علامة جبرية)",d:"العلامات الجبرية: وهي العلامات التي تلزم السائقين بما يجب عمله تطبيقًا لقانون المرور وتنظيم حركة السير، ويستعمل لها الشكل المستدير المطلي باللون الأزرق والرسم بالأبيض.",pg:14},
  {x:960,y:300,t:"ممنوع الدخول (علامة منع)",d:"علامات المنع: وتوضع في المكان المباشر للنقطة التي سيبدأ عندها المنع، أو على مسافة كافية إذا رأت السلطات المسؤولة ضرورة التنبيه على مستخدمي الطريق.",pg:15},
  {x:650,y:530,t:"ممنوع الانتظار (علامة منع)",d:"ويستعمل لها الشكل المستدير وتكون غالبية العلامات باللون الأسود على أرضية بيضاء ولها إطار دائري أحمر وغالبيتها يستخدم لها خط مائل أحمر. «كل الدوائر الحمراء تعني ممنوع».",pg:15},
  {x:60,y:70,t:"أقصى سرعة (علامة منع)",d:"علامات المنع شكلها مستدير ولها إطار دائري أحمر. «كل الدوائر الحمراء تعني ممنوع».",pg:15},
  {x:420,y:560,t:"علامة «قف»",d:"تُعد علامة «قف» من أهم العلامات المرتبطة بسلامة الطريق، وتمتاز عالميًا بشكلها المثمن ذي الأضلاع الثمانية، مما يسهل تمييزها والتعرف عليها فورًا من قِبل السائقين، تشير إلى ضرورة لمعرفة حالة الطريق وتستخدم عند التقاء طرق فرعية بأخرى رئيسية.",pg:16},
  {x:700,y:390,t:"علامة «افسح الطريق»",d:"تدل علامة «افسح الطريق» بأهمية كبيرة أيضًا فيما يختص بالسلامة على الطريق والتحكم في حركة المرور في الدوارات والتقاطعات ذات الأولوية في المرور، وتتخذ هذه العلامة شكل مثلث مقلوب، بأرضية صفراء اللون تشير إلى أولوية حركة المرور في الدوار أو الطريق الرئيسي على حركة المرور المندمجة.",pg:16},
  {x:150,y:530,t:"علامات مناطق العمل المؤقتة",d:"علامات مناطق العمل تحذر وتنظم لوضع طارئ وغير عادي ومؤقت على الطريق يجب مراعاتها من قبل السائقين ومستخدمي الطريق، وتكون ذات أرضية صفراء وإطار أحمر والكتابة أو الرسم بالأسود.",pg:16}
 ]};

MAPS[3]={title:"تقاطع بإشارات ضوئية", hint:"تقاطع فيه إشارات ضوئية وخطوط أرضية وخطوط رصيف. اضغط على كل رقم لتتعرف عليه من الكتاب.",
 art:function(){
  var o='<rect width="1000" height="600" fill="#eee5cf"/>';
  o+=bldg(20,20,150,150,"#e8d5b0")+bldg(640,20,140,150,"#f1dfc0")+bldg(820,30,160,140,"#e3cfa6")+bldg(20,430,170,150,"#ead7b4")+bldg(700,440,160,140,"#f3e2c4");
  o+='<rect x="0" y="210" width="1000" height="180" fill="#5b6066"/><rect x="410" y="0" width="180" height="600" fill="#5b6066"/>';
  o+=curbH(600,202,400,"c1")+curbH(0,390,410,"c2")+curbH(590,390,410,"c3");
  o+='<rect x="0" y="202" width="410" height="8" fill="#9e9e9e"/>';
  /* خطوط طولية */
  o+=solidH(300,0,330)+solidH(296,670,1000)+'<line x1="670" y1="306" x2="1000" y2="306" stroke="#fff" stroke-width="4" stroke-dasharray="22 16"/>'+dashH(255,0,330)+dashH(345,670,1000);
  o+='<line x1="500" y1="0" x2="500" y2="140" stroke="#fff" stroke-width="4" stroke-dasharray="22 16"/><line x1="500" y1="460" x2="500" y2="600" stroke="#fff" stroke-width="4"/>';
  /* خطوط عرضية: خط الوقوف ومعبر المشاة */
  o+='<rect x="324" y="300" width="8" height="90" fill="#fff"/>'+zebraH(340,212,388,50);
  o+='<rect x="668" y="210" width="8" height="90" fill="#fff"/>'+zebraH(612,212,388,50);
  o+=zebraV(150,412,588,48)+'<line x1="500" y1="452" x2="588" y2="452" stroke="#fff" stroke-width="6" stroke-dasharray="14 10"/>'+zebraV(402,412,588,46);
  /* المربع الأصفر */
  var hb=''; for(var i=-6;i<12;i++) hb+='<line x1="'+(412+i*20)+'" y1="212" x2="'+(412+i*20+176)+'" y2="388" stroke="#fdd835" stroke-width="3"/><line x1="'+(588-i*20)+'" y1="212" x2="'+(588-i*20-176)+'" y2="388" stroke="#fdd835" stroke-width="3"/>';
  o+='<clipPath id="ybx"><rect x="412" y="212" width="176" height="176"/></clipPath><g clip-path="url(#ybx)">'+hb+'</g><rect x="412" y="212" width="176" height="176" fill="none" stroke="#fdd835" stroke-width="5"/>';
  o+=arrowUp(250,345,90)+arrowUp(250,255,-90)+arrowUp(780,255,-90)+arrowUp(780,345,90);
  /* إشارات */
  o+=tlightV(385,120,"r")+tlightH(660,440,"g")+tlightP(388,470);
  o+='<rect x="40" y="186" width="6" height="24" fill="#78909c"/><rect x="250" y="186" width="6" height="24" fill="#78909c"/><rect x="30" y="182" width="236" height="10" fill="#78909c"/><rect x="34" y="120" width="228" height="64" rx="6" fill="#111" stroke="#455a64" stroke-width="4"/>'+label(148,165,"ضباب",30,"#ffb300");
  o+='<rect x="866" y="190" width="6" height="0"/>'+'<g transform="translate(900,150)"><rect x="-3" y="0" width="6" height="52" fill="#78909c"/><rect x="-22" y="-16" width="34" height="18" rx="4" fill="#eceff1" stroke="#455a64" stroke-width="2"/><circle cx="-22" cy="-7" r="6" fill="#263238"/></g>';
  o+=car(200,345,0,"#1e88e5")+car(290,345,0,"#ef6c00")+car(830,255,180,"#43a047")+car(455,80,90,"#8e24aa")+bus(860,352,0);
  o+=officer(470,300,1.05)+woman(370,560,0.9)+man(620,560,0.9);
  return o;
 },
 hs:[
  {x:385,y:120,t:"الإشارة الرأسية",d:"إذا كان وضعها بشكل رأسي فاللون الأحمر يكون بالأعلى والذي يدل على التوقف وعدم الحركة، ثم يليه اللون الأصفر والذي ينبه سائقي المركبات للتوقف، وأخيرًا اللون الأخضر بالأسفل ويعني استمرار حركة المرور أو السماح بالسير إذا لم تكن حركة المرور متوقفة بتقاطع الإشارات.",pg:17},
  {x:660,y:440,t:"الإشارة الأفقية",d:"أما إذا كان وضع إشارة المرور الضوئية أفقيًا فيكون اللون الأحمر جهة اليسار، ثم يليه اللون الأصفر في المنتصف، ثم يليه اللون الأخضر جهة اليمين.",pg:17},
  {x:388,y:470,t:"إشارات المشاة",d:"وهناك نوع آخر من إشارات المرور الضوئية مخصصة للمشاة فقط، وهي ذات لونين: الأحمر في الأعلى ويدل على منع المرور وضرورة التوقف، واللون الأخضر والذي يرمز إلى إمكانية مواصلة السير وقطع الطريق بعد أخذ كافة إجراءات السلامة والتأكد من خلو الطريق من المركبات العابرة.",pg:17},
  {x:148,y:152,t:"شاشات الرسائل المتغيرة الإلكترونية",d:"تتميز هذه الشاشات بإعطاء إشارات ورسائل متغيرة على الطرق السريعة، وهي التي وضعت بهدف عرض الرسائل التوعوية لسائقي المركبات لإعلامهم بمتغيرات الطريق والظروف الجوية مثل الضباب والحوادث وأعمال الطرق والاختناقات وغيرها.",pg:17},
  {x:890,y:143,t:"أنظمة الضبط والمراقبة المرورية",d:"كاميرات ذات اتصال مباشر بغرف المراقبة والتحكم المروري، تمكنهم من معرفة حالة الطريق وانسيابية حركة المرور وتصوير المركبات المخالفة واستخراج بياناتها وتحرير المخالفة في حق أصحابها.",pg:18},
  {x:120,y:300,t:"خطوط طولية متصلة",d:"وهي تقيد حرية قائد المركبة في عدم إمكانية المرور من فوقها عبورًا إلى المسار الآخر (التجاوز).",pg:19},
  {x:120,y:255,t:"خطوط طولية متقطعة",d:"حيث تفيد إمكان التجاوز وإمكانية العبور من فوقها إلى المسار الآخر بعد إعطاء الإشارة الدالة على اتجاه حركة المركبة والتأكد من تأمين الطريق.",pg:19},
  {x:940,y:301,t:"خط متصل وبجواره خط متقطع",d:"وإذا ما وجد خط متصل وبجواره خط متقطع فإن قاعدة التجاوز تعتمد كليًا على الخط الأقرب إلى السائق.",pg:19},
  {x:328,y:370,t:"خط وقوف المركبات",d:"الخطوط الأرضية العرضية تستخدم في تحديد خط وقوف المركبات قبل إشارة المرور الضوئية. وقد تكون الخطوط العرضية متصلة وتعني «قف».",pg:20},
  {x:365,y:230,t:"معبر المشاة",d:"الخطوط الأرضية العرضية تكون بعرض الطريق، وهي تستخدم في تحديد أماكن عبور المشاة.",pg:20},
  {x:544,y:452,t:"خط عرضي متقطع",d:"فإذا كانت متقطعة بعرض الطريق فهي تعني أفسح الطريق مع عدم الالتزام بالتوقف إذا كان الطريق يسمح بذلك.",pg:20},
  {x:540,y:250,t:"مربع التقاطع (المربع الأصفر)",d:"خطوط أرضية صفراء متقاطعة ومائلة عند التقاطعات (ممنوع التوقف قطعيًا).",pg:21},
  {x:250,y:255,t:"الأسهم الأرضية",d:"الأسهم الأرضية لتحديد المسارات، وهي مجموعة من الأسهم التي توضح اتجاهات المرور.",pg:21},
  {x:780,y:206,t:"الخطوط السوداء والبيضاء المتتالية",d:"تستخدم على طول المسافة التي يسمح فيها بوقوف المركبات.",pg:21},
  {x:200,y:394,t:"الخطوط السوداء والصفراء المتتالية",d:"تستخدم على طول المسافة التي يمنع فيها وقوف المركبات.",pg:21},
  {x:960,y:394,t:"الخطوط البيضاء والزرقاء المتتالية",d:"تستخدم على طول المسافة المخصصة لوقوف الباصات.",pg:21},
  {x:470,y:262,t:"رجل المرور",d:"تذكّر دائمًا أن تعليمات رجل المرور لها الأولوية عن الإشارات الضوئية والعلامات المرورية.",pg:21}
 ]};

MAPS[4]={title:"الطريق السريع والدوار والتقاطع", hint:"طريق سريع بثلاثة مسارات، ودوار وتقاطعات. اضغط على كل رقم لتقرأ قاعدة القيادة الوقائية من الكتاب.",
 art:function(){
  var o='<rect width="1000" height="600" fill="#eee5cf"/>';
  o+='<rect x="0" y="40" width="1000" height="16" fill="#9e9e9e"/><rect x="0" y="56" width="1000" height="186" fill="#5b6066"/>'+solidH(60,0,1000,"#fdd835")+dashH(118,0,1000)+dashH(178,0,1000)+solidH(238,0,1000);
  o+='<rect x="0" y="242" width="1000" height="34" fill="#80868c"/>';
  o+=label(60,95,"الأيسر",16,"#fff")+label(60,155,"الأوسط",16,"#fff")+label(60,215,"الأيمن",16,"#fff");
  o+='<path d="M60 380 Q200 360 300 300 Q360 262 470 250" stroke="#5b6066" stroke-width="46" fill="none"/>'+label(150,345,"مدخل",16,"#fff");
  o+='<path d="M640 252 Q760 262 790 380" stroke="#5b6066" stroke-width="46" fill="none"/>'+label(760,312,"مخرج",16,"#fff");
  /* النقطة العمياء */
  o+='<path d="M560 150 L470 120 L470 180 Z" fill="#ff7043" opacity=".45"/>'+car(600,150,0,"#1e88e5")+car(500,92,0,"#9e9e9e");
  /* تغيير المسار */
  o+=car(330,205,-12,"#43a047")+'<path d="M370 196 l10 -6 l-2 12 Z" fill="#ffb300"/>'+'<path d="M300 210 Q330 190 380 150" stroke="#fff" stroke-width="3" stroke-dasharray="6 6" fill="none"/>';
  o+=car(180,92,0,"#ef6c00")+car(760,210,0,"#00897b");
  /* عطل على الكتف */
  o+=car(900,259,0,"#8e24aa",64)+tri(840,262)+'<circle cx="934" cy="252" r="5" fill="#ffb300"/><circle cx="934" cy="266" r="5" fill="#ffb300"/>';
  /* عاصفة ترابية */
  o+='<rect x="880" y="56" width="120" height="186" fill="#c8a165" opacity=".55"/><path d="M890 90 q15 -10 30 0 t30 0 t30 0 M890 140 q15 -10 30 0 t30 0 t30 0 M890 190 q15 -10 30 0 t30 0 t30 0" stroke="#8d6e63" stroke-width="4" fill="none"/>';
  /* الطريق الرئيسي والفرعي والدوار */
  o+='<rect x="0" y="430" width="740" height="70" fill="#5b6066"/>'+dashH(465,0,700);
  o+='<rect x="510" y="500" width="64" height="100" fill="#5b6066"/><rect x="510" y="500" width="64" height="7" fill="#fff"/>'+label(542,580,"فرعي",15,"#fff")+label(640,488,"رئيسي",15,"#fff");
  o+='<rect x="170" y="340" width="64" height="260" fill="#5b6066"/>';
  o+='<circle cx="830" cy="470" r="100" fill="#5b6066"/><circle cx="830" cy="470" r="46" fill="#7cb342" stroke="#fff" stroke-width="4"/>'+palm(830,486)+'<rect x="860" y="560" width="64" height="40" fill="#5b6066"/>';
  o+=car(830,397,180,"#e53935",58)+car(730,465,0,"#1565c0",62);
  o+=car(188,400,90,"#ef6c00",58)+car(110,482,0,"#43a047",58)+car(558,545,-90,"#8e24aa",58)+car(420,447,180,"#00897b",58);
  o+=car(330,480,0,"#455a64",58)+'<path d="M359 472 L440 455 L440 505 L359 488 Z" fill="#fff59d" opacity=".6"/>';
  return o;
 },
 hs:[
  {x:250,y:90,t:"المسار الأيسر",d:"هو للتجاوز بسرعة لا تتعدى السرعة المقررة في الشارع أو الانعطاف إلى جهة اليسار.",pg:26},
  {x:250,y:150,t:"المسار الأوسط",d:"يستخدم لتجاوز السيارات البطيئة على الجانب الأيمن والتوجه للأمام.",pg:26},
  {x:680,y:210,t:"المسار الأيمن",d:"يستخدم للسير بسرعة أقل من السرعة المقررة (الحد الأعلى للسرعة) أو الاستمرار بالسير للأمام أو الانعطاف يمينًا قبل الوصول.",pg:26},
  {x:500,y:120,t:"النقطة العمياء",d:"هي المناطق التي لا يستطيع السائق رؤيتها من خلال المرايا التقليدية (الداخلية والجانبية)، وهي مسبب رئيسي لحوادث الاصطدام عند تغيير المسار. النقطة العمياء: تختفي المركبة من المرايا وتكون في النقطة العمياء (لا تراها في أي مرآة).",pg:33},
  {x:340,y:180,t:"تغيير مسار السير (التجاوز)",d:"1- إعطاء الإشارة الضوئية الدالة على الجهة المطلوبة يسارًا أو يمينًا. 2- النظر في المرايا المختلفة للتأكد من خلو الطريق بمسافة كافية تسمح بتغيير المسار. 3- القيام بتغيير خط السير بالانعطاف قليلًا إلى خط السير الجديد مع ضبط السرعة المناسبة.",pg:30},
  {x:870,y:262,t:"الأعطال المفاجئة",d:"إخراج المركبة من نهر الطريق وإيقافها على جانبه الأيمن. استخدام مثلث التحذير بوضعه خلف المركبة وعلى مسافة مناسبة منها، والتنبيه بأنوار التنبيه.",pg:32},
  {x:150,y:365,t:"الدخول إلى مسار طريق رئيسي",d:"استخدام الإشارة الضوئية الدالة على الاتجاه المطلوب. التأكد من خلو الطريق من المركبات والمشاة. توجيه عجلة القيادة والدخول في المسار المطلوب.",pg:30},
  {x:745,y:300,t:"الخروج عن مسار طريق رئيسي",d:"استخدام الإشارة الضوئية الدالة على الاتجاه المطلوب. التزام المسار الأيمن من الطريق مع تخفيض السرعة. توجيه عجلة القيادة للخروج في الوقت المناسب.",pg:30},
  {x:940,y:120,t:"العواصف الترابية",d:"تخفيض السرعة تدريجيًا وتجنب الوقوف المفاجئ. وفي حالة العواصف الترابية يلتزم السائق بما سبق مع التوقف بعيدًا عن مسار الطريق إذا لزم الأمر لحين انتهاء العاصفة مع استعمال ضوء التحذير لتنبيه الآخرين.",pg:31},
  {x:745,y:425,t:"الأولوية في الدوارات",d:"تكون الأولوية لمن هم داخل حرم الدوار (القادم من اليسار)، لذا يجب قبل دخولك الدوار التهدئة أو التوقف لإعطاء المجال للسيارات القادمة من جهة اليسار والتي بدأت بالفعل في الدوران.",pg:28},
  {x:202,y:465,t:"الأولوية في التقاطعات",d:"في حال الوصول إلى تقاطع تتساوى فيه جميع الطرق ولا يكون منظمًا بإشارات ضوئية أو علامات مرورية، تكون أولوية المرور للمركبة التي تصل أولًا إلى التقاطع، وعند تزامن الوصول تكون الأولوية دائمًا للمركبة القادمة من جهة اليمين.",pg:28},
  {x:542,y:515,t:"تقاطع شارع رئيسي وشارع فرعي",d:"تكون الأولوية للسيارات التي تسير في الشارع الرئيسي.",pg:28},
  {x:400,y:480,t:"الاستخدام الذكي لأنوار المركبة",d:"الأنوار هي «لغة الإشارة» بينك وبين السائقين الآخرين. نور التلاقي (العادي): يستخدم في إنارة الطريق أمام المركبة لمسافة محدودة دون تسبب في مضايقة السائقين القادمين في الاتجاه المقابل.",pg:27}
 ]};

/* ===== تبويب الخريطة ===== */
function mapDefs(){
  var t="assets/img/tiles/";
  function pat(id,file,sz){ return '<pattern id="'+id+'" patternUnits="userSpaceOnUse" width="'+sz+'" height="'+sz+'">'+IM(t+file,0,0,sz,sz)+'</pattern>'; }
  return '<defs>'+pat("tex-sand","sand.jpg",256)+pat("tex-asphalt","asphalt.jpg",220)+pat("tex-sidewalk","sidewalk.jpg",160)+pat("tex-grass","grass.jpg",220)+'</defs>';
}
function dressArt(str){
  return String(str)
    .replace(/fill="#efe7d6"/g,'fill="url(#tex-sand)"')
    .replace(/fill="#5b6066"/g,'fill="url(#tex-asphalt)"')
    .replace(/fill="#d6d0c4"/g,'fill="url(#tex-sidewalk)"');
}
function hsSVG(h,i){
  var ox=h.ox!=null?h.ox:(h.x>950?-28:28), oy=h.oy!=null?h.oy:(h.y<40?28:-28);
  return '<g class="hs" data-i="'+i+'" transform="translate('+h.x+','+h.y+')" tabindex="0" role="button" aria-label="'+h.t+'"><circle r="30" class="hs-hit"/><line x1="0" y1="0" x2="'+ox+'" y2="'+oy+'" class="hs-ln"/><g transform="translate('+ox+','+oy+')"><circle r="21" class="hs-ring"/><circle r="15" class="hs-dot"/><text y="6" text-anchor="middle" class="hs-n">'+ar(i+1)+'</text></g></g>';
}
function mapTab(b, L){
  var M=MAPS[L.id], mode="explore", seen={}, q=[], qi=0, score=0, firstTry=true, locked=false;
  b.innerHTML='<section class="map-wrap"><div class="map-top"><h2 class="map-t">الخريطة التفاعلية: '+M.title+'</h2><div class="seg" role="group"><button type="button" class="btn sm on" data-m="explore">استكشف</button><button type="button" class="btn sm" data-m="quiz">أين تجدها؟</button></div></div>'+
    '<p class="hint map-hint">'+M.hint+'</p><div class="map-grid"><div class="map-stage"><svg viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="map-svg" role="img" aria-label="'+M.title+'">'+mapDefs()+dressArt(M.art())+
    '<rect x="300" y="570" width="400" height="26" rx="6" fill="#fffc"/><text x="500" y="590" text-anchor="middle" font-size="16" fill="#555">'+NOTE+'</text>'+
    M.hs.map(hsSVG).join("")+'</svg></div><aside class="map-info" aria-live="polite"></aside></div>'+
    '<ol class="map-list">'+M.hs.map(function(h,i){ return '<li><button type="button" data-i="'+i+'"><b>'+ar(i+1)+'</b> '+h.t+'</button></li>'; }).join("")+'</ol></section>';
  var info=$(".map-info",b), stage=$(".map-stage",b);
  function prog(){ return Object.keys(seen).length; }
  function showInfo(i){
    var h=M.hs[i];
    info.innerHTML='<span class="mi-k">'+ar(i+1)+'</span><h3>'+h.t+'</h3><p>'+h.d+'</p><p class="mi-pg">المصدر: كتاب الثقافة المرورية – '+pg(h.pg)+'</p>'+
      '<p class="mi-prog">استكشفت '+ar(prog())+' من '+ar(M.hs.length)+'</p>'+(prog()===M.hs.length?'<p class="ok">✔ أحسنت! استكشفت كل نقاط الخريطة.</p>'+logBtn(L.id,"map"):'');
    bindLogBtn(info);
  }
  function intro(){ info.innerHTML='<h3>استكشف الخريطة</h3><p>اضغط على أي رقم في الخريطة أو في القائمة لتظهر المعلومة من الكتاب هنا.</p><p class="mi-prog">استكشفت '+ar(prog())+' من '+ar(M.hs.length)+'</p>'; }
  function hsEl(i){ return $('.hs[data-i="'+i+'"]',b); }
  function ask(){
    if(qi>=q.length){ info.innerHTML='<h3>انتهى التحدي</h3><p class="big-sc">'+ar(score)+' من '+ar(q.length)+'</p><p>عدد الإجابات الصحيحة من المحاولة الأولى.</p><button type="button" class="btn pri again">العب مرة أخرى</button> '+logBtn(L.id,"map"); bindLogBtn(info); $(".again",info).onclick=function(){ setMode("quiz"); }; return; }
    firstTry=true; locked=false;
    info.innerHTML='<p class="mi-prog">السؤال '+ar(qi+1)+' من '+ar(q.length)+' | النقاط '+ar(score)+'</p><h3>أين تجد: «'+M.hs[q[qi]].t+'»؟</h3><p>اضغط على المكان الصحيح في الخريطة.</p>';
  }
  function pick(i){
    var el=hsEl(i); if(!el) return;
    if(mode==="explore"){
      $$(".hs.sel",b).forEach(function(x){ x.classList.remove("sel"); }); el.classList.add("sel","done"); seen[i]=1;
      var li=$('.map-list button[data-i="'+i+'"]',b); if(li) li.classList.add("done");
      showInfo(i);
      if(isPhone()) info.scrollIntoView({block:"nearest",behavior:"smooth"});
      return;
    }
    if(locked || qi>=q.length) return;
    if(i===q[qi]){
      locked=true; if(firstTry) score++; el.classList.add("done","sel");
      var h=M.hs[i];
      info.innerHTML='<p class="ok">✔ صحيح'+(firstTry?'':' (بعد محاولة)')+'</p><h3>'+h.t+'</h3><p>'+h.d+'</p><p class="mi-pg">'+pg(h.pg)+'</p><button type="button" class="btn pri nx">'+(qi+1<q.length?"التالي":"النتيجة")+'</button>';
      $(".nx",info).onclick=function(){ $$(".hs.sel",b).forEach(function(x){ x.classList.remove("sel"); }); qi++; ask(); };
    } else {
      firstTry=false; el.classList.add("bad"); setTimeout(function(){ el.classList.remove("bad"); },650);
      var fb=$(".mi-try",info); if(!fb){ fb=document.createElement("p"); fb.className="no mi-try"; info.appendChild(fb); } fb.textContent="✘ ليس هذا المكان، حاول مرة أخرى.";
    }
  }
  function setMode(m){
    mode=m; $$(".seg .btn",b).forEach(function(x){ x.classList.toggle("on", x.getAttribute("data-m")===m); });
    stage.classList.toggle("quizmode", m==="quiz"); $(".map-list",b).hidden=(m==="quiz");
    $$(".hs",b).forEach(function(x){ x.classList.remove("sel","done","bad"); });
    if(m==="quiz"){ q=shuffle(M.hs.map(function(_,i){return i;})); qi=0; score=0; ask(); }
    else { Object.keys(seen).forEach(function(i){ var e=hsEl(i); if(e) e.classList.add("done"); }); intro(); }
  }
  $$(".seg .btn",b).forEach(function(x){ x.onclick=function(){ setMode(x.getAttribute("data-m")); }; });
  $$(".hs",b).forEach(function(x){
    x.addEventListener("click",function(){ pick(+x.getAttribute("data-i")); });
    x.addEventListener("keydown",function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); pick(+x.getAttribute("data-i")); } });
  });
  $$(".map-list button",b).forEach(function(x){ x.onclick=function(){ pick(+x.getAttribute("data-i")); }; });
  intro();
  window.__map={pick:pick, setMode:setMode, M:M, get:function(){ return {mode:mode, seen:prog(), qi:qi, score:score, cur:q[qi]}; }};
}

/* ===== لعبة الذاكرة ===== */
var MEMORY={};
MEMORY[1]={title:"ذاكرة السلوك المروري", pairs:[
  ["حزام الأمان","ارتداؤه قبل الانطلاق والتأكد من التزام جميع الركاب به"],
  ["التركيز التام","حاضر الذهن عند استخدام تطبيقات الملاحة"],
  ["النزول الآمن","انظر في المرايا الجانبية والداخلية"],
  ["الالتزام بحدود المركبة","وضع الأطفال في مقاعد الأمان المخصصة لهم في الخلف"],
  ["المظهر الحضاري","الجلوس بهدوء داخل الباصات"],
  ["المشاة","العبور من الخطوط وجسور المشاة"],
  ["الخوذة الواقية","خط الدفاع الأول والوحيد لحماية الرأس"],
  ["العواكس الفسفورية","رؤيتك من قبل سائقي السيارات من مسافات بعيدة"],
  ["أنوار الدراجة","إضاءة أمامية وخلفية قوية"],
  ["المقود","الإمساك به بكلتا اليدين"],
  ["سرعة 100 كم/س","يعادل السقوط من ارتفاع 39 مترًا"],
  ["احترام الأنظمة المرورية","العلامات والخطوط الأرضية والإشارات الضوئية"]]};
MEMORY[2]={title:"ذاكرة العلامات المرورية", pairs:[
  [{s:"hospital"},"مستشفى"],[{s:"parking"},"مواقف انتظار"],[{s:"fuel"},"وقود"],[{s:"museum"},"الأماكن السياحية والمتاحف"],
  [{s:"lightsAhead"},"أمامك إشارة ضوئية"],[{s:"pedAhead"},"أمامك معبر للمشاة"],[{s:"hump"},"أمامك مطبات"],[{s:"bends"},"أمامك منحنى"],
  [{s:"roundabout"},"أمامك دوران"],[{s:"noentry"},"ممنوع الدخول"],[{s:"noparking"},"ممنوع الانتظار"],[{s:"stop"},"قف"],
  [{s:"yield"},"افسح الطريق"],[{s:"camera"},"احذر أمامك كاميرا"]]};
MEMORY[3]={title:"ذاكرة الإشارات والخطوط", pairs:[
  ["الأحمر في الإشارة الرأسية","بالأعلى ويدل على التوقف"],["الأخضر في الإشارة الرأسية","بالأسفل ويعني استمرار حركة المرور"],
  ["اللون الأصفر","ينبه سائقي المركبات للتوقف"],["الإشارة الأفقية","الأحمر جهة اليسار"],["إشارات المشاة","ذات لونين: الأحمر والأخضر"],
  ["شاشات الرسائل المتغيرة","الضباب والحوادث وأعمال الطرق"],[{l:"solid"},"خط طولي متصل: لا تجاوز"],[{l:"dash"},"خط طولي متقطع: يمكن التجاوز"],
  [{c:"c1"},"يُسمح بالوقوف"],[{c:"c2"},"يُمنع الوقوف"],[{c:"c3"},"وقوف الباصات"],[{y:1},"ممنوع التوقف قطعيًا"],["رجل المرور","تعليماته لها الأولوية"]]};
MEMORY[4]={title:"ذاكرة القيادة الوقائية", pairs:[
  ["المسار الأيمن","سرعة أقل من المقررة أو الانعطاف يمينًا"],["المسار الأوسط","تجاوز السيارات البطيئة على الجانب الأيمن"],["المسار الأيسر","التجاوز بسرعة لا تتعدى السرعة المقررة"],
  ["أنوار الموضع","تحدد أبعاد المركبة"],["نور التلاقي (العادي)","إنارة الطريق لمسافة محدودة"],["نور السياقة (العالي)","إنارة الطريق على مسافة طويلة"],
  ["أنوار الانتظار","التوقف الاضطراري"],["أداة التنبيه (الهرن)","في حالات الضرورة فقط"],["الدوار","الأولوية لمن هم داخل حرم الدوار"],
  ["تقاطع تتساوى فيه الطرق","عند التزامن: الأولوية للقادم من اليمين"],["النقطة العمياء","لا تراها في أي مرآة"],["انفجار أحد الإطارات","تجنب الضغط على الفرامل نهائيًا"],
  ["العاصفة الترابية","التوقف بعيدًا عن المسار مع ضوء التحذير"],["العطل المفاجئ","مثلث التحذير خلف المركبة"]]};
var ICON_KEYS=[
  [/حزام/,"icon_seatbelt"],[/مشا|عبور/,"icon_pedestrian"],[/خوذة/,"icon_helmet"],
  [/مقود|عجل[ةه] القيادة/,"icon_wheel"],[/عاصف|تراب|ضباب/,"icon_sandstorm"],[/إطار/,"icon_tire"],
  [/بطاري/,"icon_battery"],[/محرك/,"icon_engine"],[/رخص|هوي/,"icon_license"],
  [/قانون|عقوب|غرام/,"icon_scales"],[/وثيق|مستند/,"icon_folder"],[/كهرب|شحن/,"icon_evplug"],
  [/إشارة ضو|الإشارات الضو/,"icon_tlight"],[/سرع/,"icon_gauge"],[/إسعاف|إصابة/,"icon_firstaid"],
  [/فحص|ورشة|عطل|إصلاح|صيان/,"icon_wrench"]
];
function iconFor(t){ for(var i=0;i<ICON_KEYS.length;i++) if(ICON_KEYS[i][0].test(t)) return ICON_KEYS[i][1]; return null; }
function iconImg(t){ var ic=iconFor(t); return ic?'<img class="mc-ic" src="'+SPRP+ic+'.png" alt="">':''; }
function face(f){
  if(typeof f==="string") return iconImg(f)+'<span class="mt">'+f+'</span>';
  if(f.s) return '<span class="ms">'+sg(f.s)+'</span>';
  if(f.c) return '<span class="mcurb"><i class="curb '+f.c+'"></i></span>';
  if(f.l) return '<span class="ml"><svg viewBox="0 0 120 60"><rect width="120" height="60" rx="6" fill="#5b6066"/><line x1="6" y1="30" x2="114" y2="30" stroke="#fff" stroke-width="6"'+(f.l==="dash"?' stroke-dasharray="18 12"':'')+'/></svg></span>';
  if(f.y){ var l=""; for(var i=-4;i<8;i++) l+='<line x1="'+(i*12)+'" y1="0" x2="'+(i*12+60)+'" y2="60" stroke="#fdd835" stroke-width="3"/><line x1="'+(60-i*12)+'" y1="0" x2="'+(-i*12)+'" y2="60" stroke="#fdd835" stroke-width="3"/>'; return '<span class="ml"><svg viewBox="0 0 60 60"><clipPath id="ymc"><rect width="60" height="60"/></clipPath><rect width="60" height="60" fill="#5b6066"/><g clip-path="url(#ymc)">'+l+'</g><rect x="2" y="2" width="56" height="56" fill="none" stroke="#fdd835" stroke-width="4"/></svg></span>'; }
  return "";
}
function Memory(host, L){
  var D=MEMORY[L.id], n=Math.min(isPhone()?6:8, D.pairs.length), cards, open, moves, matched, busy;
  function start(){
    var pairs=shuffle(D.pairs).slice(0,n); cards=[];
    pairs.forEach(function(p,k){ cards.push({k:k,f:p[0]}); cards.push({k:k,f:p[1]}); });
    cards=shuffle(cards); open=[]; moves=0; matched=0; busy=false;
    host.innerHTML='<div class="mem-top"><span>'+D.title+': اقلب بطاقتين وابحث عن كل بطاقة وما يناسبها.</span><span class="mem-st"></span></div><div class="mem n'+cards.length+'">'+
      cards.map(function(c,i){ return '<button type="button" class="mc" data-i="'+i+'" aria-label="بطاقة '+ar(i+1)+'"><span class="mc-in"><span class="mc-b">؟</span><span class="mc-f">'+face(c.f)+'</span></span></button>'; }).join("")+'</div><div class="mem-fb"></div>';
    $$(".mc",host).forEach(function(b){ b.onclick=function(){ flip(+b.getAttribute("data-i")); }; });
    st();
  }
  function st(){ $(".mem-st",host).textContent="المحاولات: "+ar(moves)+" | الأزواج: "+ar(matched)+" من "+ar(n); }
  function el(i){ return $('.mc[data-i="'+i+'"]',host); }
  function flip(i){
    if(busy) return; var e=el(i); if(!e || e.classList.contains("up") || e.classList.contains("ok")) return;
    e.classList.add("up"); open.push(i);
    if(open.length<2) return;
    moves++; var a=open[0], b2=open[1]; open=[];
    if(cards[a].k===cards[b2].k){ el(a).classList.add("ok"); el(b2).classList.add("ok"); matched++; st();
      if(matched===n){ $(".mem-fb",host).innerHTML='<div class="mem-done"><p class="ok">✔ ممتاز! وجدت كل الأزواج في '+ar(moves)+' محاولة.</p><button type="button" class="btn pri again">العب مرة أخرى</button> '+logBtn(L.id,"memory")+'</div>'; bindLogBtn(host); $(".again",host).onclick=start; }
    } else { busy=true; st(); setTimeout(function(){ el(a).classList.remove("up"); el(b2).classList.remove("up"); busy=false; },900); }
  }
  start();
  host.__mem={cards:function(){ return cards; }, flip:flip};
}

/* ===== لعبة التصنيف ===== */
var SORT={};
SORT[1]={title:"صنّف السلوك حسب صاحبه", bins:[["d","قائد المركبة"],["p","المشاة"],["r","الركاب"],["b","راكبو الدراجات"]], items:[
  ["ارتداء حزام الأمان قبل الانطلاق","d"],["التركيز التام عند استخدام تطبيقات الملاحة","d"],["التزام حدود السرعة","d"],["النظر في المرايا قبل مغادرة السيارة من جهة الشارع","d"],
  ["استخدام المسارات الآمنة","p"],["العبور من الأماكن المخصصة مثل الخطوط","p"],["استخدام جسور المشاة","p"],
  ["البقاء داخل مقصورة السيارة","r"],["الجلوس بهدوء داخل الباصات","r"],["فتح الباب بحذر بعد التأكد من توفر الأمان","r"],
  ["ارتداء الخوذة الواقية","b"],["السير في اتجاه حركة المرور وليس عكسها","b"],["الإمساك بالمقود بكلتا اليدين","b"],["استخدام العواكس وارتداء السترات الفسفورية","b"]]};
SORT[2]={title:"صنّف العلامة حسب نوعها", bins:[["g","إرشادية"],["w","تحذيرية"],["j","جبرية"],["m","منع"]], items:[
  [{s:"hospital"},"g"],[{s:"parking"},"g"],[{s:"fuel"},"g"],[{s:"museum"},"g"],
  [{s:"lightsAhead"},"w"],[{s:"pedAhead"},"w"],[{s:"hump"},"w"],[{s:"bends"},"w"],[{s:"camera"},"w"],
  [{s:"oneway"},"j"],[{s:"roundabout"},"j"],[{s:"turnRight"},"j"],[{s:"aheadRight"},"j"],
  [{s:"noentry"},"m"],[{s:"noparking"},"m"],[{s:"speed80"},"m"],[{s:"nouturn"},"m"]]};
SORT[3]={title:"صنّف حسب النوع", bins:[["l","الإشارات الضوئية"],["v","الخطوط الطولية"],["h","الخطوط العرضية"],["c","خطوط الرصيف"]], items:[
  ["الإشارة الرأسية","l"],["الإشارة الأفقية","l"],["إشارات المشاة","l"],["شاشات الرسائل المتغيرة الإلكترونية","l"],
  ["خط متصل يقيد التجاوز","v"],["خط متقطع يفيد إمكان التجاوز","v"],["تقسيم نهر الطريق إلى اتجاهين أو مسارين","v"],
  ["تحديد أماكن عبور المشاة","h"],["تحديد خط وقوف المركبات قبل الإشارة","h"],["قبل الدوارات للتوقف قبل دخول الدوار","h"],
  [{c:"c1",t:"يُسمح بالوقوف"},"c"],[{c:"c2",t:"يُمنع الوقوف"},"c"],[{c:"c3",t:"وقوف الباصات"},"c"]]};
SORT[4]={title:"صنّف الإجراء حسب الحالة الطارئة", bins:[["w","الطقس السيئ"],["b","الأعطال المفاجئة"],["t","انفجار أحد الإطارات"]], items:[
  ["تخفيض السرعة تدريجيًا وتجنب الوقوف المفاجئ","w"],["التأكد من نظافة زجاج المركبة واستعمال المساحات","w"],["فتح النوافذ قليلًا مع تشغيل مزيل الضباب","w"],["التوقف بعيدًا عن مسار الطريق لحين انتهاء العاصفة","w"],
  ["إخراج المركبة من نهر الطريق وإيقافها على جانبه الأيمن","b"],["إصلاح العطل في نفس المكان إذا كان بسيطًا أو النقل إلى ورشة الإصلاح","b"],
  ["تجنب الضغط على الفرامل نهائيًا","t"],["السيطرة على عجلة القيادة بكلتا اليدين","t"],["رفع القدم عن دواسة الوقود تدريجيًا","t"],["استخدام الغيارات العكسية (إذا أمكن)","t"],["سحب مكبح اليد فور التوقف","t"]]};
function sface(f){ if(typeof f==="string") return iconImg(f)+'<span class="mt">'+f+'</span>'; if(f.s) return '<span class="ms">'+sg(f.s)+'</span>'; if(f.c) return '<span class="mcurb"><i class="curb '+f.c+'"></i><small>'+f.t+'</small></span>'; return ""; }
function Sort(host, L){
  var D=SORT[L.id], items, done, score, sel=null, drag=null;
  var names={}; D.bins.forEach(function(b){ names[b[0]]=b[1]; });
  function start(){
    items=shuffle(D.items.map(function(it,i){ return {i:i,f:it[0],c:it[1]}; })); done=0; score=0; sel=null;
    host.innerHTML='<div class="mem-top"><span>'+D.title+': اسحب كل بطاقة إلى المجموعة الصحيحة، أو اضغط على البطاقة ثم على المجموعة.</span><span class="s-st"></span></div>'+
      '<div class="s-pool">'+items.map(function(it,k){ return '<button type="button" class="s-item" data-k="'+k+'">'+sface(it.f)+'</button>'; }).join("")+'</div>'+
      '<div class="s-bins n'+D.bins.length+'">'+D.bins.map(function(b){ return '<div class="s-bin" data-c="'+b[0]+'" role="button" tabindex="0"><h4>'+b[1]+'</h4><div class="s-list"></div></div>'; }).join("")+'</div><div class="s-fb" aria-live="polite"></div>';
    $$(".s-item",host).forEach(bindItem);
    $$(".s-bin",host).forEach(function(bn){ bn.addEventListener("click",function(){ if(sel!=null){ place(sel, bn.getAttribute("data-c")); } }); bn.addEventListener("keydown",function(e){ if((e.key==="Enter"||e.key===" ") && sel!=null){ e.preventDefault(); place(sel,bn.getAttribute("data-c")); } }); });
    st();
  }
  function st(){ $(".s-st",host).textContent="الصحيح: "+ar(score)+" | المتبقي: "+ar(items.length-done); }
  function itemEl(k){ return $('.s-item[data-k="'+k+'"]',host); }
  function select(k){ $$(".s-item.sel",host).forEach(function(x){ x.classList.remove("sel"); }); if(sel===k){ sel=null; return; } sel=k; itemEl(k).classList.add("sel"); host.classList.add("picking"); }
  function place(k, c){
    var it=items[k], e=itemEl(k); if(!e || it.placed) return;
    it.placed=true; done++; sel=null; host.classList.remove("picking");
    e.classList.remove("sel"); e.classList.add("placed"); e.disabled=true;
    var ok=(c===it.c); if(ok) score++;
    e.classList.add(ok?"ok":"no");
    $('.s-bin[data-c="'+it.c+'"] .s-list',host).appendChild(e);
    $(".s-fb",host).innerHTML=ok?'<p class="ok">✔ صحيح: «'+names[it.c]+'».</p>':'<p class="no">✘ مكانها الصحيح: «'+names[it.c]+'» (نُقلت إليها باللون الأحمر).</p>';
    st();
    if(done===items.length){ $(".s-fb",host).innerHTML='<div class="mem-done"><p class="big-sc">'+ar(score)+' من '+ar(items.length)+'</p><button type="button" class="btn pri again">العب مرة أخرى</button> '+logBtn(L.id,"sort")+'</div>'; bindLogBtn(host); $(".again",host).onclick=start; }
  }
  function binAt(x,y){ var t=document.elementFromPoint(x,y); return t && t.closest ? t.closest(".s-bin") : null; }
  function bindItem(e){
    var k=+e.getAttribute("data-k");
    e.addEventListener("pointerdown",function(ev){ if(items[k].placed || (ev.pointerType==="mouse" && ev.button!==0)) return; drag={k:k,x:ev.clientX,y:ev.clientY,on:false,g:null,id:ev.pointerId}; try{ e.setPointerCapture(ev.pointerId); }catch(_){} });
    e.addEventListener("pointermove",function(ev){
      if(!drag || drag.k!==k) return;
      if(!drag.on && Math.hypot(ev.clientX-drag.x, ev.clientY-drag.y)>8){
        drag.on=true; var r=e.getBoundingClientRect(); var gh=e.cloneNode(true); gh.classList.add("ghost"); gh.style.width=r.width+"px"; gh.style.left=(ev.clientX-r.width/2)+"px"; gh.style.top=(ev.clientY-r.height/2)+"px"; document.body.appendChild(gh); drag.g=gh; drag.w=r.width; drag.h=r.height; e.classList.add("dragging");
      }
      if(drag.on){ drag.lx=ev.clientX; drag.ly=ev.clientY;
        if(!drag.t){ var dd=drag; dd.t=setInterval(function(){ if(!dd.on){ clearInterval(dd.t); return; } var ed=Math.max(60, window.innerHeight*0.12); var dy=dd.ly>window.innerHeight-ed?16:(dd.ly<ed?-16:0); if(dy){ window.scrollBy(0,dy); $$(".s-bin.over",host).forEach(function(x){ x.classList.remove("over"); }); var bz=binAt(dd.lx,dd.ly); if(bz) bz.classList.add("over"); } },30); }
        drag.g.style.left=(ev.clientX-drag.w/2)+"px"; drag.g.style.top=(ev.clientY-drag.h/2)+"px"; $$(".s-bin.over",host).forEach(function(x){ x.classList.remove("over"); }); var bn=binAt(ev.clientX,ev.clientY); if(bn) bn.classList.add("over"); ev.preventDefault(); }
    });
    function end(ev, cancel){
      if(!drag || drag.k!==k) return; var d=drag; drag=null; d.on=d.on; if(d.t) clearInterval(d.t);
      $$(".s-bin.over",host).forEach(function(x){ x.classList.remove("over"); }); e.classList.remove("dragging");
      if(d.on){ if(d.g) d.g.remove(); if(!cancel){ var bn=binAt(ev.clientX,ev.clientY); if(bn) place(k, bn.getAttribute("data-c")); } e.__skipClick=true; setTimeout(function(){ e.__skipClick=false; },50); }
    }
    e.addEventListener("pointerup",function(ev){ end(ev,false); });
    e.addEventListener("pointercancel",function(ev){ end(ev,true); });
    e.addEventListener("click",function(ev){ ev.stopPropagation(); if(e.__skipClick || items[k].placed) return; select(k); });
  }
  start();
  host.__sort={items:function(){ return items; }, place:place};
}
function gamesTab(b, L){
  b.innerHTML='<section class="gsec"><h2 class="sec-t">لعبة الذاكرة</h2><div id="memhost" class="game-box"></div></section><section class="gsec"><h2 class="sec-t">لعبة التصنيف</h2><div id="sorthost" class="game-box"></div></section>';
  Memory($("#memhost",b), L); Sort($("#sorthost",b), L);
}

/* ===== أوراق العمل (الأسئلة من محتوى الكتاب؛ «من أسئلة الكتاب» = ص 35–37) ===== */
var BQ=' <small class="bq">(من أسئلة الكتاب)</small>';
var SHEETS={};
SHEETS[1]={pages:"3–6",
 tf:[["النزول الآمن من المركبة يتطلب يقظة تامة من قائد المركبة.",1,1],["السائق غير مسؤول بنسبة كبيرة عن الحوادث.",0,1],["يسير راكب الدراجة عكس اتجاه حركة المرور.",0],["الراكب شريك في أمن الرحلة، وسلوكه الهادئ يدعم تركيز السائق.",1]],
 fill:[[["من وسائل الحماية الشخصية لراكبي الدراجات ","الخوذة الواقية","."],1],[["يجب وضع الأطفال في ","مقاعد الأمان المخصصة لهم في الخلف","."]],[["يعبر المشاة من الأماكن المخصصة لهم مثل الخطوط و","جسور المشاة","."]]],
 mcq:[["كلما زادت السرعة:",["زادت قوة الاصطدام","قلت قوة الاصطدام","زاد الأمان"],0,1],["يحظر على قائد المركبة:",["استخدام حزام الأمان","السير فوق الرصيف","استخدام المرايا"],1,1],["السرعة 100 كم/س تعادل السقوط من ارتفاع:",["3٫5 متر","39 مترًا","88٫5 مترًا"],1]],
 extra:{h:"السؤال الرابع: اكتب الحرف المناسب (أ: قائد المركبة، ب: المشاة، ج: الركاب، د: راكبو الدراجات) أمام كل سلوك:", type:"match",
  rows:[["ارتداء الخوذة الواقية","د"],["الجلوس بهدوء داخل الباصات","ج"],["التركيز التام أثناء القيادة","أ"],["العبور من جسور المشاة","ب"],["الإمساك بالمقود بكلتا اليدين","د"],["التزام حدود السرعة","أ"]]}};
SHEETS[2]={pages:"10–16",
 tf:[["العلامات الإرشادية تقدم معلومات عن الطريق وحول الأماكن والمنشآت.",1,1],["يمكن الوقوف والانتظار عند موقف الاحتياجات الخاصة دون تصريح.",0,1],["كل المثلثات الحمراء تعني تحذير.",1],["العلامات الجبرية شكلها مثلث أحمر بأرضية بيضاء.",0]],
 fill:[[["تمتاز علامة «قف» عالميًا بشكلها ","المثمن ذي الأضلاع الثمانية","."]],[["تتخذ علامة «افسح الطريق» شكل ","مثلث مقلوب"," بأرضية صفراء اللون."]],[["العلامات الإرشادية للأماكن السياحية والمتاحف ذات أشكال مستطيلة على خلفية ","بنية اللون","."]]],
 mcq:[["«كل الدوائر الحمراء تعني»:",["إرشاد","ممنوع","تحذير"],1],["يستعمل للعلامات الجبرية الشكل المستدير المطلي باللون:",["الأزرق والرسم بالأبيض","الأحمر","البني"],0],["علامات مناطق العمل المؤقتة تكون:",["زرقاء بالكامل","ذات أرضية صفراء وإطار أحمر","خضراء والرسم بالأبيض"],1]],
 extra:{h:"السؤال الرابع: اكتب اسم العلامة المرورية ومدلولها في الجدول التالي:"+BQ, type:"signs",
  rows:[["stop","قف","التوقف لمعرفة حالة الطريق عند التقاء طرق فرعية بأخرى رئيسية"],["yield","افسح الطريق","أولوية حركة المرور في الدوار أو الطريق الرئيسي"],["noentry","ممنوع الدخول","علامة منع"],["pedAhead","أمامك معبر للمشاة","علامة تحذيرية"],["hospital","مستشفى","علامة إرشادية"],["roundabout","أمامك دوران","علامة جبرية"]]}};
SHEETS[3]={pages:"17–21",
 tf:[["يمكن وقوف وانتظار المركبات عند خطوط عبور المشاة.",0,1],["يمكن التجاوز والعبور من فوق الخطوط الطولية المتصلة الفاصلة بين المسارات.",0,1],["ضرورة عدم الوقوف في المربع المحكوم بعلامة ضوئية.",1,1],["يخصص الرصيف الملون بالأصفر والأسود لوقوف المركبات.",0,1],["يجب الوقوف عند طلب رجل الشرطة ذلك.",1,1]],
 fill:[[["تقسم الخطوط الطولية إلى: (أ) ","خطوط طولية متصلة","  (ب) ","خطوط طولية متقطعة",""],1],[["تستخدم الخطوط العرضية في: (أ) ","تحديد أماكن عبور المشاة","  (ب) ","تحديد خط وقوف المركبات قبل إشارة المرور الضوئية",""],1],[["في الإشارة الأفقية يكون اللون الأحمر جهة ","اليسار","."]]],
 mcq:[["يستخدم الرصيف الأبيض والأزرق لوقوف:",["السيارات","الباصات","الدراجات"],1,1],["يمكن عبور المشاة من على:",["الخطوط الطولية المتصلة","الخطوط العرضية","الخطوط الطولية المتقطعة"],1,1],["في الإشارة الضوئية الرأسية يكون اللون الأحمر:",["بالأعلى","بالأسفل","في المنتصف"],0]],
 extra:{h:"السؤال الرابع: اكتب الغرض من كل لون من ألوان خطوط الرصيف:", type:"curbs",
  rows:[["c1","الخطوط السوداء والبيضاء المتتالية","يسمح فيها بوقوف المركبات"],["c2","الخطوط السوداء والصفراء المتتالية","يمنع فيها وقوف المركبات"],["c3","الخطوط البيضاء والزرقاء المتتالية","مخصصة لوقوف الباصات"]]}};
SHEETS[4]={pages:"26–34",
 tf:[["يتم الانتقال بين المسارات دون إعطاء إشارة ضوئية.",0,1],["تُعرف القيادة الوقائية بأنها القدرة على التنبؤ بالمخاطر قبل وقوعها واتخاذ تدابير استباقية لتجنب الحوادث.",1,1],["تُعرف «النقاط العمياء» بأنها المناطق التي لا يستطيع السائق رؤيتها من خلال المرايا التقليدية.",1,1],["تكون الأولوية في الدوارات للقادم من جهة اليمين.",0]],
 fill:[[["المسار ","الأيمن"," يستخدم للسير بسرعة أقل من السرعة المقررة أو الانعطاف يمينًا قبل الوصول."]],[["تُستخدم ","أنوار الانتظار"," لتنبيه الآخرين بوجود مركبتك في حال التوقف الاضطراري."]],[["عند انفجار أحد الإطارات يجب ","تجنب الضغط على الفرامل"," نهائيًا لمنع اختلال توازن السيارة."]]],
 mcq:[["في حال وجود عطل بالسيارة يمكن أن تقف في:",["المسار الأوسط للطريق","المسار الأيسر للطريق","كتف الطريق"],2,1],["ما هو المفهوم الأساسي للقيادة الوقائية؟",["الاعتماد الكلي على مهارات السائقين الآخرين في الطريق","استخدام الهاتف المحمول فقط في الحالات الضرورية أثناء القيادة","التنبؤ بمتغيرات الطريق والسيطرة على السلوك لتجنب الحوادث"],2,1],["في العواصف الترابية، ما هو الإجراء الإضافي الذي قد يضطر إليه السائق؟",["استخدام الراديو بأعلى صوت ممكن","التوقف بعيدًا عن مسار الطريق مع استعمال ضوء التحذير","إطفاء جميع الأنوار لعدم تشتيت الآخرين"],1,1]],
 extra:{h:"السؤال الرابع: رتّب خطوات تغيير مسار السير (التجاوز) بكتابة الرقم (1، 2، 3) في المربع:", type:"order",
  rows:[["القيام بتغيير خط السير بالانعطاف قليلًا إلى خط السير الجديد مع ضبط السرعة المناسبة.","3"],["إعطاء الإشارة الضوئية الدالة على الجهة المطلوبة يسارًا أو يمينًا.","1"],["النظر في المرايا المختلفة للتأكد من خلو الطريق بمسافة كافية تسمح بتغيير المسار.","2"]]}};
function blank(a, ans){ return ans ? '<span class="ans">'+a+'</span>' : '<span class="blank"></span>'; }
function sheetHTML(L, ans){
  var S=SHEETS[L.id], ab="أبج";
  var tf='<section class="sh-q"><h3>السؤال الأول: ضع علامة (✓) أمام العبارة الصحيحة وعلامة (✗) أمام العبارة غير الصحيحة:</h3><ol class="sh-tf">'+
    S.tf.map(function(t){ return '<li><span class="sh-s">'+t[0]+(t[2]?BQ:'')+'</span><span class="sh-box">( '+(ans?'<b class="ans">'+(t[1]?'✓':'✗')+'</b>':'&nbsp;&nbsp;&nbsp;')+' )</span></li>'; }).join("")+'</ol></section>';
  var fl='<section class="sh-q"><h3>السؤال الثاني: أكمل العبارات التالية بما يناسبها:</h3><ol class="sh-fill">'+
    S.fill.map(function(f){ var p=f[0]; return '<li>'+p.map(function(x,i){ return i%2 ? blank(x,ans) : x; }).join("")+(f[1]?BQ:'')+'</li>'; }).join("")+'</ol></section>';
  var mc='<section class="sh-q"><h3>السؤال الثالث: اختر الإجابة الصحيحة:</h3><ol class="sh-mcq">'+
    S.mcq.map(function(m){ return '<li><p>'+m[0]+(m[3]?BQ:'')+'</p><div class="sh-opts">'+m[1].map(function(o,i){ return '<span class="sh-o'+(ans&&i===m[2]?' ans-o':'')+'"><i>'+ab[i]+'</i> '+o+'</span>'; }).join("")+'</div></li>'; }).join("")+'</ol></section>';
  var E=S.extra, ex='<section class="sh-q"><h3>'+E.h+'</h3>';
  if(E.type==="match") ex+='<table class="sh-tbl"><thead><tr><th>'+((E.cols||[])[0]||"السلوك")+'</th><th>'+((E.cols||[])[1]||"الحرف")+'</th></tr></thead><tbody>'+E.rows.map(function(r){ return '<tr><td>'+r[0]+'</td><td class="sh-c">'+(ans?'<b class="ans">'+r[1]+'</b>':'')+'</td></tr>'; }).join("")+'</tbody></table>';
  if(E.type==="signs") ex+='<table class="sh-tbl"><thead><tr><th>صورة العلامة</th><th>اسم العلامة</th><th>مدلول العلامة</th></tr></thead><tbody>'+E.rows.map(function(r){ return '<tr><td class="sh-sg">'+sg(r[0])+'</td><td>'+(ans?'<b class="ans">'+r[1]+'</b>':'')+'</td><td>'+(ans?'<span class="ans">'+r[2]+'</span>':'')+'</td></tr>'; }).join("")+'</tbody></table>';
  if(E.type==="curbs") ex+='<table class="sh-tbl"><thead><tr><th>لون خط الرصيف</th><th>الغرض منه</th></tr></thead><tbody>'+E.rows.map(function(r){ return '<tr><td><i class="curb '+r[0]+'"></i><small>'+r[1]+'</small></td><td>'+(ans?'<span class="ans">'+r[2]+'</span>':'')+'</td></tr>'; }).join("")+'</tbody></table>';
  if(E.type==="order") ex+='<table class="sh-tbl"><tbody>'+E.rows.map(function(r){ return '<tr><td class="sh-c">'+(ans?'<b class="ans">'+r[1]+'</b>':'')+'</td><td>'+r[0]+'</td></tr>'; }).join("")+'</tbody></table>';
  ex+='</section>';
  return '<article class="sheet'+(ans?' with-ans':'')+'" dir="rtl"><div class="sh-h"><img src="assets/img/logo.png" alt="شعار المدرسة"><div class="sh-org"><b>وزارة التربية – منطقة حولي التعليمية</b><b>ثانوية سلوى - نظام المسارات</b><span>الثقافة المرورية – مقرر TRF101</span></div>'+
    '<div class="sh-ttl"><h2>ورقة عمل'+(ans?' – نموذج الإجابة':'')+'</h2><p>'+L.title+'</p><small>كتاب الطالب ص '+S.pages+'</small></div></div>'+
    '<div class="sh-lines"><span>الاسم: <i></i></span><span>الصف: <i class="s"></i></span><span>الشعبة: <i class="s"></i></span><span>المجموعة: <i class="s"></i></span><span>التاريخ: <i class="s"></i></span></div>'+
    tf+fl+mc+ex+'<div class="sh-f">الأسئلة من محتوى كتاب «الثقافة المرورية – مقرر TRF101»، الطبعة الأولى 2026/2027 (ص '+S.pages+'، '+(S.q?'وأسئلة التقويم ص '+S.q:'وأسئلة التقويم ص 35–37')+'). نسخة الكتاب التفاعلي – ثانوية سلوى - نظام المسارات.</div></article>';
}
function sheetTab(b, L){
  b.innerHTML='<section class="sheet-tab"><div class="ws-tools no-print"><a class="btn pri" href="#/print/'+L.id+'" target="_blank" rel="noopener">🖨 افتح صفحة الطباعة (A4)</a><label class="chkl"><input type="checkbox" id="wsans"> عرض نموذج الإجابة</label>'+logBtn(L.id,"sheet")+'</div>'+
    '<p class="hint no-print">ورقة عمل جاهزة للطباعة على ورق A4. اضغط «افتح صفحة الطباعة» ثم «اطبع»، أو اطبع نموذج الإجابة للمعلم.</p><div class="paper-prev" id="wsprev">'+sheetHTML(L,false)+'</div></section>';
  bindLogBtn(b);
  $("#wsans",b).onchange=function(){ $("#wsprev",b).innerHTML=sheetHTML(L,this.checked); };
}
function viewPrint(app){
  var m=(location.hash||"").match(/print\/(\d+)/), id=m?+m[1]:1, ans=/ans=1|\/ans/.test(location.hash||"");
  var L=window.TRF.lessonById(id); if(!L){ location.hash="#/"; return; }
  document.title="ورقة عمل – "+L.title+" – الثقافة المرورية";
  app.innerHTML='<div class="ptools no-print"><button type="button" class="btn pri" id="pprint">🖨 اطبع</button><label class="chkl"><input type="checkbox" id="pans"'+(ans?' checked':'')+'> نموذج الإجابة</label><a class="btn" href="#/lesson/'+id+'/sheet">↩ رجوع إلى الدرس</a>'+logBtn(id,"sheet")+'<span class="ptip">نصيحة: اختر حجم الورق A4 في نافذة الطباعة.</span></div><div class="print-page">'+sheetHTML(L,ans)+'</div>';
  bindLogBtn(app);
  $("#pprint").onclick=function(){ window.print(); };
  $("#pans").onchange=function(){ location.hash="#/print/"+id+(this.checked?"?ans=1":""); };
}

/* ===== مقاطع الفيديو (ملفات محلية فقط) =====
   لا نطلب ملفات غير موجودة تلقائيًا (حتى لا تظهر أخطاء)؛ نبحث عند الضغط على الزر ثم نتذكر النتيجة. */
function videoTab(b, L){
  var files=["lesson"+L.id+".mp4","lesson"+L.id+"_2.mp4","lesson"+L.id+"_3.mp4"], VK="trf_vid_"+L.id;
  b.innerHTML='<section class="vid"><h2 class="sec-t">🎬 مقاطع فيديو: '+L.title+'</h2><div class="vids"></div><div class="vid-empty" hidden><p>لا يوجد مقطع فيديو لهذا الدرس بعد.</p><button type="button" class="btn pri vfind">🔎 أضفت مقطعًا؟ ابحث عنه الآن</button></div>'+
    '<div class="howto"><h3>كيف أضيف مقطع فيديو لهذا الدرس؟</h3><ol>'+
    '<li>احصل على مقطع فيديو بصيغة MP4 من مصدر موثوق (مثل مقاطع وزارة التربية أو الإدارة العامة للمرور).</li>'+
    '<li>انسخ الملف إلى المجلد <b dir="ltr">traffic_demo/videos</b> بجانب ملف index.html.</li>'+
    '<li>غيّر اسم الملف إلى <b dir="ltr">'+files[0]+'</b> (ولمقطع ثانٍ: <b dir="ltr">'+files[1]+'</b>، ولثالث: <b dir="ltr">'+files[2]+'</b>).</li>'+
    '<li>اضغط F5 لتحديث الصفحة، ثم اضغط زر «ابحث عنه الآن» مرة واحدة، وسيظهر المقطع هنا ويعمل دون إنترنت في كل مرة.</li></ol></div><div class="vid-log"></div></section>';
  var box=$(".vids",b), empty=$(".vid-empty",b);
  function load(list, remember){
    box.innerHTML=""; empty.hidden=true;
    var pending=list.length, found=[];
    function settle(){ pending--; if(pending>0) return;
      if(remember) store(VK, found);
      if(!found.length){ empty.hidden=false; $(".vfind",b).textContent=remember?"🔎 لم يُعثر على مقطع. ابحث مرة أخرى":"🔎 أضفت مقطعًا؟ ابحث عنه الآن"; $(".vid-log",b).innerHTML=""; }
      else { $(".vid-log",b).innerHTML=logBtn(L.id,"video"); bindLogBtn(b); }
    }
    list.forEach(function(f){
      var fig=document.createElement("figure"); fig.className="vbox"; fig.hidden=true;
      var v=document.createElement("video"); v.controls=true; v.preload="metadata"; v.setAttribute("playsinline","");
      var cap=document.createElement("figcaption"); cap.textContent="المقطع "+ar(files.indexOf(f)+1)+" ("+f+")";
      var doneF=false;
      v.addEventListener("loadedmetadata",function(){ if(doneF) return; doneF=true; fig.hidden=false; found.push(f); settle(); });
      v.addEventListener("error",function(){ if(doneF) return; doneF=true; fig.remove(); settle(); });
      fig.appendChild(v); fig.appendChild(cap); box.appendChild(fig);
      v.src="videos/"+f;
    });
  }
  $(".vfind",b).onclick=function(){ load(files, true); };
  var known=store(VK);
  if(known && known.length) load(known, true); else { empty.hidden=false; }
}

/* ===== التصدير ===== */
window.ACT={maps:MAPS, memory:MEMORY, sort:SORT, sheets:SHEETS, mapTab:mapTab, gamesTab:gamesTab, sheetTab:sheetTab, videoTab:videoTab, viewPrint:viewPrint, viewLog:viewLog, logPanel:logPanel, sheetHTML:sheetHTML, mark:mark, draw:{g:g,car:car,bus:bus,man:man,woman:woman,officer:officer,cyclist:cyclist,sign:sign,palm:palm,bldg:bldg,zebraH:zebraH,zebraV:zebraV,dashH:dashH,solidH:solidH,curbH:curbH,tlightV:tlightV,tlightH:tlightH,tlightP:tlightP,arrowUp:arrowUp,tri:tri,cone:cone,label:label}, fs:function(i){ fsApply(i); return fsI; }};
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", fsInit); else fsInit();
})();

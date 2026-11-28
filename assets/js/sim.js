/* محاكاة القيادة – رسم من الأعلى على Canvas (بدون مكتبات وبدون إنترنت) */
(function(){
"use strict";
var VEH={car:null,bus:null,truck:null,bike:null}, VEH_CACHE={};
var PED_IMGS=[], PED_READY=0;
var TILES={}, SPR={};
(function(){
  ["car","bus","truck","bike"].forEach(function(k){
    var im=new Image();
    im.onload=function(){ VEH[k]=im; };
    im.src="assets/img/vehicles/"+k+"_top.png";
  });
  ["ped_woman_a","ped_man","ped_woman_b"].forEach(function(k){
    var im=new Image();
    im.onload=function(){ PED_READY++; };
    im.src="assets/img/vehicles/"+k+".png";
    PED_IMGS.push(im);
  });
  ["sand","asphalt","sidewalk","grass"].forEach(function(k){
    var im=new Image(); im.src="assets/img/tiles/"+k+".jpg"; TILES[k]=im;
  });
  ["house1","house2","house3","house4","house5","palm1","palm2","palm3","palm4","hedge","garden",
   "cone1","cone2","tlight_v","tlight_h","tlight_p","camera","barrier","hump","triangle",
   "car_player","car_white","car_silver","car_navy","car_orange"].forEach(function(k){
    var im=new Image(); im.src="assets/img/sprites/"+k+".png"; SPR[k]=im;
  });
})();
function sprReady(im){ return im && im.naturalWidth; }
function carSheet(color, player){
  if(player && sprReady(SPR.car_player)) return SPR.car_player;
  var c=(color||"").toLowerCase();
  if(/00897b|2e7d32|00695c/.test(c) && sprReady(SPR.car_player)) return SPR.car_player;
  if(/0d47a1|1565c0|1a237e|283c/.test(c) && sprReady(SPR.car_navy)) return SPR.car_navy;
  if(/ff6d00|ef6c00|ff8|e65100|8d6e63/.test(c) && sprReady(SPR.car_orange)) return SPR.car_orange;
  if(/fafafa|ffffff|eceff|f5f5/.test(c) && sprReady(SPR.car_white)) return SPR.car_white;
  if(/7b8794|9e9e9e|90a4ae|78909c/.test(c) && sprReady(SPR.car_silver)) return SPR.car_silver;
  var n=0; for(var i=0;i<c.length;i++) n+=c.charCodeAt(i);
  var keys=["car_white","car_silver","car_navy","car_orange","car_player"];
  var k=keys[n%keys.length];
  return sprReady(SPR[k])?SPR[k]:null;
}
function vehSprite(kind,color){
  var key=(kind||"car")+"|"+(color||"");
  if(VEH_CACHE[key]) return VEH_CACHE[key];
  var img=VEH[kind]||VEH.car;
  if(!img) return null;
  var c=document.createElement("canvas");
  c.width=img.naturalWidth||90; c.height=img.naturalHeight||160;
  var x=c.getContext("2d");
  x.drawImage(img,0,0);
  if(color && kind==="car"){
    x.globalCompositeOperation="source-atop";
    x.fillStyle=color; x.globalAlpha=0.42; x.fillRect(0,0,c.width,c.height);
    x.globalAlpha=1; x.globalCompositeOperation="source-over";
  }
  VEH_CACHE[key]=c; return c;
}
var LW = 3.6;                 // عرض المسار بالمتر
var PL = 4.4, PW = 1.8;       // أبعاد سيارة المستخدم
var KMH = 3.6;

/* ======== السيناريوهات (مبنية على محتوى كل درس) ======== */
var SCEN = {
1: { lanes:2, start:1, vmax:90, follow:true, signal:null, finish:880,
  intro:"اربط حزام الأمان أولًا، ثم قُد بهدوء والتزم بما تراه على الطريق.",
  ev:[
    {t:"zone", s:30, e:300, limit:60, sign:"speed60"},
    {t:"decide", s:150, title:"التركيز التام (حاضر الذهن)", q:"وصلتك رسالة على الهاتف وأنت تقود. ماذا تفعل؟",
      o:["أقرأ الرسالة وأرد عليها وأنا أقود","أتجاهلها وأركّز في الطريق، وأقرأها بعد التوقف في مكان آمن","أمسك الهاتف بيد والمقود بيد"], a:1,
      why:"على قائد المركبة أن يكون بحالة تركيز تام أثناء القيادة، دون أن تتحول التقنية إلى مصدر خطر أو تشتت."},
    {t:"sign", s:290, kind:"warnPed", msg:"علامة تحذيرية: أمامك معبر للمشاة."},
    {t:"cross", s:340},
    {t:"npc", s:470, lane:1, v:5, kind:"bike"},
    {t:"msg", s:430, msg:"راكب دراجة في المسار الأيمن… هدّئ السرعة أو انتقل للمسار الآخر بأمان.", kind:"info"},
    {t:"npc", s:620, lane:0, v:9, kind:"car", color:"#7b8794"},
    {t:"light", s:720, ped:true},
    {t:"decide", s:860, title:"النزول الآمن من المركبة", q:"وصلت ووقفت. قبل أن تفتح الباب من جهة الشارع:",
      o:["أفتح الباب بسرعة وأنزل","أنظر في المرايا الجانبية والداخلية للتأكد من خلو الطريق من المركبات أو الدراجات القادمة","أطلب من الركاب النزول من جهة الشارع"], a:1,
      why:"مغادرتك للسيارة من جهة الشارع تتطلب يقظة تامة، انظر في المرايا الجانبية والداخلية للتأكد من خلو الطريق."}
  ]},
2: { lanes:2, start:1, vmax:100, follow:false, signal:null, finish:960,
  intro:"اقرأ كل علامة على جانب الطريق وتصرّف حسب مدلولها.",
  ev:[
    {t:"zone", s:30, e:250, limit:80, sign:"speed80"},
    {t:"sign", s:250, kind:"works", msg:"علامة مؤقتة: أعمال طرق أمامك. انتقل إلى المسار الأيسر وخفّض السرعة."},
    {t:"zone", s:255, e:470, limit:60, sign:"speed60", tempo:true},
    {t:"cones", s:320, e:440, lane:1},
    {t:"sign", s:520, kind:"yield", msg:"علامة «افسح الطريق»: الأولوية لحركة المرور في الطريق الرئيسي."},
    {t:"yield", s:575},
    {t:"sign", s:650, kind:"parking", msg:"علامة إرشادية: مواقف انتظار (معلومة للسائق، ولا تُلزمك بفعل)."},
    {t:"sign", s:690, kind:"warnPed", msg:"علامة تحذيرية: أمامك معبر للمشاة."},
    {t:"cross", s:740},
    {t:"sign", s:820, kind:"stop", msg:"علامة «قف»: توقف تمامًا عند الخط قبل دخول الطريق الرئيسي."},
    {t:"stop", s:880}
  ]},
3: { lanes:2, start:1, vmax:90, follow:false, signal:"ind", finish:900,
  intro:"راقب الإشارات الضوئية والخطوط الأرضية. لتغيير المسار أعطِ الإشارة أولًا (فقط فوق الخط المتقطع).",
  ev:[
    {t:"light", s:120, ped:true},
    {t:"solid", s:230, e:440},
    {t:"msg", s:225, msg:"خط طولي متصل: لا يجوز العبور من فوقه إلى المسار الآخر (التجاوز).", kind:"info"},
    {t:"npc", s:300, lane:1, v:8, kind:"bus"},
    {t:"msg", s:445, msg:"خط متقطع: يمكنك التجاوز الآن بعد إعطاء الإشارة والتأكد من تأمين الطريق.", kind:"info"},
    {t:"box", s:580, len:14},
    {t:"light", s:720, ped:false},
    {t:"decide", s:870, title:"ألوان خطوط الرصيف", q:"تريد أن توقف المركبة بجانب الرصيف. أي رصيف يُسمح فيه بالوقوف؟",
      o:["رصيف بخطوط سوداء وصفراء","رصيف بخطوط سوداء وبيضاء","رصيف بخطوط بيضاء وزرقاء"], a:1, curbs:true,
      why:"الأسود والأبيض: يُسمح بالوقوف. الأسود والأصفر: يُمنع الوقوف. الأبيض والأزرق: مخصص لوقوف الباصات."}
  ]},
4: { lanes:3, start:1, vmax:110, follow:true, signal:"full", finish:1250,
  intro:"قبل كل تغيير للمسار: أعطِ الإشارة ثم انظر في المرايا (زر المرايا)، ثم غيّر المسار.",
  ev:[
    {t:"zone", s:20, e:1240, limit:100, sign:"speed100", quiet:true},
    {t:"npc", s:110, lane:2, v:10, kind:"truck"},
    {t:"npc", s:170, lane:1, v:13, kind:"car", color:"#8d6e63"},
    {t:"msg", s:120, msg:"المسار الأوسط لتجاوز السيارات البطيئة، والأيسر للتجاوز بسرعة لا تتعدى السرعة المقررة.", kind:"info"},
    {t:"blind", s:420},
    {t:"brake", s:640},
    {t:"zone", s:800, e:980, limit:60, sign:"speed60", fog:true},
    {t:"msg", s:790, msg:"عاصفة ترابية! خفّض السرعة تدريجيًا وتجنّب الوقوف المفاجئ، واستعمل ضوء التحذير.", kind:"warn"},
    {t:"decide", s:1040, title:"انفجار أحد الإطارات", q:"انفجر أحد إطارات سيارتك أثناء القيادة. ما أول تصرف صحيح؟",
      o:["أضغط على الفرامل بقوة فورًا","أتجنب الضغط على الفرامل، وأسيطر على عجلة القيادة بكلتا اليدين، وأرفع قدمي عن دواسة الوقود تدريجيًا","أنعطف بسرعة إلى جانب الطريق"], a:1,
      why:"تجنب الضغط على الفرامل نهائيًا لمنع اختلال توازن السيارة، والسيطرة على عجلة القيادة بكلتا اليدين، ورفع القدم عن دواسة الوقود تدريجيًا."},
    {t:"decide", s:1160, title:"الأولوية في الدوارات", q:"تقترب من دوار، وهناك سيارة داخل الدوار قادمة من جهة اليسار. ماذا تفعل؟",
      o:["أدخل بسرعة قبلها","أهدّئ أو أتوقف لإعطاء المجال للسيارة القادمة من اليسار","أستخدم الهرن لتفسح لي"], a:1,
      why:"تكون الأولوية لمن هم داخل حرم الدوار (القادم من اليسار)، لذا يجب قبل دخولك الدوار التهدئة أو التوقف."}
  ]}
};

function el(tag, cls, html){ var e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }
function clamp(v,a,b){ return v<a?a:(v>b?b:v); }

function Sim(host, lessonId){
  var S = SCEN[lessonId], self=this;
  this.host = host; host.innerHTML="";
  host.classList.add("sim");
  var wrap = el("div","sim-stage"); host.appendChild(wrap);
  var cv = el("canvas","sim-canvas"); wrap.appendChild(cv);
  var ctx = cv.getContext("2d");
  // HUD
  var hud = el("div","sim-hud"); wrap.appendChild(hud);
  hud.innerHTML = '<div class="hud-box"><span class="lbl">السرعة</span><b class="spd">0</b><span class="u">كم/س</span></div>'+
    '<div class="hud-limit" hidden><span></span></div>'+
    '<div class="hud-box"><span class="lbl">النقاط</span><b class="pts">0</b></div>'+
    '<div class="hud-prog"><i></i></div>';
  var toast = el("div","sim-toast"); wrap.appendChild(toast);
  var mirrorBox = el("div","sim-mirror"); wrap.appendChild(mirrorBox);
  var overlay = el("div","sim-overlay"); wrap.appendChild(overlay);
  // Controls
  var ctr = el("div","sim-ctrl"); host.appendChild(ctr);
  var left = el("div","cgroup");
  var mid = el("div","cgroup mid");
  var right = el("div","cgroup");
  ctr.appendChild(left); ctr.appendChild(mid); ctr.appendChild(right);
  function btn(parent, cls, html, title){ var b=el("button","cbtn "+cls, html); b.type="button"; if(title) b.title=title; parent.appendChild(b); return b; }
  var bL = btn(left,"lane","◀","مسار لليسار (←)");
  var bR = btn(left,"lane","▶","مسار لليمين (→)");
  var bBelt = btn(mid,"belt","<span>حزام الأمان</span>","حزام الأمان (B)");
  var bIL=null,bIR=null,bMir=null,bHaz=null;
  if(S.signal){ bIL = btn(mid,"ind","<span>⇦ إشارة</span>","إشارة يسار (Q)"); bIR = btn(mid,"ind","<span>إشارة ⇨</span>","إشارة يمين (E)"); }
  if(S.signal==="full"){ bMir = btn(mid,"mir","<span>المرايا</span>","انظر في المرايا (M)"); bHaz = btn(mid,"haz","<span>ضوء التحذير</span>","ضوء التحذير (H)"); }
  var bBrake = btn(right,"pedal brake","▼<small>فرامل</small>","فرامل (↓ أو مسافة)");
  var bGas = btn(right,"pedal gas","▲<small>وقود</small>","وقود (↑)");

  var W=0,H=0,DPR=1,ppm=10;
  function resize(){
    var r = wrap.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio||1, 2);
    W = r.width; H = r.height;
    cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR);
    cv.style.width=W+"px"; cv.style.height=H+"px";
    var roadW = S.lanes*LW;
    ppm = Math.min(H/38, W/(roadW+6));
  }
  this._resize = resize;
  window.addEventListener("resize", resize);

  /* ===== الحالة ===== */
  var st;
  function laneX(i){ return (i-(S.lanes-1)/2)*LW; }
  function reset(){
    st = { t:0, p:{s:0, x:laneX(S.start), lane:S.start, tl:S.start, v:0, belt:false, ind:0, mir:-99, haz:false},
      score:0, good:0, bad:0, log:[], npcs:[], xcars:[], peds:[], ev:[], keys:{}, gas:false, brake:false,
      paused:true, ended:false, crashCD:0, followT:0, followCD:0, msgUntil:0, beltWarned:false, dustHaz:false };
    S.ev.forEach(function(e){ var c={}; for(var k in e) c[k]=e[k]; c.done=false; c.state=null; st.ev.push(c); });
    st.ev.forEach(function(e){ if(e.t==="light"){ e.state="green"; e.timer=0; } });
    updateHud(); setBtns();
  }

  function say(msg, kind, dur){
    toast.className = "sim-toast show "+(kind||"info");
    toast.textContent = msg;
    st.msgUntil = st.t + (dur||3.2);
  }
  function good(msg, pts){ pts = pts==null?10:pts; st.score+=pts; st.good++; st.log.push([true,msg]); say("✔ "+msg+(pts?"  (+"+pts+")":""),"good"); updateHud(); }
  function bad(msg, pts){ pts = pts==null?10:pts; st.score-=pts; st.bad++; st.log.push([false,msg]); say("✘ "+msg+"  (−"+pts+")","bad",3.8); updateHud(); wrap.classList.remove("shake"); void wrap.offsetWidth; wrap.classList.add("shake"); }

  function updateHud(){
    hud.querySelector(".spd").textContent = Math.round(st.p.v*KMH);
    hud.querySelector(".pts").textContent = st.score;
    hud.querySelector(".hud-prog i").style.width = clamp(st.p.s/S.finish*100,0,100)+"%";
    var z = currentZone();
    var lim = hud.querySelector(".hud-limit");
    if(z){ lim.hidden=false; lim.querySelector("span").textContent=z.limit; lim.classList.toggle("over", st.p.v*KMH>z.limit+2); }
    else lim.hidden=true;
  }
  function setBtns(){
    bBelt.classList.toggle("on", st.p.belt);
    bBelt.querySelector("span").textContent = st.p.belt ? "الحزام مربوط ✓" : "اربط الحزام";
    if(bIL){ bIL.classList.toggle("on", st.p.ind===-1); bIR.classList.toggle("on", st.p.ind===1); }
    if(bHaz) bHaz.classList.toggle("on", st.p.haz);
  }
  function currentZone(){ var z=null; for(var i=0;i<st.ev.length;i++){ var e=st.ev[i]; if(e.t==="zone" && st.p.s>=e.s && st.p.s<=e.e && (!z || e.s>z.s)) z=e; } return z; }
  function inSolid(){ for(var i=0;i<st.ev.length;i++){ var e=st.ev[i]; if(e.t==="solid" && st.p.s+PL/2>=e.s && st.p.s-PL/2<=e.e) return e; } return null; }

  /* ===== التحكم ===== */
  function laneChange(d){
    if(st.paused||st.ended) return;
    var p=st.p, nl=p.tl+d;
    if(nl<0||nl>=S.lanes) return;
    if(p.v<1){ say("تحرّك أولًا ثم غيّر المسار.","info",1.6); return; }
    var sz = inSolid();
    if(sz){ if(!sz.hit){ sz.hit=true; bad("عبرت فوق خط طولي متصل! لا يجوز التجاوز هنا."); } }
    if(S.signal && p.ind!==d){ bad("أعطِ الإشارة الضوئية الدالة على الجهة المطلوبة قبل تغيير المسار.",5); }
    else if(S.signal==="full" && st.t-p.mir>4){ bad("انظر في المرايا للتأكد من خلو الطريق قبل تغيير المسار.",5); }
    p.prevLane = p.tl; p.tl = nl;
  }
  function toggleInd(d){ if(st.ended) return; st.p.ind = st.p.ind===d?0:d; setBtns(); }
  function mirrors(){
    if(st.paused||st.ended) return;
    st.p.mir = st.t;
    var p=st.p, out=[];
    [[-1,"يسار"],[1,"يمين"]].forEach(function(sd){
      var ln=p.tl+sd[0];
      if(ln<0||ln>=S.lanes){ out.push('<div>'+sd[1]+': <b>حافة الطريق</b></div>'); return; }
      var busy = st.npcs.some(function(n){ return n.lane===ln && Math.abs(n.s-p.s)<14; });
      var blind = st.npcs.some(function(n){ return n.lane===ln && n.s<p.s+1 && n.s>p.s-7; });
      out.push('<div class="'+(busy?'busy':'free')+'">'+sd[1]+': <b>'+(busy?(blind?'مركبة في النقطة العمياء! انتظر':'مركبة قريبة! انتظر'):'خالٍ ✓')+'</b></div>');
    });
    mirrorBox.innerHTML = '<div class="mt">المرايا والنظر على الكتف</div>'+out.join("");
    mirrorBox.classList.add("show");
    clearTimeout(self._mt); self._mt=setTimeout(function(){ mirrorBox.classList.remove("show"); },2200);
  }
  function hold(b, key){
    var on=function(e){ e.preventDefault(); st[key]=true; b.classList.add("down"); if(b.setPointerCapture&&e.pointerId!=null){ try{b.setPointerCapture(e.pointerId);}catch(_){} } };
    var off=function(e){ st[key]=false; b.classList.remove("down"); };
    b.addEventListener("pointerdown",on); b.addEventListener("pointerup",off); b.addEventListener("pointercancel",off); b.addEventListener("lostpointercapture",off);
    b.addEventListener("contextmenu",function(e){e.preventDefault();});
  }
  hold(bGas,"gas"); hold(bBrake,"brake");
  function tap(b,fn){ b.addEventListener("click",function(e){ e.preventDefault(); fn(); }); }
  tap(bL,function(){laneChange(-1);}); tap(bR,function(){laneChange(1);});
  tap(bBelt,function(){ st.p.belt=!st.p.belt; if(st.p.belt && st.p.v<0.5 && st.p.s<5 && !st.beltOk){ st.beltOk=true; good("ارتديت حزام الأمان قبل الانطلاق.",10); } else if(!st.p.belt && st.p.v>0.5){ bad("لا تفك حزام الأمان أثناء القيادة!",10); } setBtns(); });
  if(bIL){ tap(bIL,function(){toggleInd(-1);}); tap(bIR,function(){toggleInd(1);}); }
  if(bMir) tap(bMir,mirrors);
  if(bHaz) tap(bHaz,function(){ st.p.haz=!st.p.haz; setBtns(); });

  var keyMap = {ArrowUp:"gas",ArrowDown:"brake"," ":"brake"};
  function kd(e){
    if(!host.isConnected){ return; }
    var k=e.key;
    if(keyMap[k]){ st[keyMap[k]]=true; e.preventDefault(); }
    else if(k==="ArrowLeft"){ laneChange(-1); e.preventDefault(); }
    else if(k==="ArrowRight"){ laneChange(1); e.preventDefault(); }
    else if(k==="b"||k==="B"||k==="لا"){ bBelt.click(); }
    else if((k==="q"||k==="Q"||k==="ض") && bIL){ toggleInd(-1); }
    else if((k==="e"||k==="E"||k==="ث") && bIR){ toggleInd(1); }
    else if((k==="m"||k==="M"||k==="ة") && bMir){ mirrors(); }
    else if((k==="h"||k==="H"||k==="ا") && bHaz){ bHaz.click(); }
  }
  function ku(e){ if(keyMap[e.key]) st[keyMap[e.key]]=false; }
  window.addEventListener("keydown",kd); window.addEventListener("keyup",ku);

  /* ===== شاشات البداية والقرار والنهاية ===== */
  function showStart(){
    if(/\/go(?:\/|$)/.test(location.hash||"")){
      overlay.className="sim-overlay";
      st.paused=false; st.p.belt=true; st.p.v=11; st.p.s=90; st.beltWarned=true; setBtns();
      return;
    }
    overlay.className="sim-overlay show";
    overlay.innerHTML = '<div class="ov-card"><h3>'+LESSON_TITLE(lessonId)+'</h3><p>'+S.intro+'</p>'+
      '<ul class="keys"><li><b>▲ وقود</b> اضغط باستمرار للتسارع، و<b>▼ فرامل</b> للتوقف</li><li><b>◀ ▶</b> لتغيير المسار</li>'+
      (S.signal?'<li><b>إشارة</b> قبل تغيير المسار'+(S.signal==="full"?'، ثم <b>المرايا</b>':'')+'</li>':'')+
      '<li>لوحة المفاتيح: الأسهم، المسافة للفرامل، B للحزام'+(S.signal?'، Q/E للإشارة':'')+(S.signal==="full"?'، M للمرايا، H للتحذير':'')+'</li></ul>'+
      '<button class="big go">ابدأ المحاكاة</button></div>';
    overlay.querySelector(".go").onclick=function(){ overlay.className="sim-overlay"; st.paused=false; say(S.intro,"info",4); try{ if(!document.fullscreenElement) host.scrollIntoView({block:"end",behavior:"smooth"}); }catch(_){} };
  }
  function decide(e){
    st.paused=true; st.gas=st.brake=false; bGas.classList.remove("down"); bBrake.classList.remove("down");
    overlay.className="sim-overlay show";
    var curbs = e.curbs ? '<div class="curbs"><i class="c1"></i><i class="c2"></i><i class="c3"></i></div>' : '';
    overlay.innerHTML='<div class="ov-card decide"><div class="tag">موقف</div><h3>'+e.title+'</h3><p class="q">'+e.q+'</p><div class="opts">'+
      e.o.map(function(t,i){ return '<button class="opt'+(e.curbs?' curb c'+(i===0?2:i===1?1:3):'')+'" data-i="'+i+'">'+t+'</button>'; }).join("")+'</div><div class="why" hidden></div></div>';
    overlay.querySelectorAll(".opt").forEach(function(b){
      b.onclick=function(){
        var i=+b.getAttribute("data-i");
        overlay.querySelectorAll(".opt").forEach(function(x){ x.disabled=true; if(+x.getAttribute("data-i")===e.a) x.classList.add("right"); });
        if(i===e.a){ good(e.title); } else { b.classList.add("wrong"); bad(e.title); }
        var w=overlay.querySelector(".why"); w.hidden=false;
        w.innerHTML='<p><b>من الكتاب:</b> '+e.why+'</p><button class="big go">متابعة</button>';
        w.querySelector(".go").onclick=function(){ overlay.className="sim-overlay"; st.paused=false; };
      };
    });
  }
  function end(){
    st.ended=true; st.paused=true;
    var tot = st.good+st.bad, ratio = tot? st.good/tot : 1;
    var stars = ratio>=0.9?3:ratio>=0.6?2:1;
    overlay.className="sim-overlay show";
    overlay.innerHTML='<div class="ov-card end"><h3>انتهت الرحلة</h3><div class="stars">'+"★★★".slice(0,stars)+'<span>'+"★★★".slice(stars)+'</span></div>'+
      '<p class="sc">النقاط: <b>'+st.score+'</b> — تصرفات صحيحة: <b>'+st.good+'</b> — مخالفات: <b>'+st.bad+'</b></p>'+
      '<ul class="log">'+st.log.map(function(l){ return '<li class="'+(l[0]?'ok':'no')+'">'+(l[0]?'✔ ':'✘ ')+l[1]+'</li>'; }).join("")+'</ul>'+
      '<button class="big go">أعد المحاكاة</button></div>';
    overlay.querySelector(".go").onclick=function(){ reset(); showStart(); };
  }

  /* ===== المنطق ===== */
  function rectHit(ax,as,aw,al,bx,bs,bw,bl){ return Math.abs(ax-bx)<(aw+bw)/2 && Math.abs(as-bs)<(al+bl)/2; }
  function crash(msg, backTo, obj){
    if(st.crashCD>0) return;
    st.crashCD=1.8;
    if(obj && obj._hit){ say("✘ "+msg,"bad",3); } else { if(obj) obj._hit=true; bad(msg,15); }
    st.p.v=0; if(backTo!=null) st.p.s=Math.min(st.p.s,backTo);
    if(st.p.prevLane!=null && Math.abs(st.p.x-laneX(st.p.tl))>0.4){ st.p.tl=st.p.prevLane; }
  }
  var roadHalf = function(){ return S.lanes*LW/2; };

  function spawnNpc(e){ var big=(e.kind==="truck"||e.kind==="bus"); st.npcs.push({lane:e.lane, s:e.s, x:laneX(e.lane), v:e.v, v0:e.v, kind:e.kind||"car", color:e.color||"#9e9e9e", len:big?9:e.kind==="bike"?1.9:4.4, w:big?2.4:e.kind==="bike"?0.7:1.8, beh:e.beh||null}); }

  function step(dt){
    var p=st.p; st.t+=dt; if(st.crashCD>0) st.crashCD-=dt;
    // سرعة
    var acc = 0;
    if(st.gas){
      if(!p.belt){ if(!st.beltWarned){ st.beltWarned=true; bad("ارتدِ حزام الأمان قبل الانطلاق!",10); } else say("اربط حزام الأمان أولًا (زر الحزام).","warn",1.5); }
      else acc = p.v<8?3.2:2.2;
    }
    if(st.brake) acc = -7.5;
    if(!st.gas && !st.brake) acc = -0.7;
    p.v = clamp(p.v+acc*dt, 0, S.vmax/KMH);
    p.s += p.v*dt;
    // انتقال جانبي
    var tx = laneX(p.tl), dx = tx-p.x, ls = 3.2*dt;
    if(Math.abs(dx)<=ls){ p.x=tx; if(p.lane!==p.tl){ p.lane=p.tl; if(p.ind) { p.ind=0; setBtns(); } } } else p.x += dx>0?ls:-ls;

    // أحداث
    st.ev.forEach(function(e){ handleEvent(e,dt); });

    // مركبات أخرى
    for(var i=st.npcs.length-1;i>=0;i--){
      var n=st.npcs[i];
      var want = n.v0;
      var tracked=false;
      if(n.beh==="blind"){
        n.bt=(n.bt||0)+dt;
        if(n.bt<7){ n.v=p.v; n.s += (p.s-3.2 - n.s)*Math.min(1,dt*3) + p.v*dt; tracked=true; }
        else want = Math.max(p.v+6, 18);
      }
      if(!tracked){
        var obst=[{s:p.s,len:PL,x:p.x,v:p.v}].concat(st.npcs);
        obst.forEach(function(o){ if(o===n) return; if(Math.abs(o.x-n.x)>1.6 || o.s<=n.s) return; var g=o.s-o.len/2-(n.s+n.len/2); if(g<3) want=0; else if(g<16) want=Math.min(want, o.v+(g-3)*0.45); });
      }
      if(n.beh==="brake"){
        if(!n.braked && n.s-p.s<30 && n.s>n.trig){ n.braked=true; n.bt=0; say("⚠ المركبة الأمامية توقفت فجأة! (مسافة الأمان تحمي حياتك)","warn",3); }
        if(n.braked){ n.bt+=dt; want = n.bt<3.2?0:n.v0; }
      }
      // التوقف عند الإشارة الحمراء
      st.ev.forEach(function(e){ if(e.t==="light" && e.state!=="green"){ var line=e.s-3; var front=n.s+n.len/2; if(front<line+0.5 && line-front<25){ var ss=line-front; if(ss<n.v*n.v/(2*5)+1) want=Math.min(want, Math.max(0,(ss-0.5))*1.2); } } });
      if(!tracked){
      var a = want>n.v ? 2.5 : -8;
      n.v = n.v + a*dt; if(a>0&&n.v>want) n.v=want; if(a<0&&n.v<want) n.v=want; if(n.v<0)n.v=0;
      n.s += n.v*dt; }
      if(n.s < p.s-60 || n.s>p.s+400) { st.npcs.splice(i,1); continue; }
      if(st.crashCD<=0 && rectHit(p.x,p.s,PW,PL,n.x,n.s,n.w,n.len)){
        if(n.s>p.s && Math.abs(p.x-n.x)<1.2) crash(n.kind==="bike"?"اصطدمت براكب الدراجة! هدّئ وحافظ على مسافة كافية.":"اصطدام بالمركبة الأمامية! حافظ على مسافة الأمان.", n.s-n.len/2-PL/2-2.5, n);
        else crash("اصطدام أثناء تغيير المسار! تأكد من خلو المسار قبل الانتقال.", null, n);
      }
    }
    // مسافة الأمان
    if(S.follow){
      var ahead=null, gap=1e9;
      st.npcs.forEach(function(n){ if(Math.abs(n.x-p.x)<1.6 && n.s>p.s){ var g=n.s-n.len/2-(p.s+PL/2); if(g<gap){gap=g;ahead=n;} } });
      st.followCD-=dt;
      if(ahead && p.v>4 && gap < Math.max(5, p.v*1.4) && ahead.v<p.v+1){ st.followT+=dt; if(st.followT>1.3 && st.followCD<=0){ st.followCD=7; st.followT=0; if(ahead._fol){ say("اترك مسافة أمان كافية!","warn",2.5); } else { ahead._fol=true; bad("اقتربت كثيرًا! مسافة الأمان هي المسافة التي تحمي حياتك عند التوقف المفاجئ.",5); } } }
      else st.followT=0;
    }
    // سرعة المنطقة
    var z=currentZone();
    if(z){
      if(p.v*KMH > z.limit+3){ z.overT=(z.overT||0)+dt; if(z.overT>1.4 && !z.viol){ z.viol=true; bad("تجاوزت الحد الأقصى للسرعة ("+z.limit+" كم/س). السرعة قوة تصادمية تزداد كلما زادت.",10); } }
      else z.overT=0;
      if(z.fog && p.haz && !st.dustHaz){ st.dustHaz=true; good("استعملت ضوء التحذير لتنبيه الآخرين في العاصفة الترابية.",5); }
    }
    if(st.t>st.msgUntil) toast.classList.remove("show");
    if(p.s>=S.finish && !st.ended){ p.v=0; end(); }
    updateHud();
  }

  function handleEvent(e,dt){
    var p=st.p, front=p.s+PL/2, rear=p.s-PL/2;
    switch(e.t){
    case "zone":
      if(!e.done && p.s>=e.s){ e.done=true; if(!e.quiet) say(e.fog?"منطقة عاصفة ترابية – الحد الأقصى "+e.limit+" كم/س":(e.tempo?"منطقة عمل مؤقتة – الحد الأقصى ":"علامة منع: أقصى سرعة ")+e.limit+" كم/س","info",3); }
      if(!e.fin && p.s>e.e){ e.fin=true; if(!e.viol && !e.quiet) good("التزمت بحد السرعة "+e.limit+" كم/س.",10); }
      break;
    case "sign": if(!e.done && p.s>=e.s-30){ e.done=true; say(e.msg,"info",3.6); } break;
    case "msg": if(!e.done && p.s>=e.s){ e.done=true; say(e.msg,e.kind||"info",4); } break;
    case "npc": if(!e.done && p.s>=e.s-70){ e.done=true; spawnNpc(e); } break;
    case "decide": if(!e.done && p.s>=e.s){ e.done=true; decide(e); } break;
    case "cones":
      if(st.crashCD<=0 && Math.abs(p.x-laneX(e.lane))<(LW/2+PW/2-0.4) && front>e.s && rear<e.e){ crash("دخلت منطقة الأعمال المغلقة! التزم بعلامات مناطق العمل المؤقتة.", e.s-PL/2-2, e); }
      break;
    case "cross":
      if(!e.state && front>e.s-48){ e.state="walk"; e.minV=99;
        st.peds = st.peds.concat([{x:roadHalf()+2.2, s:e.s-0.8, v:-1.5, c:"#f5f5f5", ev:e, pi:0},{x:roadHalf()+3.6, s:e.s+0.9, v:-1.5, c:"#37474f", ev:e, pi:1}]); }
      if(e.state==="walk" && front>e.s-20 && front<e.s-1) e.minV=Math.min(e.minV,p.v);
      if(!e.done && front>e.s-1.5 && e.state){
        var on = st.peds.some(function(q){ return q.ev===e && Math.abs(q.x)<roadHalf()+0.6; });
        if(on){ e.done=true; e.fail=true; bad("لم تتوقف للمشاة عند خط العبور! المشاة هم الطرف الأكثر عرضة لخطر الحوادث.",15); p.v=Math.min(p.v,3); }
        else if(rear>e.s+2){ e.done=true; good("توقفت وأعطيت المشاة حق العبور من الأماكن المخصصة لهم.",10); }
      }
      break;
    case "light":
      var line=e.s-3;
      if(e.state==="green" && !e.cycled && front>line-80){ e.state="yellow"; e.timer=0; e.cycled=true; }
      else if(e.state==="yellow"){ e.timer+=dt; if(e.timer>2.6){ e.state="red"; e.timer=0; if(e.ped){ st.peds=st.peds.concat([{x:roadHalf()+2.2,s:e.s+1.2,v:-1.6,c:"#f5f5f5",ev:e,pi:2},{x:-roadHalf()-2.6,s:e.s+2.6,v:1.6,c:"#4e342e",ev:e,pi:1}]); } } }
      else if(e.state==="red"){ e.timer+=dt; if(p.v<0.3 && front<line+0.2 && front>line-25) e.waited=true; if(e.timer>7.5){ e.state="green"; e.timer=0; } }
      if(!e.done && front>line+0.3){
        e.done=true;
        if(e.state==="red"){ bad("قطعت الإشارة الحمراء! اللون الأحمر يدل على التوقف وعدم الحركة.",15); }
        else if(e.waited){ good("توقفت قبل خط الوقوف عند الأحمر، وانطلقت عند الأخضر.",10); }
        else if(e.state==="yellow"){ say("اللون الأصفر ينبه سائقي المركبات للتوقف.","warn",3); }
      }
      if(e.ped && e.state){ st.peds.forEach(function(q){ if(q.ev===e && st.crashCD<=0 && rectHit(p.x,p.s,PW,PL,q.x,q.s,0.6,0.6)) crash("كدت تصدم أحد المشاة!", null, e); }); }
      break;
    case "solid": if(!e.done && p.s-PL/2>e.e){ e.done=true; if(!e.hit) good("التزمت بالخط الطولي المتصل ولم تتجاوز فوقه.",10); } break;
    case "box":
      if(!e.state && front>e.s-80){ e.state="q"; e.cars=[]; for(var l=0;l<S.lanes;l++) st.npcs.push({lane:l,s:e.s+e.len+4+l*1.5,x:laneX(l),v:0,v0:0,kind:"car",color:l?"#5d4037":"#455a64",len:4.4,w:1.8,box:e}); e.wait=0; say("ازدحام بعد التقاطع… لا تقف داخل المربع الأصفر.","warn",3.5); }
      if(e.state==="q"){
        e.wait+=dt;
        if(p.v<0.3 && front<e.s+0.3 && front>e.s-20) e.okWait=(e.okWait||0)+dt;
        if(p.v<0.3 && front>e.s+0.5 && rear<e.s+e.len){ e.inT=(e.inT||0)+dt; if(e.inT>0.8 && !e.viol){ e.viol=true; bad("توقفت داخل المربع الأصفر! ممنوع التوقف قطعيًا عند التقاطعات.",10); } }
        if((e.okWait||0)>1.8 || e.wait>14 || e.viol){ e.state="go"; st.npcs.forEach(function(n){ if(n.box===e){ n.v0=11; } }); }
      }
      if(!e.done && rear>e.s+e.len){ e.done=true; if(!e.viol) good("لم تقف داخل المربع الأصفر.",10); }
      break;
    case "stop": case "yield":
      var js=e.s, jl=js-5.5;
      if(!e.state && front>js-70){ e.state="traffic"; e.n=0; e.tt=1.6; e.minV=99; }
      if(e.state==="traffic"){ e.tt+=dt; if(e.n<3 && e.tt>2.3){ e.tt=0; var dir=(e.n%2===0)?-1:1; st.xcars.push({s:js+(dir>0?-2:2), x:dir>0?-38:38, v:12*dir, color:["#00838f","#6a1b9a","#ef6c00"][e.n]}); e.n++; } }
      if(front<jl+0.3 && front>jl-22) e.minV=Math.min(e.minV,p.v);
      var inJ = front>js-4.5 && rear<js+4.5;
      if(inJ && !e.near){ var danger=st.xcars.some(function(c){ var rel=(p.x-c.x)*Math.sign(c.v); return rel>-1 && rel<11; }); if(danger){ e.near=true; bad(e.t==="stop"?"لم تفسح الطريق للسيارات في الطريق الرئيسي!":"لم تفسح الطريق! الأولوية لحركة المرور في الطريق الرئيسي.",15); } }
      if(!e.lineDone && front>jl+0.5){ e.lineDone=true; if(e.t==="stop" && e.minV>0.6){ bad("لم تتوقف تمامًا عند علامة «قف»!",10); e.sfail=true; } }
      if(!e.done && rear>js+4.5){ e.done=true; if(!e.near && !(e.sfail)) good(e.t==="stop"?"توقفت تمامًا عند «قف» وانتظرت خلو الطريق.":"أفسحت الطريق لحركة المرور ذات الأولوية.",10); }
      break;
    case "blind":
      if(!e.done && p.s>=e.s){ e.done=true;
        var side = p.tl>0 ? p.tl-1 : p.tl+1;
        st.npcs.push({lane:side,s:p.s-3.2,x:laneX(side),v:p.v,v0:p.v+6,kind:"car",color:"#c62828",len:4.4,w:1.8,beh:"blind"});
        spawnNpc({lane:p.tl, s:p.s+48, v:Math.max(6,p.v*0.45), kind:"car", color:"#6d4c41"});
        say("سيارة بطيئة أمامك… قبل أن تغيّر المسار: أعطِ الإشارة وانظر في المرايا (احذر النقطة العمياء).","warn",5);
        e.watch=true; e.t0=st.t; e.bad0=st.bad;
      }
      if(e.watch && st.t-e.t0>11){ e.watch=false; if(st.bad===e.bad0) good("تعاملت مع النقطة العمياء بأمان.",10); }
      break;
    case "brake":
      if(!e.done && p.s>=e.s-60){ e.done=true; st.npcs.push({lane:p.tl,s:p.s+45,x:laneX(p.tl),v:Math.max(10,p.v*0.8),v0:Math.max(10,p.v*0.8),kind:"car",color:"#283593",len:4.4,w:1.8,beh:"brake",trig:e.s}); e.watch=true; e.bad0=st.bad; e.t0=st.t; }
      if(e.watch && st.t-e.t0>12){ e.watch=false; if(st.bad===e.bad0) good("حافظت على مسافة أمان كافية عند التوقف المفاجئ.",10); }
      break;
    }
  }
  function stepPeds(dt){
    var p=st.p;
    for(var i=st.peds.length-1;i>=0;i--){ var q=st.peds[i];
      // انتظار المشاة عند الإشارة إن أصبحت خضراء للسيارات
      var go = true;
      if(q.ev.t==="light" && q.ev.state==="green" && Math.abs(q.x)>roadHalf()) go=false;
      if(go) q.x += q.v*dt;
      if(Math.abs(q.x)>roadHalf()+6) st.peds.splice(i,1);
      else if(q.ev.t==="cross" && st.crashCD<=0 && rectHit(p.x,p.s,PW,PL,q.x,q.s,0.6,0.6)) crash("كدت تصدم أحد المشاة!", null, q.ev);
    }
    for(var j=st.xcars.length-1;j>=0;j--){ var c=st.xcars[j]; c.x+=c.v*dt; if(Math.abs(c.x)>45) st.xcars.splice(j,1);
      else if(st.crashCD<=0 && rectHit(p.x,p.s,PW,PL,c.x,c.s,4.4,1.8)) crash("اصطدام في التقاطع! الأولوية للطريق الرئيسي.", c.s-5, c); }
  }

  /* ===== الرسم ===== */
  function Y(s){ return H*0.83 - (s-st.p.s)*ppm; }
  function X(x){ return W/2 + x*ppm; }
  function rr(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
  function drawCar(x,s,w,l,color,opt){
    opt=opt||{};
    var cx=X(x), cy=Y(s), pw=w*ppm, pl=l*ppm;
    ctx.save(); ctx.translate(cx,cy); if(opt.rot) ctx.rotate(opt.rot);
    ctx.fillStyle="rgba(0,0,0,.25)"; rr(-pw/2+2,-pl/2+3,pw,pl,pw*0.28); ctx.fill();
    if(opt.kind==="bike"){
      var bspr = vehSprite("bike");
      if(bspr){ ctx.drawImage(bspr, -pw/2, -pl/2, pw, pl); }
      else {
        ctx.fillStyle="#263238"; rr(-pw*0.18,-pl/2,pw*0.36,pl,2); ctx.fill();
        ctx.fillStyle="#cddc39"; ctx.beginPath(); ctx.ellipse(0,0,pw*0.75,pl*0.2,0,0,7); ctx.fill();
        ctx.fillStyle="#fafafa"; ctx.beginPath(); ctx.arc(0,-pl*0.05,pw*0.38,0,7); ctx.fill();
      }
      ctx.restore(); return;
    }
    var vk = opt.kind==="truck"?"truck":opt.kind==="bus"?"bus":"car";
    var spr = (vk==="car") ? (carSheet(color, opt.player) || vehSprite("car", color)) : vehSprite(vk, null);
    var vs = opt.player ? 1.32 : 1;
    if(spr){
      ctx.drawImage(spr, -pw/2*vs, -pl/2*vs, pw*vs, pl*vs);
    } else {
      ctx.fillStyle=color; rr(-pw/2,-pl/2,pw,pl,pw*0.28); ctx.fill();
      if(vk==="truck"||vk==="bus"){
        ctx.fillStyle="#eceff1"; rr(-pw/2+2,-pl/2+pl*0.28,pw-4,pl*0.7,3); ctx.fill();
        ctx.fillStyle="#90a4ae"; rr(-pw/2+3,-pl/2+3,pw-6,pl*0.12,3); ctx.fill();
      } else {
        ctx.fillStyle="rgba(20,30,45,.85)"; rr(-pw/2+pw*0.14,-pl/2+pl*0.2,pw*0.72,pl*0.2,3); ctx.fill();
        ctx.fillStyle="rgba(20,30,45,.7)"; rr(-pw/2+pw*0.16,pl*0.22,pw*0.68,pl*0.13,3); ctx.fill();
        ctx.fillStyle="rgba(255,255,255,.18)"; rr(-pw/2+pw*0.18,-pl*0.05,pw*0.64,pl*0.24,3); ctx.fill();
      }
      ctx.fillStyle="#fff8c4"; ctx.fillRect(-pw/2+2,-pl/2,pw*0.22,2.5); ctx.fillRect(pw/2-2-pw*0.22,-pl/2,pw*0.22,2.5);
    }
    var brk = opt.brake;
    ctx.fillStyle=brk?"#ff1744":"#8b0000"; ctx.fillRect(-pw/2+2,pl/2-3,pw*0.24,3); ctx.fillRect(pw/2-2-pw*0.24,pl/2-3,pw*0.24,3);
    var blink = (Math.floor(st.t*3)%2)===0;
    if(blink && (opt.ind||opt.haz)){
      ctx.fillStyle="#ffab00";
      if(opt.ind===-1||opt.haz){ ctx.fillRect(-pw/2-2,-pl/2,5,6); ctx.fillRect(-pw/2-2,pl/2-6,5,6); }
      if(opt.ind===1||opt.haz){ ctx.fillRect(pw/2-3,-pl/2,5,6); ctx.fillRect(pw/2-3,pl/2-6,5,6); }
    }
    ctx.restore();
  }
  function drawSign(kind, cx, cy, r){
    ctx.save(); ctx.translate(cx,cy);
    ctx.fillStyle="#78909c"; ctx.fillRect(-2,r*0.6,4,r*1.2);
    ctx.lineJoin="round";
    function tri(down,fill,stroke){ ctx.beginPath(); if(down){ ctx.moveTo(-r,-r*0.8); ctx.lineTo(r,-r*0.8); ctx.lineTo(0,r*0.95);} else { ctx.moveTo(0,-r); ctx.lineTo(r,r*0.75); ctx.lineTo(-r,r*0.75);} ctx.closePath(); ctx.fillStyle=fill; ctx.fill(); ctx.lineWidth=r*0.2; ctx.strokeStyle=stroke; ctx.stroke(); }
    if(kind.indexOf("speed")===0){
      ctx.beginPath(); ctx.arc(0,0,r,0,7); ctx.fillStyle="#fff"; ctx.fill(); ctx.lineWidth=r*0.22; ctx.strokeStyle="#d32f2f"; ctx.stroke();
      ctx.fillStyle="#111"; ctx.font="bold "+(r*0.85)+"px Arial"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(kind.slice(5),0,r*0.05);
    } else if(kind==="stop"){
      ctx.beginPath(); for(var i=0;i<8;i++){ var a=Math.PI/8+i*Math.PI/4; ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r); } ctx.closePath();
      ctx.fillStyle="#d32f2f"; ctx.fill(); ctx.lineWidth=r*0.1; ctx.strokeStyle="#fff"; ctx.stroke();
      ctx.fillStyle="#fff"; ctx.font="bold "+(r*0.62)+"px LVAr, Tahoma, sans-serif"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText("قف",0,r*0.02);
    } else if(kind==="yield"){ tri(true,"#ffd600","#d32f2f"); }
    else if(kind==="warnPed"){ tri(false,"#fff","#d32f2f"); ctx.fillStyle="#111"; for(var k=0;k<3;k++) ctx.fillRect(-r*0.45+k*r*0.32,r*0.25,r*0.2,r*0.3); ctx.beginPath(); ctx.arc(0,-r*0.25,r*0.13,0,7); ctx.fill(); ctx.fillRect(-r*0.06,-r*0.12,r*0.12,r*0.34); }
    else if(kind==="works"){ tri(false,"#ffca28","#d32f2f"); ctx.fillStyle="#111"; ctx.beginPath(); ctx.arc(-r*0.12,-r*0.15,r*0.12,0,7); ctx.fill(); ctx.fillRect(-r*0.2,0,r*0.18,r*0.45); ctx.fillRect(r*0.05,r*0.25,r*0.4,r*0.18); }
    else if(kind==="parking"){ ctx.fillStyle="#1565c0"; rr(-r,-r,2*r,2*r,r*0.2); ctx.fill(); ctx.fillStyle="#fff"; ctx.font="bold "+(r*1.3)+"px Arial"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText("P",0,r*0.08); }
    ctx.restore();
  }
  function drawLight(e, cx, cy, sc){
    ctx.save(); ctx.translate(cx,cy);
    if(sprReady(SPR.tlight_v)){
      var lh=sc*5.5, lw=lh*(SPR.tlight_v.naturalWidth/SPR.tlight_v.naturalHeight);
      ctx.drawImage(SPR.tlight_v, -lw/2, -sc*1.9, lw, lh);
    } else {
      ctx.fillStyle="#455a64"; ctx.fillRect(-2,sc*1.6,4,sc*1.4);
      ctx.fillStyle="#212121"; rr(-sc*0.55,-sc*1.6,sc*1.1,sc*3.2,sc*0.25); ctx.fill();
    }
    var cols=[["red","#ff1744","#4a1010"],["yellow","#ffc400","#4a3b10"],["green","#00e676","#0f3a1d"]];
    cols.forEach(function(c,i){ ctx.beginPath(); ctx.arc(0,-sc*1.02+i*sc*1.02,sc*0.38,0,7); ctx.fillStyle = e.state===c[0]?c[1]:c[2]; ctx.fill();
      if(e.state===c[0]){ ctx.shadowColor=c[1]; ctx.shadowBlur=sc; ctx.fill(); ctx.shadowBlur=0; } });
    ctx.restore();
  }
  function posMod(a,b){ return ((a%b)+b)%b; }
  function tileFill(img, x, y, w, h, ox, oy, tilePx){
    if(!sprReady(img) || w<=0 || h<=0){ ctx.fillRect(x,y,w,h); return; }
    ctx.save();
    ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip();
    var tw=tilePx, th=tilePx*(img.naturalHeight/img.naturalWidth);
    var x0=x-posMod(x-ox,tw), y0=y-posMod(y-oy,th);
    for(var yy=y0; yy<y+h; yy+=th)
      for(var xx=x0; xx<x+w; xx+=tw)
        ctx.drawImage(img, xx, yy, tw, th);
    ctx.restore();
  }
  function stamp(img, cx, cy, w, h, rot){
    if(!sprReady(img)) return false;
    ctx.save(); ctx.translate(cx,cy); if(rot) ctx.rotate(rot);
    ctx.drawImage(img, -w/2, -h/2, w, h);
    ctx.restore(); return true;
  }
  function draw(){
    var p=st.p;
    ctx.setTransform(DPR,0,0,DPR,0,0);
    var rh=roadHalf();
    var sMin=p.s-0.17*H/ppm-5, sMax=p.s+0.83*H/ppm+5;
    var originX=X(0), originY=Y(0);
    // أرض رملية بلاطات
    ctx.fillStyle="#e9dcb8";
    tileFill(TILES.sand, 0, 0, W, H, originX, originY, 10*ppm);
    // عشب على الجانبين
    ctx.fillStyle="#c5b48a";
    tileFill(TILES.grass, 0, 0, Math.max(0,X(-rh-8)), H, originX, originY, 8*ppm);
    tileFill(TILES.grass, X(rh+8), 0, Math.max(0,W-X(rh+8)), H, originX, originY, 8*ppm);
    // رصيف
    ctx.fillStyle="#cfd8dc";
    tileFill(TILES.sidewalk, X(-rh-2.4), 0, (rh*2+4.8)*ppm, H, originX, originY, 4.2*ppm);
    // نخيل وشجيرات
    for(var s=Math.floor(sMin/14)*14; s<sMax; s+=14){
      [[-rh-6],[rh+6]].forEach(function(t,i){
        var ox=(((s/14)|0)%2?1.5:-1)*(i?1:-1);
        var cx=X(t[0]+ox), cy=Y(s+(i?6:0));
        var pk=1+((Math.abs(s/14)|0)+i)%4;
        var sz=ppm*(3.8+((Math.abs(s)|0)%3)*0.45);
        if(!stamp(SPR["palm"+pk], cx, cy, sz, sz, 0)){
          ctx.fillStyle=i?"#689f38":"#7cb342";
          ctx.beginPath(); for(var k=0;k<6;k++){ var a=k*Math.PI/3; ctx.ellipse(cx+Math.cos(a)*ppm*0.7,cy+Math.sin(a)*ppm*0.7,ppm*0.9,ppm*0.35,a,0,7); } ctx.fill();
        }
      });
      if(((s/14)|0)%3===0){
        var hx=((s/14)|0)%2? rh+11 : -rh-11;
        stamp(SPR.hedge, X(hx), Y(s+7), ppm*5.5, ppm*3.2, 0);
      }
    }
    // أسطح المنازل على الجانبين (نفس مواضع المباني السابقة)
    for(var sb=Math.floor(sMin/26)*26-26; sb<sMax+26; sb+=26){
      var hsh=Math.abs(Math.sin(sb*12.9898)*43758.5453)%1;
      [[-1],[1]].forEach(function(side,ii){
        var w=7+hsh*6, l=12+((hsh*7)%1)*8, x0=side[0]>0? rh+9+((hsh*3)%1)*3 : -(rh+9+((hsh*5)%1)*3)-w;
        var y1=Y(sb+l+ii*9);
        var iw=w*ppm, ih=l*ppm, cx=X(x0)+iw/2, cy=y1+ih/2;
        var hk=1+((Math.abs(sb/26)|0)+ii)%5;
        var him=SPR["house"+hk];
        if(sprReady(him)){
          var ar=him.naturalWidth/him.naturalHeight, dw=iw*1.15, dh=ih*1.15;
          if(dw/dh>ar) dw=dh*ar; else dh=dw/ar;
          stamp(him, cx, cy, dw, dh, 0);
        } else {
          ctx.fillStyle=ii?"#eceff1":"#efe3c8"; ctx.fillRect(X(x0),y1,iw,ih);
        }
      });
      if(((sb/26)|0)%4===1) stamp(SPR.garden, X(((sb/26)|0)%2? rh+16 : -rh-16), Y(sb+8), ppm*6, ppm*5, 0);
    }
    // حواف الرصيف
    for(var s2=Math.floor(sMin/2)*2; s2<sMax; s2+=2){ ctx.fillStyle=((s2/2)%2===0)?"#212121":"#fafafa"; ctx.fillRect(X(-rh-0.5),Y(s2+2),0.5*ppm,2*ppm); ctx.fillRect(X(rh),Y(s2+2),0.5*ppm,2*ppm); }
    // الإسفلت
    ctx.fillStyle="#3f444c";
    tileFill(TILES.asphalt, X(-rh), 0, rh*2*ppm, H, originX, originY, 8*ppm);
    // طرق عرضية للتقاطعات
    st.ev.forEach(function(e){ if(e.t==="stop"||e.t==="yield"||e.t==="box"||e.t==="light"){ var c = e.t==="box"? e.s+e.len/2 : e.t==="light"? e.s+9 : e.s; var hw = e.t==="box"? e.len/2 : 4.5;
      if(e.t==="light") return;
      ctx.fillStyle="#3f444c";
      tileFill(TILES.asphalt, 0, Y(c+hw), W, hw*2*ppm, originX, originY, 8*ppm);
      ctx.fillStyle="#fafafa"; for(var xx=-60; xx<60; xx+=6){ if(Math.abs(xx)<rh) continue; ctx.fillRect(X(xx),Y(c)-1,3*ppm,2); }
    }});
    // خطوط المسارات
    ctx.fillStyle="#fafafa"; ctx.fillRect(X(-rh)+2,0,3,H); ctx.fillRect(X(rh)-5,0,3,H);
    for(var ln=1; ln<S.lanes; ln++){
      var lx=X(-rh+ln*LW)-1.5;
      for(var s3=Math.floor(sMin/9)*9; s3<sMax; s3+=9){
        var solid = st.ev.some(function(e){ return e.t==="solid" && s3+9>e.s && s3<e.e; });
        var gapJ = st.ev.some(function(e){ return (e.t==="stop"||e.t==="yield") && s3+9>e.s-4.5 && s3<e.s+4.5; });
        if(gapJ) continue;
        if(solid){ ctx.fillStyle="#fff"; ctx.fillRect(lx-1,Y(s3+9),4,9*ppm+1); }
        else { ctx.fillStyle="#fafafa"; ctx.fillRect(lx,Y(s3+3.5),3,3.5*ppm); }
      }
    }
    // عناصر الأرض
    st.ev.forEach(function(e){
      if(e.t==="cross"||(e.t==="light"&&e.ped)){ var cs = e.t==="cross"?e.s:e.s+1.9; if(cs<sMin-5||cs>sMax+5) return; ctx.fillStyle="#fafafa"; for(var xx=-rh+0.3; xx<rh-0.3; xx+=1.0){ ctx.fillRect(X(xx),Y(cs+1.6),0.55*ppm,3.2*ppm); } }
      if(e.t==="light"){ var ls=e.s-3; ctx.fillStyle="#fff"; ctx.fillRect(X(-rh),Y(ls)-3,rh*2*ppm,5); }
      if(e.t==="stop"){ ctx.fillStyle="#fff"; ctx.fillRect(X(-rh),Y(e.s-5.5)-3,rh*2*ppm,6); ctx.fillStyle="rgba(255,255,255,.9)"; ctx.font="bold "+(ppm*1.3)+"px LVAr,Tahoma"; ctx.textAlign="center"; ctx.fillText("قف",X(0),Y(e.s-8)); }
      if(e.t==="yield"){ ctx.fillStyle="#fff"; for(var xx2=-rh; xx2<rh; xx2+=1.2) ctx.fillRect(X(xx2),Y(e.s-5.5)-2,0.6*ppm,4); }
      if(e.t==="box"){ ctx.save(); ctx.beginPath(); ctx.rect(X(-rh),Y(e.s+e.len),rh*2*ppm,e.len*ppm); ctx.clip(); ctx.strokeStyle="#ffd600"; ctx.lineWidth=2.5; ctx.strokeRect(X(-rh)+1,Y(e.s+e.len)+1,rh*2*ppm-2,e.len*ppm-2);
        for(var d=-40; d<40; d+=2){ ctx.beginPath(); ctx.moveTo(X(d),Y(e.s)); ctx.lineTo(X(d+e.len),Y(e.s+e.len)); ctx.moveTo(X(d),Y(e.s+e.len)); ctx.lineTo(X(d+e.len),Y(e.s)); ctx.stroke(); } ctx.restore(); }
      if(e.t==="cones"){
        var lx0=laneX(e.lane)-LW/2;
        ctx.fillStyle="rgba(255,193,7,.30)"; ctx.fillRect(X(lx0),Y(e.e),LW*ppm,(e.e-e.s)*ppm);
        ctx.fillStyle="#ff6d00";
        var csz=Math.max(14,ppm*1.2);
        function drawConeAt(cxm, cs){
          var ci=SPR[(((cs/4)|0)%2)?"cone2":"cone1"];
          if(sprReady(ci)) ctx.drawImage(ci, X(cxm)-csz/2, Y(cs)-csz*0.88, csz, csz);
          else { ctx.beginPath(); ctx.arc(X(cxm),Y(cs),Math.max(3,ppm*0.32),0,7); ctx.fill(); }
        }
        for(var c3=e.s; c3<=e.e; c3+=4){ var f=Math.min(1,(c3-e.s)/14); var cxm = lx0+0.4 + (1-f)*(LW-0.8);
          drawConeAt(cxm,c3); }
        for(var k2=0;k2<4;k2++){ drawConeAt(lx0+0.4+k2*(LW-0.8)/3, e.e); }
      }
    });
    // السيارات العرضية
    st.xcars.forEach(function(c){ drawCar(c.x,c.s,1.8,4.4,c.color,{rot:c.v>0?Math.PI/2:-Math.PI/2}); });
    // المركبات
    st.npcs.forEach(function(n){ drawCar(n.x,n.s,n.w,n.len,n.color,{kind:n.kind,brake:n.v<n.v0-0.5||n.v<0.2}); });
    // المشاة
    st.peds.forEach(function(q){ var cx=X(q.x), cy=Y(q.s), r=Math.max(5,ppm*0.42);
      var pimg = q.img || (PED_IMGS.length ? PED_IMGS[(q.pi||0)%PED_IMGS.length] : null);
      if(pimg && pimg.naturalWidth){
        ctx.save(); ctx.translate(cx,cy);
        ctx.rotate(q.v>=0 ? Math.PI/2 : -Math.PI/2);
        var ph=r*3.6, pw=ph*(pimg.naturalWidth/pimg.naturalHeight);
        ctx.drawImage(pimg, -pw/2, -ph/2, pw, ph);
        ctx.restore();
        return;
      }
      ctx.fillStyle="rgba(0,0,0,.2)"; ctx.beginPath(); ctx.ellipse(cx+2,cy+2,r*1.5,r*1.1,0,0,7); ctx.fill();
      ctx.fillStyle=q.c; ctx.beginPath(); ctx.ellipse(cx,cy,r*1.5,r*1.05,0,0,7); ctx.fill(); ctx.strokeStyle="rgba(0,0,0,.35)"; ctx.lineWidth=1; ctx.stroke();
      ctx.fillStyle=q.c==="#f5f5f5"?"#fafafa":"#263238"; ctx.beginPath(); ctx.arc(cx,cy,r*0.7,0,7); ctx.fill(); ctx.stroke(); });
    // اللاعب
    drawCar(p.x,p.s,PW,PL,"#00897b",{brake:st.brake,ind:p.ind,haz:p.haz,player:true});
    if(!p.belt && p.s<3){ ctx.fillStyle="#d32f2f"; ctx.font="bold "+Math.max(13,ppm*0.9)+"px LVAr,Tahoma"; ctx.textAlign="center"; ctx.fillText("اربط الحزام",X(p.x),Y(p.s)-PL*ppm*0.75); }
    // العلامات والإشارات على جانب الطريق
    var sr=Math.max(14,ppm*1.05);
    st.ev.forEach(function(e){
      if(e.t==="zone" && e.sign && !e.quiet) drawSign(e.sign,X(rh+1.6),Y(e.s),sr);
      if(e.t==="zone" && e.quiet && e.sign) drawSign(e.sign,X(rh+1.6),Y(e.s),sr);
      if(e.t==="sign") drawSign(e.kind,X(rh+1.6),Y(e.s),sr);
      if(e.t==="light") { drawLight(e,X(rh+1.5),Y(e.s-1),Math.max(12,ppm*0.8)); drawLight(e,X(-rh-1.5),Y(e.s-1),Math.max(12,ppm*0.8)); }
    });
    // ضباب
    var z=currentZone();
    if(z && z.fog){ var g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,"rgba(214,170,100,.95)"); g.addColorStop(0.55,"rgba(214,170,100,.55)"); g.addColorStop(1,"rgba(214,170,100,.25)"); ctx.fillStyle=g; ctx.fillRect(0,0,W,H); }
    // لوحة الإشارة القادمة
    var nl=null; st.ev.forEach(function(e){ if(e.t==="light" && !e.done && e.s-p.s<90 && (!nl||e.s<nl.s)) nl=e; });
    if(nl){ ctx.fillStyle="rgba(20,28,34,.8)"; rr(10,H*0.3-34,40,68,10); ctx.fill(); drawLight(nl, 30, H*0.3, 12); }
  }

  var last=0, raf=0;
  function loop(ts){
    if(!host.isConnected){ self.destroy(); return; }
    var dt = last? Math.min(0.05,(ts-last)/1000) : 0; last=ts;
    if(!st.paused && !st.ended){ step(dt); stepPeds(dt); }
    draw();
    raf=requestAnimationFrame(loop);
  }
  this.destroy=function(){ cancelAnimationFrame(raf); window.removeEventListener("keydown",kd); window.removeEventListener("keyup",ku); window.removeEventListener("resize",resize); };
  this.state=function(){ return st; };
  this.dbg={ step:function(dt){ if(!st.paused&&!st.ended){ step(dt); stepPeds(dt);} }, lane:laneChange, mirrors:mirrors, ind:toggleInd, overlay:overlay };
  reset(); resize(); showStart();
  raf=requestAnimationFrame(loop);
}
function LESSON_TITLE(id){ var L=(window.LESSONS||[]).filter(function(l){return l.id===id;})[0]; return L? "محاكاة: "+L.simTitle : "محاكاة القيادة"; }
window.TrafficSim = Sim;
window.SIM_SCEN = SCEN;
})();

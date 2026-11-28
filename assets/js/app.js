(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s);};
var app=$("#app");
function ar(n){ return String(n).replace(/[\u0660-\u0669\u06F0-\u06F9]/g,function(d){ var c=d.charCodeAt(0); return String(c>=0x06F0?c-0x06F0:c-0x0660); }); }
function bookNo(pdf){ /* الإزاحة تختلف حسب الوحدة: الأولى −18، الثانية −20، الثالثة −22 */ return pdf>=76 ? pdf-22 : pdf>=58 ? pdf-20 : pdf-BOOK.offset; }
var currentSim=null;

/* ===== أيقونات وعلامات SVG (مرسومة يدويًا) ===== */
function signSVG(k){
  var o='<svg viewBox="0 0 100 100" class="sg" aria-hidden="true">';
  var tri=function(inner,fill){ return '<path d="M50 8 L94 88 H6 Z" fill="'+(fill||"#fff")+'" stroke="#d32f2f" stroke-width="9" stroke-linejoin="round"/>'+inner; };
  var circ=function(inner,fill,stroke){ return '<circle cx="50" cy="50" r="42" fill="'+(fill||"#fff")+'" stroke="'+(stroke||"#d32f2f")+'" stroke-width="'+(stroke==="none"?0:9)+'"/>'+inner; };
  var sq=function(inner,fill){ return '<rect x="8" y="8" width="84" height="84" rx="8" fill="'+(fill||"#1565c0")+'"/>'+inner; };
  var slash='<line x1="21" y1="21" x2="79" y2="79" stroke="#d32f2f" stroke-width="9"/>';
  var walker='<circle cx="52" cy="40" r="6" fill="#111"/><path d="M50 48 L44 66 M50 48 L58 64 M48 54 L40 58 M50 52 L60 56" stroke="#111" stroke-width="5" stroke-linecap="round" fill="none"/>';
  switch(k){
    case "hospital": o+=sq('<path d="M32 26v48M68 26v48M32 50h36" stroke="#fff" stroke-width="12"/>'); break;
    case "parking": o+=sq('<text x="50" y="72" font-size="62" font-family="Arial" font-weight="bold" fill="#fff" text-anchor="middle">P</text>'); break;
    case "uturn": o+=sq('<path d="M62 78 V44 a14 14 0 0 0 -28 0 V60" stroke="#fff" stroke-width="9" fill="none"/><path d="M22 56 L34 74 L46 56 Z" fill="#fff"/>'); break;
    case "fuel": o+=sq('<rect x="30" y="28" width="26" height="46" rx="3" fill="#fff"/><rect x="35" y="34" width="16" height="12" fill="#1565c0"/><path d="M56 40 h8 v26 a4 4 0 0 0 8 0 V36 l-6 -6" stroke="#fff" stroke-width="5" fill="none"/>'); break;
    case "museum": o+=sq('<path d="M24 44 L50 26 L76 44 Z M28 48h44v4H28z M32 54h6v16h-6z M47 54h6v16h-6z M62 54h6v16h-6z M26 72h48v5H26z" fill="#fff"/>','#6d4c41'); break;
    case "lightsAhead": o+=tri('<rect x="42" y="38" width="16" height="40" rx="4" fill="#222"/><circle cx="50" cy="46" r="4.5" fill="#e53935"/><circle cx="50" cy="58" r="4.5" fill="#fdd835"/><circle cx="50" cy="70" r="4.5" fill="#43a047"/>'); break;
    case "pedAhead": o+=tri('<g transform="translate(0,10)">'+walker+'</g><path d="M30 80h40" stroke="#111" stroke-width="3" stroke-dasharray="5 3"/>'); break;
    case "hump": o+=tri('<path d="M26 76 Q50 50 74 76 Z" fill="#111"/>'); break;
    case "bends": o+=tri('<path d="M40 78 V60 L60 50 V36" stroke="#111" stroke-width="7" fill="none"/><path d="M52 38 L60 26 L68 38Z" fill="#111"/>'); break;
    case "works": o+=tri('<circle cx="44" cy="46" r="5.5" fill="#111"/><path d="M44 52 L42 70 M42 58 L58 66 M58 62 L66 76" stroke="#111" stroke-width="5" stroke-linecap="round"/><path d="M60 76 h16 l-6 -8z" fill="#111"/>','#ffca28'); break;
    case "oneway": o+=circ('<path d="M50 78 V34" stroke="#fff" stroke-width="10"/><path d="M34 40 L50 20 L66 40Z" fill="#fff"/>',"#1565c0","none"); break;
    case "keepright": o+=circ('<path d="M34 34 L62 62" stroke="#fff" stroke-width="10"/><path d="M48 70 L70 70 L70 48Z" fill="#fff"/>',"#1565c0","none"); break;
    case "roundabout": o+=circ('<g fill="none" stroke="#fff" stroke-width="7"><path d="M50 26 a24 24 0 0 1 22 14"/><path d="M72 62 a24 24 0 0 1 -24 12"/><path d="M28 62 a24 24 0 0 1 2 -26"/></g><path d="M66 36 l10 8 l2 -12z M52 82 l-10 -8 l12 -4z M24 40 l2 -12 l10 6z" fill="#fff"/>',"#1565c0","none"); break;
    case "noentry": o+=circ('<rect x="20" y="42" width="60" height="16" fill="#fff"/>',"#d32f2f","none"); break;
    case "noparking": o+=circ('<text x="50" y="68" font-size="48" font-family="Arial" font-weight="bold" fill="#111" text-anchor="middle">P</text>'+slash); break;
    case "nouturn": o+=circ('<path d="M60 74 V46 a10 10 0 0 0 -20 0 V58" stroke="#111" stroke-width="7" fill="none"/><path d="M32 56 L40 70 L48 56Z" fill="#111"/>'+slash); break;
    case "speed80": o+=circ('<text x="50" y="64" font-size="40" font-family="Arial" font-weight="bold" fill="#111" text-anchor="middle">80</text>'); break;
    case "stop": o+='<path d="M33 6h34l27 27v34L67 94H33L6 67V33Z" fill="#d32f2f" stroke="#fff" stroke-width="3"/><text x="50" y="58" font-size="30" font-family="LVAr,Tahoma" font-weight="bold" fill="#fff" text-anchor="middle">قف</text>'; break;
    case "yield": o+='<path d="M8 14 H92 L50 90 Z" fill="#ffd600" stroke="#d32f2f" stroke-width="9" stroke-linejoin="round"/>'; break;
    case "warnblank": o+=tri(''); break;
    case "pedCross": o+=sq('<path d="M50 18 L84 80 H16Z" fill="#fff"/><g transform="translate(0,14)">'+walker+'</g><path d="M28 76h44" stroke="#111" stroke-width="3" stroke-dasharray="5 3"/>'); break;
    case "noThrough": o+=sq('<rect x="44" y="40" width="12" height="42" fill="#fff"/><rect x="26" y="24" width="48" height="16" fill="#d32f2f"/>'); break;
    case "highway": o+=sq('<path d="M30 84 L44 34 H56 L70 84Z M46 84 L48 50 H52 L54 84Z" fill="#fff"/><path d="M18 34 H82 V26 H18Z" fill="#fff"/><path d="M30 84 L44 34 H56 L70 84Z" fill="none"/>','#0b6b32'); break;
    case "children": o+=tri('<circle cx="40" cy="44" r="5.5" fill="#111"/><path d="M40 50 L36 64 L32 76 M36 64 L42 76 M40 54 L50 58" stroke="#111" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="60" cy="48" r="5" fill="#111"/><path d="M60 54 L58 66 L54 76 M58 66 L64 76 M60 57 L51 59" stroke="#111" stroke-width="4.5" stroke-linecap="round" fill="none"/>'); break;
    case "sideRoad": o+=tri('<path d="M46 80 V36 M46 56 H64" stroke="#111" stroke-width="8"/>'); break;
    case "twoWay": o+=tri('<path d="M40 78 V44 M60 40 V74" stroke="#111" stroke-width="6"/><path d="M32 48 L40 36 L48 48Z M52 70 L60 82 L68 70Z" fill="#111"/>'); break;
    case "crossRoad": o+=tri('<path d="M50 38 V80 M34 58 H66" stroke="#111" stroke-width="9"/>'); break;
    case "camera": o+='<rect x="8" y="14" width="84" height="72" rx="6" fill="#fff" stroke="#111" stroke-width="4"/><rect x="22" y="34" width="38" height="30" rx="5" fill="#111"/><circle cx="41" cy="49" r="9" fill="#fff"/><path d="M60 42 L76 34 V64 L60 56Z" fill="#111"/>'; break;
    case "turnRight": o+=circ('<path d="M40 80 V52 a12 12 0 0 1 12 -12 H62" stroke="#fff" stroke-width="10" fill="none"/><path d="M60 26 L78 40 L60 54Z" fill="#fff"/>',"#1565c0","none"); break;
    case "aheadRight": o+=circ('<path d="M44 82 V26 M44 60 L64 44" stroke="#fff" stroke-width="9" fill="none"/><path d="M32 32 L44 16 L56 32Z M58 34 L76 36 L68 52Z" fill="#fff"/>',"#1565c0","none"); break;
    case "noLeft": o+=circ('<path d="M60 76 V48 a10 10 0 0 0 -10 -10 H40" stroke="#111" stroke-width="8" fill="none"/><path d="M42 26 L26 38 L42 50Z" fill="#111"/>'+slash); break;
    case "noHorn": o+=circ('<path d="M26 44 h10 l22 -12 v36 l-22 -12 h-10z" fill="#111"/><path d="M62 40 q8 10 0 20" stroke="#111" stroke-width="4" fill="none"/>'+slash); break;
    case "noStopping": o+='<circle cx="50" cy="50" r="42" fill="#1565c0" stroke="#d32f2f" stroke-width="9"/><path d="M24 24 L76 76 M76 24 L24 76" stroke="#d32f2f" stroke-width="9"/>'; break;
    case "noOvertake": o+=circ('<rect x="24" y="44" width="22" height="14" rx="5" fill="#d32f2f"/><circle cx="29" cy="60" r="3.5" fill="#111"/><circle cx="41" cy="60" r="3.5" fill="#111"/><rect x="54" y="44" width="22" height="14" rx="5" fill="#111"/><circle cx="59" cy="60" r="3.5" fill="#111"/><circle cx="71" cy="60" r="3.5" fill="#111"/>'); break;
    case "noPeds": o+=circ('<g transform="translate(-2,8)">'+walker+'</g>'+slash); break;
    case "noBikes": o+=circ('<circle cx="34" cy="60" r="10" stroke="#111" stroke-width="4" fill="none"/><circle cx="66" cy="60" r="10" stroke="#111" stroke-width="4" fill="none"/><path d="M34 60 L46 44 H60 L66 60 M46 44 L52 60 H34 M58 38 h6" stroke="#111" stroke-width="4" fill="none"/>'+slash); break;
    case "noVehicles": o+=circ('<rect x="30" y="50" width="40" height="16" rx="6" fill="#111"/><rect x="38" y="40" width="24" height="14" rx="4" fill="#111"/><circle cx="38" cy="68" r="4" fill="#111"/><circle cx="62" cy="68" r="4" fill="#111"/>'+slash); break;
    case "regblank": o+=circ(''); break;
    case "mandblank": o+=circ('','#1565c0','none'); break;
  }
  return o+'</svg>';
}
var ICONS={
  1:'<svg viewBox="0 0 100 100"><rect x="6" y="6" width="88" height="88" rx="14" fill="#1565c0"/><path d="M50 16 L86 80 H14Z" fill="#fff"/><circle cx="52" cy="42" r="6" fill="#111"/><path d="M50 50 L44 68 M50 50 L58 66 M48 56 L40 60 M50 54 L60 58" stroke="#111" stroke-width="5" stroke-linecap="round"/></svg>',
  2:signSVG("stop"),
  3:'<svg viewBox="0 0 100 100"><rect x="30" y="4" width="40" height="92" rx="12" fill="#263238"/><circle cx="50" cy="24" r="11" fill="#ff1744"/><circle cx="50" cy="50" r="11" fill="#5d4c10"/><circle cx="50" cy="76" r="11" fill="#14532d"/></svg>',
  4:'<svg viewBox="0 0 100 100"><path d="M50 6 L88 20 V48 C88 72 70 88 50 96 C30 88 12 72 12 48 V20Z" fill="#1565c0"/><path d="M32 50 L45 63 L70 36" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

function _ic(c,inner){ return '<svg viewBox="0 0 100 100"><rect x="6" y="6" width="88" height="88" rx="14" fill="'+c+'"/>'+inner+'</svg>'; }
ICONS[5]=_ic("#00838f",'<circle cx="34" cy="34" r="10" fill="#fff"/><circle cx="66" cy="34" r="10" fill="#fff"/><path d="M18 76 q16 -30 32 0 M50 76 q16 -30 32 0" fill="#fff"/><path d="M40 60 h20" stroke="#fff" stroke-width="7" stroke-linecap="round"/>');
ICONS[6]=_ic("#5d4037",'<rect x="16" y="28" width="68" height="46" rx="6" fill="#fff"/><circle cx="34" cy="48" r="8" fill="#5d4037"/><path d="M24 66 q10 -12 20 0Z" fill="#5d4037"/><path d="M52 42h24M52 52h24M52 62h16" stroke="#5d4037" stroke-width="5"/>');
ICONS[7]=_ic("#455a64",'<path d="M38 18 L18 86 H82 L62 18Z" fill="#263238"/><path d="M50 22v12M50 44v12M50 66v14" stroke="#fff" stroke-width="5"/><path d="M38 18 L18 86 M62 18 L82 86" stroke="#ffeb3b" stroke-width="4"/>');
ICONS[8]=_ic("#ad1457",'<path d="M50 16 L88 82 H12Z" fill="#fff"/><rect x="46" y="36" width="8" height="26" rx="3" fill="#ad1457"/><circle cx="50" cy="70" r="5" fill="#ad1457"/>');
ICONS[9]=_ic("#6a1b9a",'<path d="M50 18v60M30 80h40M22 30h56" stroke="#fff" stroke-width="6" stroke-linecap="round"/><path d="M22 30 l-10 24 h20Z M78 30 l-10 24 h20Z" fill="#fff"/>');
ICONS[10]=_ic("#4527a0",'<rect x="18" y="20" width="64" height="16" rx="4" fill="#ef5350"/><rect x="18" y="42" width="64" height="16" rx="4" fill="#fff"/><rect x="18" y="64" width="64" height="16" rx="4" fill="#ffca28"/>');
ICONS[11]=_ic("#283593",'<rect x="24" y="14" width="52" height="72" rx="6" fill="#fff"/><path d="M34 30h32M34 42h32M34 54h32M34 66h20" stroke="#283593" stroke-width="5"/>');
ICONS[12]=_ic("#bf360c",'<rect x="16" y="28" width="68" height="44" rx="6" fill="#fff"/><path d="M26 38h30M26 50h22M26 62h26" stroke="#bf360c" stroke-width="5"/><circle cx="68" cy="56" r="14" fill="none" stroke="#d32f2f" stroke-width="6"/><path d="M58 66 L78 46" stroke="#d32f2f" stroke-width="6"/>');
ICONS[13]=_ic("#00695c",'<path d="M66 16 a18 18 0 0 0 -18 24 L18 70 a8 8 0 0 0 12 12 L60 52 a18 18 0 0 0 24 -18 l-12 8 -10 -4 -4 -10Z" fill="#fff"/>');
ICONS[14]=_ic("#37474f",'<circle cx="50" cy="50" r="22" fill="none" stroke="#fff" stroke-width="12" stroke-dasharray="10 7"/><circle cx="50" cy="50" r="16" fill="#fff"/><circle cx="50" cy="50" r="7" fill="#37474f"/>');
ICONS[15]=_ic("#1565c0",'<rect x="20" y="30" width="56" height="40" rx="6" fill="#fff"/><rect x="76" y="42" width="8" height="16" rx="2" fill="#fff"/><path d="M52 34 L38 52 H50 L44 66 L62 46 H50Z" fill="#1565c0"/>');
ICONS[16]=_ic("#2e7d32",'<path d="M28 74 C28 40 56 22 82 22 C82 52 62 74 28 74Z" fill="#fff"/><path d="M28 74 L58 44" stroke="#2e7d32" stroke-width="5"/><rect x="16" y="62" width="14" height="22" rx="3" fill="#ffeb3b"/>');
ICONS[17]=_ic("#6d4c41",'<rect x="20" y="52" width="14" height="30" fill="#fff"/><rect x="43" y="34" width="14" height="48" fill="#ffca28"/><rect x="66" y="20" width="14" height="62" fill="#fff"/><path d="M14 84h72" stroke="#fff" stroke-width="4"/>');
var ART={
  hero:"assets/img/lessons/hero.jpg",
  1:"assets/img/lessons/l01.jpg", 2:"assets/img/lessons/l02.jpg", 3:"assets/img/lessons/l03.jpg", 4:"assets/img/lessons/l04.jpg",
  5:"assets/img/lessons/l05.jpg", 6:"assets/img/lessons/l06.jpg", 7:"assets/img/lessons/l07.jpg", 8:"assets/img/lessons/l08.jpg",
  9:"assets/img/lessons/l09.jpg", 10:"assets/img/lessons/l10.jpg", 11:"assets/img/lessons/l11.jpg", 12:"assets/img/lessons/l12.jpg",
  13:"assets/img/lessons/l13.jpg", 14:"assets/img/lessons/l14.jpg", 15:"assets/img/lessons/l15.jpg", 16:"assets/img/lessons/l16.jpg",
  17:"assets/img/lessons/l17.jpg"
};
function artSrc(id){ return ART[id] || ART.hero; }
function IC(L){
  var src=ART[L.id];
  if(src) return '<img src="'+src+'" alt="">';
  return ICONS[L.id] || _ic(L.color||"#455a64",'<circle cx="50" cy="50" r="20" fill="#fff"/>');
}
function artFig(L){
  var src=ART[L.id]; if(!src) return "";
  return '<figure class="lphoto lart"><img src="'+src+'" alt="'+L.title+'"><figcaption class="cap">رسمة توضيحية للدرس</figcaption></figure>';
}
function lessonIdx(id){ for(var k=0;k<LESSONS.length;k++){ if(LESSONS[k].id===+id) return k; } return -1; }
var UNITS=window.UNITS||[{n:1,title:"الدروس",range:""}];
function lessonsMenuHTML(){
  return UNITS.map(function(u){ var ls=LESSONS.filter(function(l){return (l.unit||1)===u.n;}); if(!ls.length) return "";
    return '<div class="lm-u"><div class="lm-h">'+u.title+'</div>'+ls.map(function(l){ return '<a href="#/lesson/'+l.id+'" data-lid="'+l.id+'"><span class="lm-c">'+l.code+'</span>'+l.title+'</a>'; }).join("")+'</div>'; }).join("");
}
(function(){
  var nav=document.querySelector(".topnav"); if(!nav) return;
  var d=document.createElement("details"); d.className="lesmenu";
  d.innerHTML='<summary data-nav="lesson">الدروس <span aria-hidden="true">▾</span></summary><div class="lm-pop" role="menu">'+lessonsMenuHTML()+'</div>';
  var first=nav.querySelector("a"); nav.insertBefore(d, first?first.nextSibling:null);
  document.addEventListener("click",function(e){ if(d.open && !d.contains(e.target)) d.open=false; });
  d.addEventListener("click",function(e){ if(e.target.closest("a")) d.open=false; });
  document.addEventListener("keydown",function(e){ if(e.key==="Escape" && d.open){ d.open=false; d.querySelector("summary").focus(); } });
})();
function lessonById(id){ return LESSONS.filter(function(l){return l.id===+id;})[0]; }
var LSKIN={1:"g",2:"r",3:"y",4:"g2"};
var PHOTOS={
  hero:{src:"assets/img/photos/kuwait_highway_signs.jpg",alt:"علامات إرشادية على طريق سريع في مدينة الكويت",credit:"EnGxBaDeR — CC BY-SA 4.0"},
  1:{src:"assets/img/photos/kuwait_ardiya_crossing_sign.jpg",alt:"علامة تحذير لعبور المشاة في طرق العارضية",credit:"EnGxBaDeR — CC BY-SA 4.0"},
  2:{src:"assets/img/photos/kuwait_give_way_sign.jpg",alt:"علامة أفسح الطريق في الكويت",credit:"Irvin calicut — CC BY-SA 3.0"},
  3:{src:"assets/img/photos/kuwait_gulf_street_traffic_lights.jpg",alt:"إشارات ضوئية وعلامة شارع الخليج العربي",credit:"M sh شراونة محمد — ملكية عامة"},
  4:{src:"assets/img/photos/kuwait_highway_skyline.jpg",alt:"طريق سريع باتجاه أفق مدينة الكويت",credit:"Rob Faulkner — CC BY 2.0"}
};
function photoFig(ph, extraClass){
  if(!ph) return "";
  return '<figure class="'+(extraClass||"lphoto")+' real"><img src="'+ph.src+'" alt="'+ph.alt+'"><figcaption class="cap">من شوارع الكويت — '+ph.credit+'</figcaption></figure>';
}
function setNav(active){
  var sm=document.querySelector(".lesmenu summary"); if(sm) sm.classList.toggle("on", active==="-");
  var lid=(location.hash.match(/^#\/lesson\/(\d+)/)||[])[1];
  document.querySelectorAll(".lm-pop a").forEach(function(a){ a.classList.toggle("on", a.getAttribute("data-lid")===lid); });
  document.querySelectorAll(".topnav > a").forEach(function(a){
    var n=a.getAttribute("data-nav")||"";
    a.classList.toggle("on", n===active);
  });
}


/* ===== الهيكل ===== */
function crumbs(html){ return '<nav class="crumbs"><a href="#/">الرئيسية</a>'+(html||"")+'</nav>'; }
function render(){
  if(currentSim){ currentSim.destroy(); currentSim=null; }
  var h=(location.hash||"#/").slice(2).split("/");
  window.scrollTo(0,0);
  setNav(h[0]==="lesson" ? "-" : (h[0]||""));
  document.body.classList.toggle("printmode", h[0]==="print");
  document.body.classList.remove("simmode");
  setFoot();
  if(h[0]==="print") return ACT.viewPrint(app, +h[1]);
  if(h[0]==="log") return ACT.viewLog(app, crumbs);
  if(h[0]==="lesson") return viewLesson(+h[1], h[2]||"content");
  if(h[0]==="book") return viewBook(h[1]?+h[1]:0);
  if(h[0]==="games") return viewGames();
  if(h[0]==="about") return viewAbout();
  return viewHome();
}
window.addEventListener("hashchange", render);

function viewHome(){
  app.innerHTML =
  '<section class="hero"><div class="hero-in">'+
    '<div class="hero-txt"><div class="sign"><span class="kicker">'+BOOK.course+'</span><h1>'+BOOK.title+'</h1></div>'+
    '<span class="pill">«كتاب تفاعلي: جميع دروس الكتاب – 3 وحدات»</span>'+
    '<p class="course">'+BOOK.edition+'</p>'+
    '<p class="lead">جميع دروس الكتاب بمحتواها الأصلي، مع صفحات الكتاب، و<b>محاكاة قيادة عملية</b> في دروس القيادة، وخريطة أو مخطط تفاعلي، ولعبة ذاكرة ولعبة تصنيف، وورقة عمل للطباعة لكل درس. يعمل بالكامل بدون إنترنت.</p>'+
    '<div class="hero-btns"><a class="btn pri" href="#/lesson/'+LESSONS[0].id+'">ابدأ الدرس الأول</a><a class="btn" href="#/book">متصفح الكتاب</a><a class="btn" href="#/games">مركز الألعاب</a></div></div>'+
    '<figure class="hero-media"><div class="hero-photo-wrap"><img class="hero-photo" src="'+ART.hero+'" alt="رسمة توضيحية لطريق في مدينة الكويت"><img class="cover-mini" src="assets/img/cover.jpg" alt="غلاف كتاب الثقافة المرورية"></div><figcaption class="cap">رسمة توضيحية</figcaption></figure>'+
  '</div></section>'+
  '<section class="wrap"><h2 class="sec-t"><span class="tl" aria-hidden="true"><i></i><i></i><i></i></span> الدروس</h2>'+
  UNITS.map(function(u){ var ls=LESSONS.filter(function(l){return (l.unit||1)===u.n;}); return '<h3 class="unit-h"><span>'+u.title+'</span><small>'+u.range+' | '+ar(ls.length)+' صفحات دروس</small></h3><div class="cards">'+
  ls.map(function(l){ return '<a class="lcard '+(LSKIN[l.id]||"g")+'" href="#/lesson/'+l.id+'" style="--c:'+l.color+'"><div class="lc-art"><img src="'+artSrc(l.id)+'" alt=""></div><div class="signhead"><span class="code">'+l.code+'</span><h3>'+l.title+'</h3></div><div class="lc-b"><p>'+l.sub+'</p><span class="range code">'+l.range+'</span><span class="sim-tag">'+(l.sim?'محاكاة: '+l.simTitle:'مخطط تفاعلي وألعاب وورقة عمل')+'</span></div></a>'; }).join("")+'</div>'; }).join("")+
  '<div class="tiles">'+
    '<a class="tile" href="#/book"><div class="t-ic"><svg viewBox="0 0 100 100"><path d="M50 24 C38 16 22 16 10 20 V82 C22 78 38 78 50 86 C62 78 78 78 90 82 V20 C78 16 62 16 50 24Z" fill="#1565c0"/><path d="M50 24 V86" stroke="#fff" stroke-width="4"/></svg></div><h3>متصفح الكتاب</h3><p>صفحات جميع الدروس كما في الكتاب المطبوع.</p></a>'+
    '<a class="tile" href="#/games"><div class="t-ic"><svg viewBox="0 0 100 100"><rect x="8" y="30" width="84" height="44" rx="22" fill="#ef6c00"/><path d="M28 44v16M20 52h16" stroke="#fff" stroke-width="6"/><circle cx="68" cy="46" r="5" fill="#fff"/><circle cx="78" cy="56" r="5" fill="#fff"/></svg></div><h3>مركز الألعاب</h3><p>المحاكاة والخرائط التفاعلية ولعبة الذاكرة ولعبة التصنيف والاختبارات.</p></a>'+
    '<a class="tile" href="#/log"><div class="t-ic"><svg viewBox="0 0 100 100"><rect x="16" y="10" width="68" height="82" rx="8" fill="#ef6c00"/><rect x="34" y="4" width="32" height="14" rx="4" fill="#5d4037"/><path d="M28 38 l6 6 l10 -12 M28 62 l6 6 l10 -12" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M52 40 h20 M52 64 h20" stroke="#fff" stroke-width="6" stroke-linecap="round"/></svg></div><h3>سجل الفصل</h3><p>تابع ما أنجزه الفصل أو كل مجموعة في كل درس.</p></a>'+
    '<a class="tile" href="#/about"><div class="t-ic"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="#2e7d32"/><rect x="44" y="44" width="12" height="32" rx="4" fill="#fff"/><circle cx="50" cy="30" r="7" fill="#fff"/></svg></div><h3>عن نسخة الكتاب التفاعلي</h3><p>الإعداد، ومؤلفو الكتاب، وطريقة التشغيل.</p></a>'+
  '</div></section>';
}

function tableHTML(t){
  return '<div class="tbl-wrap" tabindex="0">'+(t.cap?'<div class="tbl-cap">'+t.cap+'</div>':'')+'<table class="btbl"><thead><tr>'+t.head.map(function(h){return '<th>'+h+'</th>';}).join("")+'</tr></thead><tbody>'+t.rows.map(function(r){ return '<tr>'+r.map(function(c,k){ return k===0?'<th scope="row">'+c+'</th>':'<td>'+c+'</td>'; }).join("")+'</tr>'; }).join("")+'</tbody></table></div>';
}
function sectionHTML(s, L){
  var x='<article class="sect"><h3>'+s.h+'</h3>';
  (s.p||[]).forEach(function(p){ x+='<p>'+p+'</p>'; });
  if(s.sign){ var rows={guide:["hospital","parking","fuel","uturn","museum"],warn:["lightsAhead","pedAhead","hump","bends"],reg:["oneway","keepright","roundabout","noentry","noparking","speed80"],special:["stop","yield"]}[s.sign]; if(rows) x+='<div class="sign-row">'+rows.map(function(k){return '<span class="sg-w">'+signSVG(k)+'</span>';}).join("")+'</div>'; }
  if(s.li){ x+='<ul class="pts">'+s.li.map(function(i){ return '<li><b>'+i[0]+':</b> '+i[1]+'</li>'; }).join("")+'</ul>'; }
  if(s.ol){ x+='<ol class="steps">'+s.ol.map(function(i){return '<li>'+i+'</li>';}).join("")+'</ol>'; }
  if(s.guideColors){ x+='<div class="gcolors"><span style="background:#1f5fa6">للأماكن القريبة</span><span style="background:#2e7d32">للأماكن البعيدة</span><span style="background:#6d3b16">للأماكن السياحية</span><span style="background:#ffeb3b;color:#111">«الخروج فقط» من شبكة الطرق</span></div>'; }
  if(s.p2) x+='<p>'+s.p2+'</p>';
  if(s.table) x+=tableHTML(s.table);
  (s.blocks||[]).forEach(function(bk){
    x+='<div class="blk">'+(bk.h4?'<h4>'+bk.h4+'</h4>':'');
    (bk.p||[]).forEach(function(p){ x+='<p>'+p+'</p>'; });
    if(bk.li) x+='<ul class="pts">'+bk.li.map(function(i){ return '<li><b>'+i[0]+':</b> '+i[1]+'</li>'; }).join("")+'</ul>';
    if(bk.ul) x+='<ul class="chk">'+bk.ul.map(function(i){ return '<li>'+i+'</li>'; }).join("")+'</ul>';
    if(bk.ol) x+='<ol class="steps">'+bk.ol.map(function(i){return '<li>'+i+'</li>';}).join("")+'</ol>';
    if(bk.p2) x+='<p>'+bk.p2+'</p>';
    if(bk.table) x+=tableHTML(bk.table);
    x+='</div>';
  });
  if(s.ul){ x+='<ul class="chk">'+s.ul.map(function(i){ return '<li>'+i+'</li>'; }).join("")+'</ul>'; }
  if(s.speed){ x+='<div class="speedbox"><div class="sb-h">العلاقة بين السرعة وقوة الاصطدام (من الكتاب)</div>'+
    [["30","3.5 متر","خطر محدود",10],["100","39 مترًا","الطابق 13",45],["150","88.5 مترًا","الطابق 30",100]].map(function(r){ return '<div class="sb-r"><span class="sb-s">'+r[0]+'<small>كم/س</small></span><div class="sb-bar"><i style="width:'+r[3]+'%"></i></div><span class="sb-v">يعادل السقوط من ارتفاع <b>'+r[1]+'</b> ('+r[2]+')</span></div>'; }).join("")+'</div>'; }
  if(s.lights){ x+='<div class="lights-demo"><div class="tl v"><i class="r"></i><i class="y"></i><i class="g"></i><span>رأسية</span></div><div class="tl h"><i class="r"></i><i class="y"></i><i class="g"></i><span>أفقية</span></div><div class="tl p"><i class="r"></i><i class="g"></i><span>المشاة</span></div></div>'; }
  if(s.curbs){ x+='<div class="curb-demo"><div><i class="curb c1"></i>يُسمح بالوقوف</div><div><i class="curb c2"></i>يُمنع الوقوف</div><div><i class="curb c3"></i>وقوف الباصات</div></div>'; }
  return x+'</article>';
}

function viewLesson(id, tab){
  var L=lessonById(id); if(!L){ location.hash="#/"; return; }
  var tabs=[["content","المحتوى"],["pages","صفحات الكتاب"]].concat(L.sim?[["sim","المحاكاة"]]:[]).concat([["map","الخريطة التفاعلية"],["games","الألعاب"],["sheet","ورقة العمل"],["video","مقاطع فيديو"],["quiz",L.game?"اللعبة والاختبار":"الاختبار"]]);
  var ix=lessonIdx(L.id), PV=LESSONS[ix-1], NX=LESSONS[ix+1];
  app.innerHTML = crumbs('<span>›</span><span>'+L.title+'</span>')+
  '<header class="lhead" style="--c:'+L.color+'"><div class="ic">'+IC(L)+'</div><div><span class="code">('+L.code+') | '+L.range+'</span><h1>'+L.title+'</h1><p>'+L.sub+'</p></div><a class="btn pri ws-btn" href="#/print/'+L.id+'" target="_blank" rel="noopener">🖨 ورقة عمل</a></header>'+
  '<div class="tabs" role="tablist">'+tabs.map(function(t){ return '<a role="tab" class="tab'+(t[0]===tab?' on':'')+'" href="#/lesson/'+id+'/'+t[0]+'">'+t[1]+'</a>'; }).join("")+'</div>'+
  '<div class="wrap lbody" id="lbody"></div>'+
  '<div class="wrap lnav">'+(PV?'<a class="btn" href="#/lesson/'+PV.id+'" title="'+PV.title+'">→ الدرس السابق</a>':'<span></span>')+(NX?'<a class="btn" href="#/lesson/'+NX.id+'" title="'+NX.title+'">الدرس التالي ←</a>':'<a class="btn" href="#/games">مركز الألعاب ←</a>')+'</div>';
  var b=$("#lbody");
  var lp=document.createElement("div"); lp.className="wrap"; lp.id="logpanel"; b.parentNode.insertBefore(lp, b.nextSibling); ACT.logPanel(lp, L);
  if(tab==="content"){
    b.innerHTML = artFig(L)+photoFig(PHOTOS[L.id])+
      L.sections.map(function(s){return sectionHTML(s,L);}).join("")+
      (L.notes||[]).map(function(n){ return '<aside class="note"><b>'+n[0]+'</b> '+n[1]+'</aside>'; }).join("")+
      '<div class="cta">'+(L.sim?'<a class="btn pri" href="#/lesson/'+id+'/sim">جرّب المحاكاة: '+L.simTitle+'</a>':'')+'<a class="btn" href="#/lesson/'+id+'/map">الخريطة التفاعلية</a><a class="btn" href="#/lesson/'+id+'/games">لعبة الذاكرة ولعبة التصنيف</a><a class="btn" href="#/lesson/'+id+'/quiz">'+(L.game?"اللعبة والاختبار":"الاختبار")+'</a></div>';
  } else if(tab==="pages"){
    b.innerHTML='<div id="viewer"></div>'; Viewer($("#viewer"), L.bookPages.map(function(p){return {pdf:p, lesson:L};}));
  } else if(tab==="sim" && !L.sim){
    b.innerHTML='<div class="nosim"><h3>لا توجد محاكاة قيادة لهذا الدرس</h3><p>محتوى هذا الدرس عن تكنولوجيا السيارات، لذلك يحتوي على مخطط تفاعلي وألعاب وورقة عمل بدلًا من محاكاة القيادة. يمكنك تجربة محاكاة القيادة من الدروس الآتية:</p><div class="cta">'+LESSONS.filter(function(x){return x.sim&&x.sim===x.id;}).map(function(x){ return '<a class="btn" href="#/lesson/'+x.id+'/sim">'+x.simTitle+'</a>'; }).join("")+'</div><div class="cta"><a class="btn pri" href="#/lesson/'+id+'/map">الخريطة التفاعلية لهذا الدرس</a></div></div>';
  } else if(tab==="sim"){
    b.innerHTML='<p class="sim-desc">'+L.simDesc+'</p><div id="simhost"></div><p class="hint">نصيحة: على السبورة استخدم الأزرار الكبيرة، وعلى الكمبيوتر استخدم الأسهم في لوحة المفاتيح. <button class="btn sm" id="fs">ملء الشاشة</button></p>';
    currentSim = new TrafficSim($("#simhost"), L.sim||L.id); window.__sim=currentSim;
    document.body.classList.add("simmode"); setTimeout(function(){currentSim&&currentSim._resize();},60);
    $("#fs").onclick=function(){ var e=$("#simhost"); if(document.fullscreenElement){ document.exitFullscreen(); } else if(e.requestFullscreen){ e.requestFullscreen().then(function(){ setTimeout(function(){currentSim&&currentSim._resize();},200); }); } };
    document.addEventListener("fullscreenchange", function(){ setTimeout(function(){ currentSim&&currentSim._resize(); },150); });
  } else if(tab==="map"){ ACT.mapTab(b, L);
  } else if(tab==="games"){ ACT.gamesTab(b, L);
  } else if(tab==="sheet"){ ACT.sheetTab(b, L);
  } else if(tab==="video"){ ACT.videoTab(b, L);
  } else {
    b.innerHTML=(L.game==="signs"?'<div id="game"></div>':'')+'<div id="quiz"></div>';
    if(L.game==="signs") SignGame($("#game"));
    Quiz($("#quiz"), L);
  }
}

/* ===== متصفح الكتاب ===== */
function Viewer(host, pages, startIdx){
  var i=startIdx||0, fit="h";
  host.className="viewer";
  host.innerHTML='<div class="v-bar"><button class="btn sm v-prev">▶ السابقة</button><span class="v-pg"></span><button class="btn sm v-fit">تكبير</button><button class="btn sm v-next">التالية ◀</button></div>'+
    '<div class="v-stage"><img class="v-img" alt=""></div><div class="v-thumbs"></div>';
  var img=$(".v-img",host), stage=$(".v-stage",host), th=$(".v-thumbs",host);
  th.innerHTML=pages.map(function(p,k){ return '<button class="v-th" data-k="'+k+'"><img loading="lazy" src="assets/book/p'+String(p.pdf).padStart(3,"0")+'.jpg" alt=""><span>'+(bookNo(p.pdf)>0?"ص "+ar(bookNo(p.pdf)):"الغلاف")+'</span></button>'; }).join("");
  function show(){
    var p=pages[i];
    img.src="assets/book/p"+String(p.pdf).padStart(3,"0")+".jpg";
    img.alt="صفحة "+bookNo(p.pdf);
    $(".v-pg",host).textContent=(bookNo(p.pdf)>0?"صفحة الكتاب "+ar(bookNo(p.pdf)):"الغلاف")+(p.lesson?" | "+p.lesson.title:"")+"  ("+ar(i+1)+" من "+ar(pages.length)+")";
    th.querySelectorAll(".v-th").forEach(function(t,k){ t.classList.toggle("on",k===i); if(k===i){ th.scrollLeft = t.offsetLeft - th.clientWidth/2 + t.offsetWidth/2; } });
    stage.scrollTop=0;
  }
  function go(d){ i=Math.max(0,Math.min(pages.length-1,i+d)); show(); }
  $(".v-prev",host).onclick=function(){go(-1);}; $(".v-next",host).onclick=function(){go(1);};
  $(".v-fit",host).onclick=function(){ fit = fit==="h"?"w":"h"; stage.classList.toggle("wide",fit==="w"); this.textContent = fit==="h"?"تكبير":"تصغير"; };
  th.onclick=function(e){ var t=e.target.closest(".v-th"); if(t){ i=+t.getAttribute("data-k"); show(); } };
  var sx=null; stage.addEventListener("touchstart",function(e){ sx=e.touches[0].clientX; },{passive:true});
  stage.addEventListener("touchend",function(e){ if(sx==null) return; var dx=e.changedTouches[0].clientX-sx; if(Math.abs(dx)>60 && !stage.classList.contains("wide")) go(dx>0?1:-1); sx=null; });
  function key(e){ if(!host.isConnected){ document.removeEventListener("keydown",key); return; } if(e.key==="ArrowLeft") go(1); if(e.key==="ArrowRight") go(-1); }
  document.addEventListener("keydown",key);
  show();
}
function viewBook(f){
  var pages=[{pdf:1}];
  LESSONS.forEach(function(L){ L.bookPages.forEach(function(p){ pages.push({pdf:p,lesson:L}); }); });
  var start=0; if(f){ for(var k=0;k<pages.length;k++){ if(pages[k].lesson && pages[k].lesson.id===f){ start=k; break; } } }
  app.innerHTML=crumbs('<span>›</span><span>متصفح الكتاب</span>')+'<div class="wrap"><h1 class="pg-t">متصفح الكتاب</h1><div class="chips">'+
    '<a class="chip'+(!f?' on':'')+'" href="#/book">الكل</a>'+LESSONS.map(function(L){ return '<a class="chip'+(f===L.id?' on':'')+'" href="#/book/'+L.id+'" style="--c:'+L.color+'">('+L.code+') '+L.title+' | '+L.range+'</a>'; }).join("")+'</div><div id="viewer"></div></div>';
  Viewer($("#viewer"), pages, start);
}

/* ===== الاختبار ===== */
function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i];a[i]=a[j];a[j]=t; } return a; }
function Quiz(host, L){
  var qs, i, sc;
  function start(){ qs=L.quiz.map(function(q){ var idx=shuffle(q.o.map(function(_,k){return k;})); return {q:q.q, o:idx.map(function(k){return q.o[k];}), a:idx.indexOf(q.a)}; }); i=0; sc=0; show(); }
  function show(){
    if(i>=qs.length){ var r=sc/qs.length; host.innerHTML='<div class="quiz done"><h3>نتيجتك: '+ar(sc)+' من '+ar(qs.length)+'</h3><div class="stars">'+"★★★".slice(0,r>=0.85?3:r>=0.5?2:1)+'</div><p>'+(r>=0.85?"ممتاز! أنت ملتزم بالثقافة المرورية.":r>=0.5?"جيد، راجع صفحات الكتاب وحاول مرة أخرى.":"راجع محتوى الدرس ثم أعد المحاولة.")+'</p><button class="btn pri again">أعد الاختبار</button></div>'; $(".again",host).onclick=start; return; }
    var q=qs[i];
    host.innerHTML='<div class="quiz"><div class="q-top"><span>الاختبار | '+L.title+'</span><span>السؤال '+ar(i+1)+' من '+ar(qs.length)+'</span></div><div class="q-prog"><i style="width:'+(i/qs.length*100)+'%"></i></div><h3>'+q.q+'</h3><div class="q-opts">'+
      q.o.map(function(o,k){ return '<button class="q-opt" data-k="'+k+'"><span class="q-l">'+"أبج"[k]+'</span>'+o+'</button>'; }).join("")+'</div><div class="q-fb"></div></div>';
    host.querySelectorAll(".q-opt").forEach(function(b){ b.onclick=function(){
      var k=+b.getAttribute("data-k"); host.querySelectorAll(".q-opt").forEach(function(x){ x.disabled=true; if(+x.getAttribute("data-k")===q.a) x.classList.add("right"); });
      if(k===q.a){ sc++; $(".q-fb",host).innerHTML='<p class="ok">✔ إجابة صحيحة</p>'; } else { b.classList.add("wrong"); $(".q-fb",host).innerHTML='<p class="no">✘ الإجابة الصحيحة مظللة بالأخضر</p>'; }
      $(".q-fb",host).innerHTML+='<button class="btn pri nx">'+(i+1<qs.length?"السؤال التالي":"النتيجة")+'</button>'; $(".nx",host).onclick=function(){ i++; show(); };
    }; });
  }
  start();
}

/* ===== لعبة تصنيف العلامات ===== */
function SignGame(host){
  var items=[["hospital","g","مستشفى"],["parking","g","مواقف انتظار"],["fuel","g","وقود"],["museum","g","الأماكن السياحية والمتاحف"],["lightsAhead","w","أمامك إشارة ضوئية"],["pedAhead","w","أمامك معبر للمشاة"],["hump","w","أمامك مطبات"],["bends","w","أمامك منحنى"],["oneway","r","إلى الأمام فقط (جبرية)"],["roundabout","r","أمامك دوران (جبرية)"],["noentry","r","ممنوع الدخول (منع)"],["noparking","r","ممنوع الانتظار (منع)"],["speed80","r","أقصى سرعة (منع)"],["stop","r","قف"],["yield","r","افسح الطريق"]];
  var names={g:"إرشادية",w:"تحذيرية",r:"تنظيمية"};
  var why={g:"العلامات الإرشادية تُستخدم لتوجيه مستخدمي الطريق، ومعظمها مستطيل.",w:"كل المثلثات الحمراء تعني تحذير.",r:"العلامات التنظيمية (جبرية – منع) شكلها دائري، ومن استثناءاتها «قف» المثمنة و«افسح الطريق» المثلث المقلوب."};
  var list, i, sc;
  function start(){ list=shuffle(items).slice(0,10); i=0; sc=0; show(); }
  function show(){
    if(i>=list.length){ host.innerHTML='<div class="game done"><h3>لعبة تصنيف العلامات</h3><p class="big-sc">'+ar(sc)+' من '+ar(list.length)+'</p><button class="btn pri again">العب مرة أخرى</button></div>'; $(".again",host).onclick=start; return; }
    var it=list[i];
    host.innerHTML='<div class="game"><div class="q-top"><span>لعبة: صنّف العلامة</span><span>'+ar(i+1)+' من '+ar(list.length)+' | النقاط '+ar(sc)+'</span></div><div class="g-sign">'+signSVG(it[0])+'</div><div class="g-bins">'+
      ["g","w","r"].map(function(c){ return '<button class="g-bin b-'+c+'" data-c="'+c+'">'+names[c]+'</button>'; }).join("")+'</div><div class="q-fb"></div></div>';
    host.querySelectorAll(".g-bin").forEach(function(b){ b.onclick=function(){
      var c=b.getAttribute("data-c"); host.querySelectorAll(".g-bin").forEach(function(x){ x.disabled=true; if(x.getAttribute("data-c")===it[1]) x.classList.add("right"); });
      if(c===it[1]){ sc++; } else b.classList.add("wrong");
      $(".q-fb",host).innerHTML='<p class="'+(c===it[1]?'ok':'no')+'">'+(c===it[1]?'✔ ':'✘ ')+'«'+it[2]+'» علامة '+names[it[1]]+'. '+why[it[1]]+'</p><button class="btn pri nx">التالي</button>';
      $(".nx",host).onclick=function(){ i++; show(); };
    }; });
  }
  start();
}

function viewGames(){
  app.innerHTML=crumbs('<span>›</span><span>مركز الألعاب</span>')+'<div class="wrap"><h1 class="pg-t">مركز الألعاب</h1>'+
  '<h2 class="sec-t"><span class="tl" aria-hidden="true"><i></i><i></i><i></i></span> محاكاة القيادة</h2><div class="gcards">'+LESSONS.filter(function(L){return L.sim;}).map(function(L){ return '<a class="gcard" href="#/lesson/'+L.id+'/sim" style="--c:'+L.color+'"><div class="ic">'+IC(L)+'</div><h3>'+L.simTitle+'</h3><p>'+L.simDesc+'</p><span class="from">من درس: '+L.title+'</span></a>'; }).join("")+'</div>'+
  '<h2 class="sec-t"><span class="tl" aria-hidden="true"><i></i><i></i><i></i></span> الخرائط التفاعلية</h2><div class="gcards">'+LESSONS.map(function(L){ return '<a class="gcard" href="#/lesson/'+L.id+'/map" style="--c:'+L.color+'"><div class="ic">'+IC(L)+'</div><h3>'+ACT.maps[L.id].title+'</h3><p>اضغط على النقاط في الخريطة لتظهر شروحات الكتاب، أو العب «أين تجدها؟».</p><span class="from">من درس: '+L.title+'</span></a>'; }).join("")+'</div>'+
  '<h2 class="sec-t"><span class="tl" aria-hidden="true"><i></i><i></i><i></i></span> لعبة الذاكرة ولعبة التصنيف</h2><div class="gcards">'+LESSONS.map(function(L){ return '<a class="gcard" href="#/lesson/'+L.id+'/games" style="--c:'+L.color+'"><div class="ic">'+IC(L)+'</div><h3>ألعاب: '+L.title+'</h3><p>لعبة الذاكرة: '+ACT.memory[L.id].title+'<br>لعبة التصنيف: '+ACT.sort[L.id].title+'</p></a>'; }).join("")+'</div>'+
  '<h2 class="sec-t"><span class="tl" aria-hidden="true"><i></i><i></i><i></i></span> الاختبارات والألعاب</h2><div class="gcards">'+
  '<a class="gcard" href="#/lesson/2/quiz" style="--c:#c62828"><div class="ic">'+signSVG("warnblank")+'</div><h3>لعبة تصنيف العلامات</h3><p>إرشادية أم تحذيرية أم تنظيمية؟</p><span class="from">من درس: العلامات المرورية الرأسية</span></a>'+
  LESSONS.map(function(L){ return '<a class="gcard" href="#/lesson/'+L.id+'/quiz" style="--c:'+L.color+'"><div class="ic">'+IC(L)+'</div><h3>اختبار: '+L.title+'</h3><p>'+ar(L.quiz.length)+' أسئلة من محتوى الكتاب.</p></a>'; }).join("")+'</div></div>';
}
function aboutHTML(){
  return '<div class="about-grid"><div class="about-card"><h3>عن نسخة الكتاب التفاعلي</h3><img src="assets/img/logo.png" alt="شعار المدرسة" class="logo"><ul><li>وزارة التربية</li><li>منطقة حولي التعليمية</li><li>«ثانوية سلوى - نظام المسارات»</li><li><b>إعداد المعلمة: أ. بروج م. شعيب</b></li></ul><p class="small">يشمل جميع دروس الكتاب (14 درسًا في 3 وحدات)، ويعمل بدون إنترنت من فلاش USB أو من جهاز السبورة مباشرة (افتح index.html بالمتصفح Edge).</p></div>'+
  '<div class="about-card"><h3>عن الكتاب</h3><p><b>'+BOOK.title+'</b> — '+BOOK.course+'<br>'+BOOK.edition+'</p><p class="lbl">تأليف:</p><ul>'+BOOK.authors.map(function(a){return '<li>'+a+'</li>';}).join("")+'</ul><p class="small">حقوق التأليف والطبع والنشر محفوظة لوزارة التربية – الإدارة العامة للتوجيه والبحوث والمناهج. المحتوى وصفحات الكتاب مأخوذة من الكتاب المدرسي لأغراض تعليمية.</p></div></div>'+
  '<div class="about-card sources"><h3>مصادر الصور</h3><p class="small">الرسوم التوضيحية للصفحة الرئيسة ولجميع الدروس، ورسومات المركبات والمشاة في المحاكاة، أُعدّت خصيصًا لهذه النسخة التعليمية. الصور الفوتوغرافية للطرق والعلامات (في بعض الدروس تحت عنوان «من شوارع الكويت») من ويكيميديا كومنز، برخص حرة.</p><ul>'+
  '<li>علامات إرشادية على طريق سريع في مدينة الكويت — EnGxBaDeR — CC BY-SA 4.0<span class="src-url">https://commons.wikimedia.org/wiki/File:Roads_signs_in_Kuwait_City.jpg</span></li>'+
  '<li>إشارات ضوئية وعلامة شارع الخليج العربي — نُشرت كملكية عامة (رافع الملف: M sh شراونة محمد) — Public domain<span class="src-url">https://commons.wikimedia.org/wiki/File:Arabian_Gulf_Street.JPG</span></li>'+
  '<li>علامة تحذير لعبور المشاة في طرق العارضية — EnGxBaDeR — CC BY-SA 4.0<span class="src-url">https://commons.wikimedia.org/wiki/File:Al-Ardiya_City_Roads.jpg</span></li>'+
  '<li>الطريق الدائري الرابع في الكويت — Ahmadk — CC BY-SA 3.0<span class="src-url">https://commons.wikimedia.org/wiki/File:4th_Ring_road.jpg</span></li>'+
  '<li>علامة «أفسح الطريق / Give way» في الكويت — Irvin calicut — CC BY-SA 3.0<span class="src-url">https://commons.wikimedia.org/wiki/File:Give_way_sign_in_arabic_from_kuwait.jpg</span></li>'+
  '<li>طريق سريع باتجاه أفق مدينة الكويت — Rob Faulkner — CC BY 2.0<span class="src-url">https://commons.wikimedia.org/wiki/File:2012_road_Kuwait_8016482071.jpg</span></li>'+
  '</ul></div>';
}
function viewAbout(){ app.innerHTML=crumbs('<span>›</span><span>عن نسخة الكتاب التفاعلي</span>')+'<div class="wrap"><h1 class="pg-t">عن نسخة الكتاب التفاعلي</h1>'+aboutHTML()+'</div>'; }

var FOOTFULL='<div class="wrap foot-in"><img src="assets/img/logo.png" alt="" class="flogo"><div><b>عن نسخة الكتاب التفاعلي:</b> وزارة التربية – منطقة حولي التعليمية – «ثانوية سلوى - نظام المسارات» – إعداد المعلمة: أ. بروج م. شعيب<br><b>عن الكتاب:</b> '+BOOK.title+' ('+BOOK.course+') – تأليف: '+BOOK.authors.join("، ")+'</div></div>';
function setFoot(){var h=(location.hash||"#/").slice(2).split("/")[0];$("#foot").innerHTML=(h===""||h==="about")?FOOTFULL:'<div class="wrap foot-in slim"><img src="assets/img/logo.png" alt="" class="flogo"><span>منهج المسارات</span><span>إعداد أ. بروج م. شعيب</span></div>'}
setFoot();
window.signSVG=signSVG; window.TRF={ar:ar, shuffle:shuffle, lessonById:lessonById, ICONS:ICONS, render:render};
render();
})();

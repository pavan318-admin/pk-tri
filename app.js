(()=>{
"use strict";
const CFG=Object.assign({APP_NAME:"PK Tri Translator",VERSION:"2.0.0",SUPABASE_URL:"",SUPABASE_ANON_KEY:"",REQUIRE_LOGIN:false,FEEDBACK_EMAIL:"",APK_URL:"",PLAY_STORE_URL:"",APP_STORE_URL:""},window.PK_CONFIG||{});
const $=s=>document.querySelector(s);
const L=["te","en","hi"],ALL=["te","en","hi","x"],NAME={te:"Telugu",en:"English",hi:"Hindi"},NATIVE={te:"తెలుగు",en:"",hi:"हिन्दी"},CHIP={te:"అ",en:"A",hi:"अ"};
const PH={te:"టైప్ చేయండి లేదా మైక్ నొక్కండి…",en:"Type or tap the mic…",hi:"लिखें या माइक दबाएँ…"};
const DIALECTS={te:[["te-IN","Telugu (India)"]],en:[["en-IN","English (India)"],["en-US","English (US)"],["en-GB","English (UK)"]],hi:[["hi-IN","Hindi (India)"]]};

const LANG_DATA="af:Afrikaans,sq:Albanian,am:Amharic,ar:Arabic,hy:Armenian,as:Assamese,az:Azerbaijani,eu:Basque,be:Belarusian,bn:Bengali,bho:Bhojpuri,bs:Bosnian,bg:Bulgarian,ca:Catalan,ceb:Cebuano,zh-CN:Chinese (Simplified),zh-TW:Chinese (Traditional),co:Corsican,hr:Croatian,cs:Czech,da:Danish,doi:Dogri,nl:Dutch,eo:Esperanto,et:Estonian,tl:Filipino,fi:Finnish,fr:French,gl:Galician,ka:Georgian,de:German,el:Greek,gu:Gujarati,ht:Haitian Creole,ha:Hausa,haw:Hawaiian,iw:Hebrew,hmn:Hmong,hu:Hungarian,is:Icelandic,ig:Igbo,id:Indonesian,ga:Irish,it:Italian,ja:Japanese,jw:Javanese,kn:Kannada,kk:Kazakh,km:Khmer,rw:Kinyarwanda,gom:Konkani,ko:Korean,ku:Kurdish,ky:Kyrgyz,lo:Lao,la:Latin,lv:Latvian,lt:Lithuanian,lb:Luxembourgish,mk:Macedonian,mai:Maithili,mg:Malagasy,ms:Malay,ml:Malayalam,mt:Maltese,mi:Maori,mr:Marathi,mn:Mongolian,my:Myanmar (Burmese),ne:Nepali,no:Norwegian,ny:Nyanja (Chichewa),or:Odia,ps:Pashto,fa:Persian,pl:Polish,pt:Portuguese,pa:Punjabi,ro:Romanian,ru:Russian,sm:Samoan,sa:Sanskrit,gd:Scots Gaelic,sr:Serbian,st:Sesotho,sn:Shona,sd:Sindhi,si:Sinhala,sk:Slovak,sl:Slovenian,so:Somali,es:Spanish,su:Sundanese,sw:Swahili,sv:Swedish,tg:Tajik,ta:Tamil,tt:Tatar,th:Thai,tr:Turkish,tk:Turkmen,uk:Ukrainian,ur:Urdu,ug:Uyghur,uz:Uzbek,vi:Vietnamese,cy:Welsh,xh:Xhosa,yi:Yiddish,yo:Yoruba,zu:Zulu".split(",").map(x=>{const i=x.indexOf(":");return[x.slice(0,i),x.slice(i+1)]});
const REG=Object.fromEntries("fr:fr-FR,es:es-ES,de:de-DE,it:it-IT,pt:pt-BR,ru:ru-RU,ja:ja-JP,ko:ko-KR,ar:ar-SA,ta:ta-IN,bn:bn-IN,mr:mr-IN,gu:gu-IN,kn:kn-IN,ml:ml-IN,pa:pa-IN,ur:ur-PK,ne:ne-NP,tr:tr-TR,nl:nl-NL,pl:pl-PL,id:id-ID,vi:vi-VN,th:th-TH,uk:uk-UA,el:el-GR,cs:cs-CZ,sv:sv-SE,da:da-DK,fi:fi-FI,no:nb-NO,hu:hu-HU,ro:ro-RO,he:he-IL,iw:he-IL,tl:fil-PH,jw:jv-ID,fa:fa-IR,sw:sw-KE,af:af-ZA,bg:bg-BG,hr:hr-HR,sk:sk-SK,sl:sl-SI,sr:sr-RS,lt:lt-LT,lv:lv-LV,et:et-EE,ms:ms-MY,si:si-LK,km:km-KH,am:am-ET,zu:zu-ZA,ca:ca-ES,eu:eu-ES,gl:gl-ES,is:is-IS,sq:sq-AL,hy:hy-AM,ka:ka-GE,az:az-AZ,kk:kk-KZ,uz:uz-UZ,mn:mn-MN,lo:lo-LA,my:my-MM".split(",").map(x=>x.split(":")));
const langName=c=>{const f=LANG_DATA.find(x=>x[0]===c);return f?f[1]:"Choose language"};
const speechTag=c=>REG[c]||c;
const SPEAK={te:"te-IN",en:"en-IN",hi:"hi-IN"};
const I={mic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>',
spk:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4zM17 8a5 5 0 0 1 0 8"/></svg>'};

/* ---------- storage + settings ---------- */
const store={get(k,d){try{const v=localStorage.getItem("pk_"+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem("pk_"+k,JSON.stringify(v))}catch(e){}}};
const DEF={theme:"system",fs:1,autoTr:true,saveHist:true,continuous:false,extra:false,xLang:"",dialect:{te:"te-IN",en:"en-IN",hi:"hi-IN"}};
let S=Object.assign({},DEF,store.get("settings",{}));S.dialect=Object.assign({},DEF.dialect,S.dialect);
const saveS=()=>store.set("settings",S);
function applyS(){const r=document.documentElement;if(S.theme==="system")r.removeAttribute("data-theme");else r.setAttribute("data-theme",S.theme);r.style.setProperty("--fs",S.fs)}
applyS();

/* ---------- ui helpers ---------- */
const st=$("#status"),toastEl=$("#toast");let toastT=null;
const say=(m,e)=>{st.textContent=m;st.className=e?"err":""};
function toast(m){toastEl.textContent=m;toastEl.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>toastEl.hidden=true,2600)}
const clean=s=>String(s).normalize("NFC").trim();
const single=t=>!/\s/.test(t.trim());
const baseUrl=()=>location.origin+location.pathname;
const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
const isStandalone=()=>matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
async function copyText(t){try{await navigator.clipboard.writeText(t);return true}catch(e){return false}}

/* ---------- cards ---------- */
const cards=$("#cards");
cards.innerHTML=L.map(l=>`<section class="card" data-l="${l}"><div class="ch"><span class="chip">${CHIP[l]}</span><h2>${NAME[l]}<span>${NATIVE[l]}</span></h2><button class="ic" data-spk="${l}" aria-label="Listen to ${NAME[l]}">${I.spk}</button><button class="ic" data-copy="${l}" aria-label="Copy ${NAME[l]}">${I.copy}</button></div><textarea id="${l}" lang="${l}" placeholder="${PH[l]}" spellcheck="false"></textarea><div class="cf"><div class="alt" id="alt-${l}"></div><button class="mic" data-mic="${l}" aria-label="Speak in ${NAME[l]}. Long press for options">${I.mic}</button></div></section>`).join("");
cards.insertAdjacentHTML("beforeend",`<section class="card extra" id="xcard" data-l="x" hidden><div class="ch"><span class="chip">+</span><h2><button class="langpick" id="xPick" aria-label="Choose language"><span id="xName"></span> ▾</button></h2><button class="ic" data-spk="x" aria-label="Listen">${I.spk}</button><button class="ic" data-copy="x" aria-label="Copy">${I.copy}</button><button class="ic" id="xHide" aria-label="Hide this language">✕</button></div><textarea id="x" placeholder="Type or tap the mic…" spellcheck="false"></textarea><div class="cf"><div class="alt" id="alt-x"></div><button class="mic" data-mic="x" aria-label="Speak. Long press for options">${I.mic}</button></div></section>`);
const el=Object.fromEntries(ALL.map(l=>[l,$("#"+l)]));
const alt=Object.fromEntries(ALL.map(l=>[l,$("#alt-"+l)]));
const code=l=>l==="x"?S.xLang:l;
const nm=l=>l==="x"?langName(S.xLang):NAME[l];
const act=()=>S.extra&&S.xLang?ALL:L;
const mmCode=c=>({iw:"he",jw:"jv",tl:"fil"}[c]||c);
const card=l=>cards.querySelector(`[data-l=${l}]`);

/* ---------- free translation engines ---------- */
const OLD={en:[[/\bthou\b/gi,"you"],[/\bthee\b/gi,"you"],[/\bthy\b/gi,"your"],[/\bthine\b/gi,"yours"],[/\bhath\b/gi,"has"],[/\bdoth\b/gi,"does"],[/\bwherefore\b/gi,"why"],[/\bhither\b/gi,"here"],[/\bthither\b/gi,"there"]],te:[[/ఱ/g,"ర"]],hi:[[/ऩ/g,"न"],[/ऱ/g,"र"]]};
const modern=(t,l)=>(OLD[l]||[]).reduce((s,[a,b])=>s.replace(a,b),t);
async function gtx(q,from,to,signal){
  const r=await fetch("https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&dt=bd&sl="+from+"&tl="+to+"&q="+encodeURIComponent(q),{signal});
  if(!r.ok)throw new Error("gtx");
  const j=await r.json();const words=[];
  try{(j[1]||[]).forEach(p=>(p[1]||[]).forEach(w=>words.push(w)))}catch(e){}
  return{text:j[0].map(x=>x[0]).join(""),words:words.slice(0,4)};
}
async function mymemory(q,from,to,signal){
  const r=await fetch("https://api.mymemory.translated.net/get?q="+encodeURIComponent(q)+"&langpair="+mmCode(from)+"|"+mmCode(to),{signal});
  const j=await r.json();const t=j&&j.responseData&&j.responseData.translatedText;
  if(!t||Number(j.responseStatus)!==200||/MYMEMORY WARNING/i.test(t))throw new Error("mm");
  return{text:t,words:[]};
}
async function one(q,from,to,signal){try{return await gtx(q,from,to,signal)}catch(e){if(e.name==="AbortError")throw e;return await mymemory(q,from,to,signal)}}
async function translate(from,text,signal){
  const to=act().filter(l=>l!==from),src=modern(text,from);
  const res=await Promise.all(to.map(t=>one(src,code(from),code(t),signal)));
  const out={alt:{}};to.forEach((t,i)=>{out[t]=res[i].text;out.alt[t]=res[i].words});return out;
}
let timer=null,ctrl=null,last="",lastLang="",active="en";
async function run(from){
  const text=clean(el[from].value),to=act().filter(l=>l!==from);
  if(!text){to.forEach(l=>{el[l].value="";alt[l].textContent=""});say("");return}
  if(text===last&&from===lastLang)return;
  if(ctrl)ctrl.abort();ctrl=new AbortController();say("Translating…");
  try{
    const r=await translate(from,text,ctrl.signal);
    if(clean(el[from].value)!==text)return;
    to.forEach(l=>{if(typeof r[l]==="string")el[l].value=clean(r[l])});
    const s=single(text);
    act().forEach(l=>{const a=s&&r.alt&&Array.isArray(r.alt[l])?r.alt[l].filter(Boolean).map(clean):[];alt[l].textContent=a.length?"Also: "+a.join(", "):""});
    last=text;lastLang=from;say("");addHistory();
  }catch(e){
    if(e&&e.name==="AbortError")return;
    say("Cannot reach the translation service. Check your internet and try again.",true);
  }
}
ALL.forEach(l=>el[l].addEventListener("input",()=>{active=l;clearTimeout(timer);if(!S.autoTr)return;timer=setTimeout(()=>run(l),900)}));
$("#go").onclick=()=>{last="";run(active)};

/* ---------- history ---------- */
let hist=store.get("hist",[]);
function addHistory(){
  if(!S.saveHist)return;
  const e={te:el.te.value,en:el.en.value,hi:el.hi.value,x:S.extra&&S.xLang?el.x.value:"",xn:S.extra&&S.xLang?langName(S.xLang):"",xc:S.extra&&S.xLang?S.xLang:"",t:Date.now()};
  hist=[e].concat(hist.filter(h=>h.en!==e.en||h.te!==e.te)).slice(0,50);store.set("hist",hist);
}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function renderHistory(){
  const box=$("#histList");
  box.innerHTML=hist.length?hist.map((h,i)=>`<div class="hist" data-i="${i}">${esc(h.te)}<br>${esc(h.en)}<br>${esc(h.hi)}${h.x?"<br>"+esc(h.x)+" <small>("+esc(h.xn)+")</small>":""}<br><small>${new Date(h.t).toLocaleString()}</small></div>`).join(""):'<p class="hint">No history yet.</p>';
}
$("#histList").addEventListener("click",e=>{const d=e.target.closest(".hist");if(!d)return;const h=hist[+d.dataset.i];L.forEach(l=>el[l].value=h[l]);if(h.xc){S.extra=true;S.xLang=h.xc;saveS();syncExtra();el.x.value=h.x}last=h.en;lastLang="en";nav.back()});
function clearHist(){hist=[];store.set("hist",hist);renderHistory();toast("History cleared")}
$("#clrHist").onclick=clearHist;$("#clrHist2").onclick=clearHist;

/* ---------- navigation (screens + Android back button) ---------- */
const TITLES={settings:"Settings",history:"History",login:"Account",feedback:"Rate & feedback",about:"About & download"};
const nav={cur:"home",gated:false,
 show(n){this.cur=n;const home=n==="home";$("#home").hidden=!home;Object.keys(TITLES).forEach(k=>$("#s-"+k).hidden=k!==n);
  $("#back").hidden=home||this.gated;$("#brandImg").hidden=!home;$("#sub").hidden=!home;$("#go").hidden=!home;
  $("#title").textContent=home?CFG.APP_NAME:TITLES[n];scrollTo(0,0);
  if(n==="settings")renderSettings();if(n==="history")renderHistory();if(n==="login")renderAccount();if(n==="feedback")renderFeedback();if(n==="about")renderAbout()},
 go(n){if(this.cur===n)return;history.pushState({s:n},"");this.show(n)},
 back(){if(history.state&&history.state.s&&history.state.s!=="home")history.back();else this.show("home")}};
history.replaceState({s:"home"},"");
addEventListener("popstate",e=>{const s=(e.state&&e.state.s)||"home";nav.show(nav.gated&&s==="home"?"login":s)});
$("#back").onclick=()=>nav.back();

/* ---------- 3-dots menu ---------- */
const menu=$("#menu");
$("#menuBtn").onclick=e=>{e.stopPropagation();menu.hidden=!menu.hidden};
addEventListener("click",e=>{if(!menu.hidden&&!e.target.closest("#menu"))menu.hidden=true});
addEventListener("keydown",e=>{if(e.key==="Escape"){menu.hidden=true;closeSheet()}});
menu.addEventListener("click",e=>{const b=e.target.closest("[data-act]");if(!b)return;menu.hidden=true;const a=b.dataset.act;
 if(a==="share")return shareApp();
 if(a==="clear"){stopMic();ALL.forEach(l=>{el[l].value="";alt[l].textContent=""});last="";say("");return}
 if(a==="update"){nav.go("about");return checkUpdate()}
 if(a==="about2"){nav.go("about");return}
 nav.go(a)});

/* ---------- share ---------- */
async function shareApp(){
  const data={title:CFG.APP_NAME,text:"Translate Telugu, English and Hindi instantly, with voice.",url:baseUrl()};
  if(navigator.share){try{await navigator.share(data);return}catch(e){if(e.name==="AbortError")return}}
  toast(await copyText(baseUrl())?"Link copied":"Copy the link from About")
}
$("#shareBtn").onclick=shareApp;
$("#copyLink").onclick=async()=>toast(await copyText(baseUrl())?"Link copied":"Select and copy the link");

/* ---------- settings screen ---------- */
function renderSettings(){$("#setTheme").value=S.theme;$("#setFs").value=S.fs;$("#setAuto").checked=S.autoTr;$("#setHist").checked=S.saveHist;$("#setCont").checked=S.continuous}
$("#setTheme").onchange=e=>{S.theme=e.target.value;saveS();applyS()};
$("#setFs").oninput=e=>{S.fs=+e.target.value;saveS();applyS()};
$("#setAuto").onchange=e=>{S.autoTr=e.target.checked;saveS()};
$("#setHist").onchange=e=>{S.saveHist=e.target.checked;saveS()};
$("#setCont").onchange=e=>{S.continuous=e.target.checked;saveS()};
$("#resetS").onclick=()=>{S=JSON.parse(JSON.stringify(DEF));saveS();applyS();renderSettings();toast("Settings reset")};

/* ---------- voice: tap = start/stop, long-press = options ---------- */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let rec=null,listening=null,userStop=false;
function setMic(l,on){cards.querySelector(`[data-mic=${l}]`).classList.toggle("on",on);card(l).classList.toggle("live",on)}
function stopMic(){userStop=true;const r=rec;rec=null;if(r){try{r.abort()}catch(e){}}if(listening){setMic(listening,false);listening=null}}
function mic(l){
  if(!SR){say("Voice input is not supported in this browser. Use Chrome (Android/desktop) or Safari (iPhone).",true);return}
  if(listening===l){userStop=true;rec.stop();return}
  stopMic();userStop=false;clearTimeout(timer);
  const r=rec=new SR();r.lang=l==="x"?speechTag(S.xLang):S.dialect[l];r.interimResults=true;r.continuous=!!S.continuous;r.maxAlternatives=1;
  let fin="",failed=false;
  r.onstart=()=>{listening=l;setMic(l,true);say("Listening in "+nm(l)+"… speak now")};
  r.onresult=e=>{let it="";fin="";for(const x of e.results){if(x.isFinal)fin+=x[0].transcript+" ";else it+=x[0].transcript}
    el[l].value=clean(fin+it);if(S.continuous&&fin){clearTimeout(timer);timer=setTimeout(()=>{active=l;last="";run(l)},700)}};
  r.onerror=e=>{failed=true;const m={"not-allowed":"Microphone blocked. Allow mic access for this site.","service-not-allowed":"Microphone blocked. Allow mic access for this site.","no-speech":"No speech heard. Tap the mic and try again.","network":"Voice service needs internet.","audio-capture":"No microphone found."};say(m[e.error]||"Voice error: "+e.error,true)};
  r.onend=()=>{
    if(r!==rec)return;
    if(S.continuous&&!userStop&&!failed&&rec===r){try{r.start();return}catch(e){}}
    setMic(l,false);if(listening===l)listening=null;
    if(!failed&&clean(el[l].value)){active=l;last="";run(l)}};
  try{r.start()}catch(e){say("Could not start the microphone.",true)}
}
let lp=null,lpFired=false,px=0,py=0;
cards.addEventListener("pointerdown",e=>{const m=e.target.closest("[data-mic]");if(!m)return;lpFired=false;clearTimeout(lp);px=e.clientX;py=e.clientY;
  lp=setTimeout(()=>{lpFired=true;if(navigator.vibrate)navigator.vibrate(25);micSheet(m.dataset.mic)},550)});
["pointerup","pointercancel"].forEach(t=>addEventListener(t,()=>clearTimeout(lp)));
addEventListener("pointermove",e=>{if(Math.hypot(e.clientX-px,e.clientY-py)>12)clearTimeout(lp)});
cards.addEventListener("contextmenu",e=>{if(e.target.closest("[data-mic]"))e.preventDefault()});
cards.addEventListener("click",async e=>{
  const m=e.target.closest("[data-mic]"),c=e.target.closest("[data-copy]"),s=e.target.closest("[data-spk]");
  if(m){if(lpFired){lpFired=false;return}return mic(m.dataset.mic)}
  if(c){const v=el[c.dataset.copy].value;if(!v)return;toast(await copyText(v)?"Copied "+nm(c.dataset.copy):"Could not copy")}
  if(s){const v=el[s.dataset.spk].value;if(!v||!window.speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(v);u.lang=s.dataset.spk==="x"?speechTag(S.xLang):SPEAK[s.dataset.spk];speechSynthesis.speak(u)}
});
const sheet=$("#sheet"),sheetBg=$("#sheetBg");
function closeSheet(){sheet.hidden=true;sheetBg.hidden=true}
sheetBg.onclick=closeSheet;
function micSheet(l){
  sheet.innerHTML=`<h3>Mic options · ${nm(l)}</h3>
  <label class="row">Continuous listening <input type="checkbox" class="sw" id="shCont" ${S.continuous?"checked":""}></label>
  ${l==="x"?"":`<label class="row">Accent <select id="shDia">${DIALECTS[l].map(([c,n])=>`<option value="${c}" ${S.dialect[l]===c?"selected":""}>${n}</option>`).join("")}</select></label>`}
  <button class="btn" id="shClear">Clear this box</button><button class="btn" id="shClose">Close</button>`;
  sheet.hidden=false;sheetBg.hidden=false;
  $("#shCont").onchange=e=>{S.continuous=e.target.checked;saveS()};
  if($("#shDia"))$("#shDia").onchange=e=>{S.dialect[l]=e.target.value;saveS()};
  $("#shClear").onclick=()=>{el[l].value="";alt[l].textContent="";closeSheet()};
  $("#shClose").onclick=closeSheet;
}

/* ---------- more languages ---------- */
function syncExtra(){
  const on=S.extra&&!!S.xLang;$("#xcard").hidden=!on;
  if(on){$("#xName").textContent=langName(S.xLang);el.x.lang=S.xLang}
  $("#moreBtn").textContent=on?"🌐 More languages · now "+langName(S.xLang):"🌐 More languages";
}
function pickLang(){
  sheet.innerHTML=`<h3>Choose any language</h3><input id="lgQ" type="search" placeholder="Search language…" autocomplete="off"><div class="lglist" id="lgList"></div><button class="btn" id="shClose">Close</button>`;
  sheet.hidden=false;sheetBg.hidden=false;
  const draw=q=>{const t=q.trim().toLowerCase();const r=LANG_DATA.filter(([c,n])=>!t||n.toLowerCase().includes(t)||c.toLowerCase()===t);
    $("#lgList").innerHTML=r.map(([c,n])=>`<button class="lg ${c===S.xLang?"on":""}" data-c="${c}">${n}</button>`).join("")||'<p class="hint">No match</p>'};
  draw("");$("#lgQ").oninput=e=>draw(e.target.value);
  $("#lgList").onclick=e=>{const b=e.target.closest("[data-c]");if(b)chooseX(b.dataset.c)};
  $("#shClose").onclick=closeSheet;
}
function chooseX(c){
  S.extra=true;S.xLang=c;saveS();closeSheet();el.x.value="";alt.x.textContent="";syncExtra();
  if(active==="x")active="en";
  if(clean(el[active].value)){last="";run(active)}else say("Type or speak in any box. "+langName(c)+" will follow.");
}
function hideX(){S.extra=false;saveS();stopMic();el.x.value="";alt.x.textContent="";if(active==="x")active="en";syncExtra()}
$("#moreBtn").onclick=pickLang;
cards.addEventListener("click",e=>{if(e.target.closest("#xPick"))pickLang();if(e.target.closest("#xHide"))hideX()});

/* ---------- account: email OTP, password, reset (Supabase) ---------- */
let sb=null,user=null,lmode="login",pendingEmail="",cool=0,coolT=null;
const sbReady=()=>!!(CFG.SUPABASE_URL&&CFG.SUPABASE_ANON_KEY);
async function loadSB(){
  if(sb)return sb;if(!sbReady())return null;
  await new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";s.onload=res;s.onerror=()=>rej(new Error("Could not load sign-in service"));document.head.appendChild(s)});
  sb=window.supabase.createClient(CFG.SUPABASE_URL,CFG.SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true}});
  const {data}=await sb.auth.getSession();user=data.session?data.session.user:null;
  sb.auth.onAuthStateChange((_e,s)=>{user=s?s.user:null;updateMenu()});
  return sb;
}
function updateMenu(){$("#mAcct").textContent=user?"👤 "+(user.email||"Account"):"👤 Sign in"}
function lpanel(n){document.querySelectorAll("[id^=lp-]").forEach(p=>p.hidden=p.id!=="lp-"+n)}
async function renderAccount(){
  if(!sbReady()){lpanel("off");return}
  try{await loadSB()}catch(e){lpanel("off");toast(e.message);return}
  if(user){$("#aEmail").textContent=user.email;lpanel("acct")}else{lmode="login";lpanel("email")}
}
function startCooldown(){cool=45;const b=$("#lResend");clearInterval(coolT);coolT=setInterval(()=>{cool--;b.textContent=cool>0?"Resend code in "+cool+"s":"Resend code";b.disabled=cool>0;if(cool<=0)clearInterval(coolT)},1000);b.disabled=true;b.textContent="Resend code in "+cool+"s"}
async function sendCode(email){
  email=clean(email).toLowerCase();
  if(!/^\S+@\S+\.\S+$/.test(email)){toast("Enter a valid email");return false}
  try{await loadSB();const {error}=await sb.auth.signInWithOtp({email,options:{shouldCreateUser:lmode==="login"}});
    if(error)throw error;pendingEmail=email;
    $("#cTitle").textContent=lmode==="reset"?"Reset password":"Enter code";
    $("#cMsg").textContent="We sent a code to "+email+". Check spam too.";$("#lCode").value="";lpanel("code");startCooldown();return true}
  catch(e){toast(e.message||"Could not send code");return false}
}
$("#lSend").onclick=()=>{lmode="login";sendCode($("#lEmail").value)};
$("#lResend").onclick=()=>sendCode(pendingEmail);
$("#lChange").onclick=()=>lpanel(lmode==="reset"?"pass":"email");
$("#lVerify").onclick=async()=>{
  const token=clean($("#lCode").value);if(!token){toast("Enter the code");return}
  try{const {error}=await sb.auth.verifyOtp({email:pendingEmail,token,type:"email"});if(error)throw error;
    $("#nTitle").textContent=lmode==="reset"?"Set a new password":"Set a password";
    $("#nMsg").textContent=lmode==="reset"?"Choose a new password for your account.":"Optional. Lets you sign in without a code next time.";
    $("#nSkip").hidden=lmode==="reset";$("#nPass").value="";lpanel("new");updateMenu();toast("Signed in")}
  catch(e){toast(e.message||"Wrong or expired code")}
};
$("#lToPass").onclick=()=>{$("#pEmail").value=$("#lEmail").value;lpanel("pass")};
$("#pToOtp").onclick=()=>{lmode="login";lpanel("email")};
$("#pSign").onclick=async()=>{
  try{await loadSB();const {error}=await sb.auth.signInWithPassword({email:clean($("#pEmail").value).toLowerCase(),password:$("#pPass").value});if(error)throw error;
    toast("Signed in");finishLogin()}catch(e){toast(e.message||"Sign in failed")}
};
$("#pForgot").onclick=()=>{lmode="reset";const em=$("#pEmail").value;if(!em){toast("Enter your email first");return}sendCode(em)};
$("#nSave").onclick=async()=>{
  const p=$("#nPass").value;if(p.length<8){toast("Use at least 8 characters");return}
  try{const {error}=await sb.auth.updateUser({password:p});if(error)throw error;toast("Password saved");finishLogin()}catch(e){toast(e.message||"Could not save password")}
};
$("#nSkip").onclick=finishLogin;
$("#aPass").onclick=()=>{lmode="reset";$("#nTitle").textContent="Change password";$("#nMsg").textContent="Choose a new password.";$("#nSkip").hidden=true;$("#nPass").value="";lpanel("new")};
$("#aOut").onclick=async()=>{try{await sb.auth.signOut()}catch(e){}user=null;updateMenu();toast("Signed out");if(CFG.REQUIRE_LOGIN)gate();else renderAccount()};
function finishLogin(){const g=nav.gated;nav.gated=false;updateMenu();if(g){history.replaceState({s:"home"},"");nav.show("home")}else nav.back()}
async function gate(){nav.gated=true;history.replaceState({s:"login"},"");nav.show("login")}

/* ---------- rating + feedback ---------- */
let stars=store.get("rating",0);
function renderFeedback(){
  $("#stars").innerHTML=[1,2,3,4,5].map(n=>`<button role="radio" aria-checked="${n===stars}" aria-label="${n} star" data-n="${n}" class="${n<=stars?"on":""}">★</button>`).join("");
  const links=[];if(CFG.PLAY_STORE_URL)links.push(`<a class="btn" href="${esc(CFG.PLAY_STORE_URL)}" target="_blank" rel="noopener">Rate on Google Play</a>`);
  if(CFG.APP_STORE_URL)links.push(`<a class="btn" href="${esc(CFG.APP_STORE_URL)}" target="_blank" rel="noopener">Rate on the App Store</a>`);
  $("#storeLinks").innerHTML=stars>=4?links.join(""):"";
}
$("#stars").addEventListener("click",e=>{const b=e.target.closest("[data-n]");if(!b)return;stars=+b.dataset.n;store.set("rating",stars);renderFeedback()});
$("#fbSend").onclick=async()=>{
  const msg=clean($("#fbMsg").value);if(!stars&&!msg){toast("Add a rating or a message");return}
  const meta=`App ${CFG.VERSION}`;
  try{if(sbReady()){await loadSB();const {error}=await sb.from("feedback").insert({rating:stars||null,message:msg,email:user?user.email:null,version:CFG.VERSION,ua:navigator.userAgent.slice(0,200)});if(!error){toast("Thank you for your feedback!");$("#fbMsg").value="";nav.back();return}}}catch(e){}
  if(CFG.FEEDBACK_EMAIL){location.href="mailto:"+CFG.FEEDBACK_EMAIL+"?subject="+encodeURIComponent(CFG.APP_NAME+" feedback ("+stars+"★)")+"&body="+encodeURIComponent(msg+"\n\n"+meta);return}
  toast("Rating saved on this device")
};

/* ---------- about, updates, install/download ---------- */
const cmpV=(a,b)=>{const x=String(a).split(".").map(Number),y=String(b).split(".").map(Number);for(let i=0;i<3;i++){const d=(x[i]||0)-(y[i]||0);if(d)return d}return 0};
let dp=null;
async function checkUpdate(quiet){
  const msg=$("#updMsg"),btn=$("#updApply");if(!quiet)msg.textContent="Checking…";
  try{const r=await fetch("version.json?t="+Date.now(),{cache:"no-store"});const j=await r.json();
    if(cmpV(j.version,CFG.VERSION)>0){msg.textContent="Version "+j.version+" is available. "+(j.notes||"");btn.hidden=false;if(quiet)toast("Update available: open menu → Check for updates")}
    else{msg.textContent="You have the latest version.";btn.hidden=true}}
  catch(e){if(!quiet)msg.textContent="Could not check for updates. Are you online?"}
}
$("#updCheck").onclick=()=>checkUpdate();
$("#updApply").onclick=async()=>{try{if(navigator.serviceWorker){const rs=await navigator.serviceWorker.getRegistrations();await Promise.all(rs.map(r=>r.unregister()))}if(window.caches){const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)))}}catch(e){}location.reload()};
function renderAbout(){
  $("#verNow").textContent=CFG.VERSION;$("#webLink").textContent=baseUrl();
  const ios=isIOS(),inst=isStandalone();
  $("#installBtn").hidden=!dp||inst;
  $("#iosSteps").hidden=!ios||inst;$("#andSteps").hidden=ios||inst||!!dp;
  $("#apkLink").hidden=!CFG.APK_URL;if(CFG.APK_URL){$("#apkLink").href=CFG.APK_URL}
  $("#playLink").hidden=!CFG.PLAY_STORE_URL;if(CFG.PLAY_STORE_URL)$("#playLink").href=CFG.PLAY_STORE_URL;
  $("#storeLink").hidden=!CFG.APP_STORE_URL;if(CFG.APP_STORE_URL)$("#storeLink").href=CFG.APP_STORE_URL;
  $("#dlHint").textContent=inst?"You are already using the installed app.":"Install it like any app from your phone's home screen.";
}
addEventListener("beforeinstallprompt",e=>{e.preventDefault();dp=e;if(nav.cur==="about")renderAbout()});
addEventListener("appinstalled",()=>{dp=null;toast("App installed");if(nav.cur==="about")renderAbout()});
$("#installBtn").onclick=async()=>{if(!dp)return;dp.prompt();await dp.userChoice;dp=null;renderAbout()};
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js").catch(()=>{});

/* ---------- start ---------- */
updateMenu();syncExtra();
if(sbReady())loadSB().then(()=>{updateMenu();if(CFG.REQUIRE_LOGIN&&!user)gate()}).catch(()=>{});
checkUpdate(true);
window.__pk={nav,S:()=>S};
})();

(()=>{
const L=["te","en","hi"];
const NAME={te:"Telugu",en:"English",hi:"Hindi"};
const NATIVE={te:"తెలుగు",en:"",hi:"हिन्दी"};
const CHIP={te:"అ",en:"A",hi:"अ"};
const VLANG={te:"te-IN",en:"en-IN",hi:"hi-IN"};
const PH={te:"టైప్ చేయండి లేదా మైక్ నొక్కండి…",en:"Type or tap the mic…",hi:"लिखें या माइक दबाएँ…"};
const I={
 mic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
 copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>',
 spk:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4zM17 8a5 5 0 0 1 0 8"/></svg>'
};
const cards=document.getElementById("cards"),st=document.getElementById("status");
cards.innerHTML=L.map(l=>`<section class="card" data-l="${l}"><div class="ch"><span class="chip">${CHIP[l]}</span><h2>${NAME[l]}<span>${NATIVE[l]}</span></h2><button class="ic" data-spk="${l}" aria-label="Listen to ${NAME[l]}">${I.spk}</button><button class="ic" data-copy="${l}" aria-label="Copy ${NAME[l]}">${I.copy}</button></div><textarea id="${l}" lang="${l}" placeholder="${PH[l]}" spellcheck="false"></textarea><div class="cf"><div class="alt" id="alt-${l}"></div><button class="mic" data-mic="${l}" aria-label="Speak in ${NAME[l]}">${I.mic}</button></div></section>`).join("");
const el=Object.fromEntries(L.map(l=>[l,document.getElementById(l)]));
const alt=Object.fromEntries(L.map(l=>[l,document.getElementById("alt-"+l)]));
const card=l=>cards.querySelector(`[data-l=${l}]`);
let timer=null,ctrl=null,last="",lastLang="",sampleP=null,active="en",rec=null,listening=null;
const say=(m,e)=>{st.textContent=m;st.className=e?"err":""};
const clean=s=>String(s).normalize("NFC").trim();
const single=t=>!/\s/.test(t.trim());
const getSample=()=>sampleP||(sampleP=(window.claude&&claude.use?claude.use("sample"):Promise.resolve(null)));

function buildPrompt(from,text){
  const to=L.filter(l=>l!==from);
  return `${window.PK_RULES||""}\n\nInput language: ${NAME[from]}\nTranslate into: ${NAME[to[0]]} and ${NAME[to[1]]}.\nReturn ONLY JSON, no markdown:\n{"${to[0]}":"...","${to[1]}":"...","alt":{"${from}":[],"${to[0]}":[],"${to[1]}":[]}}\nLeave every alt list empty unless the input is a single word.\n\nINPUT:\n${text}`;
}
const OLD={en:[[/\bthou\b/gi,"you"],[/\bthee\b/gi,"you"],[/\bthy\b/gi,"your"],[/\bthine\b/gi,"yours"],[/\bhath\b/gi,"has"],[/\bdoth\b/gi,"does"],[/\bwherefore\b/gi,"why"],[/\bhither\b/gi,"here"],[/\bthither\b/gi,"there"]],te:[[/ఱ/g,"ర"]],hi:[[/ऩ/g,"न"],[/ऱ/g,"र"]]};
const modern=(t,l)=>(OLD[l]||[]).reduce((s,[a,b])=>s.replace(a,b),t);
async function gtx(q,from,to,signal){
  const r=await fetch("https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&dt=bd&sl="+from+"&tl="+to+"&q="+encodeURIComponent(q),{signal});
  if(!r.ok)throw new Error("gtx");
  const j=await r.json();
  const text=j[0].map(x=>x[0]).join("");
  let words=[];
  try{(j[1]||[]).forEach(p=>(p[1]||[]).forEach(w=>words.push(w)))}catch(e){}
  return{text,words:words.slice(0,4)};
}
async function mymemory(q,from,to,signal){
  const r=await fetch("https://api.mymemory.translated.net/get?q="+encodeURIComponent(q)+"&langpair="+from+"|"+to,{signal});
  const j=await r.json();
  const t=j&&j.responseData&&j.responseData.translatedText;
  if(!t||Number(j.responseStatus)!==200||/MYMEMORY WARNING/i.test(t))throw new Error("mm");
  return{text:t,words:[]};
}
async function one(q,from,to,signal){
  try{return await gtx(q,from,to,signal)}catch(e){if(e.name==="AbortError")throw e;return await mymemory(q,from,to,signal)}
}
async function translate(from,text,signal){
  const to=L.filter(l=>l!==from);
  const src=modern(text,from);
  const res=await Promise.all(to.map(t=>one(src,from,t,signal)));
  const out={alt:{}};
  to.forEach((t,i)=>{out[t]=res[i].text;out.alt[t]=res[i].words});
  return out;
}
async function run(from){
  const text=clean(el[from].value);
  const to=L.filter(l=>l!==from);
  if(!text){to.forEach(l=>{el[l].value="";alt[l].textContent=""});say("");return}
  if(text===last&&from===lastLang)return;
  if(ctrl)ctrl.abort();ctrl=new AbortController();
  say("Translating carefully…");
  try{
    const r=await translate(from,text,ctrl.signal);
    if(clean(el[from].value)!==text)return;
    to.forEach(l=>{if(typeof r[l]==="string")el[l].value=clean(r[l])});
    const s=single(text);
    L.forEach(l=>{const a=s&&r.alt&&Array.isArray(r.alt[l])?r.alt[l].filter(Boolean).map(clean):[];alt[l].textContent=a.length?"Also: "+a.join(", "):""});
    last=text;lastLang=from;say("");
  }catch(e){
    if(e&&(e.name==="AbortError"||e.code==="aborted"))return;
    if(e&&e.code==="not_granted")say("Permission declined. Allow it when asked, then press Translate.",true);
    else if(e&&e.code==="rate_limited")say("Too many requests. Wait a few seconds and retry.",true);
    else if(e&&e.code==="server")say("Server error: "+(e.detail||"try again"),true);
    else say("Cannot reach the free translation service. Check your internet and try again.",true);
  }
}
L.forEach(l=>el[l].addEventListener("input",()=>{active=l;clearTimeout(timer);timer=setTimeout(()=>run(l),900)}));

// Voice input
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
function setMic(l,on){const b=cards.querySelector(`[data-mic=${l}]`);b.classList.toggle("on",on);card(l).classList.toggle("live",on)}
function mic(l){
  if(!SR){say("Voice input is not supported in this browser. Use Chrome (Android/desktop) or Safari (iPhone).",true);return}
  if(listening===l){rec.stop();return}
  if(rec){try{rec.abort()}catch(e){}}
  clearTimeout(timer);
  const r=rec=new SR();r.lang=VLANG[l];r.interimResults=true;r.continuous=false;r.maxAlternatives=1;
  let fin="",failed=false;
  r.onstart=()=>{listening=l;setMic(l,true);say("Listening in "+NAME[l]+"… speak now")};
  r.onresult=e=>{let it="";for(const x of e.results){if(x.isFinal)fin+=x[0].transcript;else it+=x[0].transcript}el[l].value=clean(fin+it)};
  r.onerror=e=>{failed=true;const m={"not-allowed":"Microphone blocked. Allow mic access for this site.","service-not-allowed":"Microphone blocked. Allow mic access for this site.","no-speech":"No speech heard. Tap the mic and try again.","network":"Voice service needs internet.","audio-capture":"No microphone found."};say(m[e.error]||"Voice error: "+e.error,true)};
  r.onend=()=>{setMic(l,false);if(listening===l)listening=null;if(!failed&&clean(el[l].value)){active=l;last="";run(l)}};
  try{r.start()}catch(e){say("Could not start the microphone.",true)}
}
cards.addEventListener("click",async e=>{
  const m=e.target.closest("[data-mic]"),c=e.target.closest("[data-copy]"),s=e.target.closest("[data-spk]");
  if(m)return mic(m.dataset.mic);
  if(c){const v=el[c.dataset.copy].value;if(!v)return;try{await navigator.clipboard.writeText(v);say("Copied "+NAME[c.dataset.copy])}catch(x){el[c.dataset.copy].select()}}
  if(s){const v=el[s.dataset.spk].value;if(!v||!window.speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(v);u.lang=VLANG[s.dataset.spk];speechSynthesis.speak(u)}
});
document.getElementById("go").onclick=()=>{last="";run(active)};
document.getElementById("clr").onclick=()=>{if(rec){try{rec.abort()}catch(e){}}L.forEach(l=>{el[l].value="";alt[l].textContent="";setMic(l,false)});last="";say("");if(ctrl)ctrl.abort()};

// Install + offline shell (standalone build only)
if(window.PK_STANDALONE){
  let dp;const ib=document.getElementById("install");
  addEventListener("beforeinstallprompt",e=>{e.preventDefault();dp=e;ib.hidden=false});
  ib.onclick=async()=>{if(!dp)return;dp.prompt();await dp.userChoice;dp=null;ib.hidden=true};
  if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
}
})();

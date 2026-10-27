"use strict";
/* ============================================================
   Dispečing — pomocná appka pre dispečerské riadenie
   (záchranné a bezpečnostné zložky): udalosti, jednotky a ich
   stavy, mapa, denník a odovzdanie zmeny.
   Dáta: localStorage (len v tomto prehliadači). Mapa: Leaflet + OSM.
   ============================================================ */

/* ---------- Pomocné funkcie ---------- */
const $ = (sel, root=document) => root.querySelector(sel);
const el = (tag, props={}, ...kids) => {
  const n = document.createElement(tag);
  let val;
  for(const k in props){
    const v = props[k];
    if(v===false || v==null) continue;
    if(k==='class') n.className = v;
    else if(k==='html') n.innerHTML = v;
    else if(k==='value') val = v;
    else if(k.startsWith('on') && typeof v==='function') n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v===true ? '' : v);
  }
  for(const c of kids.flat(Infinity)){ if(c==null || c===false) continue; n.append(c.nodeType ? c : document.createTextNode(c)); }
  if(val!==undefined) n.value = val;
  return n;
};
/* nahradí obsah prvku (null/false sa preskakujú) */
function fill(n, ...kids){
  n.replaceChildren();
  for(const c of kids.flat(Infinity)){ if(c==null || c===false) continue; n.append(c.nodeType ? c : document.createTextNode(c)); }
  return n;
}
const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const pad = n => String(n).padStart(2,'0');
const hms = ts => { const d=new Date(ts); return pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds()); };
const hm  = ts => { const d=new Date(ts); return pad(d.getHours())+':'+pad(d.getMinutes()); };
const dmy = ts => { const d=new Date(ts); return d.getDate()+'.'+(d.getMonth()+1)+'.'+d.getFullYear(); };
const sameDay = (a,b) => new Date(a).toDateString()===new Date(b).toDateString();
const when = ts => sameDay(ts, Date.now()) ? hms(ts) : dmy(ts)+' '+hm(ts);
const DAYS = ['Ne','Po','Ut','St','Št','Pi','So'];
/* trvanie pre odpočty: 0:42 · 12:05 · 1:02:33 */
function dur(ms){
  if(!(ms>0)) ms=0;
  const s=Math.floor(ms/1000), h=Math.floor(s/3600), m=Math.floor(s%3600/60), sec=s%60;
  return h ? h+':'+pad(m)+':'+pad(sec) : m+':'+pad(sec);
}
/* trvanie slovami pre štatistiky */
function durTxt(ms){
  if(ms==null || isNaN(ms)) return '—';
  const s=Math.round(ms/1000); if(s<60) return s+' s';
  const m=Math.floor(s/60); if(m<60) return m+' min '+pad(s%60)+' s';
  return Math.floor(m/60)+' h '+pad(m%60)+' min';
}
const esc = s => String(s??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cmpCs = (a,b) => a.cs.localeCompare(b.cs, 'sk', {numeric:true});
const lines = s => s.split('\n').map(x=>x.trim()).filter(Boolean);
function toast(msg, alarm){
  toast.overdue=false;
  const t=$('#toast'); t.textContent=msg; t.classList.toggle('alarm', !!alarm); t.classList.add('show');
  clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove('show'), alarm?6000:2400);
}
let audioCtx=null;
function beep(n=3){
  if(!state.settings.sound) return;
  try{
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
    audioCtx = audioCtx || new AC();
    const a=audioCtx; if(a.state==='suspended') a.resume();
    for(let i=0;i<n;i++){
      const t=a.currentTime+i*0.3, o=a.createOscillator(), g=a.createGain();
      o.connect(g); g.connect(a.destination);
      o.type='square'; o.frequency.value = i%2 ? 740 : 988;
      g.gain.setValueAtTime(0.0001,t);
      g.gain.exponentialRampToValueAtTime(0.15,t+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001,t+0.24);
      o.start(t); o.stop(t+0.26);
    }
  }catch(e){}
}
function download(name, text, type){
  const a=el('a',{href:URL.createObjectURL(new Blob([text],{type})), download:name});
  document.body.append(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
const fileStamp = () => { const d=new Date(); return d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'-'+pad(d.getHours())+pad(d.getMinutes()); };
function distKm(a, b){
  if(a.lat==null || b.lat==null) return null;
  const R=6371, r=Math.PI/180, dLat=(b.lat-a.lat)*r, dLng=(b.lng-a.lng)*r;
  const x=Math.sin(dLat/2)**2 + Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(x));
}
/* hrubý odhad dojazdu: vzdušná čiara × 1,3 (cesty) pri priemernej rýchlosti z nastavení */
const etaMin = km => Math.max(1, Math.round(km*1.3/state.settings.speed*60));
/* „48.1486, 17.1077“ alebo „48,1486; 17,1077“ → {lat,lng} */
function parseCoords(s){
  const m=/^\s*(-?\d{1,3}(?:[.,]\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:[.,]\d+)?)\s*$/.exec(s);
  if(!m) return null;
  const lat=+m[1].replace(',','.'), lng=+m[2].replace(',','.');
  return (Math.abs(lat)<=90 && Math.abs(lng)<=180) ? {lat, lng} : null;
}

/* ---------- Číselníky ---------- */
/* náhľad v Claude: bez tlače, sťahovania súborov, mapových podkladov a vyhľadávania adries */
const EMBED = !!window.DISP_EMBED;
const BASE_TITLE = document.title || 'Dispečing';
const STORE_KEY = 'dispecing-v1';
const STATUSES = [
  {code:1, label:'Voľná – v teréne',     short:'Voľná',     color:'#37d39b', free:true},
  {code:2, label:'Voľná – na základni',  short:'Základňa',  color:'#2aa198', free:true},
  {code:3, label:'Výjazd – na ceste',    short:'Výjazd',    color:'#ffb23e'},
  {code:4, label:'Na mieste zásahu',     short:'Na mieste', color:'#ff5d6c'},
  {code:5, label:'Transport / presun',   short:'Transport', color:'#b98cff'},
  {code:6, label:'V cieli / odovzdanie', short:'V cieli',   color:'#4f8cff'},
  {code:0, label:'Mimo prevádzky',       short:'Mimo',      color:'#7b8494'},
];
const PRIO = {
  1:{short:'P1', label:'P1 – kritická', color:'#ff4757'},
  2:{short:'P2', label:'P2 – vysoká',   color:'#ff9f43'},
  3:{short:'P3', label:'P3 – stredná',  color:'#feca57'},
  4:{short:'P4', label:'P4 – nízka',    color:'#a4b0be'},
};
const LOG_KINDS = {
  inc:  {ic:'🚨', label:'Udalosti'},
  unit: {ic:'📻', label:'Jednotky'},
  note: {ic:'📝', label:'Poznámky'},
  shift:{ic:'👤', label:'Zmena'},
  sys:  {ic:'⚙️', label:'Systém'},
};
const DEFAULT_INC_TYPES = ['Náhla zdravotná príhoda','Úraz','Dopravná nehoda','Požiar','Technická pomoc',
  'Narušenie objektu','Poplach EZS / EPS','Rušenie verejného poriadku','Pátranie po osobe','Iné'];
const DEFAULT_UNIT_TYPES = ['RZP','RLP','Hasiči','Polícia','Mestská polícia','Hliadka SBS','Technická služba','Iná'];
const ST = code => STATUSES.find(s=>s.code===code) || STATUSES[STATUSES.length-1];

/* ============================================================
   DÁTA
   ============================================================ */
function loadState(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(raw) return normalize(JSON.parse(raw));
  }catch(e){ console.error('load fail', e); }
  return normalize({});
}
function normalize(s){
  s.units     = s.units     || [];   // jednotky / posádky
  s.incidents = s.incidents || [];   // udalosti
  s.log       = s.log       || [];   // denník (chronologicky)
  s.shift     = s.shift     || null; // aktuálna zmena
  s.handovers = s.handovers || [];   // archív odovzdaných zmien
  s.seq       = s.seq       || {y:new Date().getFullYear(), n:0};
  const st = s.settings = s.settings || {};
  if(!st.incTypes || !st.incTypes.length)  st.incTypes  = [...DEFAULT_INC_TYPES];
  if(!st.unitTypes || !st.unitTypes.length) st.unitTypes = [...DEFAULT_UNIT_TYPES];
  st.limits = Object.assign({1:1, 2:3, 3:10, 4:20}, st.limits);  // min čakania na vyslanie
  if(st.sound==null)   st.sound=true;
  if(st.speed==null)   st.speed=60;
  if(!st.center)       st.center=[48.67, 19.70];  // stred Slovenska
  if(st.zoom==null)    st.zoom=7;
  if(st.geocode==null) st.geocode=true;
  if(EMBED)            st.geocode=false;
  if(st.country==null) st.country='sk';
  if(!st.theme)        st.theme=EMBED ? 'auto' : 'dark';
  if(st.darkMap==null) st.darkMap=true;
  if(st.lastWho==null) st.lastWho='';
  return s;
}
let state = loadState();

let saveTimer=null, commitTimer=null, saveWarned=0;
function save(){
  clearTimeout(saveTimer); saveTimer=null;
  try{ localStorage.setItem(STORE_KEY, JSON.stringify(state)); return true; }
  catch(e){
    if(Date.now()-saveWarned > 30000){
      saveWarned=Date.now();
      toast('Dáta sa nepodarilo uložiť. Urob si zálohu a v Nastaveniach vymaž staré záznamy.', true);
    }
    return false;
  }
}
function commit(){ clearTimeout(commitTimer); commitTimer=null; save(); renderAll(); }
function saveSoon(){ clearTimeout(saveTimer); saveTimer=setTimeout(save, 400); }
function commitSoon(){ clearTimeout(commitTimer); commitTimer=setTimeout(commit, 350); }
function flush(){ if(commitTimer || saveTimer){ clearTimeout(commitTimer); commitTimer=null; save(); } }
window.addEventListener('pagehide', flush);
document.addEventListener('visibilitychange', ()=>{ if(document.hidden) flush(); });

/* zmeny z iného okna/karty (napr. mapa na druhom monitore) */
window.addEventListener('storage', e=>{
  if(e.key!==STORE_KEY || !e.newValue) return;
  try{ state = normalize(JSON.parse(e.newValue)); }catch(_){ return; }
  renderAll();
});

function addLog(k, txt, extra){ state.log.push(Object.assign({id:uid(), t:Date.now(), k, txt}, extra||{})); }

const unitById = id => state.units.find(u=>u.id===id);
const incById  = id => state.incidents.find(i=>i.id===id);
const isFree   = u => !!ST(u.status).free;
const isOpen   = i => !i.tClosed;
const unitGroup = u => u.status===0 ? 'off' : isFree(u) ? 'free' : 'busy';
const byPrio   = (a,b) => a.prio-b.prio || a.created-b.created;
function isOverdue(i, now=Date.now()){
  return isOpen(i) && !i.tDispatch && now-i.created > (state.settings.limits[i.prio]||5)*60000;
}
function incState(i){
  if(i.tClosed) return i.cancelled ? 'Zrušená' : 'Ukončená';
  if(!i.units.length) return i.tDispatch ? 'Bez jednotky' : 'Čaká na vyslanie';
  if(i.units.some(id=>{ const u=unitById(id); return u && u.status>=4; })) return 'Prebieha zásah';
  return 'Jednotky na ceste';
}

/* ============================================================
   AKCIE
   ============================================================ */
function detach(u, inc){ inc.units = inc.units.filter(id=>id!==u.id); u.inc = null; }

function setUnitStatus(uId, code, quiet){
  const u=unitById(uId); if(!u || u.status===code) return;
  const now=Date.now(), old=u.status, inc=u.inc ? incById(u.inc) : null;
  u.status=code; u.since=now;
  let txt = u.cs+': '+ST(old).short+' → '+ST(code).label;
  if(inc){
    txt += ' ('+inc.no+')';
    if((code===3 || code===4) && !inc.tDispatch) inc.tDispatch=now;
    if(code===4){
      if(!inc.tArrive) inc.tArrive=now;
      if(inc.lat!=null){ u.lat=inc.lat; u.lng=inc.lng; }
    }
    if(ST(code).free || code===0){ detach(u, inc); txt += ' – uvoľnená z udalosti'; }
  } else if(u.inc){ u.inc=null; }
  if(code===2 && u.baseLat!=null){ u.lat=u.baseLat; u.lng=u.baseLng; }
  addLog('unit', txt, {unit:u.id, inc:inc ? inc.id : undefined});
  if(!quiet) commit();
}

async function dispatchUnit(incId, uId){
  let inc=incById(incId), u=unitById(uId);
  if(!inc || !u || !isOpen(inc) || u.inc===inc.id) return;
  const busy = u.inc ? incById(u.inc) : null;
  if(busy){
    if(!await ask({title:'Presunúť '+u.cs+'?', text:u.cs+' je na udalosti '+busy.no+' ('+busy.type+'). Presunúť ju na '+inc.no+'?', ok:'Presunúť'})) return;
  } else if(u.status===0 && !await ask({title:'Vyslať '+u.cs+'?', text:u.cs+' je mimo prevádzky. Napriek tomu vyslať?', ok:'Vyslať'})) return;
  inc=incById(incId); u=unitById(uId);  // počas potvrdenia sa mohli zmeniť dáta
  if(!inc || !u || !isOpen(inc) || u.inc===inc.id) return;
  const other = u.inc ? incById(u.inc) : null;
  if(other){
    detach(u, other);
    addLog('inc', other.no+': jednotka '+u.cs+' presunutá na '+inc.no, {inc:other.id, unit:u.id});
  }
  inc.units.push(u.id);
  if(!inc.allUnits.includes(u.id)) inc.allUnits.push(u.id);
  u.inc = inc.id;
  addLog('inc', inc.no+': vyslaná jednotka '+u.cs, {inc:inc.id, unit:u.id});
  if(u.status===3){ if(!inc.tDispatch) inc.tDispatch=Date.now(); commit(); }
  else setUnitStatus(u.id, 3);
}

function releaseUnit(incId, uId){
  const inc=incById(incId), u=unitById(uId); if(!inc || !u) return;
  if(isFree(u) || u.status===0){
    detach(u, inc);
    addLog('inc', inc.no+': jednotka '+u.cs+' uvoľnená', {inc:inc.id, unit:u.id});
    commit();
  } else setUnitStatus(u.id, 1);
}

function createIncident(d){
  const y=new Date().getFullYear();
  if(state.seq.y!==y) state.seq={y, n:0};
  state.seq.n++;
  const inc = {id:uid(), no:y+'-'+String(state.seq.n).padStart(4,'0'), created:d.created||Date.now(),
    type:d.type, prio:+d.prio||3, addr:d.addr||'', lat:d.lat??null, lng:d.lng??null,
    caller:d.caller||'', phone:d.phone||'', desc:d.desc||'',
    units:[], allUnits:[], tDispatch:null, tArrive:null, tClosed:null, cancelled:false, outcome:''};
  state.incidents.push(inc);
  addLog('inc', inc.no+': nová udalosť – '+inc.type+' ('+PRIO[inc.prio].short+')'+(inc.addr ? ', '+inc.addr : ''), {inc:inc.id});
  commit();
  return inc;
}

/* priebežné úpravy formulára udalosti (ukladá sa s malým oneskorením) */
function updateInc(id, patch, logTxt){
  const inc=incById(id); if(!inc) return;
  Object.assign(inc, patch);
  if(logTxt){ addLog('inc', inc.no+': '+logTxt, {inc:inc.id}); commit(); }
  else commitSoon();
}

function closeIncident(incId, outcome, cancelled){
  const inc=incById(incId); if(!inc || !isOpen(inc)) return;
  for(const id of [...inc.units]){
    const u=unitById(id); if(!u) continue;
    if(isFree(u) || u.status===0) detach(u, inc); else setUnitStatus(id, 1, true);
  }
  inc.units=[];
  inc.tClosed=Date.now(); inc.cancelled=!!cancelled; inc.outcome=outcome||'';
  addLog('inc', inc.no+': '+(cancelled ? 'udalosť zrušená' : 'udalosť ukončená')+(outcome ? ' – '+outcome : ''), {inc:inc.id});
  commit();
}
function reopenIncident(incId){
  const inc=incById(incId); if(!inc) return;
  inc.tClosed=null; inc.cancelled=false;
  addLog('inc', inc.no+': udalosť znovu otvorená', {inc:inc.id});
  commit();
}

function moveUnit(id, ll){
  const u=unitById(id); if(!u || !ll) return;
  u.lat=ll.lat; u.lng=ll.lng; commit();
}
function saveUnit(data, id){
  if(id){
    const u=unitById(id); if(!u) return;
    Object.assign(u, data);
    if(u.status===2 && u.baseLat!=null){ u.lat=u.baseLat; u.lng=u.baseLng; }
    addLog('sys', 'Upravená jednotka '+u.cs, {unit:u.id});
  } else {
    const u = Object.assign({id:uid(), status:2, since:Date.now(), inc:null, lat:data.baseLat??null, lng:data.baseLng??null}, data);
    state.units.push(u);
    addLog('sys', 'Pridaná jednotka '+u.cs+' ('+u.type+')', {unit:u.id});
  }
  commit();
}
function deleteUnit(id){
  const u=unitById(id); if(!u) return;
  const inc = u.inc ? incById(u.inc) : null;
  if(inc) detach(u, inc);
  state.units = state.units.filter(x=>x.id!==id);
  addLog('sys', 'Odstránená jednotka '+u.cs);
  commit();
}

/* ---------- Zmena ---------- */
function startShift(who){
  state.shift = {id:uid(), who, start:Date.now(), note:''};
  state.settings.lastWho = who;
  addLog('shift', 'Začiatok zmeny – dispečer '+who);
  commit();
}
function shiftStats(from, to){
  const incs = state.incidents.filter(i=>i.created>=from && i.created<=to);
  const avg = a => a.length ? a.reduce((x,y)=>x+y,0)/a.length : null;
  return {
    total: incs.length,
    p1: incs.filter(i=>i.prio===1).length,
    closed: incs.filter(i=>i.tClosed && !i.cancelled).length,
    cancelled: incs.filter(i=>i.cancelled).length,
    avgDispatch: avg(incs.filter(i=>i.tDispatch).map(i=>i.tDispatch-i.created)),
    avgArrive: avg(incs.filter(i=>i.tArrive).map(i=>i.tArrive-i.created)),
  };
}
function snapshotReport(sh, end, next){
  return {
    id:sh.id, who:sh.who, next:next||'', start:sh.start, end, note:sh.note||'',
    stats: shiftStats(sh.start, end),
    open: state.incidents.filter(isOpen).sort(byPrio).map(i=>({
      no:i.no, prio:i.prio, type:i.type, addr:i.addr, created:i.created, state:incState(i),
      units: i.units.map(id=>{ const u=unitById(id); return u ? u.cs+' ('+ST(u.status).short+')' : ''; }).filter(Boolean).join(', ')})),
    units: [...state.units].sort(cmpCs).map(u=>({cs:u.cs, type:u.type, status:u.status,
      inc: u.inc ? (incById(u.inc)||{}).no||'' : ''})),
  };
}
function endShift(next){
  const sh=state.shift; if(!sh) return null;
  const rep = snapshotReport(sh, Date.now(), next);
  state.handovers.unshift(rep);
  if(state.handovers.length>60) state.handovers.length=60;
  addLog('shift', 'Koniec zmeny – '+sh.who+(next ? ', službu preberá '+next : ''));
  state.shift = null;
  if(next) startShift(next); else commit();
  return rep;
}

/* ---------- Adresy (OpenStreetMap Nominatim) ---------- */
function shortAddr(a){
  if(!a) return '';
  const street = [a.road||a.pedestrian||a.footway||a.square||a.hamlet||a.neighbourhood, a.house_number].filter(Boolean).join(' ');
  const town = a.city||a.town||a.village||a.municipality||'';
  const part = a.city_district||a.suburb||a.borough||'';
  return [street, town && part && part!==town ? town+' – '+part : town||part].filter(Boolean).join(', ');
}
async function geocode(q){
  const st=state.settings;
  const url='https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&addressdetails=1&accept-language=sk'
    +(st.country ? '&countrycodes='+encodeURIComponent(st.country) : '')+'&q='+encodeURIComponent(q);
  const r=await fetch(url); if(!r.ok) throw new Error('HTTP '+r.status);
  return (await r.json()).map(x=>({label:shortAddr(x.address)||x.display_name, full:x.display_name, lat:+x.lat, lng:+x.lon}));
}
async function reverseGeocode(lat, lng){
  const r=await fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&accept-language=sk&lat='+lat+'&lon='+lng);
  if(!r.ok) throw new Error('HTTP '+r.status);
  const x=await r.json();
  return x && !x.error ? (shortAddr(x.address) || x.display_name || '') : '';
}

/* ============================================================
   VYKRESĽOVANIE
   ============================================================ */
const MAPONLY = location.hash==='#mapa';
const TABS = [
  {id:'board',    label:'Dispečing'},
  {id:'log',      label:'Denník'},
  {id:'shift',    label:'Zmena'},
  {id:'settings', label:'Nastavenia'},
];
let route='board', boardSub='inc', unitFilter='all', showClosed=false;
let overdueKey=null; const alerted=new Set();

function go(r){
  route=r;
  for(const t of TABS) $('#view-'+t.id).classList.toggle('on', t.id===r);
  renderTabs();
  if(r==='board' && map) setTimeout(mapShown, 0);
  if(r==='log') buildLogPage();
  if(r==='shift') buildShiftPage();
  if(r==='settings') buildSettings();
  try{ sessionStorage.setItem('disp-route', r); }catch(e){}
}
function setBoardSub(k){
  boardSub=k; $('#view-board').dataset.sub=k; renderBoardTabs();
  if(k==='map' && map) setTimeout(mapShown, 0);
}
function mapShown(){ map.invalidateSize(); if(pendingFit) fitAll(); }
function applyTheme(){
  const t=state.settings.theme;
  const host=document.documentElement.getAttribute('data-theme');  // téma, ktorú nastaví prostredie (napr. Claude)
  const light = t==='light' || (t==='auto' && (host ? host==='light'
    : !!(window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches)));
  document.body.classList.toggle('light', light);
  document.body.classList.toggle('darkmap', !light && state.settings.darkMap);
}

function renderAll(){
  applyTheme();
  renderTabs(); renderShiftInfo(); renderBoardTabs();
  renderIncidents(); renderUnits(); renderMap();
  if(route==='log') renderLogList();
  if(route==='shift'){ if((state.shift&&state.shift.id) !== shiftBuiltFor) buildShiftPage(); else renderShiftLive(); }
  if(route==='settings') renderSettingsUnits();
  if(modal.live) modal.live();
}

function renderTabs(){
  const open=state.incidents.filter(isOpen).length;
  fill($('#tabs'), TABS.map(t=>el('button',{class:route===t.id?'on':'', onclick:()=>go(t.id)},
    t.label, t.id==='board' ? el('span',{class:'cnt'}, open||'') : null)));
}
function renderBoardTabs(){
  const open=state.incidents.filter(isOpen).length;
  fill($('#boardtabs'), [['inc','Udalosti'+(open?' ('+open+')':'')],['map','Mapa'],['units','Jednotky']].map(([k,l])=>
    el('button',{class:'pill'+(boardSub===k?' on':''), onclick:()=>setBoardSub(k)}, l)));
}
function renderShiftInfo(){
  const sh=state.shift, b=$('#shiftinfo');
  b.classList.toggle('none', !sh);
  if(sh) fill(b, el('div',{},'Zmena: ', el('b',{},sh.who)), el('div',{},'od '+when(sh.start)));
  else fill(b, '⚠ Zmena nie je otvorená');
}

/* ---------- Udalosti ---------- */
const uchip = u => el('span',{class:'uchip', style:'--sc:'+ST(u.status).color, title:ST(u.status).label}, u.cs+' · '+ST(u.status).short);

function renderIncidents(){
  const list=$('#incList'), now=Date.now();
  const open=state.incidents.filter(isOpen).sort(byPrio);
  $('#incCount').textContent = open.length || '';
  const closed=state.incidents.filter(i=>i.tClosed && now-i.tClosed < 24*3600e3).sort((a,b)=>b.tClosed-a.tClosed);
  fill(list,
    open.length ? open.map(incCard) : el('div',{class:'empty'}, el('div',{class:'big'},'✓'), 'Žiadne otvorené udalosti',
      el('div',{class:'small', style:'margin-top:6px'}, 'Novú udalosť založíš tlačidlom „+ Nová udalosť“, klávesom ', el('kbd',{},'N'), ' alebo pravým klikom na mapu.')),
    closed.length ? el('button',{class:'btn sm ghost block', style:'margin-top:4px', onclick:()=>{ showClosed=!showClosed; renderIncidents(); }},
      (showClosed?'▾':'▸')+' Ukončené za 24 h ('+closed.length+')') : null,
    showClosed ? closed.map(incCard) : null);
}
function incCard(i){
  const p=PRIO[i.prio], open=isOpen(i), now=Date.now();
  const units=i.units.map(unitById).filter(Boolean);
  return el('div',{class:'inc'+(open?'':' closed')+(isOverdue(i,now)?' overdue':''), style:'--pc:'+p.color, onclick:()=>openIncident(i.id)},
    el('div',{class:'l1'},
      el('span',{class:'prio'}, p.short),
      el('b',{class:'grow ellip'}, i.type),
      open ? el('span',{class:'elapsed', 'data-since':i.created, title:'Od prijatia'}, dur(now-i.created))
           : el('span',{class:'small muted'}, hm(i.tClosed))),
    el('div',{class:'l2 small ellip'}, el('span',{class:'tab'}, i.no), ' · ', i.addr || 'bez adresy'),
    open ? el('div',{class:'chips'}, units.length ? units.map(uchip) : el('span',{class:'wait'}, '⚠ '+incState(i)))
         : el('div',{class:'small muted ellip'}, incState(i)+(i.outcome ? ' – '+i.outcome : '')));
}

/* ---------- Jednotky ---------- */
function statusButtons(u){
  return el('div',{class:'sbtns'}, STATUSES.map(s=>el('button',{class:u.status===s.code?'on':'', style:'--bc:'+s.color,
    title:s.code+' – '+s.label, onclick:e=>{ e.stopPropagation(); setUnitStatus(u.id, s.code); }}, String(s.code))));
}
function renderUnits(){
  const c={all:state.units.length, free:0, busy:0, off:0};
  for(const u of state.units) c[unitGroup(u)]++;
  fill($('#unitFilters'), [['all','Všetky'],['free','Voľné'],['busy','V akcii'],['off','Mimo']].map(([k,l])=>
    el('button',{class:'pill'+(unitFilter===k?' on':''), onclick:()=>{ unitFilter=k; renderUnits(); }}, l+' '+c[k])));
  const list=$('#unitList');
  if(!state.units.length){
    fill(list, el('div',{class:'empty'}, el('div',{class:'big'},'📻'), 'Zatiaľ žiadne jednotky.',
      el('div',{class:'row wrap', style:'justify-content:center; margin-top:12px'},
        el('button',{class:'btn primary sm', onclick:()=>unitForm()},'+ Pridať jednotku'),
        el('button',{class:'btn sm', onclick:loadDemo},'Načítať ukážku'))));
    return;
  }
  const units=state.units.filter(u=>unitFilter==='all' || unitGroup(u)===unitFilter).sort(cmpCs);
  fill(list, units.length ? units.map(unitCard) : el('div',{class:'empty small'},'Žiadna jednotka v tomto filtri.'));
}
function unitCard(u){
  const s=ST(u.status), inc=u.inc ? incById(u.inc) : null;
  return el('div',{class:'unit', style:'--sc:'+s.color},
    el('div',{class:'top', onclick:()=>openUnit(u.id)},
      el('div',{class:'l1'},
        el('span',{class:'cs'}, u.cs), el('span',{class:'tag'}, u.type),
        el('div',{class:'grow'}),
        el('span',{class:'sbadge'}, s.short),
        el('span',{class:'elapsed small', 'data-since':u.since, title:'V tomto stave'}, dur(Date.now()-u.since))),
      (inc || u.crew) ? el('div',{class:'l2 small ellip'},
        inc ? el('a',{onclick:e=>{ e.stopPropagation(); openIncident(inc.id); }}, '→ '+inc.no+' '+inc.type) : null,
        u.crew ? el('span',{class:'muted'}, (inc?' · ':'')+u.crew) : null) : null),
    statusButtons(u));
}

/* ---------- Mapa ---------- */
let map=null, lineLayer=null, incLayer=null, unitLayer=null;
const markers={inc:new Map(), unit:new Map()};
function initMap(){
  if(!window.L){ fill($('#map'), el('div',{class:'mapoff'},'🗺️ Mapu sa nepodarilo načítať.')); return; }
  map = L.map('map', {zoomControl:true}).setView(state.settings.center, state.settings.zoom);
  const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19,
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'}).addTo(map);
  const tileMsg=el('div',{class:'tilemsg', hidden:true}, EMBED
    ? 'V náhľade sa mapové podklady nenačítajú. Značky, vzdialenosti a výber miesta fungujú.'
    : 'Mapové podklady sa nenačítali – skontroluj pripojenie na internet.');
  $('.mapwrap').append(tileMsg);
  let tileErr=0;
  tiles.on('tileerror', ()=>{ if(++tileErr>=3) tileMsg.hidden=false; });
  tiles.on('tileload', ()=>{ tileErr=0; tileMsg.hidden=true; });
  lineLayer=L.layerGroup().addTo(map); incLayer=L.layerGroup().addTo(map); unitLayer=L.layerGroup().addTo(map);
  map.on('click', e=>{ if(picking) endPick(e.latlng); });
  /* pravý klik (na mobile dlhé podržanie) = nová udalosť na tomto mieste */
  map.on('contextmenu', e=>{ if(!picking) newIncident({lat:+e.latlng.lat.toFixed(6), lng:+e.latlng.lng.toFixed(6)}); });
}
function upsertMarker(kind, layer, id, ll, icon, z, title, onClick, onDrag){
  let m=markers[kind].get(id);
  if(!m){
    m=L.marker(ll, {icon, draggable:true, zIndexOffset:z, title, autoPan:true});
    m.on('click', ()=>{ if(picking) endPick(m.getLatLng()); else onClick(); });
    m.on('dragend', ()=>onDrag(m.getLatLng()));
    m.addTo(layer); markers[kind].set(id, m);
  } else {
    m.options.title=title;
    m.setLatLng(ll); m.setIcon(icon); m.setZIndexOffset(z);
  }
}
function renderMap(){
  if(!map) return;
  const now=Date.now(), seen={inc:new Set(), unit:new Set()};
  for(const i of state.incidents){
    if(!isOpen(i) || i.lat==null) continue;
    seen.inc.add(i.id);
    const p=PRIO[i.prio];
    const icon=L.divIcon({className:'mk', iconSize:null,
      html:'<div class="mk-inc'+(isOverdue(i,now)?' overdue':'')+'" style="--pc:'+p.color+'"><b>'+p.short+'</b> '+esc(i.type)+'</div>'});
    upsertMarker('inc', incLayer, i.id, [i.lat,i.lng], icon, 1000+(5-i.prio)*100,
      i.no+' · '+i.type+(i.addr?' · '+i.addr:''), ()=>openIncident(i.id),
      ll=>updateInc(i.id, {lat:ll.lat, lng:ll.lng}));
  }
  /* viac jednotiek na rovnakom mieste → poskladať pod seba */
  const stack={};
  for(const u of [...state.units].sort(cmpCs)){
    if(u.lat==null) continue;
    seen.unit.add(u.id);
    const key=u.lat.toFixed(5)+','+u.lng.toFixed(5), k=stack[key]=(stack[key]||0)+1;
    const icon=L.divIcon({className:'mk', iconSize:null,
      html:'<div class="mk-unit" style="--sc:'+ST(u.status).color+(k>1?';margin-top:'+((k-1)*19)+'px':'')+'">'+esc(u.cs)+'</div>'});
    upsertMarker('unit', unitLayer, u.id, [u.lat,u.lng], icon, 2000, u.cs+' · '+ST(u.status).label,
      ()=>openUnit(u.id), ll=>moveUnit(u.id, ll));
  }
  for(const kind of ['inc','unit'])
    for(const [id,m] of markers[kind]) if(!seen[kind].has(id)){ m.remove(); markers[kind].delete(id); }
  /* čiary od jednotiek, ktoré sú na ceste, k udalosti */
  lineLayer.clearLayers();
  for(const i of state.incidents){
    if(!isOpen(i) || i.lat==null) continue;
    for(const id of i.units){
      const u=unitById(id);
      if(u && u.lat!=null && (u.lat!==i.lat || u.lng!==i.lng))
        L.polyline([[u.lat,u.lng],[i.lat,i.lng]], {color:ST(u.status).color, weight:3, opacity:.85, dashArray:'6 8', interactive:false}).addTo(lineLayer);
    }
  }
}
/* skrytá mapa (iná záložka, mobil) má nulovú veľkosť – priblíženie sa vtedy odloží, kým sa mapa ukáže */
let pendingFit=false;
function fitAll(){
  if(!map) return;
  map.invalidateSize();
  const size=map.getSize();
  if(!size.x || !size.y){ pendingFit=true; return; }
  pendingFit=false;
  const pts=[];
  for(const i of state.incidents) if(isOpen(i) && i.lat!=null) pts.push([i.lat,i.lng]);
  for(const u of state.units) if(u.lat!=null) pts.push([u.lat,u.lng]);
  if(!pts.length) map.setView(state.settings.center, state.settings.zoom);
  else if(pts.length===1) map.setView(pts[0], 15);
  else map.fitBounds(pts, {padding:[50,50], maxZoom:16});
}
function showOnMap(o){
  if(!map || o.lat==null) return;
  go('board'); setBoardSub('map');
  setTimeout(()=>{ map.invalidateSize(); map.setView([o.lat,o.lng], Math.max(map.getZoom(), 15)); }, 30);
}
function openMapWindow(){
  window.open(location.pathname+location.search+'#mapa', 'dispecing-mapa', 'width=1280,height=860');
}

/* ---------- Výber miesta na mape ---------- */
let picking=null;
function pickOnMap(label, cb){
  if(!map){ toast('Mapa nie je dostupná'); return; }
  picking={cb, route, sub:boardSub};
  document.body.classList.add('picking');
  fill($('#pickBanner'), el('div',{class:'pickbar'}, '📍 '+label+' – klikni na mapu',
    el('button',{class:'btn sm', onclick:()=>endPick(null)}, 'Zrušiť (Esc)')));
  if(route!=='board') go('board');
  setBoardSub('map');
}
function endPick(ll){
  const p=picking; if(!p) return;
  picking=null;
  document.body.classList.remove('picking');
  fill($('#pickBanner'));
  if(p.route!==route) go(p.route);
  setBoardSub(p.sub);
  p.cb(ll ? {lat:+ll.lat.toFixed(6), lng:+ll.lng.toFixed(6)} : null);
}

/* ---------- Modálne okná ---------- */
let modal={live:null, guard:null, submit:null};
function openModal(content, opts={}){
  fill($('#modalRoot'), el('div',{class:'modal-bg'}, el('div',{class:'modal'+(opts.wide?' wide':''), role:'dialog'}, content)));
  modal={live:opts.live||null, guard:opts.guard||null, submit:opts.submit||null};
  setTimeout(()=>{ const f=$('#modalRoot [autofocus]'); if(f) f.focus(); }, 30);
}
function closeModal(){ fill($('#modalRoot')); modal={live:null, guard:null, submit:null}; }
async function tryCloseModal(){
  if(modal.guard && modal.guard() &&
     !await ask({title:'Zahodiť rozpísanú udalosť?', text:'Zadané údaje sa neuložia.', ok:'Zahodiť', danger:true})) return;
  closeModal();
}
const modalOpen = () => !!$('#modalRoot').firstChild;

/* jednoduchý dialóg nad modálnym oknom (text alebo potvrdenie) */
let dialog=null;
function ask({title, text, input, placeholder, value, ok='OK', danger, noCancel}){
  if(dialog) dialog.cancel();
  return new Promise(res=>{
    const root=$('#dialogRoot');
    const inp = input ? el('input',{class:'fld', placeholder:placeholder||'', value:value||''}) : null;
    const done = v => { fill(root); dialog=null; res(v); };
    const okFn = () => done(inp ? inp.value.trim() : true);
    if(inp) inp.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); okFn(); } });
    dialog={cancel:()=>done(null)};
    const okBtn=el('button',{class:'btn '+(danger?'danger':'primary'), onclick:okFn}, ok);
    fill(root, el('div',{class:'modal-bg dlg'}, el('div',{class:'modal', style:'max-width:460px'},
      el('h2',{}, title), text ? el('p',{class:'muted small'}, text) : null, inp,
      el('div',{class:'mactions'}, noCancel ? null : el('button',{class:'btn ghost', onclick:()=>done(null)}, 'Späť'), okBtn))));
    setTimeout(()=>(inp||okBtn).focus(), 30);
  });
}

/* ---------- Formulár udalosti (nová aj detail) ---------- */
function incFields(v, set, opts={}){
  const st=state.settings;
  const coordsEl=el('div',{class:'coords'});
  const showCoords=()=>fill(coordsEl, v.lat!=null ? '📍 '+v.lat.toFixed(5)+', '+v.lng.toFixed(5)
    : el('span',{style:'color:var(--warn)'}, 'Poloha nie je určená – vyhľadaj adresu (🔍) alebo ju vyber na mape (📍)'));
  const results=el('div');
  const addr=el('input',{class:'fld', value:v.addr||'', autofocus:opts.focus||false,
    placeholder:'Ulica a číslo, obec – alebo súradnice 48.1486, 17.1077',
    oninput:()=>{ v.addr=addr.value; set({addr:addr.value}); },
    onkeydown:e=>{ if(e.key==='Enter'){ e.preventDefault(); search(); } }});
  const fillAddr=(lat,lng)=>{
    if(!st.geocode) return;
    reverseGeocode(lat,lng).then(a=>{ if(a && !addr.value.trim()){ addr.value=a; v.addr=a; set({addr:a}); } }).catch(()=>{});
  };
  const setPos=(lat,lng,label)=>{
    v.lat=lat; v.lng=lng;
    const patch={lat,lng};
    if(label){ v.addr=label; addr.value=label; patch.addr=label; }
    set(patch); showCoords(); fill(results);
  };
  const msg=(t,c)=>el('div',{class:'small', style:'padding:6px 2px;'+(c?'color:'+c:'')}, t);
  async function search(){
    const q=addr.value.trim(); if(!q) return;
    const c=parseCoords(q);
    if(c){
      setPos(c.lat, c.lng);
      if(st.geocode) reverseGeocode(c.lat, c.lng).then(a=>{ if(a && addr.value.trim()===q){ addr.value=a; v.addr=a; set({addr:a}); } }).catch(()=>{});
      return;
    }
    if(!st.geocode){ fill(results, msg(EMBED ? 'V náhľade vyhľadávanie adries nefunguje – miesto vyber na mape (📍) alebo zadaj GPS súradnice.'
      : 'Vyhľadávanie adries je vypnuté v nastaveniach – miesto vyber na mape (📍).','var(--mut)')); return; }
    fill(results, msg('Hľadám…','var(--mut)'));
    try{
      const r=await geocode(q);
      fill(results, r.length
        ? el('div',{class:'georesults'}, r.map(x=>el('button',{type:'button', title:x.full, onclick:()=>setPos(x.lat,x.lng,x.label)},
            el('div',{}, x.label), el('div',{class:'tiny muted ellip'}, x.full))))
        : msg('Nič som nenašiel. Uprav adresu alebo vyber miesto na mape (📍).','var(--mut)'));
    }catch(e){ fill(results, msg('Vyhľadávanie zlyhalo (bez internetu?). Miesto vyber na mape (📍).','var(--dang)')); }
  }
  const pick=()=>pickOnMap('Miesto udalosti', ll=>{ if(!ll) return; setPos(ll.lat, ll.lng); fillAddr(ll.lat, ll.lng); });

  const types=[...new Set([...st.incTypes, v.type].filter(Boolean))];
  const typeSel=el('select',{class:'fld', value:v.type||'', onchange:()=>{
      const old=v.type; v.type=typeSel.value; set({type:v.type}, old ? 'typ '+old+' → '+v.type : null); }},
    v.type ? null : el('option',{value:''},'— vyber typ —'),
    types.map(t=>el('option',{value:t}, t)));
  const prioSeg=el('div',{class:'seg'});
  const drawPrio=()=>fill(prioSeg, [1,2,3,4].map(p=>el('button',{type:'button', class:v.prio===p?'on':'', style:'--pc:'+PRIO[p].color,
    title:PRIO[p].label, onclick:()=>{ if(v.prio===p) return; const old=v.prio; v.prio=p; drawPrio(); set({prio:p}, 'priorita '+PRIO[old].short+' → '+PRIO[p].short); }}, PRIO[p].short)));
  const text=(key, attrs={})=>el(attrs.rows?'textarea':'input', Object.assign({class:'fld', value:v[key]||'',
    oninput:e=>{ v[key]=e.target.value; set({[key]:e.target.value}); }}, attrs));
  drawPrio(); showCoords();
  if(v.lat!=null && !v.addr) fillAddr(v.lat, v.lng);

  return el('div',{class:'grid2'},
    el('div',{}, el('label',{class:'lbl'},'Typ udalosti'), typeSel),
    el('div',{}, el('label',{class:'lbl'},'Priorita'), prioSeg),
    el('div',{class:'full'}, el('label',{class:'lbl'},'Miesto'),
      el('div',{class:'addr'}, addr,
        el('button',{type:'button', class:'btn', title:'Vyhľadať adresu (Enter)', onclick:search},'🔍'),
        el('button',{type:'button', class:'btn', title:'Vybrať miesto na mape', onclick:pick},'📍')),
      coordsEl, results),
    el('div',{}, el('label',{class:'lbl'},'Volajúci'), text('caller',{placeholder:'Meno'})),
    el('div',{}, el('label',{class:'lbl'},'Telefón'), text('phone',{type:'tel', placeholder:'Spätné volanie'})),
    el('div',{class:'full'}, el('label',{class:'lbl'},'Popis / doplňujúce informácie'),
      text('desc',{rows:3, placeholder:'Čo sa stalo, počet osôb, stav, nebezpečenstvá, prístup…'})));
}

function newIncident(pre={}){
  const opened=Date.now();
  const d=Object.assign({type:'', prio:2, addr:'', lat:null, lng:null, caller:'', phone:'', desc:''}, pre);
  let dirty=false;
  const fields=incFields(d, patch=>{ Object.assign(d, patch); dirty=true; }, {focus:true});
  const timeInp=el('input',{class:'fld', type:'time', step:1, value:hms(opened), style:'max-width:150px'});
  const submit=()=>{
    let created=opened;
    const m=/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(timeInp.value);
    if(m){
      const t=new Date(opened); t.setHours(+m[1], +m[2], +(m[3]||0), 0);
      if(t.getTime() > Date.now()+60000) t.setDate(t.getDate()-1);  // čas pred polnocou
      created=t.getTime();
    }
    const inc=createIncident(Object.assign({}, d, {type:d.type||'Neurčené', created}));
    closeModal(); openIncident(inc.id);
  };
  openModal(el('div',{},
    el('div',{class:'mhead'}, el('h2',{class:'grow'},'🚨 Nová udalosť'),
      el('button',{class:'iconbtn', title:'Zavrieť (Esc)', onclick:tryCloseModal},'✕')),
    fields,
    el('div',{class:'row', style:'margin-top:10px'}, el('label',{class:'lbl', style:'margin:0'},'Čas prijatia'), timeInp),
    el('div',{class:'mactions'},
      el('button',{class:'btn ghost', onclick:tryCloseModal},'Zahodiť'),
      el('button',{class:'btn primary', onclick:submit},'Založiť udalosť ', el('kbd',{},'Ctrl+Enter')))),
    {wide:true, guard:()=>dirty, submit});
}

/* ---------- Detail udalosti ---------- */
function candRow(c, inc){
  const u=c.u, s=ST(u.status), other=u.inc && u.inc!==inc.id ? incById(u.inc) : null;
  return el('div',{class:'urow'},
    el('span',{class:'sbadge', style:'--sc:'+s.color, title:s.label}, s.short),
    el('div',{class:'grow'},
      el('div',{}, el('b',{}, u.cs), ' ', el('span',{class:'tag'}, u.type), other ? el('span',{class:'tiny muted'}, ' na '+other.no) : null),
      u.crew ? el('div',{class:'tiny muted ellip'}, u.crew) : null),
    c.d!=null ? el('div',{class:'small tab', style:'text-align:right; white-space:nowrap'}, c.d.toFixed(1)+' km',
        el('div',{class:'tiny muted'}, '~'+etaMin(c.d)+' min'))
      : el('span',{class:'tiny muted'}, 'poloha ?'),
    el('button',{class:'btn sm'+(isFree(u)?' primary':''), onclick:()=>dispatchUnit(inc.id, u.id)}, 'Vyslať'));
}

function openIncident(id){
  if(!incById(id)) return;
  const head=el('div',{class:'mhead'}), mid=el('div'), tl=el('div',{class:'timeline'}), acts=el('div',{class:'mactions'});
  const form=incFields(Object.assign({}, incById(id)), (patch, logTxt)=>updateInc(id, patch, logTxt));
  const note=el('input',{class:'fld', placeholder:'Záznam k udalosti (Enter)…'});
  const addNote=()=>{ const v=note.value.trim(); if(!v) return; addLog('note', v, {inc:id}); note.value=''; commit(); };
  note.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); addNote(); } });

  const live=()=>{
    const i=incById(id); if(!i){ closeModal(); return; }
    const p=PRIO[i.prio], now=Date.now(), open=isOpen(i);
    fill(head,
      el('span',{class:'prio', style:'--pc:'+p.color}, p.short),
      el('h2',{class:'grow ellip'}, el('span',{class:'muted tab'}, i.no), ' ', i.type),
      el('span',{class:'stchip'}, incState(i)),
      open ? el('span',{class:'elapsed', 'data-since':i.created, title:'Od prijatia'}, dur(now-i.created)) : null,
      el('button',{class:'iconbtn', title:'Zavrieť (Esc)', onclick:closeModal},'✕'));

    const T=(label, t, base)=>el('div',{}, el('span',{class:'tiny muted'}, label), el('b',{}, t ? hms(t) : '—'),
      el('span',{class:'d'}, t && base ? '+'+dur(t-base) : t && !sameDay(t, now) ? dmy(t) : ' '));
    const cands=state.units.filter(u=>!i.units.includes(u.id)).map(u=>({u, d:distKm(i,u)}));
    const byDist=(a,b)=>(a.d??1e9)-(b.d??1e9) || cmpCs(a.u,b.u);
    const free=cands.filter(c=>isFree(c.u)).sort(byDist), other=cands.filter(c=>!isFree(c.u)).sort(byDist);
    const before=i.allUnits.filter(x=>!i.units.includes(x)).map(unitById).filter(Boolean);

    fill(mid,
      el('div',{class:'msec'}, el('h3',{},'Časy'),
        el('div',{class:'times'}, T('Prijatie', i.created), T('Vyslanie', i.tDispatch, i.created),
          T('Príjazd', i.tArrive, i.created), T(i.cancelled?'Zrušenie':'Ukončenie', i.tClosed, i.created))),
      el('div',{class:'msec'}, el('h3',{},'Vyslané jednotky ('+i.units.length+')'),
        i.units.length ? i.units.map(unitById).filter(Boolean).map(u=>el('div',{class:'urow'},
            el('div',{style:'min-width:118px'}, el('span',{class:'cs', onclick:()=>openUnit(u.id)}, u.cs),
              el('div',{class:'tiny muted'}, ST(u.status).short+' · ', el('span',{'data-since':u.since}, dur(now-u.since)))),
            statusButtons(u),
            el('button',{class:'btn sm ghost', title:'Uvoľniť jednotku (stav 1 – Voľná)', onclick:()=>releaseUnit(id, u.id)},'Uvoľniť')))
          : el('div',{class:'small muted'}, open ? 'Zatiaľ nebola vyslaná žiadna jednotka.' : '—'),
        before.length ? el('div',{class:'tiny muted', style:'margin-top:6px'}, 'Predtým: '+before.map(u=>u.cs).join(', ')) : null),
      open ? el('div',{class:'msec'}, el('h3',{},'Vyslať jednotku'),
        i.lat==null ? el('div',{class:'small', style:'color:var(--warn); margin-bottom:6px'}, 'Urč polohu udalosti a ukážem najbližšie jednotky.') : null,
        free.length ? free.map(c=>candRow(c,i)) : el('div',{class:'small muted'},'Žiadna voľná jednotka.'),
        other.length ? el('details',{}, el('summary',{class:'small muted', style:'cursor:pointer; margin-top:8px'}, 'Obsadené / mimo prevádzky ('+other.length+')'),
          other.map(c=>candRow(c,i))) : null) : null);

    const entries=state.log.filter(l=>l.inc===id);
    fill(tl, entries.length ? entries.map(l=>el('div',{class:'tl'+(l.k==='note'?' note':'')},
        el('span',{class:'t'}, when(l.t)), el('span',{class:'x'}, l.k==='note' ? '📝 '+l.txt : l.txt.replace(i.no+': ','').replace(' ('+i.no+')',''))))
      : el('div',{class:'small muted'},'Bez záznamov.'));
    tl.scrollTop=tl.scrollHeight;

    fill(acts, open ? [
        el('button',{class:'btn ghost', disabled:i.lat==null, onclick:()=>{ closeModal(); showOnMap(i); }},'🗺 Na mape'),
        el('div',{class:'hspacer'}),
        el('button',{class:'btn danger', onclick:async()=>{
          const r=await ask({title:'Zrušiť udalosť '+i.no+'?', text:'Napr. planý poplach alebo duplicitné volanie. Priradené jednotky sa uvoľnia.',
            input:true, placeholder:'Dôvod zrušenia', ok:'Zrušiť udalosť', danger:true});
          if(r!=null) closeIncident(id, r, true); }},'Zrušiť…'),
        el('button',{class:'btn good', onclick:async()=>{
          const r=await ask({title:'Ukončiť udalosť '+i.no+'?', text:'Priradené jednotky sa uvoľnia (stav 1 – Voľná).',
            input:true, placeholder:'Výsledok (napr. transport do nemocnice, ošetrený na mieste…)', ok:'Ukončiť udalosť'});
          if(r!=null) closeIncident(id, r, false); }},'✓ Ukončiť…')]
      : [el('div',{class:'grow small muted'}, (i.cancelled?'Zrušená ':'Ukončená ')+when(i.tClosed)+(i.outcome ? ' – '+i.outcome : '')),
         el('button',{class:'btn', onclick:()=>reopenIncident(id)},'Znovu otvoriť')]);
  };

  openModal(el('div',{}, head, form, mid,
    el('div',{class:'msec'}, el('h3',{},'Priebeh'), tl,
      el('div',{class:'row', style:'margin-top:8px'}, note, el('button',{class:'btn', onclick:addNote},'Zapísať'))),
    acts), {wide:true, live});
  live();
}

/* ---------- Detail jednotky ---------- */
function openUnit(id){
  if(!unitById(id)) return;
  const body=el('div');
  const live=()=>{
    const u=unitById(id); if(!u){ closeModal(); return; }
    const s=ST(u.status), inc=u.inc ? incById(u.inc) : null, now=Date.now();
    const openIncs=state.incidents.filter(i=>isOpen(i) && i.id!==u.inc).sort(byPrio);
    const sel=el('select',{class:'fld'}, el('option',{value:''},'— vyslať na udalosť —'),
      openIncs.map(i=>el('option',{value:i.id}, PRIO[i.prio].short+' · '+i.no+' · '+i.type+(i.addr?' · '+i.addr:''))));
    const hist=state.log.filter(l=>l.unit===id).slice(-30).reverse();
    fill(body,
      el('div',{class:'mhead'},
        el('span',{class:'sbadge', style:'--sc:'+s.color}, s.short),
        el('h2',{class:'grow'}, u.cs, ' ', el('span',{class:'tag'}, u.type)),
        el('span',{class:'elapsed', 'data-since':u.since, title:'V tomto stave'}, dur(now-u.since)),
        el('button',{class:'iconbtn', title:'Zavrieť (Esc)', onclick:closeModal},'✕')),
      u.crew ? el('div',{class:'small muted'}, '👥 '+u.crew) : null,
      u.base ? el('div',{class:'small muted'}, '🏠 '+u.base) : null,
      el('div',{class:'msec'}, el('h3',{},'Stav'),
        el('div',{class:'stlist'}, STATUSES.map(st=>el('button',{class:'stbtn'+(u.status===st.code?' on':''), style:'--bc:'+st.color,
          onclick:()=>setUnitStatus(id, st.code)}, el('b',{}, st.code), st.label)))),
      el('div',{class:'msec'}, el('h3',{},'Udalosť'),
        inc ? el('div',{class:'row'},
            el('span',{class:'prio', style:'--pc:'+PRIO[inc.prio].color}, PRIO[inc.prio].short),
            el('a',{class:'grow', onclick:()=>openIncident(inc.id)}, inc.no+' · '+inc.type+(inc.addr?' · '+inc.addr:'')),
            el('button',{class:'btn sm ghost', onclick:()=>releaseUnit(inc.id, id)},'Uvoľniť'))
          : el('div',{class:'small muted'},'Jednotka nie je priradená k udalosti.'),
        openIncs.length ? el('div',{class:'row', style:'margin-top:8px'}, sel,
          el('button',{class:'btn primary', onclick:()=>{ if(sel.value) dispatchUnit(sel.value, id); }},'Vyslať')) : null),
      el('div',{class:'msec'}, el('h3',{},'Poloha'),
        el('div',{class:'small muted'}, u.lat!=null ? '📍 '+u.lat.toFixed(5)+', '+u.lng.toFixed(5) : 'Poloha nie je známa.'),
        el('div',{class:'row wrap', style:'margin-top:8px'},
          el('button',{class:'btn sm', onclick:()=>pickOnMap('Poloha jednotky '+u.cs, ll=>moveUnit(id, ll))},'📍 Určiť na mape'),
          u.baseLat!=null ? el('button',{class:'btn sm', onclick:()=>moveUnit(id, {lat:u.baseLat, lng:u.baseLng})},'🏠 Na základňu') : null,
          u.lat!=null ? el('button',{class:'btn sm ghost', onclick:()=>{ closeModal(); showOnMap(u); }},'🗺 Ukázať na mape') : null)),
      el('div',{class:'msec'}, el('h3',{},'Posledné záznamy'),
        el('div',{class:'timeline'}, hist.length ? hist.map(l=>el('div',{class:'tl'}, el('span',{class:'t'}, when(l.t)), el('span',{}, l.txt)))
          : el('div',{class:'small muted'},'Bez záznamov.'))),
      el('div',{class:'mactions'}, el('button',{class:'btn ghost', onclick:()=>unitForm(id)},'✏️ Upraviť jednotku')));
  };
  openModal(body, {live});
  live();
}

/* ---------- Pridanie / úprava jednotky ---------- */
function unitForm(id){
  const u=id ? unitById(id) : null;
  const d={baseLat:u?u.baseLat??null:null, baseLng:u?u.baseLng??null:null};
  const types=[...new Set([...state.settings.unitTypes, u&&u.type].filter(Boolean))];
  const cs=el('input',{class:'fld', value:u?u.cs:'', placeholder:'napr. RZP-12', autofocus:true});
  const type=el('select',{class:'fld', value:u?u.type:types[0]}, types.map(t=>el('option',{value:t}, t)));
  const crew=el('input',{class:'fld', value:u?u.crew||'':'', placeholder:'mená / počet členov'});
  const base=el('input',{class:'fld', value:u?u.base||'':'', placeholder:'napr. Stanica Ružinov'});
  const bpos=el('div',{class:'coords'});
  const showB=()=>fill(bpos, d.baseLat!=null ? '📍 '+d.baseLat.toFixed(5)+', '+d.baseLng.toFixed(5) : 'Poloha základne nie je určená.');
  showB();
  const submit=()=>{
    const v=cs.value.trim();
    if(!v){ toast('Zadaj volací znak'); cs.focus(); return; }
    if(state.units.some(x=>x.id!==id && x.cs.toLowerCase()===v.toLowerCase())){ toast('Jednotka '+v+' už existuje'); cs.focus(); return; }
    saveUnit({cs:v, type:type.value, crew:crew.value.trim(), base:base.value.trim(), baseLat:d.baseLat, baseLng:d.baseLng}, id);
    closeModal();
    toast(id ? 'Jednotka uložená' : 'Jednotka '+v+' pridaná');
  };
  openModal(el('div',{},
    el('div',{class:'mhead'}, el('h2',{class:'grow'}, id ? 'Upraviť jednotku' : 'Nová jednotka'),
      el('button',{class:'iconbtn', title:'Zavrieť (Esc)', onclick:closeModal},'✕')),
    el('div',{class:'grid2'},
      el('div',{}, el('label',{class:'lbl'},'Volací znak *'), cs),
      el('div',{}, el('label',{class:'lbl'},'Typ'), type),
      el('div',{class:'full'}, el('label',{class:'lbl'},'Posádka'), crew),
      el('div',{class:'full'}, el('label',{class:'lbl'},'Základňa'), base, bpos,
        el('div',{class:'row', style:'margin-top:6px'},
          el('button',{class:'btn sm', onclick:()=>pickOnMap('Poloha základne', ll=>{ if(ll){ d.baseLat=ll.lat; d.baseLng=ll.lng; showB(); } })},'📍 Určiť na mape'),
          el('button',{class:'btn sm ghost', onclick:()=>{ d.baseLat=d.baseLng=null; showB(); }},'Zmazať polohu')))),
    el('div',{class:'mactions'},
      id ? el('button',{class:'btn danger', onclick:async()=>{
        if(await ask({title:'Odstrániť jednotku '+u.cs+'?', text:'Zmizne zo zoznamu aj z mapy. Záznamy v denníku ostanú.', ok:'Odstrániť', danger:true})){ deleteUnit(id); closeModal(); } }},'Odstrániť') : null,
      el('div',{class:'hspacer'}),
      el('button',{class:'btn ghost', onclick:closeModal},'Zrušiť'),
      el('button',{class:'btn primary', onclick:submit},'Uložiť'))),
    {submit});
}

/* ---------- Denník ---------- */
const logFilter={k:'all', range:'shift', q:''};
function filteredLog(){
  const now=Date.now(), r=logFilter.range;
  const from = r==='shift' ? (state.shift ? state.shift.start : now-12*3600e3)
    : r==='today' ? new Date().setHours(0,0,0,0)
    : r==='24h' ? now-24*3600e3 : r==='7d' ? now-7*24*3600e3 : 0;
  const q=logFilter.q.trim().toLowerCase();
  return state.log.filter(l=>l.t>=from && (logFilter.k==='all' || l.k===logFilter.k) &&
    (!q || l.txt.toLowerCase().includes(q) || (l.inc && ((incById(l.inc)||{}).no||'').includes(q))));
}
function buildLogPage(){
  const note=el('input',{class:'fld grow', placeholder:'Zapísať poznámku do denníka (Enter)…'});
  const add=()=>{ const v=note.value.trim(); if(!v) return; addLog('note', v); note.value=''; commit(); };
  note.addEventListener('keydown', e=>{ if(e.key==='Enter') add(); });
  fill($('#logPage'),
    el('div',{class:'row', style:'margin-bottom:12px'}, el('h2',{class:'grow', style:'margin:0'},'Denník'),
      EMBED ? null : el('button',{class:'btn sm', onclick:()=>download('dennik-'+fileStamp()+'.csv', csvLog(filteredLog()), 'text/csv;charset=utf-8')},'⬇ CSV'),
      EMBED ? null : el('button',{class:'btn sm', onclick:printLog},'🖨 Tlačiť')),
    el('div',{class:'row', style:'margin-bottom:10px'}, note, el('button',{class:'btn primary', onclick:add},'Zapísať')),
    el('div',{class:'toolbar'}, el('div',{class:'row wrap', id:'logKinds'}), el('div',{class:'hspacer'}),
      el('select',{class:'fld', style:'width:auto', value:logFilter.range, onchange:e=>{ logFilter.range=e.target.value; renderLogList(); }},
        [['shift', state.shift ? 'Táto zmena' : 'Posledných 12 h'],['today','Dnes'],['24h','Posledných 24 h'],['7d','7 dní'],['all','Všetko']]
          .map(([v,l])=>el('option',{value:v}, l))),
      el('input',{class:'fld', type:'search', placeholder:'Hľadať…', value:logFilter.q, style:'width:160px',
        oninput:e=>{ logFilter.q=e.target.value; renderLogList(); }})),
    el('div',{id:'logList'}));
  renderLogList();
}
function renderLogList(){
  const box=$('#logList'); if(!box) return;
  fill($('#logKinds'), [['all','Všetko'], ...Object.entries(LOG_KINDS).map(([k,v])=>[k, v.ic+' '+v.label])].map(([k,l])=>
    el('button',{class:'pill'+(logFilter.k===k?' on':''), onclick:()=>{ logFilter.k=k; renderLogList(); }}, l)));
  const rows=filteredLog().reverse();
  fill(box,
    rows.length ? el('div',{class:'loglist'}, rows.slice(0,500).map(logRow)) : el('div',{class:'empty'},'Žiadne záznamy pre zvolený filter.'),
    rows.length>500 ? el('p',{class:'small muted center'}, 'Zobrazených najnovších 500 z '+rows.length+' záznamov.'+(EMBED ? '' : ' Celý výpis stiahneš cez ⬇ CSV.')) : null);
}
function logRow(l){
  const inc=l.inc ? incById(l.inc) : null, k=LOG_KINDS[l.k]||{ic:'•', label:''};
  return el('div',{class:'logrow k-'+l.k},
    el('span',{class:'t'}, when(l.t)), el('span',{title:k.label}, k.ic),
    el('div',{}, logText(l.txt, inc)));
}
/* číslo udalosti v texte záznamu = odkaz na detail */
function logText(txt, inc){
  if(!inc) return txt;
  const link=t=>el('a',{onclick:()=>openIncident(inc.id)}, t), ix=txt.indexOf(inc.no);
  return ix<0 ? [txt, ' ', link('↗ '+inc.no)] : [txt.slice(0,ix), link(inc.no), txt.slice(ix+inc.no.length)];
}
function csvLog(entries){
  const q=s=>'"'+String(s??'').replace(/"/g,'""')+'"';
  const rows=[['Dátum','Čas','Druh','Udalosť','Jednotka','Záznam']];
  for(const l of entries) rows.push([dmy(l.t), hms(l.t), (LOG_KINDS[l.k]||{}).label||l.k,
    l.inc ? (incById(l.inc)||{}).no||'' : '', l.unit ? (unitById(l.unit)||{}).cs||'' : '', l.txt]);
  return '﻿'+rows.map(r=>r.map(q).join(';')).join('\r\n');
}
function printLog(){
  const rows=filteredLog();
  printEl(el('div',{},
    el('h1',{},'Denník dispečingu'),
    el('p',{class:'muted'}, 'Vytlačené '+dmy(Date.now())+' '+hm(Date.now())+' · záznamov: '+rows.length),
    table(['Čas','Druh','Záznam'], rows.map(l=>[dmy(l.t)+' '+hms(l.t), (LOG_KINDS[l.k]||{}).label||'', l.txt]))));
}

/* ---------- Zmena a odovzdanie ---------- */
const card = (title, ...kids) => el('div',{class:'card'}, title ? el('h3',{}, title) : null, kids);
const stat = (label, val) => el('div',{class:'stat'}, el('b',{}, String(val)), el('span',{}, label));
function table(heads, rows, onRow){
  return el('div',{class:'tblwrap'}, el('table',{class:'tbl'},
    el('thead',{}, el('tr',{}, heads.map(h=>el('th',{}, h)))),
    el('tbody',{}, rows.map((r,ix)=>el('tr',{class:onRow?'click':'', onclick:onRow ? ()=>onRow(ix) : null},
      r.map(c=>el('td',{}, c==null ? '' : c)))))));
}
function printEl(node){ fill($('#print'), node); window.print(); }

let shiftBuiltFor=undefined;
function buildShiftPage(){
  const pg=$('#shiftPage'), sh=state.shift;
  shiftBuiltFor = sh ? sh.id : null;
  if(!sh){
    const who=el('input',{class:'fld', placeholder:'Meno dispečera', value:state.settings.lastWho||'', style:'max-width:320px'});
    const start=()=>{ const v=who.value.trim(); if(!v){ who.focus(); return; } startShift(v); };
    who.addEventListener('keydown', e=>{ if(e.key==='Enter') start(); });
    fill(pg, el('h2',{},'Zmena'),
      card(null, el('p',{style:'margin-top:0'},'Zmena nie je otvorená. Zadaj meno dispečera, ktorý preberá službu – začiatok sa zapíše do denníka a protokol pri odovzdaní bude obsahovať všetko od tejto chvíle.'),
        el('div',{class:'row wrap'}, who, el('button',{class:'btn primary', onclick:start},'Začať zmenu'))),
      handoverHistory());
    return;
  }
  const note=el('textarea',{class:'fld', rows:5, value:sh.note||'',
    placeholder:'Čo má vedieť ďalšia zmena: rozpracované veci, poruchy techniky, dohodnuté telefonáty, výmeny posádok…',
    oninput:e=>{ if(state.shift){ state.shift.note=e.target.value; saveSoon(); } }});
  fill(pg,
    el('div',{class:'row wrap', style:'margin-bottom:12px'},
      el('h2',{class:'grow', style:'margin:0'}, 'Zmena – '+sh.who),
      EMBED ? null : el('button',{class:'btn', onclick:()=>{ flush(); printEl(reportEl(snapshotReport(state.shift, Date.now(), ''), true)); }},'🖨 Priebežný protokol'),
      el('button',{class:'btn primary', onclick:endShiftFlow},'Odovzdať zmenu…')),
    el('div',{id:'shiftLive'}),
    card('Poznámka pre ďalšiu zmenu', note),
    handoverHistory());
  renderShiftLive();
}
function renderShiftLive(){
  const box=$('#shiftLive'), sh=state.shift; if(!box || !sh) return;
  const now=Date.now(), st=shiftStats(sh.start, now), open=state.incidents.filter(isOpen).sort(byPrio);
  const units=[...state.units].sort(cmpCs);
  fill(box,
    el('p',{class:'muted', style:'margin-top:0'}, 'Začiatok '+when(sh.start)+' · trvá ', el('span',{class:'tab', 'data-since':sh.start}, dur(now-sh.start))),
    card('Štatistika zmeny', el('div',{class:'stats'},
      stat('Prijaté udalosti', st.total), stat('z toho P1', st.p1), stat('Ukončené', st.closed), stat('Zrušené', st.cancelled),
      stat('Otvorené teraz', open.length), stat('Ø čas do vyslania', durTxt(st.avgDispatch)), stat('Ø čas do príjazdu', durTxt(st.avgArrive)))),
    card('Otvorené udalosti ('+open.length+')', open.length
      ? table(['Číslo','Pr.','Typ','Miesto','Prijatá','Stav','Jednotky'], open.map(i=>[i.no, PRIO[i.prio].short, i.type, i.addr||'—', when(i.created), incState(i),
          i.units.map(unitById).filter(Boolean).map(u=>u.cs+' ('+ST(u.status).short+')').join(', ')||'—']), ix=>openIncident(open[ix].id))
      : el('p',{class:'muted', style:'margin:0'},'Žiadne.')),
    card('Stav jednotiek', units.length
      ? table(['Jednotka','Typ','Stav','V stave','Udalosť'], units.map(u=>[el('b',{},u.cs), u.type,
          el('span',{class:'sbadge', style:'--sc:'+ST(u.status).color}, ST(u.status).label), el('span',{class:'tab', 'data-since':u.since}, dur(now-u.since)), u.inc ? (incById(u.inc)||{}).no||'' : '']), ix=>openUnit(units[ix].id))
      : el('p',{class:'muted', style:'margin:0'},'Žiadne jednotky.')));
}
async function endShiftFlow(){
  if(!state.shift) return;
  flush();
  const open=state.incidents.filter(isOpen).length;
  const next=await ask({title:'Odovzdať zmenu',
    text:(open ? 'Otvorené udalosti ('+open+') prechádzajú na ďalšiu zmenu. ' : '')+'Zadaj meno dispečera, ktorý preberá službu (nepovinné).',
    input:true, placeholder:'Meno nástupcu', ok:'Odovzdať zmenu'});
  if(next==null) return;
  const rep=endShift(next);
  buildShiftPage();
  if(rep) showReport(rep);
}
function showReport(rep){
  openModal(el('div',{},
    el('div',{class:'mhead'}, el('h2',{class:'grow'},'Odovzdávací protokol'),
      EMBED ? null : el('button',{class:'btn', onclick:()=>printEl(reportEl(rep, true))},'🖨 Tlačiť / PDF'),
      el('button',{class:'iconbtn', title:'Zavrieť (Esc)', onclick:closeModal},'✕')),
    reportEl(rep, false)), {wide:true});
}
function reportEl(r, withLog){
  const st=r.stats;
  const logRows = withLog ? state.log.filter(l=>l.t>=r.start && l.t<=r.end) : [];
  return el('div',{class:'report'},
    el('h1',{},'Odovzdávací protokol zmeny'),
    el('p',{}, 'Dispečer: ', el('b',{}, r.who), r.next ? ['  →  službu preberá: ', el('b',{}, r.next)] : null, el('br'),
      'Zmena: '+dmy(r.start)+' '+hm(r.start)+' – '+(sameDay(r.start, r.end) ? '' : dmy(r.end)+' ')+hm(r.end)+' ('+durTxt(r.end-r.start)+')'),
    el('h2',{},'Štatistika'),
    el('div',{class:'stats'}, stat('Prijaté udalosti', st.total), stat('z toho P1', st.p1), stat('Ukončené', st.closed),
      stat('Zrušené', st.cancelled), stat('Ø čas do vyslania', durTxt(st.avgDispatch)), stat('Ø čas do príjazdu', durTxt(st.avgArrive))),
    el('h2',{},'Otvorené udalosti pri odovzdaní ('+r.open.length+')'),
    r.open.length ? table(['Číslo','Pr.','Typ','Miesto','Prijatá','Stav','Jednotky'],
      r.open.map(o=>[o.no, PRIO[o.prio].short, o.type, o.addr||'—', dmy(o.created)+' '+hm(o.created), o.state, o.units||'—'])) : el('p',{},'Žiadne.'),
    el('h2',{},'Stav jednotiek'),
    r.units.length ? table(['Jednotka','Typ','Stav','Udalosť'], r.units.map(u=>[u.cs, u.type, ST(u.status).label, u.inc||''])) : el('p',{},'—'),
    el('h2',{},'Poznámka pre ďalšiu zmenu'),
    el('p',{class:'prewrap'}, r.note || '—'),
    withLog ? [el('h2',{},'Denník zmeny ('+logRows.length+')'),
      table(['Čas','Záznam'], logRows.map(l=>[dmy(l.t)+' '+hms(l.t), l.txt]))] : null,
    el('p',{class:'tiny muted'}, 'Vygenerované '+dmy(Date.now())+' '+hm(Date.now())+' · Dispečing'));
}
function handoverHistory(){
  if(!state.handovers.length) return null;
  const list=state.handovers.slice(0,20);
  return card('Odovzdané zmeny', table(['Zmena','Dispečer','Preberá','Udalostí'],
    list.map(r=>[dmy(r.start)+' '+hm(r.start)+' – '+hm(r.end), r.who, r.next||'—', String(r.stats.total)]), ix=>showReport(list[ix])));
}

/* ---------- Nastavenia ---------- */
function buildSettings(){
  const st=state.settings;
  const num=(val, onset, attrs={})=>el('input',Object.assign({class:'fld', type:'number', value:val, style:'width:90px',
    onchange:e=>{ const n=+e.target.value; if(n>0){ onset(n); save(); toast('Uložené'); } else e.target.value=val; }}, attrs));
  const chk=(label, val, onset)=>el('label',{class:'check'}, el('input',{type:'checkbox', checked:val,
    onchange:e=>{ onset(e.target.checked); save(); applyTheme(); }}), label);
  const file=el('input',{type:'file', accept:'.json,application/json', style:'display:none', onchange:async e=>{
    const f=e.target.files[0]; e.target.value=''; if(!f) return;
    try{
      const obj=JSON.parse(await f.text());
      if(!obj || !Array.isArray(obj.units) || !Array.isArray(obj.incidents)) throw new Error('súbor nie je záloha Dispečingu');
      if(!await ask({title:'Obnoviť dáta zo zálohy?', text:'Súčasné dáta v tomto prehliadači sa nahradia.', ok:'Obnoviť', danger:true})) return;
      state=normalize(obj); alerted.clear(); overdueKey=null;
      commit(); buildSettings(); fitAll(); toast('Záloha obnovená');
    }catch(err){ ask({title:'Zálohu sa nepodarilo načítať', text:err.message, ok:'Rozumiem', noCancel:true}); }
  }});
  const days=el('input',{class:'fld', type:'number', value:30, min:1, style:'width:80px'});
  let size=0;
  try{ size=new Blob([localStorage.getItem(STORE_KEY)||'']).size; }catch(e){}

  fill($('#settingsPage'),
    el('h2',{},'Nastavenia'),
    card('Jednotky', el('div',{id:'setUnits'}),
      el('div',{class:'row wrap', style:'margin-top:10px'}, el('button',{class:'btn primary', onclick:()=>unitForm()},'+ Pridať jednotku')),
      el('label',{class:'lbl', style:'margin-top:14px'},'Typy jednotiek (jeden na riadok)'),
      el('textarea',{class:'fld', rows:4, value:st.unitTypes.join('\n'),
        onchange:e=>{ st.unitTypes=lines(e.target.value); if(!st.unitTypes.length) st.unitTypes=[...DEFAULT_UNIT_TYPES]; save(); toast('Uložené'); }})),
    card('Udalosti',
      el('label',{class:'lbl'},'Typy udalostí (jeden na riadok)'),
      el('textarea',{class:'fld', rows:7, value:st.incTypes.join('\n'),
        onchange:e=>{ st.incTypes=lines(e.target.value); if(!st.incTypes.length) st.incTypes=[...DEFAULT_INC_TYPES]; save(); toast('Uložené'); }}),
      el('label',{class:'lbl', style:'margin-top:14px'},'Upozorniť, keď udalosť čaká na vyslanie dlhšie ako (minúty)'),
      el('div',{class:'setgrid'}, [1,2,3,4].map(p=>el('div',{}, el('span',{class:'prio', style:'--pc:'+PRIO[p].color}, PRIO[p].short),
        num(st.limits[p], n=>{ st.limits[p]=n; overdueKey=null; }, {min:0.5, step:0.5})))),
      chk('Zvukové upozornenie (pípanie) pri prekročení limitu', st.sound, v=>{ st.sound=v; if(v) beep(1); })),
    card('Mapa a adresy',
      el('div',{class:'row wrap'}, el('span',{},'Priemerná rýchlosť pre odhad dojazdu'), num(st.speed, n=>{ st.speed=n; renderAll(); }, {min:5, step:5}), el('span',{class:'muted'},'km/h')),
      el('div',{class:'row wrap', style:'margin-top:10px'},
        el('button',{class:'btn sm', disabled:!map, onclick:()=>{ const c=map.getCenter(); st.center=[+c.lat.toFixed(5), +c.lng.toFixed(5)]; st.zoom=map.getZoom(); save(); toast('Výrez mapy uložený ako predvolený'); }},'Uložiť aktuálny výrez mapy ako predvolený'),
        EMBED ? null : el('button',{class:'btn sm', onclick:openMapWindow},'⧉ Mapa v samostatnom okne')),
      chk('Tmavá mapa (v tmavej téme)', st.darkMap, v=>{ st.darkMap=v; }),
      EMBED ? el('p',{class:'small muted', style:'margin:8px 0 0'}, 'Mapové podklady a vyhľadávanie adries fungujú až v nainštalovanej appke, nie v tomto náhľade.') : [
      chk('Vyhľadávať adresy cez OpenStreetMap Nominatim', st.geocode, v=>{ st.geocode=v; }),
      el('div',{class:'row', style:'margin:6px 0 0 26px'}, el('span',{class:'small muted'},'Krajina (kód, napr. sk, cz; prázdne = všade):'),
        el('input',{class:'fld', value:st.country, style:'width:80px', onchange:e=>{ st.country=e.target.value.trim().toLowerCase(); save(); toast('Uložené'); }})),
      el('p',{class:'small muted', style:'margin:8px 0 0 26px'}, 'Pri vyhľadávaní sa text adresy (a pri výbere na mape súradnice) odošle na verejný server OpenStreetMap. Ak to vaše pravidlá ochrany údajov nedovoľujú, vypni to – miesto potom určíš kliknutím na mapu alebo zadaním súradníc.')]),
    card('Vzhľad',
      el('div',{class:'row'}, el('span',{},'Téma'),
        el('select',{class:'fld', style:'width:auto', value:st.theme, onchange:e=>{ st.theme=e.target.value; save(); applyTheme(); }},
          [['dark','Tmavá'],['light','Svetlá'],['auto','Podľa systému']].map(([v,l])=>el('option',{value:v}, l))))),
    card('Dáta a zálohy',
      el('p',{class:'small muted', style:'margin-top:0'}, 'Dáta sú uložené iba v tomto prehliadači ('+Math.round(size/1024)+' kB · '
        +state.units.length+' jednotiek · '+state.incidents.length+' udalostí · '+state.log.length+' záznamov v denníku). Pravidelne si rob zálohu.'),
      el('div',{class:'row wrap'},
        EMBED ? null : el('button',{class:'btn', onclick:()=>download('dispecing-zaloha-'+fileStamp()+'.json', JSON.stringify(state), 'application/json')},'⬇ Záloha (JSON)'),
        el('button',{class:'btn', onclick:()=>file.click()},'⬆ Obnoviť zo zálohy'), file,
        EMBED ? null : el('button',{class:'btn', onclick:()=>download('dennik-cely-'+fileStamp()+'.csv', csvLog(state.log), 'text/csv;charset=utf-8')},'⬇ Celý denník (CSV)')),
      el('div',{class:'row wrap', style:'margin-top:12px'},
        el('span',{class:'small'},'Vymazať ukončené udalosti, denník a protokoly staršie ako'), days, el('span',{class:'small'},'dní'),
        el('button',{class:'btn sm', onclick:async()=>{ const n=+days.value;
          if(n>=1 && await ask({title:'Vymazať staré záznamy?', text:'Odstránia sa ukončené udalosti, záznamy denníka a protokoly staršie ako '+n+' dní. Najprv si urob zálohu.', ok:'Vymazať', danger:true})) cleanup(n); }},'Vymazať')),
      el('div',{class:'row wrap', style:'margin-top:12px'},
        el('button',{class:'btn sm', onclick:loadDemo},'Načítať ukážkové dáta'),
        el('button',{class:'btn sm danger', onclick:wipeAll},'Vymazať všetky dáta'))),
    card('Klávesové skratky a tipy', el('ul',{class:'help small', style:'margin:0; padding-left:18px'},
      el('li',{}, el('kbd',{},'N'),' alebo ',el('kbd',{},'F2'),' – nová udalosť; ',el('kbd',{},'Ctrl+Enter'),' – uložiť; ',el('kbd',{},'Esc'),' – zavrieť okno / zrušiť výber na mape'),
      el('li',{}, 'Pravý klik na mapu (na mobile dlhé podržanie) – nová udalosť na tom mieste'),
      el('li',{}, 'Značky jednotiek a udalostí na mape sa dajú ťahať – tak rýchlo upravíš polohu'),
      el('li',{}, 'Stavy jednotiek: ', STATUSES.map(s=>s.code+' '+s.label).join(' · ')),
      el('li',{}, 'Stav 3 a 4 zapisuje čas vyslania a príjazdu k udalosti; stav 1, 2 alebo 0 jednotku z udalosti uvoľní'),
      EMBED ? null : el('li',{}, 'Mapu môžeš otvoriť v samostatnom okne (⧉) na druhom monitore – obe okná sa synchronizujú'),
      el('li',{}, 'Do adresy môžeš vložiť aj GPS súradnice, napr. 48.1486, 17.1077'))),
    el('p',{class:'tiny muted center'}, 'Dispečing · pomocný nástroj pre prehľad a evidenciu. Nenahrádza certifikovaný dispečerský systém ani rádiovú komunikáciu.'));
  renderSettingsUnits();
}
function renderSettingsUnits(){
  const box=$('#setUnits'); if(!box) return;
  const units=[...state.units].sort(cmpCs);
  fill(box, units.length
    ? table(['Volací znak','Typ','Posádka','Základňa','Stav'], units.map(u=>[el('b',{}, u.cs), u.type, u.crew||'—',
        (u.base||'—')+(u.baseLat!=null?' 📍':''), el('span',{class:'sbadge', style:'--sc:'+ST(u.status).color}, ST(u.status).short)]),
        ix=>unitForm(units[ix].id))
    : el('p',{class:'muted', style:'margin:0'},'Zatiaľ žiadne jednotky.'));
}
function cleanup(days){
  const cut=Date.now()-days*86400e3, bi=state.incidents.length, bl=state.log.length;
  state.incidents=state.incidents.filter(i=>isOpen(i) || i.tClosed>=cut);
  state.log=state.log.filter(l=>l.t>=cut);
  state.handovers=state.handovers.filter(h=>h.end>=cut);
  addLog('sys', 'Upratovanie: odstránených '+(bi-state.incidents.length)+' udalostí a '+(bl-state.log.length)+' záznamov starších ako '+days+' dní');
  commit(); buildSettings(); toast('Hotovo');
}
async function wipeAll(){
  if(!await ask({title:'Vymazať všetky dáta?', text:'Odstránia sa všetky jednotky, udalosti, denník a protokoly. Nastavenia ostanú. Toto sa nedá vrátiť.',
    ok:'Vymazať všetko', danger:true})) return;
  state=normalize({settings:state.settings}); alerted.clear(); overdueKey=null;
  commit(); buildSettings(); toast('Dáta vymazané');
}

/* ---------- Ukážkové dáta (Bratislava) ---------- */
async function loadDemo(silent){
  if(silent!==true && (state.units.length || state.incidents.length || state.log.length) &&
     !await ask({title:'Načítať ukážkové dáta?', text:'Súčasné jednotky, udalosti a denník sa nahradia.', ok:'Načítať', danger:true})) return;
  const now=Date.now(), m=60000, y=new Date().getFullYear(), no=n=>y+'-'+String(n).padStart(4,'0');
  const U=(cs,type,crew,base,b,status,ago,pos)=>({id:uid(), cs, type, crew, base, baseLat:b[0], baseLng:b[1],
    status, since:now-ago*m, inc:null, lat:(pos||b)[0], lng:(pos||b)[1]});
  const units=[
    U('RZP-11','RZP','Novák, Horváth','Stanica Ružinov',[48.1556,17.1607],2,55),
    U('RZP-12','RZP','Kováč, Baláž','Stanica Petržalka',[48.1167,17.1080],4,2,[48.1337,17.1039]),
    U('RZP-14','RZP','Mráz, Lukáč','Stanica Dúbravka',[48.1835,17.0353],1,40,[48.1652,17.0598]),
    U('RLP-1','RLP','MUDr. Szabó, Tóth, Varga','Stanica Kramáre',[48.1746,17.0915],2,95),
    U('HAS-21','Hasiči','veliteľ Fodor + 4','HS Petržalka',[48.1213,17.1180],3,6,[48.1262,17.1121]),
    U('POL-07','Polícia','hliadka 07','OO PZ Staré Mesto',[48.1440,17.1130],3,8,[48.1404,17.1092]),
    U('SBS-3','Hliadka SBS','Krajčí, Benko','Centrála SBS',[48.1590,17.1290],0,20),
  ];
  const by=cs=>units.find(u=>u.cs===cs);
  const I=(n,type,prio,addr,ll,ago,caller,phone,desc)=>({id:uid(), no:no(n), created:now-ago*m, type, prio, addr, lat:ll[0], lng:ll[1],
    caller, phone, desc, units:[], allUnits:[], tDispatch:null, tArrive:null, tClosed:null, cancelled:false, outcome:''});
  const i40=I(40,'Poplach EZS / EPS',3,'Obchodná 2, Bratislava – Staré Mesto',[48.1466,17.1077],34,'PCO','','Poplach EZS v predajni, zóna 3 – sklad.');
  Object.assign(i40,{tDispatch:now-33*m, tArrive:now-24*m, tClosed:now-15*m, outcome:'Planý poplach – objekt skontrolovaný, bez narušenia', allUnits:[by('POL-07').id]});
  const i41=I(41,'Dopravná nehoda',1,'Einsteinova, Bratislava – Petržalka',[48.1337,17.1039],9,'Peter M.','0905 123 456',
    'Zrážka 2 osobných áut, 1 osoba zakliesnená, pri vedomí. Uniká palivo.');
  const sent=['RZP-12','POL-07','HAS-21'].map(cs=>by(cs).id);
  Object.assign(i41,{tDispatch:now-8*m, tArrive:now-2*m, units:[...sent], allUnits:[...sent]});
  sent.forEach(id=>{ units.find(u=>u.id===id).inc=i41.id; });
  const i42=I(42,'Náhla zdravotná príhoda',2,'Trnavská cesta 50, Bratislava – Nové Mesto',[48.1617,17.1398],2,'Jana K.','0911 222 333',
    'Muž 67 r., bolesť na hrudi, spotený, dýcha.');
  const L=(ago,k,txt,inc,u)=>({id:uid(), t:now-ago*m, k, txt, inc:inc&&inc.id, unit:u&&by(u).id});
  const log=[
    L(130,'shift','Začiatok zmeny – dispečer Ukážkový dispečer'),
    L(55,'unit','RZP-11: Voľná → Voľná – na základni',null,'RZP-11'),
    L(40,'unit','RZP-14: Základňa → Voľná – v teréne',null,'RZP-14'),
    L(34,'inc',i40.no+': nová udalosť – Poplach EZS / EPS (P3), Obchodná 2, Bratislava – Staré Mesto',i40),
    L(33,'inc',i40.no+': vyslaná jednotka POL-07',i40,'POL-07'),
    L(33,'unit','POL-07: Voľná → Výjazd – na ceste ('+i40.no+')',i40,'POL-07'),
    L(24,'unit','POL-07: Výjazd → Na mieste zásahu ('+i40.no+')',i40,'POL-07'),
    L(20,'unit','SBS-3: Voľná → Mimo prevádzky',null,'SBS-3'),
    L(20,'note','SBS-3 mimo prevádzky – porucha vozidla, servis informovaný.'),
    L(15,'unit','POL-07: Na mieste → Voľná – v teréne ('+i40.no+') – uvoľnená z udalosti',i40,'POL-07'),
    L(15,'inc',i40.no+': udalosť ukončená – '+i40.outcome,i40),
    L(9,'inc',i41.no+': nová udalosť – Dopravná nehoda (P1), Einsteinova, Bratislava – Petržalka',i41),
    L(8,'inc',i41.no+': vyslaná jednotka RZP-12',i41,'RZP-12'),
    L(8,'unit','RZP-12: Základňa → Výjazd – na ceste ('+i41.no+')',i41,'RZP-12'),
    L(8,'inc',i41.no+': vyslaná jednotka POL-07',i41,'POL-07'),
    L(8,'unit','POL-07: Voľná → Výjazd – na ceste ('+i41.no+')',i41,'POL-07'),
    L(7,'note','Volajúci hlási únik paliva – vyžiadaní hasiči.',i41),
    L(6,'inc',i41.no+': vyslaná jednotka HAS-21',i41,'HAS-21'),
    L(6,'unit','HAS-21: Základňa → Výjazd – na ceste ('+i41.no+')',i41,'HAS-21'),
    L(2,'unit','RZP-12: Výjazd → Na mieste zásahu ('+i41.no+')',i41,'RZP-12'),
    L(2,'inc',i42.no+': nová udalosť – Náhla zdravotná príhoda (P2), Trnavská cesta 50, Bratislava – Nové Mesto',i42),
  ];
  state=normalize({settings:state.settings, units, incidents:[i40,i41,i42], log, handovers:[], seq:{y, n:42},
    shift:{id:uid(), who:'Ukážkový dispečer', start:now-130*m, note:'RLP-1: výmena posádky o 19:00.\nSBS-3 v servise – zavolať o stave opravy.'}});
  state.settings.center=[48.148, 17.11]; state.settings.zoom=13;
  alerted.clear(); overdueKey=null;
  commit();
  if(route==='settings') buildSettings();
  if(route==='shift') buildShiftPage();
  if(route==='log') buildLogPage();
  fitAll();
  if(silent!==true) toast('Ukážkové dáta načítané');
}

/* ============================================================
   ČASOVAČ: hodiny, odpočty a upozornenia
   ============================================================ */
function tick(){
  const now=Date.now();
  fill($('#clock'), hms(now), el('small',{}, DAYS[new Date(now).getDay()]+' '+dmy(now)));
  document.querySelectorAll('[data-since]').forEach(n=>{ n.textContent=dur(now - +n.dataset.since); });
  const od=state.incidents.filter(i=>isOverdue(i, now));
  const key=od.map(i=>i.id).join(',');
  if(key!==overdueKey){
    overdueKey=key;
    renderIncidents(); renderMap();
    const fresh=od.filter(i=>!alerted.has(i.id));
    fresh.forEach(i=>alerted.add(i.id));
    if(fresh.length && !MAPONLY){
      const i=fresh.sort(byPrio)[0];
      beep();
      toast('⚠ '+i.no+' ('+PRIO[i.prio].short+' '+i.type+') čaká na vyslanie už '+dur(now-i.created), true);
      toast.overdue=true;
    }
  }
  if(!od.length && toast.overdue){ toast.overdue=false; $('#toast').classList.remove('show'); }
  document.title=(od.length ? '⚠ ('+od.length+') ' : '')+BASE_TITLE;
}

/* ---------- Klávesnica ---------- */
document.addEventListener('keydown', e=>{
  if(e.key==='Escape'){
    if(dialog){ dialog.cancel(); return; }
    if(picking){ endPick(null); return; }
    if(modalOpen()) tryCloseModal();
    return;
  }
  if(dialog || picking) return;
  if(e.key==='Enter' && (e.ctrlKey || e.metaKey) && modal.submit){ e.preventDefault(); modal.submit(); return; }
  if(/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey || modalOpen()) return;
  if(e.key==='n' || e.key==='N' || e.key==='F2'){ e.preventDefault(); newIncident(); }
});

/* ============================================================
   ŠTART
   ============================================================ */
function init(){
  if(MAPONLY) document.body.classList.add('maponly');
  $('#btnNew').addEventListener('click', ()=>newIncident());
  $('#shiftinfo').addEventListener('click', ()=>go('shift'));
  $('#btnAddUnit').addEventListener('click', ()=>unitForm());
  $('#btnFit').addEventListener('click', fitAll);
  $('#btnMapWin').addEventListener('click', openMapWindow);
  if(EMBED){
    $('#btnMapWin').hidden=true;
    const bar=el('div',{class:'embedbar'},
      el('span',{class:'grow'}, 'Náhľad v Claude · dáta sa ukladajú len v tomto prehliadači · mapové podklady, tlač a export fungujú až v nainštalovanej appke'),
      el('button',{class:'iconbtn', title:'Skryť', onclick:()=>bar.remove()},'✕'));
    $('header.top').after(bar);
  }
  if(window.matchMedia){ const mq=matchMedia('(prefers-color-scheme: light)'); if(mq.addEventListener) mq.addEventListener('change', applyTheme); }
  new MutationObserver(applyTheme).observe(document.documentElement, {attributes:true, attributeFilter:['data-theme']});
  fill($('#legend'), STATUSES.map(s=>el('span',{style:'--sc:'+s.color, title:s.label}, s.code+' '+s.short)));
  applyTheme();
  initMap();
  let r='board';
  try{ r=sessionStorage.getItem('disp-route')||'board'; }catch(e){}
  go(MAPONLY || !TABS.some(t=>t.id===r) ? 'board' : r);
  setBoardSub(MAPONLY ? 'map' : 'inc');
  /* náhľad sa otvára rovno s ukážkovými dátami, aby bolo čo skúšať */
  if(EMBED && !state.units.length && !state.incidents.length && !state.log.length) loadDemo(true);
  renderAll();
  tick(); setInterval(tick, 1000);
  if(map) setTimeout(()=>map.invalidateSize(), 100);
}
init();

if(!EMBED && 'serviceWorker' in navigator){
  window.addEventListener('load', ()=>{ navigator.serviceWorker.register('./sw.js').catch(()=>{}); });
}

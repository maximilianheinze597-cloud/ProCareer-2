const $=s=>document.querySelector(s),V=$('#view');let tab='home',match=null,toast='';
const TABS=[['home','Start'],['play','Spiel'],['train','Training'],['tac','Taktik'],['table','Tabelle'],['mkt','Transfers'],['sys','System']];
const cn=id=>CLUBS[id].name,ovrBar=(l,v)=>`<div class="row"><span>${l}</span><b>${Math.round(v)}</b></div><div class="bar"><i style="width:${v}%"></i></div>`;
const POS=['ST','LW','RW','CAM','CM','CDM','CB','LB','RB','GK'];
function saved(ok){const e=$('#saved');e.textContent=ok===false?'Speichern fehlgeschlagen':'Gespeichert '+new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}
function nav(){$('#nav').innerHTML=Career.s?TABS.map(([k,l])=>`<button data-tab="${k}" class="${tab===k?'on':''}">${l}</button>`).join(''):''}
function render(){nav();const s=Career.s;if(!s){V.innerHTML=createView();return}V.innerHTML=({home,play,train,tac,table,mkt,sys})[tab]()+(toast?`<div class="card">${toast}</div>`:'');toast=''}
function createView(){return`<div class="card"><h2>Neue Karriere</h2>
<label>Name</label><input id="n" value="Alex Neumann"><label>Alter</label><input id="a" type="number" min="16" max="34" value="18">
<label>Nationalität</label><input id="nat" value="Deutschland"><label>Position</label><select id="p">${POS.map(p=>`<option>${p}</option>`).join('')}</select>
<label>Größe (cm)</label><input id="h" type="number" value="182"><label>Fuß</label><select id="f"><option>rechts</option><option>links</option></select>
<label>Startverein</label><select id="c">${LEAGUES.map((l,li)=>`<optgroup label="${l}">${CLUBS.filter(c=>c.lg===li).map(c=>`<option value="${c.id}">${c.name} (Stärke ${c.str})</option>`).join('')}</optgroup>`).join('')}</select>
<label>Schwierigkeit</label><select id="d"><option value="0">Leicht</option><option value="1" selected>Normal</option><option value="2">Schwer</option></select>
<button data-act="create">Karriere starten</button><button class="s" data-act="loadfile">Spielstand importieren</button></div>`}
function home(){const s=Career.s,m=s.me,f=Career.userFix(),tb=Career.sorted(),pos=tb.findIndex(e=>+e[0]===s.club)+1,avg=m.st.rat.length?(m.st.rat.reduce((a,b)=>a+b,0)/m.st.rat.length).toFixed(2):'–';
 return`<div class="card"><h2>${m.name}</h2><div class="row"><span>${m.pos} · ${m.age} J. · ${m.nat}</span><b style="font-size:28px;color:var(--ac)">${Math.round(m.ovr)}</b></div>
<div class="row"><span>Verein</span><b>${cn(s.club)}</b></div><div class="row"><span>Liga</span><b>${LEAGUES[s.lg[s.club]]}</b></div><div class="row"><span>Saison ${s.season} · Spieltag</span><b>${s.md+1}/${MDS}</b></div>
<div class="row"><span>Tabellenplatz</span><b>${pos}.</b></div><div class="row"><span>Form / Fitness</span><b>${Math.round(m.form)} / ${Math.round(100-m.fatigue)}${m.inj?' · verletzt '+m.inj:''}</b></div>
<div class="row"><span>Vertrag</span><b>${s.contract.years} J. · ${s.contract.wage} T€/Woche</b></div><div class="row"><span>Marktwert</span><b>${Career.value(m)} Mio €</b></div>
<div class="row"><span>Saison: Spiele/Tore/Vorlagen/Ø</span><b>${m.st.apps}/${m.st.goals}/${m.st.ass}/${avg}</b></div></div>
<div class="card"><h3>Attribute</h3>${KEYS.filter(k=>m.role==='GK'?k==='gk':k!=='gk').map(k=>ovrBar({pac:'Tempo',sho:'Abschluss',pas:'Passspiel',dri:'Dribbling',def:'Verteidigung',phy:'Physis',gk:'Torwart'}[k],m.att[k])).join('')}
<small>Potenzial: ${Math.round(m.pot)}</small></div>
<div class="card"><h3>Neuigkeiten</h3>${s.news.slice(0,5).map(n=>`<div class="row">${n}</div>`).join('')}</div>
${s.hist.length?`<div class="card"><h3>Karrierehistorie</h3>${s.hist.map(h=>`<div class="row"><span>S${h.season} ${h.club} (${h.lg||''} ${h.pos}.)</span><span>${h.apps}Sp ${h.goals}T ${h.ass}V Ø${h.avg} · Meister: ${h.champ}</span></div>`).join('')}</div>`:''}`}
function play(){const s=Career.s,f=Career.userFix(),h=f[0]===s.club;return`<div class="card"><h2>Spieltag ${s.md+1}</h2><div class="row"><span>${cn(f[0])}</span><b>vs</b><span>${cn(f[1])}</span></div>
<small>${h?'Heimspiel in der '+CLUBS[f[0]].stadium:'Auswärtsspiel'}${s.me.inj?' · du bist verletzt (kein Einsatz)':''}</small><br>
${s.me.inj?'':'<button data-act="play3d">3D-Spiel starten</button>'}<button class="s" data-act="sim">Simulieren</button>
<p><small>PC: WASD/Pfeile, J Pass, K Steilpass, L/Leertaste Schuss, Shift Sprint, U Grätsche, Q Wechsel.</small></p></div>
${s.res.length?`<div class="card"><h3>Letzter Spieltag</h3>${s.res[s.res.length-1].map(r=>`<div class="row"><span>${cn(r[0])}</span><b>${r[2]}:${r[3]}</b><span>${cn(r[1])}</span></div>`).join('')}</div>`:''}`}
function train(){const s=Career.s,m=s.me;const types=m.role==='GK'?['Torwart','Kraft','Passspiel']:['Abschluss','Passspiel','Dribbling','Sprint','Verteidigung','Kraft'];
 return`<div class="card"><h2>Training</h2><div class="row"><span>Einheiten diese Woche</span><b>${s.sess}/3</b></div><div class="row"><span>Müdigkeit</span><b>${Math.round(m.fatigue)}%</b></div>
${types.map(t=>`<button data-train="${t}">${t}</button>`).join('')}<button class="s" data-act="rest">Ruhetag</button></div>`}
function tac(){const t=Career.s.tac;return`<div class="card"><h2>Taktik & Aufstellung</h2><label>Formation</label><select data-tac="form">${Object.keys(FORMS).map(f=>`<option ${f===t.form?'selected':''}>${f}</option>`).join('')}</select>
<label>Spielweise</label><select data-tac="style"><option value="0" ${t.style==0?'selected':''}>Defensiv</option><option value="1" ${t.style==1?'selected':''}>Ausgewogen</option><option value="2" ${t.style==2?'selected':''}>Offensiv</option></select>
<label>Pressing</label><select data-tac="press"><option value="0.2" ${t.press==.2?'selected':''}>Niedrig</option><option value="0.5" ${t.press==.5?'selected':''}>Mittel</option><option value="0.8" ${t.press==.8?'selected':''}>Hoch</option></select>
<small>Die Aufstellung wird automatisch nach Stärke und Position gewählt; dein Spieler steht in der Startelf.</small></div>
<div class="card"><h3>Kader</h3>${Career.s.squads[Career.s.club].slice().sort((a,b)=>b.ovr-a.ovr).map(p=>`<div class="row ${p.id==='ME'?'':''}"><span>${p.pos} ${p.name}${p.id==='ME'?' ★':''}</span><b>${Math.round(p.ovr)}</b></div>`).join('')}</div>`}
function table(){const s=Career.s;return`<div class="card"><h2>${LEAGUES[s.lg[s.club]]} · Saison ${s.season}</h2><table><tr><th>#</th><th>Verein</th><th>Sp</th><th>T</th><th>Pkt</th></tr>
${Career.sorted().map(([id,t],i)=>`<tr class="${+id===s.club?'me':''}"><td>${i+1}</td><td>${cn(id)}</td><td>${t.p}</td><td>${t.gf}:${t.ga}</td><td>${t.pts}</td></tr>`).join('')}</table></div>`}
function mkt(){const s=Career.s;return`<div class="card"><h2>Angebote</h2>${s.offers.length?s.offers.map((o,i)=>`<div class="row"><span>${cn(o.club)} · ${o.years} J. · ${o.wage} T€/Wo</span><button data-offer="${i}">Annehmen</button></div>`).join(''):'<small>Aktuell keine Angebote.</small>'}</div>
<div class="card"><h3>Transfermarkt (Ansicht)</h3>${Object.values(s.squads).flat().filter(p=>p.id!=='ME').sort((a,b)=>b.ovr-a.ovr).slice(0,12).map(p=>`<div class="row"><span>${p.pos} ${p.name} (${p.age})</span><b>${Math.round(p.ovr)}</b></div>`).join('')}</div>`}
function sys(){const o=App.opt;return`<div class="card"><h2>System</h2><label>Grafikqualität</label><select data-opt="q"><option value="0" ${o.q==0?'selected':''}>Niedrig</option><option value="1" ${o.q==1?'selected':''}>Mittel</option><option value="2" ${o.q==2?'selected':''}>Hoch (Schatten)</option></select>
<label>Lautstärke</label><input type="range" min="0" max="1" step=".1" value="${Sfx.vol}" data-opt="vol"><label>Ton</label><select data-opt="snd"><option value="1" ${Sfx.on?'selected':''}>An</option><option value="0" ${Sfx.on?'':'selected'}>Aus</option></select>
<button data-act="save">Speichern</button><button class="s" data-act="export">Export (JSON)</button><button class="s" data-act="loadfile">Import</button><button class="s" data-act="new">Neue Karriere</button></div>
<div class="card"><h3>Vereinsnamen anpassen</h3><small>Ein Name pro Zeile (${CLUBS.length} Zeilen, Reihenfolge wie bei der Vereinsauswahl). Eigene Namen trägst du hier selbst ein.</small>
<textarea id="names" rows="8" style="width:100%;background:#0b1520;color:#e8f0f7;border:1px solid #2a4260;border-radius:8px;padding:8px;font-size:14px">${CLUBS.map(c=>c.name).join('\n')}</textarea>
<button data-act="names">Namen speichern</button><button class="s" data-act="resetnames">Zurücksetzen</button></div>`}
const App={opt:{q:1}};
try{Object.assign(App.opt,JSON.parse(localStorage.getItem('procareer_opt')||'{}'))}catch(e){}
function startMatch(){if(typeof THREE==='undefined'){alert('Three.js konnte nicht geladen werden (Internetverbindung / CDN prüfen).');return}
 Sfx.init();const s=Career.s,f=Career.userFix(),uh=f[0]===s.club;const opp=Career.lineupFor(uh?f[1]:f[0]),mine=Career.lineupFor(s.club);
 mine.kit=CLUBS[s.club].col;opp.kit=opp.club.col===mine.kit||Math.abs(opp.club.col-mine.kit)<0x101010?opp.club.col2:opp.club.col;
 // Nutzerteam spielt im Match immer von links nach rechts (Team 0)
 $('#game').hidden=false;$('#err').hidden=true;
 try{match=new Match($('#c'),mine,opp,App.opt,res=>endMatch(res,uh))}catch(e){$('#game').hidden=true;$('#err').hidden=false;$('#err').textContent='3D konnte nicht gestartet werden: '+e.message}}
function endMatch(res,uh){if(match){match.dispose();match=null}$('#game').hidden=true;const s=Career.s;
 const end=Career.finish({score:uh?res.score:res.score,goals:res.goals,ass:res.ass,rating:res.rating});saved(true);
 const st=res.stats;toast=`<h3>Endergebnis ${res.score[0]}:${res.score[1]}</h3><div class="row"><span>Deine Bewertung</span><b>${res.rating}</b></div>
 ${[['Ballbesitz %','poss'],['Schüsse','shots'],['aufs Tor','on'],['Pässe','pass'],['angekommen','ok'],['Ecken','corners'],['Fouls','fouls'],['Paraden','saves']].map(([l,k])=>`<div class="row"><span>${st[0][k]}</span><span>${l}</span><span>${st[1][k]}</span></div>`).join('')}
 ${res.ev.filter(e=>!e.card).map(e=>`<div class="row">${e.m}' Tor ${e.t?'Gegner':'Eigenes Team'}: ${e.name}${e.ass?' (Vorlage '+e.ass+')':''}</div>`).join('')}
 ${end?`<p><b>Saison ${end.season} beendet:</b> Platz ${end.pos}, Meister ${end.champ}.</p>`:''}`;tab='home';render()}
document.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;const s=Career.s;
 if(t.dataset.tab){tab=t.dataset.tab;render();return}
 if(t.dataset.train){toast=Career.train(t.dataset.train);saved(true);render();return}
 if(t.dataset.offer){Career.accept(+t.dataset.offer);saved(true);render();return}
 switch(t.dataset.act){
  case'create':Career.create({name:$('#n').value,age:clamp(+$('#a').value||18,16,34),nat:$('#nat').value,pos:$('#p').value,height:+$('#h').value,foot:$('#f').value,club:+$('#c').value,diff:+$('#d').value});saved(true);tab='home';render();break;
  case'play3d':startMatch();break;
  case'sim':endMatch((()=>{const f=Career.userFix(),g=Career.simGoals(f[0],f[1]),uh=f[0]===s.club;return{score:uh?g:[g[1],g[0]],goals:0,ass:0,rating:6.3,ev:[],stats:[0,1].map(()=>({poss:50,shots:0,on:0,pass:0,ok:0,corners:0,fouls:0,saves:0}))}})(),Career.userFix()[0]===s.club);break;
  case'rest':toast=Career.rest();saved(true);render();break;
  case'save':saved(Career.save());break;
  case'new':if(confirm('Aktuelle Karriere wirklich verwerfen?')){Career.s=null;render()}break;
  case'export':{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(Career.s)],{type:'application/json'}));a.download='procareer-save.json';a.click();break}
  case'loadfile':{const i=document.createElement('input');i.type='file';i.accept='.json';i.onchange=()=>{const r=new FileReader();r.onload=()=>{if(Career.load(r.result)){Career.save();saved(true);tab='home'}else alert('Spielstand beschädigt oder falsche Version.');render()};r.readAsText(i.files[0])};i.click();break}
  case'names':{const v=$('#names').value.split('\n').map(x=>x.trim());if(v.length<CLUBS.length||v.slice(0,CLUBS.length).some(x=>!x))alert('Bitte genau '+CLUBS.length+' nicht-leere Zeilen eingeben.');else{v.slice(0,CLUBS.length).forEach((n,i)=>CLUBS[i].name=n.slice(0,28));try{localStorage.setItem('procareer_names',JSON.stringify(v.slice(0,CLUBS.length)))}catch(x){}render()}break}
  case'resetnames':try{localStorage.removeItem('procareer_names')}catch(x){}location.reload();break;
  case'quit':if(match&&confirm('Spiel beenden? Der aktuelle Stand wird gewertet.'))match.finish();break}});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset.tac){Career.s.tac[t.dataset.tac]=t.dataset.tac==='form'?t.value:+t.value;Career.save();saved(true)}
 if(t.dataset.opt){const k=t.dataset.opt;if(k==='q')App.opt.q=+t.value;if(k==='vol')Sfx.vol=+t.value;if(k==='snd')Sfx.on=t.value==='1';try{localStorage.setItem('procareer_opt',JSON.stringify(App.opt))}catch(x){}}});
// Touch-Steuerung
(function(){const j=$('#joy'),k=j.firstElementChild;let id=null;const mv=e=>{const r=j.getBoundingClientRect(),dx=e.clientX-r.left-65,dz=e.clientY-r.top-65,l=Math.min(1,Math.hypot(dx,dz)/50),a=Math.atan2(dz,dx);
 const x=Math.cos(a)*l,z=Math.sin(a)*l;if(match){match.inp.x=l>.15?x:0;match.inp.z=l>.15?z:0}k.style.transform=`translate(${x*40}px,${z*40}px)`};
 j.addEventListener('pointerdown',e=>{id=e.pointerId;j.setPointerCapture(id);mv(e)});j.addEventListener('pointermove',e=>{if(e.pointerId===id)mv(e)});
 const up=e=>{if(e.pointerId===id){id=null;if(match)match.inp.x=match.inp.z=0;k.style.transform=''}};j.addEventListener('pointerup',up);j.addEventListener('pointercancel',up);
 document.querySelectorAll('#btns button').forEach(b=>{const a=b.dataset.k;b.addEventListener('pointerdown',e=>{e.preventDefault();if(!match)return;if(a==='sprint')match.inp.sprint=true;else match.press(a)});
  const off=()=>{if(a==='sprint'&&match)match.inp.sprint=false};b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off)})})();
addEventListener('error',e=>{const d=$('#err');d.hidden=false;d.textContent='JavaScript-Fehler: '+e.message});
try{const n=JSON.parse(localStorage.getItem('procareer_names')||'null');if(Array.isArray(n))n.forEach((x,i)=>{if(CLUBS[i]&&typeof x==='string'&&x)CLUBS[i].name=x.slice(0,28)})}catch(e){}
Career.load();render();if(Career.s)saved(true);
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});

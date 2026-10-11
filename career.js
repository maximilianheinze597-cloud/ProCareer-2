const SAVE='procareer_save_v2',MDS=14;
const Career={s:null,
 pois(l){let k=0,p=1,e=Math.exp(-l);do{k++;p*=Math.random()}while(p>e);return k-1},
 strength(id){return Math.round(this.s.squads[id].map(p=>p.ovr).sort((a,b)=>b-a).slice(0,11).reduce((a,b)=>a+b,0)/11)},
 value(m){return +(0.1*Math.exp((m.ovr-40)/9)*(m.age<24?1.3:m.age>31?.5:1)).toFixed(1)},
 fixtures(ids){const r=[];let a=ids.slice();
  for(let i=0;i<7;i++){const m=[];for(let j=0;j<4;j++)m.push(i%2?[a[7-j],a[j]]:[a[j],a[7-j]]);r.push(m);a=[a[0],a[7],...a.slice(1,7)]}
  return[...r,...r.map(m=>m.map(([h,x])=>[x,h]))]},
 emptyTable(ids){const t={};for(const id of ids)t[id]={p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0};return t},
 create(o){const squads={};for(const c of CLUBS)squads[c.id]=makeSquad(c);
  const role=ROLE[o.pos],base=[62,58,54][o.diff]||58,att={};
  for(const k of KEYS)att[k]=clamp(base+RI(-6,6),30,90);
  if(role==='GK'){for(const k of KEYS)if(k!=='gk')att[k]=35;att.gk=base}else att.gk=15;
  if(role==='FWD'){att.sho+=6;att.def-=12}if(role==='DEF'){att.def+=6;att.sho-=12}
  const me={id:'ME',name:o.name||'Spieler',nat:o.nat,pos:o.pos,role,age:o.age,height:o.height,foot:o.foot,att,pot:Math.min(92,base+Math.max(6,(28-o.age)*2.6)+RI(0,4)),
   form:60,fatigue:0,inj:0,st:{apps:0,goals:0,ass:0,min:0,rat:[],yel:0}};
  me.ovr=calcOvr(me.att,role);
  const sq=squads[o.club],w=sq.filter(p=>p.role===role).sort((a,b)=>a.ovr-b.ovr)[0];sq.splice(sq.indexOf(w),1,me);
  const lg={};CLUBS.forEach(c=>lg[c.id]=c.lg);const ids=CLUBS.filter(c=>c.lg===lg[o.club]).map(c=>c.id);
  this.s={v:2,lg,ids,season:1,md:0,sess:0,me,club:o.club,diff:o.diff,squads,fx:this.fixtures(ids),table:this.emptyTable(ids),res:[],hist:[],
   contract:{years:3,wage:Math.round(this.value(me)*0.8+2)},tac:{form:'4-3-3',style:1,press:.5},news:['Karriere gestartet!'],offers:[],log:[]};
  this.save()},
 userFix(){return this.s.fx[this.s.md].find(([h,a])=>h===this.s.club||a===this.s.club)},
 lineupFor(id){const s=this.s,tac=id===s.club?s.tac:{form:['4-4-2','4-3-3','4-2-3-1'][id%3],style:1,press:.5};
  const meId=id===s.club?'ME':null;return{club:CLUBS[id],lineup:lineup(s.squads[id],tac.form,meId),tac:{...tac,line:0}}},
 train(type){const s=this.s,m=s.me,map={Abschluss:'sho',Passspiel:'pas',Dribbling:'dri',Sprint:'pac',Verteidigung:'def',Kraft:'phy',Torwart:'gk'};
  if(s.sess>=3)return'Diese Woche sind keine Einheiten mehr möglich.';
  if(m.inj>0)return'Verletzt – nur Ruhe möglich.';
  const k=map[type];s.sess++;
  const ageF=m.age<=21?1:m.age<=26?.7:m.age<=30?.4:.15,room=clamp((m.pot-m.att[k])/25,0,1),tired=m.fatigue>70?.4:m.fatigue>50?.7:1;
  const g=0.22*ageF*room*tired*(0.8+Math.random()*.4)*(1+(m.form-50)/400);
  m.att[k]=Math.min(99,m.att[k]+g);m.fatigue=Math.min(100,m.fatigue+14);
  if(m.fatigue>85&&Math.random()<.15){m.inj=RI(1,3);s.news.unshift('Überlastung: Verletzung ('+m.inj+' Spieltage)')}
  const old=m.ovr;m.ovr=calcOvr(m.att,m.role);this.save();
  return type+': '+(g>=0.005?'+'+g.toFixed(2):'kaum Fortschritt')+(m.ovr>old?' – Gesamtstärke steigt auf '+m.ovr:'')},
 rest(){const s=this.s;if(s.sess>=3)return'Keine Einheit mehr frei.';s.sess++;s.me.fatigue=Math.max(0,s.me.fatigue-28);this.save();return'Ruhetag: Müdigkeit sinkt.'},
 simGoals(h,a){const sh=this.strength(h),sa=this.strength(a);return[this.pois(1.35*Math.exp((sh-sa+4)/30)),this.pois(1.1*Math.exp((sa-sh)/30))]},
 apply(h,a,gh,ga){const t=this.s.table;t[h].p++;t[a].p++;t[h].gf+=gh;t[h].ga+=ga;t[a].gf+=ga;t[a].ga+=gh;
  if(gh>ga){t[h].w++;t[h].pts+=3;t[a].l++}else if(gh<ga){t[a].w++;t[a].pts+=3;t[h].l++}else{t[h].d++;t[a].d++;t[h].pts++;t[a].pts++}},
 finish(user){const s=this.s,m=s.me,fx=this.userFix(),inj=m.inj>0,res=[];
  for(const[h,a]of s.fx[s.md]){let g;if(h===s.club||a===s.club){g=user?(h===s.club?[user.score[0],user.score[1]]:[user.score[1],user.score[0]]):this.simGoals(h,a)}else g=this.simGoals(h,a);
   this.apply(h,a,g[0],g[1]);res.push([h,a,g[0],g[1]])}
  s.res.push(res);
  if(user&&!inj){m.st.apps++;m.st.goals+=user.goals;m.st.ass+=user.ass;m.st.min+=90;m.st.rat.push(user.rating);
   m.form=clamp(m.form+(user.rating-6.5)*3,25,95);m.fatigue=Math.min(100,m.fatigue+20)}
  else if(!inj){m.st.apps++;m.st.min+=90;m.fatigue=Math.min(100,m.fatigue+15)}
  if(m.inj>0)m.inj--;s.md++;s.sess=0;m.fatigue=Math.max(0,m.fatigue-12);m.form+=(55-m.form)*.05;
  m.val=this.value(m);
  let end=null;if(s.md>=MDS)end=this.endSeason();this.offers();this.save();return end},
 offers(){const s=this.s,m=s.me;s.offers=[];
  if(Math.random()<.4){const pool=CLUBS.filter(c=>c.id!==s.club&&c.str<=m.ovr+10&&(s.md===0||s.ids.includes(c.id))),c=pool[RI(0,pool.length-1)];
   if(c){s.offers.push({club:c.id,wage:Math.round(this.value(m)*.9+3),years:RI(2,4)});s.news.unshift('Gerücht: '+c.name+' zeigt Interesse (Spielereignis)')}}},
 accept(i){const s=this.s,o=s.offers[i];if(!o)return;const old=s.club,sq=s.squads[old],meI=sq.indexOf(s.me),nsq=s.squads[o.club];
  const w=nsq.filter(p=>p.role===s.me.role).sort((a,b)=>a.ovr-b.ovr)[0];nsq.splice(nsq.indexOf(w),1,s.me);sq.splice(meI,1,w);
  s.club=o.club;s.contract={years:o.years,wage:o.wage};
  if(!s.ids.includes(o.club)){s.ids=Object.keys(s.lg).map(Number).filter(i=>s.lg[i]===s.lg[o.club]);s.table=this.emptyTable(s.ids);s.fx=this.fixtures(s.ids);s.md=0;s.res=[]}s.offers=[];s.news.unshift('Wechsel zu '+CLUBS[o.club].name);this.save()},
 endSeason(){const s=this.s,m=s.me,tb=Object.entries(s.table).sort((a,b)=>b[1].pts-a[1].pts||(b[1].gf-b[1].ga)-(a[1].gf-a[1].ga)),pos=tb.findIndex(e=>+e[0]===s.club)+1;
  const avg=m.st.rat.length?m.st.rat.reduce((a,b)=>a+b,0)/m.st.rat.length:0;
  const oldLg=s.lg[s.club];
  s.hist.push({season:s.season,lg:LEAGUES[oldLg],club:CLUBS[s.club].name,pos,apps:m.st.apps,goals:m.st.goals,ass:m.st.ass,avg:+avg.toFixed(2),ovr:m.ovr,champ:CLUBS[+tb[0][0]].name});
  const byLg=[0,1,2].map(l=>{const ids=Object.keys(s.lg).map(Number).filter(i=>s.lg[i]===l);
   return l===oldLg?tb.map(e=>+e[0]):ids.map(i=>[i,this.strength(i)+R(-9,9)]).sort((a,b)=>b[1]-a[1]).map(e=>e[0])});
  for(let l=0;l<2;l++){byLg[l].slice(-2).forEach(i=>s.lg[i]=l+1);byLg[l+1].slice(0,2).forEach(i=>s.lg[i]=l)}
  const nl=s.lg[s.club];if(nl<oldLg)s.news.unshift('Aufstieg in die '+LEAGUES[nl]+'!');if(nl>oldLg)s.news.unshift('Abstieg in die '+LEAGUES[nl]);
  m.age++;for(const k of KEYS){if(m.role!=='GK'&&k==='gk')continue;
   if(m.age<=24)m.att[k]=Math.min(m.pot,m.att[k]+Math.random()*1.2);else if(m.age>=31)m.att[k]-=Math.random()*1.5*(k==='pac'?1.5:1)}
  m.ovr=calcOvr(m.att,m.role);m.st={apps:0,goals:0,ass:0,min:0,rat:[],yel:0};
  for(const id in s.squads)for(const p of s.squads[id])if(p.id!=='ME'){p.age++;p.att.pac=clamp(p.att.pac+(p.age>30?-1:p.age<24?1:0),25,95);p.ovr=clamp(p.ovr+(p.age>31?-1:p.age<24?RI(0,2):0),40,90)}
  s.contract.years--;if(s.contract.years<=0){s.contract={years:3,wage:Math.round(this.value(m)*.8+2)};s.news.unshift('Vertrag automatisch verlängert')}
  s.season++;s.md=0;s.ids=Object.keys(s.lg).map(Number).filter(i=>s.lg[i]===s.lg[s.club]);s.table=this.emptyTable(s.ids);s.fx=this.fixtures(s.ids);s.res=[];return s.hist[s.hist.length-1]},
 save(){try{localStorage.setItem(SAVE,JSON.stringify(this.s));return true}catch(e){return false}},
 load(raw){try{const d=JSON.parse(raw||localStorage.getItem(SAVE)||'null');if(!d||d.v!==2||!d.me||!d.squads)return false;this.s=d;return true}catch(e){return false}},
 sorted(){return Object.entries(this.s.table).sort((a,b)=>b[1].pts-a[1].pts||(b[1].gf-b[1].ga)-(a[1].gf-a[1].ga))}};

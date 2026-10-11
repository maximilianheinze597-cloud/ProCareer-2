const PW=105,PH=68,GH=3.66,TS=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
class Match{
constructor(cv,H,A,opt,done){
 this.cv=cv;this.done=done;this.opt=opt;this.T=[H,A];this.keys={};this.inp={x:0,z:0,sprint:false};this.alive=true;
 this.score=[0,0];this.state='ko';this.tmr=1.6;this.t=0;this.half=1;this.lim=[45+RI(1,3),90+RI(1,4)];this.cel=null;this.over=false;
 this.st=[0,1].map(()=>({poss:0,shots:0,on:0,pass:0,ok:0,fouls:0,corners:0,tackles:0,saves:0,yel:0}));
 this.ev=[];this.me={goals:0,ass:0,pass:0,ok:0,tk:0,sh:0,err:0};this.lastKick=null;this.prevKick=null;this.ctl=null;
 const r=this.r=new THREE.WebGLRenderer({canvas:cv,antialias:opt.q>0});
 r.setPixelRatio(Math.min(window.devicePixelRatio||1,opt.q>1?2:1));r.shadowMap.enabled=opt.q>1;
 const sc=this.sc=new THREE.Scene();sc.background=new THREE.Color(0x0a1420);sc.fog=new THREE.Fog(0x0a1420,110,280);
 this.cam=new THREE.PerspectiveCamera(42,1,1,400);this.camT=new THREE.Vector3();
 this.world();this.teams();this.kickoff(1);
 this.onKey=e=>{const d=e.type==='keydown';this.keys[e.code]=d;if(d&&!e.repeat){const a={KeyJ:'pass',KeyK:'through',KeyL:'shoot',KeyU:'tackle',KeyQ:'switch',Space:'shoot'}[e.code];if(a)this.press(a)}if(e.code.startsWith('Arrow')||e.code==='Space')e.preventDefault()};
 addEventListener('keydown',this.onKey);addEventListener('keyup',this.onKey);
 this.onRs=()=>this.resize();addEventListener('resize',this.onRs);this.resize();
 this.last=performance.now();this.loop=this.loop.bind(this);this.raf=requestAnimationFrame(this.loop)}
resize(){const w=innerWidth,h=innerHeight;this.r.setSize(w,h,false);this.cam.aspect=w/h;this.cam.updateProjectionMatrix()}
mat(c,e){return new THREE.MeshStandardMaterial({color:c,roughness:.8,emissive:e||0})}
world(){const sc=this.sc,q=this.opt.q;
 sc.add(new THREE.HemisphereLight(0xcfe3ff,0x1f3a22,.85));
 const dl=new THREE.DirectionalLight(0xffffff,.9);dl.position.set(30,70,25);
 if(q>1){dl.castShadow=true;dl.shadow.mapSize.set(1024,1024);const c=dl.shadow.camera;c.left=-70;c.right=70;c.top=50;c.bottom=-50;c.far=200}sc.add(dl);
 const cv=document.createElement('canvas');cv.width=1050;cv.height=680;const g=cv.getContext('2d');
 for(let i=0;i<14;i++){g.fillStyle=i%2?'#2f8a3c':'#2b7d37';g.fillRect(i*75,0,75,680)}
 g.strokeStyle='#fff';g.lineWidth=4;const S=10,ox=525,oz=340;g.strokeRect(2,2,1046,676);g.beginPath();g.moveTo(ox,0);g.lineTo(ox,680);g.stroke();
 g.beginPath();g.arc(ox,oz,91.5,0,7);g.stroke();for(const sx of[-1,1]){g.strokeRect(sx<0?2:1050-165,oz-201,163,403);g.strokeRect(sx<0?2:1050-55,oz-92,53,183);
  g.beginPath();g.arc(ox+sx*410,oz,3,0,7);g.fill()}
 const tx=new THREE.CanvasTexture(cv);tx.anisotropy=4;
 const p=new THREE.Mesh(new THREE.PlaneGeometry(PW,PH),new THREE.MeshStandardMaterial({map:tx,roughness:1}));p.rotation.x=-Math.PI/2;p.receiveShadow=true;sc.add(p);
 const gr=new THREE.Mesh(new THREE.PlaneGeometry(320,260),this.mat(0x1d4a26));gr.rotation.x=-Math.PI/2;gr.position.y=-.05;sc.add(gr);
 for(const sx of[-1,1]){const m=this.mat(0xffffff);const bar=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,7.32),m);bar.position.set(sx*PW/2,2.44,0);sc.add(bar);
  for(const z of[-GH,GH]){const po=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,2.44),m);po.position.set(sx*PW/2,1.22,z);sc.add(po)}
  const net=new THREE.Mesh(new THREE.BoxGeometry(2,2.44,7.32),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.12}));net.position.set(sx*(PW/2+1),1.22,0);sc.add(net)}
 for(const sz of[-1,1]){const s=new THREE.Mesh(new THREE.BoxGeometry(130,9,12),this.mat(0x1c2a3a));s.position.set(0,4.5,sz*(PH/2+10));sc.add(s)}
 for(const sx of[-1,1]){const s=new THREE.Mesh(new THREE.BoxGeometry(12,9,90),this.mat(0x1c2a3a));s.position.set(sx*(PW/2+12),4.5,0);sc.add(s)}
 if(q>0){const n=q>1?1600:600,im=new THREE.InstancedMesh(new THREE.BoxGeometry(.5,.9,.4),new THREE.MeshBasicMaterial(),n),d=new THREE.Object3D(),col=new THREE.Color();
  for(let i=0;i<n;i++){const side=i%2,u=R(-60,60),row=R(0,4);
   if(side)d.position.set(u,9.2+row*.3,(i%4<2?1:-1)*(PH/2+5+row*1.5));else d.position.set((i%4<2?1:-1)*(PW/2+7+row*1.5),9.2+row*.3,u*.7);
   d.updateMatrix();im.setMatrixAt(i,d.matrix);im.setColorAt(i,col.setHSL(Math.random(),.5,.5))}sc.add(im)}
 for(const[x,z]of[[-62,-44],[62,-44],[-62,44],[62,44]]){const po=new THREE.Mesh(new THREE.CylinderGeometry(.4,.5,28),this.mat(0x555555));po.position.set(x,14,z);sc.add(po);
  const l=new THREE.Mesh(new THREE.BoxGeometry(5,2,.5),new THREE.MeshBasicMaterial({color:0xfffbe0}));l.position.set(x,28,z);sc.add(l)}
 const bc=document.createElement('canvas');bc.width=128;bc.height=64;const bg=bc.getContext('2d');bg.fillStyle='#fff';bg.fillRect(0,0,128,64);bg.fillStyle='#222';for(let i=0;i<14;i++){bg.beginPath();bg.arc((i%7)*20+8,i<7?16:46,7,0,7);bg.fill()}
 this.ball={x:0,y:.11,z:0,vx:0,vy:0,vz:0,owner:null,mesh:new THREE.Mesh(new THREE.SphereGeometry(.22,16,12),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(bc),roughness:.5})),sh:null};
 this.ball.mesh.castShadow=true;sc.add(this.ball.mesh)}
teams(){this.P=[];const SK=[0xf1c9a5,0xe0ac7f,0xc68642,0x8d5524,0x5c3a21],HC=[0x1b1b1b,0x3b2a1a,0x6b4423,0xc9a05a,0x8b1a1a];
 for(let t=0;t<2;t++){const s=t?-1:1,T=this.T[t],kc=new THREE.Color(T.kit),lum=kc.r*.3+kc.g*.59+kc.b*.11,shc=lum>.6?0x1a1a1a:0xf2f2f2;
  T.lineup.forEach((d,i)=>{const gk=d.slotRole==='GK',g=new THREE.Group(),shirt=this.mat(gk?0x22cc66:T.kit),skm=this.mat(SK[RI(0,4)]),shm=this.mat(shc),sock=this.mat(gk?0x111111:T.kit),boot=this.mat(0x111111);
   const grp=(x,y,z,par)=>{const o=new THREE.Group();o.position.set(x,y,z);(par||g).add(o);return o};
   const box=(w,h,dp,m,x,y,z,par)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,dp),m);o.position.set(x,y,z);o.castShadow=this.opt.q>1;(par||g).add(o);return o};
   box(.42,.56,.24,shirt,0,1.26,0);box(.54,.12,.27,shirt,0,1.56,0);box(.44,.26,.27,shm,0,.92,0);box(.09,.08,.09,skm,0,1.66,0);
   const head=grp(0,1.8,0);const hs=new THREE.Mesh(new THREE.SphereGeometry(.15,12,10),skm);head.add(hs);
   const hr=new THREE.Mesh(new THREE.SphereGeometry(.16,12,6,0,Math.PI*2,0,Math.PI/2),this.mat(HC[RI(0,4)]));hr.position.y=.02;head.add(hr);
   const leg=x=>{const h=grp(x,.82,0);box(.17,.38,.19,skm,0,-.19,0,h);const k=grp(0,-.38,0,h);box(.13,.36,.15,sock,0,-.18,0,k);box(.15,.08,.27,boot,0,-.4,.05,k);h.k=k;return h};
   const arm=x=>{const h=grp(x,1.56,0);box(.11,.26,.12,shirt,0,-.13,0,h);const k=grp(0,-.26,0,h);box(.09,.26,.1,skm,0,-.13,0,k);h.k=k;return h};
   const cvn=document.createElement('canvas');cvn.width=cvn.height=64;const cx=cvn.getContext('2d');cx.fillStyle=gk||lum<.6?'#fff':'#111';cx.font='bold 46px sans-serif';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(String(i+1),32,34);
   const np=new THREE.Mesh(new THREE.PlaneGeometry(.32,.32),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cvn),transparent:true}));np.position.set(0,1.28,-.125);np.rotation.y=Math.PI;g.add(np);
   if(this.opt.q<2){const bl=new THREE.Mesh(new THREE.CircleGeometry(.55,12),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.3}));bl.rotation.x=-Math.PI/2;bl.position.y=.03;g.add(bl)}
   g.scale.setScalar(R(.97,1.05)*(gk?1.03:1));
   const pl={t,i,s,role:d.slotRole,gk,hx:gk?s*-49.5:s*(-52.5+d.fx*70),hz:gk?0:-s*d.fz*28,x:0,z:0,vx:0,vz:0,face:s>0?Math.PI/2:-Math.PI/2,
    ovr:d.ovr,att:d.att,me:d.me,id:d.id,name:d.name,stam:1,cool:0,think:R(0,.4),slide:0,ph:0,tcd:0,try:0,dive:0,kt:0,lL:leg(-.11),lR:leg(.11),aL:arm(-.31),aR:arm(.31),head,mesh:g,gz:0};
   if(d.me){const ring=new THREE.Mesh(new THREE.RingGeometry(.7,.85,24),new THREE.MeshBasicMaterial({color:0xffee00,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.05;g.add(ring)}
   this.sc.add(g);this.P.push(pl)})}
 this.mark=new THREE.Mesh(new THREE.ConeGeometry(.3,.6,8),new THREE.MeshBasicMaterial({color:0xffff00}));this.mark.rotation.x=Math.PI;this.sc.add(this.mark)}
msg(t,ms){const e=document.getElementById('msg');e.textContent=t;clearTimeout(this.mt);if(ms)this.mt=setTimeout(()=>{e.textContent=''},ms)}
fmt(){let m=Math.floor(this.t/3);if(this.half===1&&m>45)return'45+'+(m-45)+"'";if(m>90)return'90+'+(m-90)+"'";return m+"'"}
kickoff(t){for(const p of this.P){p.x=p.hx;p.z=p.hz;p.vx=p.vz=0;if(!p.gk&&p.x*p.s>-1.5)p.x=-1.5*p.s;p.slide=0;p.dive=0}
 const b=this.ball;b.x=b.z=0;b.y=.11;b.vx=b.vy=b.vz=0;const tk=this.P.filter(p=>p.t===t&&p.role==='FWD')[0]||this.P.find(p=>p.t===t&&!p.gk);
 tk.x=-.8*tk.s;tk.z=0;b.owner=tk;this.state='ko';this.tmr=1.4;this.cel=null;this.msg('')}
press(a){if(this.state!=='play'&&a!=='switch')return;Sfx.init();const p=this.ctl;
 if(a==='switch'){const c=this.P.filter(q=>q.t===0&&!q.gk&&q!==p).sort((x,y)=>TS(x,this.ball)-TS(y,this.ball))[0];if(c)this.ctl=c;return}
 if(!p)return;const b=this.ball,s=p.s,dx=this.inp.x,dz=this.inp.z,has=b.owner===p;
 if(a==='tackle'){p.slide=.4;const f=Math.hypot(dx,dz)>.2?[dx,dz]:[Math.cos(p.face2||0),Math.sin(p.face2||0)];return}
 if(!has)return;
 if(a==='shoot'){this.shoot(p,clamp(dz*3,-3.2,3.2))}
 if(a==='pass'||a==='through'){const dir=Math.hypot(dx,dz)>.2?Math.atan2(dz,dx):(s>0?0:Math.PI);let best=null,bs=-1e9;
  for(const m of this.P){if(m.t!==p.t||m===p||m.gk)continue;const d=TS(m,p),ang=Math.abs(Math.atan2(Math.sin(Math.atan2(m.z-p.z,m.x-p.x)-dir),Math.cos(Math.atan2(m.z-p.z,m.x-p.x)-dir)));
   if(ang>.9||d<4)continue;const sc=-ang*20-d*.15+(a==='through'?(m.x-p.x)*s*.4:0);if(sc>bs){bs=sc;best=m}}
  if(best)this.pass(p,best,a==='through')}}
kick(p,tx,tz,sp,lift,spread,type){const b=this.ball;let a=Math.atan2(tz-p.z,tx-p.x)+(Math.random()-.5)*2*spread;const d=Math.hypot(tx-p.x,tz-p.z);
 p.kt=.25;b.owner=null;b.vx=Math.cos(a)*sp;b.vz=Math.sin(a)*sp;b.vy=sp*lift;b.y=Math.max(b.y,.25);p.cool=.45;
 this.prevKick=this.lastKick;this.lastKick={p,type,t:p.t,time:this.t};Sfx.kick();return{a,d}}
pass(p,m,thr){const d=TS(m,p),sp=clamp(d*1.45+9,11,thr?27:24),lead=d/sp*.7,tx=m.x+m.vx*lead+(thr?m.s*7:0),tz=m.z+m.vz*lead;
 const press=this.nearOpp(p),sp2=(1-p.att.pas/100)*.1+(press<3?.04:0)+(1-p.stam)*.05;
 this.kick(p,tx,tz,sp,d>25?.18:.02,sp2,'pass');this.st[p.t].pass++;if(p.me)this.me.pass++}
shoot(p,aimZ){const s=p.s,gx=s*PW/2,dist=Math.hypot(gx-p.x,p.z),pr=this.nearOpp(p);
 const spread=(1-p.att.sho/100)*.16+(pr<3?.04:0)+(1-p.stam)*.06+dist*.0015,sp=clamp(20+p.att.sho*.12+(dist>20?4:0),22,34);
 const r=this.kick(p,gx,aimZ+(Math.random()-.5)*2,sp,dist>16?.2:.08,spread,'shot');this.st[p.t].shots++;if(p.me)this.me.sh++;
 const zl=p.z+Math.tan(r.a)*(gx-p.x)*(Math.cos(r.a)*s>0?1:1);if(Math.abs(Math.sin(r.a))*0+Math.abs(zl)<GH+.4&&Math.cos(r.a)*s>0){this.st[p.t].on++}}
nearOpp(p){let m=99;for(const q of this.P)if(q.t!==p.t)m=Math.min(m,TS(p,q));return m}
offLine(t){const s=t?-1:1,a=this.P.filter(q=>q.t!==t).map(q=>q.x*s).sort((x,y)=>y-x);return Math.max(a[1]||0,this.ball.x*s,0)}
aiTarget(p){const b=this.ball,s=p.s,t=p.t,own=b.owner&&b.owner.t===t,tc=this.T[t].tac,lh=(tc.style-1)*5+(tc.line||0);
 if(p.gk){const cx=-s*(PW/2-1.8);let z=clamp(b.z*.28,-3.2,3.2),x=cx;const dB=Math.abs(b.x-cx);
  if(!b.owner&&dB<14&&Math.abs(b.vx)<8)x=cx+s*clamp(14-dB,0,6)*.35;
  if(p.gz!==0&&this.state==='play')z=p.gz;return{x,z}}
 let x=p.hx+b.x*.35+s*lh,z=p.hz*(own?1.15:.8)+b.z*.22;
 if(own){if(p.role==='FWD'){x+=s*12;z+=Math.sin(this.t*.7+p.i)*7}else if(p.role==='MID'){x+=s*6;if(Math.abs(p.hz)>18)x+=s*5}else x+=s*2}
 else{x-=s*3;if(b.owner&&p.role!=='FWD'){const gx=-s*PW/2;x=x*.6+(gx+(b.x-gx)*.55)*.4;z=z*.6+b.z*.4}}
 x=clamp(x*s,-50,50)*s;if(p.role==='DEF'&&x*s>15+lh)x=s*(15+lh);if(p.role==='FWD'&&x*s<-10)x=-10*s;
 if(p.role!=='DEF'&&(own||!b.owner)){const ol=this.offLine(t);if(x*s>ol-.5)x=s*(ol-.5)}
 return{x,z:clamp(z,-31,31)}}
ownerAI(p,dt){p.think-=dt;if(p.think>0)return;p.think=.35-p.att.pas*.001;const s=p.s,gx=s*PW/2,dg=Math.hypot(gx-p.x,p.z),pr=this.nearOpp(p);
 if(p.gk){const m=this.P.filter(q=>q.t===p.t&&!q.gk).sort((a,b)=>(b.x-a.x)*s+R(-6,6))[0];this.pass(p,m,false);return}
 if(dg<22&&Math.random()<.4+p.att.sho/500){this.shoot(p,R(-2.8,2.8));return}
 let best=null,bs=-1e9;for(const m of this.P){if(m.t!==p.t||m===p||m.gk)continue;const d=TS(m,p);if(d<6||d>38)continue;
  const sc=(m.x-p.x)*s*.6-Math.max(0,8-this.nearOpp(m))*3-d*.15+R(0,2);if((m.x-p.x)*s<-12&&pr>4)continue;if(sc>bs){bs=sc;best=m}}
 if(best&&(pr<3.8||bs>3)){this.pass(p,best,best.x*s>p.x*s+10&&Math.random()<.3);return}
 p.drib=true}
update(dt){const b=this.ball,P=this.P;if(this.state==='end'||this.state==='half'){this.tmr-=dt;if(this.state==='half'&&this.tmr<=0){this.half=2;this.t=135;this.kickoff(1);Sfx.whistle()}return}
 if(this.state==='ko'){this.tmr-=dt;if(this.tmr<=0){this.state='play';Sfx.whistle()}}
 if(this.state==='goal'){this.celebrate(dt);return}
 if(this.state==='play'){this.t+=dt;if(b.owner)this.st[b.owner.t].poss+=dt;
  const m=this.t/3;if(m>=this.lim[this.half-1]){if(this.half===1){this.state='half';this.tmr=3;Sfx.whistle();this.msg('Halbzeit',2800);return}this.finish();return}}
 const user=this.T[0].user!==false;
 if(user){const c=this.ctl;if(b.owner&&b.owner.t===0&&!b.owner.gk)this.ctl=b.owner;else if(!c||c.gk||(TS(c,b)>6&&this.P.some(q=>q.t===0&&!q.gk&&TS(q,b)<TS(c,b)-3))){this.ctl=P.filter(q=>q.t===0&&!q.gk).sort((x,y)=>TS(x,b)-TS(y,b))[0]}}
 const chasers=[0,1].map(t=>P.filter(q=>q.t===t&&!q.gk&&q!==this.ctl).sort((x,y)=>TS(x,b)-TS(y,b)));
 for(const p of P){p.cool-=dt;p.tcd-=dt;p.try-=dt;p.dive-=dt;let tx,tz,spd=5.5+p.att.pac*.035,run=.85;const own=b.owner===p;
  if(p===this.ctl&&this.T[0].user!==false){const kx=(this.keys.KeyD||this.keys.ArrowRight?1:0)-(this.keys.KeyA||this.keys.ArrowLeft?1:0),kz=(this.keys.KeyS||this.keys.ArrowDown?1:0)-(this.keys.KeyW||this.keys.ArrowUp?1:0);
   let ix=this.inp.x+kx,iz=this.inp.z+kz;const l=Math.hypot(ix,iz);if(l>1){ix/=l;iz/=l}this.inp.dx=ix;this.inp.dz=iz;
   const sp=this.keys.ShiftLeft||this.keys.ShiftRight||this.inp.sprint;tx=p.x+ix*10;tz=p.z+iz*10;run=l<.1?0:(sp?1.3:1)}
  else if(this.state==='ko'&&!own){const a=this.aiTarget(p);tx=a.x;tz=a.z;run=.6}
  else{const a=this.aiTarget(p);tx=a.x;tz=a.z;
   if(own&&this.state==='ko'){tx=p.x;tz=p.z;run=0}
   else if(own&&this.state==='play'){this.ownerAI(p,dt);if(p.gk){tx=p.x;tz=p.z;run=0}else{tx=p.s*PW/2;tz=0;let rx=0,rz=0;for(const q of P)if(q.t!==p.t){const d=TS(p,q);if(d<7&&d>.1){rx+=(p.x-q.x)/d*(7-d);rz+=(p.z-q.z)/d*(7-d)}}tx+=rx*3;tz=clamp(rz*3,-30,30);run=.95}}
   else if(!p.gk&&!own){const cs=chasers[p.t],opp=b.owner&&b.owner.t!==p.t,loose=!b.owner,pi=cs.indexOf(p),press=this.T[p.t].tac.press;
    if((loose&&pi<1)||(opp&&(pi<1||(pi<2&&press>.6&&TS(p,b)<14)))){tx=b.x+b.vx*.25;tz=b.z+b.vz*.25;run=1.1}}
   if(!p.gk&&!own&&run<1){const d=Math.hypot(tx-p.x,tz-p.z);run=d<2?.3:d<8?.7:.9}}
  if(p.gk&&p.gz!==0&&this.state==='play'){run=1.1}
  let dx=tx-p.x,dz=tz-p.z;const d=Math.hypot(dx,dz)||1;let want=Math.min(1,d/1.5)*run*spd*(.7+.3*p.stam);
  if(p.slide>0){p.slide-=dt;want=spd*1.9;}
  for(const q of P)if(q!==p&&q.t===p.t){const e=TS(p,q);if(e<3&&e>.01){dx+=(p.x-q.x)/e*(3-e)*2;dz+=(p.z-q.z)/e*(3-e)*2}}
  const dd=Math.hypot(dx,dz)||1;p.vx+=((dx/dd)*want-p.vx)*Math.min(1,7*dt);p.vz+=((dz/dd)*want-p.vz)*Math.min(1,7*dt);
  p.x=clamp(p.x+p.vx*dt,-PW/2-4,PW/2+4);p.z=clamp(p.z+p.vz*dt,-PH/2-3,PH/2+3);
  p.stam=clamp(p.stam+(run>1?-.012:.004)*dt*(1+(1-p.att.pac/100)),.35,1);
  const sp=Math.hypot(p.vx,p.vz);if(sp>.6){const f=Math.atan2(p.vx,p.vz);let da=f-p.face;da=Math.atan2(Math.sin(da),Math.cos(da));p.face+=da*Math.min(1,10*dt);p.face2=Math.atan2(p.vz,p.vx)}}
 this.gkLogic(dt);this.physics(dt);this.contest(dt)}
gkLogic(dt){const b=this.ball;for(const g of this.P){if(!g.gk)continue;const s=g.s;g.gz=0;if(b.owner||this.state!=='play')continue;
  const gx=-s*PW/2,toward=b.vx*(-s)>3,tt=(gx-b.x)/(b.vx||1e-6);
  if(toward&&tt>0&&tt<1.1){const zp=b.z+b.vz*tt,yp=b.y+b.vy*tt-4.9*tt*tt;if(Math.abs(zp)<GH+.8&&yp<2.7){g.gz=clamp(zp,-GH,GH);if(!g.dive||g.dive<-1)g.dive=0}}
  const d3=Math.hypot(b.x-g.x,b.z-g.z);if(d3<1.8&&b.y<2.6&&g.cool<=0&&(toward||Math.hypot(b.vx,b.vz)<8)){
   const sp=Math.hypot(b.vx,b.vz),ch=clamp(.55+g.att.gk/200-sp/110,.3,.95);g.cool=.6;
   if(Math.random()<ch){this.st[g.t].saves++;g.dive=.7;g.dz=Math.sign(b.z-g.z)||1;
    if(sp<17||Math.random()<.4){b.owner=g;b.vx=b.vy=b.vz=0;g.think=.8}else{b.vx=-b.vx*.35+s*2;b.vz=(b.z-g.z)*5+R(-3,3);b.vy=R(2,5);this.lastKick={p:g,type:'save',t:g.t,time:this.t};Sfx.kick()}}}}}
physics(dt){const b=this.ball;
 if(b.owner){const o=b.owner,f=o.face;if(this.state==='ko'){b.x=o.x+Math.sin(f)*.6;b.z=o.z+Math.cos(f)*.6}else{b.x+=((o.x+Math.sin(f)*.7)-b.x)*Math.min(1,14*dt);b.z+=((o.z+Math.cos(f)*.7)-b.z)*Math.min(1,14*dt)}
  b.y=.22;b.vx=o.vx;b.vz=o.vz;b.vy=0;
  if(this.state==='play'&&!o.gk){o.lt=(o.lt||0)-dt;if(o.lt<=0){o.lt=.5;const sp=Math.hypot(o.vx,o.vz);if(sp>7&&this.nearOpp(o)<3&&Math.random()<.1-o.att.dri/1500){b.owner=null;b.vx=o.vx*1.4;b.vz=o.vz*1.4;o.cool=.5;if(o.me)this.me.err++}}}}
 else{b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;b.vy-=9.8*dt;
  if(b.y<.22){b.y=.22;if(Math.abs(b.vy)>1.5)b.vy=-b.vy*.55;else b.vy=0;const f=Math.exp(-.7*dt);b.vx*=f;b.vz*=f}else{const f=Math.exp(-.08*dt);b.vx*=f;b.vz*=f}
  for(const z of[-GH,GH])if(Math.abs(b.x)>PW/2-.2&&Math.abs(b.x)<PW/2+.4&&Math.abs(b.z-z)<.3&&b.y<2.5){b.vx*=-.55;b.vz=Math.sign(b.z-z)*3;Sfx.post()}
  if(Math.abs(b.x)>PW/2-.2&&Math.abs(b.x)<PW/2+.4&&Math.abs(b.z)<GH&&b.y>2.3&&b.y<2.7){b.vy=-Math.abs(b.vy)*.5;b.vx*=-.5;Sfx.post()}
  if(this.state==='play')this.outCheck()}
 if(!isFinite(b.x+b.z+b.y)){b.x=b.z=0;b.y=.22;b.vx=b.vy=b.vz=0}}
outCheck(){const b=this.ball;if(Math.abs(b.x)>PW/2&&Math.abs(b.z)<GH&&b.y<2.44){this.goal(b.x>0?0:1);return}
 const lk=this.lastKick?this.lastKick.t:0;
 if(Math.abs(b.z)>PH/2+.3){this.restart(1-lk,clamp(b.x,-50,50),Math.sign(b.z)*(PH/2-.5),'Einwurf');return}
 if(Math.abs(b.x)>PW/2+.3){const sx=Math.sign(b.x),def=sx>0?1:0;
  if(lk===def){this.st[1-def].corners++;this.restart(1-def,sx*(PW/2-1),Math.sign(b.z||1)*(PH/2-1),'Ecke')}else this.restart(def,sx*(PW/2-6),0,'Abstoß',true)}}
restart(t,x,z,label,gk){const b=this.ball;const c=this.P.filter(p=>p.t===t&&(gk?p.gk:!p.gk)).sort((a,c)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(c.x-x,c.z-z))[0];
 c.x=x-Math.sign(x||1)*.3*(label==='Ecke'?-1:1);c.z=z;c.vx=c.vz=0;b.x=x;b.z=z;b.y=.22;b.vx=b.vy=b.vz=0;b.owner=c;c.face=Math.atan2(-x,-z);
 this.state='ko';this.tmr=1.3;this.msg(label,1200)}
goal(t){if(this.state!=='play')return;const lk=this.lastKick;let sc=lk&&lk.p&&lk.type!=='save'?lk.p:this.P.find(p=>p.t===t&&p.role==='FWD');
 if(sc.t!==t){sc=this.P.filter(p=>p.t===t&&!p.gk).sort((a,b)=>TS(a,this.ball)-TS(b,this.ball))[0]}
 this.score[t]++;const pk=this.prevKick,as=pk&&pk.t===t&&pk.p!==sc&&lk.time-pk.time<6&&pk.type==='pass'?pk.p:null;
 const m=Math.floor(this.t/3),late=m>=80&&Math.abs(this.score[0]-this.score[1])<=1;
 this.ev.push({m,t,name:sc.name,ass:as?as.name:null});if(sc.me)this.me.goals++;if(as&&as.me)this.me.ass++;
 this.state='goal';this.tmr=late?6.5:4.5;this.cel={sc,t,late,t0:0};this.ball.owner=null;this.ball.vx*=.2;this.ball.vz*=.2;
 this.msg(late&&this.score[t]>=this.score[1-t]?'SIEGTREFFER! ':'TOR! ',0);document.getElementById('msg').textContent+=sc.name;Sfx.cheer();Sfx.whistle()}
celebrate(dt){const c=this.cel,b=this.ball;c.t0+=dt;this.tmr-=dt;b.x+=b.vx*dt;b.z+=b.vz*dt;b.vx*=.97;b.vz*=.97;b.y=.22;
 const s=c.sc.s,cx=s*(PW/2-3),cz=Math.sign(c.sc.z||1)*(PH/2-4);
 for(const p of this.P){let tx=p.x,tz=p.z,want=0;
  if(p===c.sc){if(c.t0<2){tx=cx;tz=cz;want=7}else want=0}
  else if(p.t===c.t&&!p.gk){const k=p.i%5;tx=c.sc.x+Math.cos(k*1.3)*2.2;tz=c.sc.z+Math.sin(k*1.3)*2.2;want=c.t0>.8?7.5:0}
  else if(!p.gk){tx=p.hx;tz=p.hz;want=2.2}
  const dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz);if(d>.6){p.vx=dx/d*want;p.vz=dz/d*want}else p.vx=p.vz=0;p.x+=p.vx*dt;p.z+=p.vz*dt;
  if(Math.hypot(p.vx,p.vz)>.5)p.face=Math.atan2(p.vx,p.vz)}
 if(this.tmr<=0){const conc=1-c.t;this.cel=null;this.kickoff(conc)}}
contest(dt){const b=this.ball;if(this.state!=='play')return;const o=b.owner;
 if(o&&!o.gk){for(const q of this.P){if(q.t===o.t||q.gk||q.tcd>0)continue;if(TS(q,o)<1.3){q.tcd=.35;const ch=.16+(q.att.def-o.att.dri)/260+(q.slide>0?.22:0)+(this.T[q.t].tac.press-.5)*.1;
   if(Math.random()<ch){b.owner=q;this.st[q.t].tackles++;if(q.me)this.me.tk++;if(o.me)this.me.err++;this.lastKick={p:q,type:'tackle',t:q.t,time:this.t};o.cool=.5}
   else if(Math.random()<(q.slide>0?.22:.07)){this.st[q.t].fouls++;let txt='Foul';if(Math.random()<.14){this.st[q.t].yel++;txt='Gelbe Karte';this.ev.push({m:Math.floor(this.t/3),card:1,t:q.t,name:q.name})}
    this.restart(o.t,o.x,o.z,txt);return}}}}
 if(!o)for(const p of this.P){if(p.cool>0||p.try>0||p.gk&&b.y>2.6)continue;const d=Math.hypot(p.x-b.x,p.z-b.z);if(d>1.15||b.y>(p.gk?2.4:1.2))continue;
  const sp=Math.hypot(b.vx,b.vz),ch=clamp(.92-sp/42-(this.nearOpp(p)<2?.12:0)+p.att.dri/500,.2,.96);
  if(Math.random()<ch){b.owner=p;const l=this.lastKick;if(l&&l.type==='pass'&&l.t===p.t&&l.p!==p){this.st[p.t].ok++;if(l.p.me)this.me.ok++}else if(l&&l.type==='pass'&&l.t!==p.t){if(l.p.me)this.me.err++}this.lastKick={p,type:'ctl',t:p.t,time:this.t};break}
  else{p.try=.25;b.vx=b.vx*.4+p.vx*.7+R(-2,2);b.vz=b.vz*.4+p.vz*.7+R(-2,2);b.vy=R(0,2)}}}
anim(p,t){const sp=Math.hypot(p.vx,p.vz),m=p.mesh,k=Math.min(1,sp/5),dt=this.dt||1/60;p.ph+=sp*3.9*dt;const sw=Math.sin(p.ph)*.9*k;
 m.position.set(p.x,0,p.z);m.rotation.set(0,p.face,0);
 p.lL.rotation.x=sw;p.lR.rotation.x=-sw;p.lL.k.rotation.x=Math.max(0,-sw)*1.2;p.lR.k.rotation.x=Math.max(0,sw)*1.2;
 p.aL.rotation.x=-sw*.8;p.aR.rotation.x=sw*.8;p.aL.k.rotation.x=p.aR.k.rotation.x=-.5*k;p.head.rotation.x=0;
 if(p.kt>0){p.kt-=dt;p.lR.rotation.x=-1.3*Math.min(1,p.kt/.15);p.lR.k.rotation.x=0}
 if(p.slide>0){m.rotation.x=-1.2;m.position.y=.35;p.lL.rotation.x=-1.3}
 if(p.gk&&p.dive>0){m.rotation.z=(p.dz||1)*1.2;m.position.y=.5;p.aL.rotation.x=p.aR.rotation.x=-3}
 const c=this.cel;
 if(c&&this.state==='goal'){if(p.t===c.t&&!p.gk&&(p===c.sc?c.t0>2:c.t0>1.2)){p.aL.rotation.x=p.aR.rotation.x=-3;m.position.y=Math.abs(Math.sin(t*7+p.i))*.35}
  else if(p.t!==c.t){p.head.rotation.x=.7;p.aL.rotation.x=p.aR.rotation.x=.2}}}
cam3(dt){const b=this.ball,c=this.cel&&this.state==='goal'?this.cel.sc:null,cam=this.cam;let px,py,pz,lx,lz;
 if(c){px=c.x+7;py=5;pz=c.z+10;lx=c.x;lz=c.z}else{px=b.x*.75;py=32;pz=b.z*.5+40;lx=b.x*.85;lz=b.z*.5}
 cam.position.x+=(px-cam.position.x)*Math.min(1,3*dt);cam.position.y+=(py-cam.position.y)*Math.min(1,3*dt);cam.position.z+=(pz-cam.position.z)*Math.min(1,3*dt);
 this.camT.x+=(lx-this.camT.x)*Math.min(1,4*dt);this.camT.z+=(lz-this.camT.z)*Math.min(1,4*dt);cam.lookAt(this.camT.x,c?1.2:0,this.camT.z)}
loop(now){if(!this.alive)return;this.raf=requestAnimationFrame(this.loop);const dt=Math.min(.05,(now-this.last)/1000);this.last=now;this.dt=dt;this.fa=(this.fa||dt)*.95+dt*.05;this.tt=(this.tt||0)+dt;if(!this.lowDone&&this.tt>8&&this.fa>.036){this.lowDone=1;this.r.setPixelRatio(1)}
 try{this.update(dt)}catch(e){console.error(e);this.fail(e);return}
 for(const p of this.P)this.anim(p,now/1000);const b=this.ball;b.mesh.position.set(b.x,b.y,b.z);b.mesh.rotation.x+=b.vz*dt*3;b.mesh.rotation.z-=b.vx*dt*3;
 if(this.ctl){this.mark.visible=true;this.mark.position.set(this.ctl.x,2.5,this.ctl.z)}else this.mark.visible=false;
 this.cam3(dt);this.r.render(this.sc,this.cam);
 const ab=n=>{const w=n.split(' ');return(w[1]||w[0]).slice(0,4).toUpperCase()};document.getElementById('sc').textContent=ab(this.T[0].club.name)+' '+this.score[0]+' : '+this.score[1]+' '+ab(this.T[1].club.name);
 document.getElementById('tm').textContent=this.fmt()}
fail(e){const d=document.getElementById('err');d.hidden=false;d.textContent='Fehler in der Match-Engine: '+e.message}
finish(){if(this.over)return;this.over=true;this.state='end';Sfx.whistle();const s=this.st,tot=s[0].poss+s[1].poss||1,m=this.me;
 let rat=6+m.goals*1+m.ass*.6+(m.ok-(m.pass-m.ok))*.03+m.tk*.12-m.err*.1+(this.score[0]>this.score[1]?.3:this.score[0]<this.score[1]?-.3:0);
 const res={score:this.score.slice(),goals:m.goals,ass:m.ass,rating:+clamp(rat,3,10).toFixed(1),ev:this.ev,
  stats:s.map((x,i)=>({...x,poss:Math.round(x.poss/tot*100)}))};setTimeout(()=>this.done(res),600)}
dispose(){this.alive=false;cancelAnimationFrame(this.raf);removeEventListener('keydown',this.onKey);removeEventListener('keyup',this.onKey);removeEventListener('resize',this.onRs);
 this.sc.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(m.map)m.map.dispose();m.dispose()})});
 this.r.dispose();try{this.r.forceContextLoss()}catch(e){}}}

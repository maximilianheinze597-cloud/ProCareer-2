const Sfx={ctx:null,vol:.5,on:true,
 init(){try{if(!this.ctx)this.ctx=new(window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume()}catch(e){this.ctx=null}},
 tone(f,d,type,g){if(!this.on||!this.ctx)return;const c=this.ctx,o=c.createOscillator(),a=c.createGain();o.type=type||'sine';o.frequency.value=f;a.gain.value=(g||.2)*this.vol;
  o.connect(a);a.connect(c.destination);o.start();a.gain.exponentialRampToValueAtTime(.0001,c.currentTime+d);o.stop(c.currentTime+d)},
 noise(d,g){if(!this.on||!this.ctx)return;const c=this.ctx,n=c.sampleRate*d,b=c.createBuffer(1,n,c.sampleRate),x=b.getChannelData(0);
  for(let i=0;i<n;i++)x[i]=(Math.random()*2-1)*(1-i/n);const s=c.createBufferSource(),f=c.createBiquadFilter(),a=c.createGain();
  s.buffer=b;f.type='bandpass';f.frequency.value=900;a.gain.value=(g||.3)*this.vol;s.connect(f);f.connect(a);a.connect(c.destination);s.start()},
 whistle(){this.tone(2800,.6,'sine',.25)},kick(){this.tone(130,.09,'triangle',.45)},cheer(){this.noise(2.5,.5)},post(){this.tone(900,.2,'square',.2)}};

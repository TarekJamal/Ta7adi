const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const P={
quran:'<path d="M12 6c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13c-3-.5-6 0-8 1.5z"/><path d="M12 6v13"/>',
seerah:'<path d="M4 20v-7h16v7M7 13c0-3 2-5 5-7 3 2 5 4 5 7M12 3v3M3 20h18"/>',
prophets:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/><path d="M17 5l.7 1.6 1.6.7-1.6.7L17 9.6l-.7-1.6-1.6-.7 1.6-.7z"/>',
companions:'<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
history:'<path d="M3 20h18M5 20V10M9 20V10M15 20V10M19 20V10M3 10l9-6 9 6z"/>',
general:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
all:'<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="9" cy="15" r="1"/><circle cx="15" cy="15" r="1"/>',
back:'<path d="M9 5l7 7-7 7"/>',
home:'<path d="M4 11l8-7 8 7M6 10v10h12V10"/>',
sound:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
mute:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>',
flame:'<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 13v4M8 20h8M10 17h4"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
image:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.5"/><path d="M4 18l5-5 4 4 3-3 4 4"/>'};
const ic=(k,c='')=>`<svg class="ic ${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[k]||''}</svg>`;
const LOGO='<svg viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="12" fill="#2bb3a3"/><path d="M33 29a11 11 0 1 1-12-17 9 9 0 0 0 12 17z" fill="#10203a"/><path d="M33 12l1.3 3 3 1.3-3 1.3L33 21l-1.3-3.4-3-1.3 3-1.3z" fill="#f2b84b"/></svg>';
const avatar=n=>{let h=0;for(const c of n)h=(h*31+c.charCodeAt(0))%360;return `<span class="av" style="background:hsl(${h} 55% 42%)">${[...n][0]}</span>`};
document.body.insertAdjacentHTML('afterbegin','<div class="blobs"><i></i><i></i><i></i></div>');

const SFX={muted:localStorage.mute==='1',ctx:null,
 tone(f,t,d,type='sine',v=.15){if(this.muted)return;try{
  const c=this.ctx=this.ctx||new(window.AudioContext||window.webkitAudioContext)();if(c.state==='suspended')c.resume();
  const o=c.createOscillator(),g=c.createGain(),s=c.currentTime+t;o.type=type;o.frequency.value=f;
  g.gain.setValueAtTime(v,s);g.gain.exponentialRampToValueAtTime(.001,s+d);o.connect(g);g.connect(c.destination);o.start(s);o.stop(s+d)}catch{}},
 play(n){const T=(...a)=>this.tone(...a);({
  click:()=>T(520,0,.06,'triangle',.1),
  tick:()=>T(880,0,.07,'square',.05),
  tock:()=>T(520,0,.09,'square',.05),
  good:()=>{[784,988,1319].forEach((f,i)=>T(f,i*.09,.5,'triangle',.16));this.clap(.9)},
  bad:()=>{T(110,0,.55,'sawtooth',.14);T(100,.05,.5,'square',.07)},
  win:()=>{[523,659,784,1047,784,1047,1319].forEach((f,i)=>T(f,i*.14,.45,'triangle',.16));this.clap(2.4)}}[n]||(()=>{}))()},
 clap(d){if(this.muted)return;try{const c=this.ctx=this.ctx||new(window.AudioContext||window.webkitAudioContext)();if(c.state==='suspended')c.resume();
  const n=Math.floor(d*22);for(let i=0;i<n;i++){const t=c.currentTime+Math.random()*d,b=c.createBuffer(1,2205,44100),a=b.getChannelData(0);
   for(let j=0;j<a.length;j++)a[j]=(Math.random()*2-1)*(1-j/a.length);
   const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=b;f.type='bandpass';f.frequency.value=1200+Math.random()*1800;
   g.gain.setValueAtTime(.12*(1-i/n*.6),t);s.connect(f);f.connect(g);g.connect(c.destination);s.start(t)}}catch{}},
 toggle(){this.muted=!this.muted;localStorage.mute=this.muted?'1':'0';const b=document.getElementById('mu');if(b)b.innerHTML=ic(this.muted?'mute':'sound')}};
document.addEventListener('click',e=>{const t=e.target.closest('button,a.btn,.card');if(t&&!t.classList.contains('opt'))SFX.play('click')});

function back(){history.length>1?history.back():location.hash='#/'}
function floatXP(el,txt){if(RM||!el)return;const r=el.getBoundingClientRect(),s=document.createElement('span');s.className='fxp';s.textContent=txt+' XP';s.style.left=(r.left+r.width/2-30)+'px';s.style.top=r.top+'px';document.body.appendChild(s);setTimeout(()=>s.remove(),1000)}
function burst(){if(RM||!window.confetti)return;const C=['#f2b84b','#ffd76a','#fff3c4','#2bb3a3','#f3e9d2'],end=Date.now()+2800;
 confetti({particleCount:150,spread:100,origin:{y:.6},colors:C,scalar:1.1});
 (function f(){confetti({particleCount:6,angle:90,spread:130,startVelocity:22,origin:{x:Math.random(),y:-.1},colors:C,ticks:260});if(Date.now()<end)requestAnimationFrame(f)})()}
function shakeScreen(el){if(el)el.classList.add('shake');if(!RM){const h=document.documentElement;h.classList.add('shk');setTimeout(()=>h.classList.remove('shk'),500);navigator.vibrate&&navigator.vibrate(200)}}
const media=q=>!q.media?'':q.kind==='audio'?`<audio class="qm" controls autoplay src="${esc(q.media)}"></audio>`:q.kind==='video'?`<video class="qm" controls playsinline src="${esc(q.media)}"></video>`:`<img class="qm" src="${esc(q.media)}" alt="صورة السؤال">`;

async function makeCard(){
  const r=G.res||{},W=1080,H=1350,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  try{await document.fonts.load('900 80px Cairo')}catch{}
  const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#10203a');g.addColorStop(1,'#1a3358');x.fillStyle=g;x.fillRect(0,0,W,H);
  x.fillStyle='#2bb3a355';x.beginPath();x.arc(W,0,420,0,7);x.fill();x.fillStyle='#f2b84b33';x.beginPath();x.arc(0,H,380,0,7);x.fill();
  x.textAlign='center';
  const T=(t,y,s,col='#f3e9d2',w=700,d='rtl')=>{x.direction=d;x.font=`${w} ${s}px Cairo,sans-serif`;x.fillStyle=col;x.fillText(t,W/2,y)};
  T('تحدي المعرفة',150,84,'#f2b84b',900);
  T(user?user.username:'لاعب',290,56);
  T(`${r.correct||0} / ${r.total||0}`,560,230,'#f2b84b',900,'ltr');
  T('إجابات صحيحة',650,52);
  if(user)T(`${rank(lvl(user.xp))} · المستوى ${lvl(user.xp)}  ·  ${user.xp} XP`,760,54,'#2bb3a3',900);
  T('هل تستطيع التفوق عليّ؟',890,60,'#f3e9d2',900);
  if(window.QRCode){const im=new Image();im.src=await QRCode.toDataURL(location.origin,{margin:1,width:260,color:{dark:'#10203a',light:'#f3e9d2'}});await im.decode();
    x.fillStyle='#f3e9d2';x.fillRect(W/2-150,950,300,300);x.drawImage(im,W/2-130,970,260,260)}
  T(location.host,1310,40,'#f3e9d2aa',700,'ltr');
  const url=c.toDataURL('image/png'),o=document.createElement('div');o.className='ov';
  o.innerHTML=`<img src="${url}" alt="بطاقة النتيجة"><div><a class="btn" download="tahaddi.png" href="${url}">تحميل الصورة</a><button class="btn alt" id="shr">مشاركة</button><button class="btn alt" id="cl">إغلاق</button></div>`;
  document.body.appendChild(o);o.querySelector('#cl').onclick=()=>o.remove();
  o.querySelector('#shr').onclick=async()=>{const b=await new Promise(r=>c.toBlob(r)),f=new File([b],'tahaddi.png',{type:'image/png'});
    navigator.canShare&&navigator.canShare({files:[f]})?navigator.share({files:[f],text:location.origin}).catch(()=>{}):alert('حمّل الصورة وشاركها يدوياً')};
}

const RANKS=[[1,'مبتدئ'],[3,'متعلّم'],[5,'مجتهد'],[8,'فطِن'],[12,'باحث'],[17,'عالِم'],[23,'علّامة']];
const rank=l=>RANKS.filter(r=>l>=r[0]).pop()[1];
const DNAME=['','سهل','متوسط','صعب'];
let DIF=localStorage.dif||'all';
const setDif=v=>{DIF=v;localStorage.dif=v;home()};
const difBar=()=>`<div class="chips" role="group" aria-label="الصعوبة">${[['all','كل المستويات'],[1,'سهل'],[2,'متوسط'],[3,'صعب']].map(([v,n])=>`<button class="chip2${DIF==v?' on':''}" onclick="setDif('${v}')">${n}</button>`).join('')}</div>`;

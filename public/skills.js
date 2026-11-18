Object.assign(P,{
 puzzle:'<path d="M10 4a2 2 0 1 1 4 0v2h4v4h-2a2 2 0 1 0 0 4h2v4h-4v-2a2 2 0 1 0-4 0v2H6v-4h2a2 2 0 1 0 0-4H6V6h4z"/>',
 num:'<path d="M5 7l2-1v12M12 9a2.5 2.5 0 1 1 4 2l-4 5h5M19 8v10"/>',
 ltr:'<path d="M4 18l4-12 4 12M5.5 14h5M15 9h5M17.5 9v9"/>',
 mem:'<rect x="3" y="5" width="8" height="14" rx="2"/><rect x="13" y="5" width="8" height="14" rx="2"/><circle cx="17" cy="12" r="1.5"/>',
 pat:'<path d="M3 18l5-5 4 3 9-10"/><circle cx="20" cy="6" r="1.5"/>'});
const SK={t:0,s:0,left:0},RN=n=>Math.floor(Math.random()*n),shf=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
const GAMES={
 num:{n:'ترتيب الأرقام',d:'المس الأرقام تصاعدياً من 1 بأسرع وقت',i:'num',L:[['سهل',9],['متوسط',16],['صعب',25]],low:1,u:'ث'},
 ltr:{n:'ترتيب الحروف',d:'رتّب الحروف المبعثرة لتكوّن الكلمة',i:'ltr',L:[['سهل',1],['متوسط',2],['صعب',3]],u:'نقطة'},
 mem:{n:'تطابق البطاقات',d:'اعثر على كل زوج متشابه بأقل محاولات',i:'mem',L:[['سهل',6],['متوسط',8],['صعب',10]],low:1,u:'محاولة'},
 pat:{n:'أكمل النمط',d:'ما الرقم التالي في السلسلة؟',i:'pat',L:[['سهل',1],['متوسط',2],['صعب',3]],u:'نقطة'}};
const WORDS=[['رمضان','الشهر الذي نزل فيه القرآن'],['زمزم','بئر مباركة في مكة'],['عرفة','يوم الوقوف في الحج'],['بدر','أولى الغزوات الكبرى'],['يوسف','نبي ألقاه إخوته في الجب'],['موسى','كليم الله'],['خديجة','أولى زوجات النبي ﷺ'],
['الكعبة','قبلة المسلمين'],['القرآن','كتاب الله'],['الصدقة','إنفاق في سبيل الله'],['التوبة','الرجوع إلى الله'],['الوضوء','طهارة قبل الصلاة'],['الأقصى','أولى القبلتين'],['السجود','أقرب ما يكون العبد فيه من ربه'],['العمرة','نسك أصغر من الحج'],
['المدينة','دار هجرة النبي ﷺ'],['الفاتحة','أم الكتاب'],['الإسلام','ديننا الحنيف'],['الأمانة','ضد الخيانة'],['الإخلاص','العمل لوجه الله'],['إبراهيم','خليل الله']];
const MI=['quran','seerah','prophets','companions','history','general','all','flame','trophy','image'];
const bk=(g,l)=>'sk_'+g+'_'+l;
function skSave(g,l,v){const k=bk(g,l),o=localStorage[k],b=GAMES[g].low?(o==null||v<+o):(o==null||v>+o);if(b)localStorage[k]=v;return b}
function skHd(t,v){return `<div class="meta"><span>${t}</span><span class="tmw">${ic('clock','sm')}<b id="sk-t">${v||0}</b></span></div>`}
function skTick(f,ms=500){clearInterval(SK.t);SK.t=setInterval(()=>{if(!$('#sk-t')){clearInterval(SK.t);return}f()},ms)}
function skEnd(g,l,v,label,win){clearInterval(SK.t);const nb=skSave(g,l,v);SFX.play(win?'win':'good');if(win)burst();
 app.innerHTML=`<div class="box center"><h1>${win?'أحسنت!':'انتهت الجولة'}</h1><p class="big">${label}</p>${nb?'<p>⭐ رقم قياسي جديد</p>':`<p>أفضل نتيجة: ${localStorage[bk(g,l)]} ${GAMES[g].u}</p>`}<button class="btn" onclick="skStart('${g}',${l})">إعادة</button><a class="btn alt" href="#/skills/${g}">المستويات</a><a class="btn alt" href="#/skills">ركن المهارات</a></div>`}

function skills(a){clearInterval(SK.t);const[g,l]=(a||'').split('-');if(!GAMES[g])return skHub();l?skStart(g,+l):skLevels(g)}
function skHub(){app.innerHTML=`<section class="hero"><h1>ركن تنمية المهارات</h1><p>ألعاب ذكاء وتركيز وذاكرة تنشّط عقلك بين الأسئلة.</p></section><div class="grid">${Object.entries(GAMES).map(([k,x])=>`<a class="card" href="#/skills/${k}"><b>${ic(x.i)}</b>${x.n}<small>${x.d}</small></a>`).join('')}</div>`}
function skLevels(g){const x=GAMES[g];app.innerHTML=`<div class="box center"><h2>${x.n}</h2><p>${x.d}</p>${x.L.map(([n,v])=>{const b=localStorage[bk(g,v)];return `<a class="btn wide" href="#/skills/${g}-${v}">${n}${b?` · أفضل: ${b} ${x.u}`:''}</a>`}).join('')}</div>`}
function skStart(g,l){history.replaceState(null,'','#/skills/'+g+'-'+l);({num:gNum,ltr:gLtr,mem:gMem,pat:gPat})[g](l)}

function gNum(n){let next=1,pen=0;SK.s=Date.now();const c=Math.sqrt(n);
 app.innerHTML=`<div class="box">${skHd('المس الأرقام بالترتيب من 1')}<div class="tg" style="grid-template-columns:repeat(${c},1fr)">${shf([...Array(n)].map((_,i)=>i+1)).map(v=>`<button class="tile" data-v="${v}">${v}</button>`).join('')}</div></div>`;
 skTick(()=>$('#sk-t').textContent=Math.floor((Date.now()-SK.s)/1000+pen));
 app.querySelectorAll('.tile').forEach(b=>b.onclick=()=>{
  if(+b.dataset.v===next){b.classList.add('ok');b.disabled=1;if(++next>n){const t=+((Date.now()-SK.s)/1000+pen).toFixed(1);skEnd('num',n,t,t+' ثانية',t<n*2.5)}}
  else{pen+=2;SFX.play('bad');shakeScreen(b)}})}

function gLtr(lv){const pool=shf(WORDS.filter(w=>{const n=[...w[0]].length;return lv==1?n<=5:lv==2?n==6:n>=7})).slice(0,5);
 let i=0,pts=0,ans=[],sc=[];SK.left=75;
 const done=()=>{const v=pts+Math.max(SK.left,0);skEnd('ltr',lv,v,v+' نقطة',pts>=30)};
 const nxt=()=>{if(i>=pool.length)return done();const w=pool[i][0];do sc=shf([...w]);while(sc.join('')===w);ans=[];draw()};
 const draw=()=>{const[w,h]=pool[i];
  app.innerHTML=`<div class="box center">${skHd(`كلمة ${i+1}/${pool.length} · ${pts} نقطة`,SK.left)}<p>${h}</p><div class="slots">${sc.map((_,k)=>`<button class="tile sl" data-s="${k}">${ans[k]!=null?sc[ans[k]]:'؟'}</button>`).join('')}</div><div class="slots">${sc.map((c,k)=>`<button class="tile" data-k="${k}"${ans.includes(k)?' disabled':''}>${c}</button>`).join('')}</div></div>`;
  app.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{ans.splice(+b.dataset.s,1);draw()});
  app.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{ans.push(+b.dataset.k);if(ans.length<sc.length)return draw();
   if(ans.map(k=>sc[k]).join('')===w){pts+=10;SFX.play('good');draw();floatXP($('.slots'),'+10');setTimeout(()=>{i++;nxt()},700)}
   else{SFX.play('bad');shakeScreen($('.slots'));ans=[];setTimeout(draw,350)}})};
 skTick(()=>{SK.left--;$('#sk-t').textContent=SK.left;if(SK.left<=0)done()},1000);nxt()}

function gMem(p){const cards=shf([...MI.slice(0,p),...MI.slice(0,p)]);let open=[],moves=0,found=0,lock=0;SK.s=Date.now();
 app.innerHTML=`<div class="box">${skHd('محاولات: <b id="mv">0</b>')}<div class="tg" style="grid-template-columns:repeat(4,1fr)">${cards.map((k,i)=>`<button class="tile mc" data-i="${i}" aria-label="بطاقة"><span class="bk">؟</span><span class="fr">${ic(k)}</span></button>`).join('')}</div></div>`;
 skTick(()=>$('#sk-t').textContent=Math.floor((Date.now()-SK.s)/1000));
 app.querySelectorAll('.mc').forEach(b=>b.onclick=()=>{
  if(lock||b.classList.contains('on'))return;b.classList.add('on');open.push(b);if(open.length<2)return;
  moves++;$('#mv').textContent=moves;const[a,c]=open;open=[];
  if(cards[+a.dataset.i]===cards[+c.dataset.i]){a.classList.add('ok');c.classList.add('ok');SFX.play('good');if(++found===p)setTimeout(()=>skEnd('mem',p,moves,moves+' محاولة',moves<=p*2),500)}
  else{lock=1;SFX.play('bad');setTimeout(()=>{a.classList.remove('on');c.classList.remove('on');lock=0},800)}})}

const GEN={
 1:()=>{const a=1+RN(20),d=2+RN(8);return[0,1,2,3,4,5].map(k=>a+d*k)},
 2:()=>{if(RN(2)){const a=1+RN(4),r=2+RN(2);return[0,1,2,3,4,5].map(k=>a*r**k)}const p=1+RN(5),q=p+1+RN(5),s=[1+RN(9)];for(let k=0;k<5;k++)s.push(s[k]+(k%2?q:p));return s},
 3:()=>{const t=RN(3),o=RN(4);if(t==0)return[0,1,2,3,4,5].map(k=>(o+k+1)**2);if(t==1){const s=[1+RN(4),2+RN(5)];while(s.length<6)s.push(s.at(-1)+s.at(-2));return s}return[0,1,2,3,4,5].map(k=>(o+k+1)*(o+k+2)/2)}};
function gPat(lv){let i=0,ok=0;
 const q=()=>{if(i>=8)return skEnd('pat',lv,ok*10,ok*10+' نقطة',ok>=6);
  const s=GEN[lv](),a=s[5],o=new Set([a]);while(o.size<4){const d=a+(RN(2)?1:-1)*(1+RN(Math.max(3,Math.round(a/4))));if(d>0)o.add(d)}
  app.innerHTML=`<div class="box center"><div class="meta"><span>سؤال ${i+1}/8</span><span>${ok*10} نقطة</span></div><h2>ما الرقم التالي؟</h2><div class="seq" dir="ltr">${s.slice(0,5).map(n=>`<span class="nb">${n}</span>`).join('')}<span class="nb q">؟</span></div>${shf([...o]).map((v,k)=>`<button class="opt" style="--d:${k*70}ms" data-v="${v}">${v}</button>`).join('')}</div>`;
  app.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{app.querySelectorAll('.opt').forEach(x=>{x.disabled=1;if(+x.dataset.v===a)x.classList.add('good')});
   if(+b.dataset.v===a){ok++;SFX.play('good');floatXP(b,'+10')}else{b.classList.add('bad');SFX.play('bad');shakeScreen(b)}
   setTimeout(()=>{i++;q()},1000)})};q()}

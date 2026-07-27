'use strict';
const SPECIES={
  dog:{max:25,fn(a){if(a<=0)return 0;if(a<=1)return a*15;if(a<=2)return 15+(a-1)*9;return 24+(a-2)*5}},
  cat:{max:25,fn(a){if(a<=0)return 0;if(a<=1)return a*15;if(a<=2)return 15+(a-1)*9;return 24+(a-2)*4}},
  rabbit:{max:12,fn(a){if(a<=0)return 0;if(a<=1)return a*10;return 10+(a-1)*8}},
  hamster:{max:4,fn(a){if(a<=0)return 0;if(a<=1)return a*20;return 20+(a-1)*18}},
  parrot:{max:80,fn(a){if(a<=0)return 0;if(a<=1)return a*5;return 5+(a-1)*2.5}},
};
const STAGES=[
  {min:0, max:2, stage:'Newborn',    group:'young',phrase:'still figuring out the world!'},
  {min:3, max:12,stage:'Toddler',    group:'young',phrase:'curious and full of energy!'},
  {min:13,max:19,stage:'Teenager',   group:'mid',  phrase:'testing all the boundaries!'},
  {min:20,max:34,stage:'Young Adult',group:'mid',  phrase:'peak adulting!'},
  {min:35,max:54,stage:'Middle-Aged',group:'mid',  phrase:'wise and settled!'},
  {min:55,max:74,stage:'Senior',     group:'senior',phrase:'earned every gray hair!'},
  {min:75,max:Infinity,stage:'Elder',group:'senior',phrase:'a true legend!'},
];
const COLORS={young:'var(--young)',mid:'var(--mid)',sen:'var(--sen)'};
const ICONS={
  'Newborn':'<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="2" fill="currentColor"/><line x1="10" y1="3" x2="10" y2="6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="10" y1="14" x2="10" y2="17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="3" y1="10" x2="6" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  'Toddler':'<svg viewBox="0 0 20 20" fill="none"><rect x="7" y="11" width="6" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="8" y="5" width="5" height="4.5" rx="1" stroke="currentColor" stroke-width="1.5"/></svg>',
  'Teenager':'<svg viewBox="0 0 20 20" fill="none"><path d="M3 12L7 7L11 12L15 7L18 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  'Young Adult':'<svg viewBox="0 0 20 20" fill="none"><path d="M5 15L13 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M8 6L14 6L14 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  'Middle-Aged':'<svg viewBox="0 0 20 20" fill="none"><line x1="4" y1="10" x2="16" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="10" r="2.5" stroke="currentColor" stroke-width="1.5"/></svg>',
  'Senior':'<svg viewBox="0 0 20 20" fill="none"><path d="M3 13Q10 6 17 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M6 13Q10 9 14 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  'Elder':'<svg viewBox="0 0 20 20" fill="none"><path d="M10 4C7 6 4 9 5 12C6 15 10 16 10 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M10 4C13 6 16 9 15 12C14 15 10 16 10 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
};

const $=id=>document.getElementById(id);
const ageInp=$('age-input'),rEmpty=$('r-empty'),rContent=$('r-content'),
      rNum=$('r-num'),rSweep=$('r-sweep'),badge=$('badge'),
      badgeIcon=$('badge-icon'),badgeTxt=$('badge-txt'),flavour=$('flavour'),
      btnDec=$('btn-dec'),btnInc=$('btn-inc');

let state={sp:'dog',age:null};
let rafId=null,displayed=0,prevStage=null,firstReveal=true;

function getStage(h){
  for(const s of STAGES)if(h>=s.min&&h<=s.max)return s;
  return STAGES[STAGES.length-1];
}

function countUp(target){
  if(rafId){cancelAnimationFrame(rafId);rafId=null}
  const start=displayed,diff=target-start;
  const dur=Math.min(600,Math.max(200,Math.abs(diff)*15));
  const t0=performance.now();
  function step(now){
    const p=Math.min((now-t0)/dur,1);
    const e=1-Math.pow(1-p,3);
    const v=Math.round(start+diff*e);
    rNum.textContent=v;displayed=v;
    if(p<1){rafId=requestAnimationFrame(step)}
    else{rNum.textContent=target;displayed=target;rafId=null;sweep()}
  }
  rafId=requestAnimationFrame(step);
}

function sweep(){
  rSweep.classList.remove('sweeping');
  void rSweep.offsetWidth;
  rSweep.classList.add('sweeping');
}

function render(){
  const{sp,age}=state;
  if(age===null){
    rEmpty.style.display='';
    rContent.setAttribute('aria-hidden','true');
    rContent.style.display='none';
    firstReveal=true;displayed=0;return;
  }
  const cfg=SPECIES[sp];
  const hf=cfg.fn(Number(age));
  const h=Math.round(hf);
  const ls=getStage(h);

  rEmpty.style.display='none';
  rContent.style.display='flex';
  rContent.removeAttribute('aria-hidden');

  if(firstReveal){
    firstReveal=false;
    rContent.classList.remove('revealing');
    void rContent.offsetWidth;
    rContent.classList.add('revealing');
    setTimeout(()=>rContent.classList.remove('revealing'),600);
  }

  countUp(h);

  const colKey={young:'young',mid:'mid',senior:'sen'}[ls.group];
  badge.style.background=COLORS[colKey];
  badgeTxt.textContent=ls.stage;
  badgeIcon.innerHTML=ICONS[ls.stage]||'';

  if(ls.stage!==prevStage){
    prevStage=ls.stage;
    badgeIcon.classList.remove('rotating');
    void badgeIcon.offsetWidth;
    badgeIcon.classList.add('rotating');
  }

  const a=Number(age);
  const yw=a===1?'year':'years';
  const sc=sp.charAt(0).toUpperCase()+sp.slice(1);
  const ageStr=Number.isInteger(a)?String(a):a.toFixed(1);
  // textContent only — no XSS risk
  flavour.textContent=`Your ${ageStr}-${yw}-old ${sc} is basically a ${h}-year-old human\u00A0\u2014\u00A0${ls.phrase}`;
}

function clampAge(val,sp){
  if(val===null)return null;
  let v=parseFloat(val);
  if(isNaN(v))return null;
  if(v<0)v=0;
  const mx=SPECIES[sp].max;
  if(v>mx)v=mx;
  return v;
}

function selectSp(sp){
  if(sp===state.sp)return;
  const prev=$('btn-'+state.sp);
  if(prev){prev.setAttribute('aria-pressed','false');prev.closest('.sp-item').classList.remove('sel')}
  state.sp=sp;
  const nb=$('btn-'+sp);
  if(nb){nb.setAttribute('aria-pressed','true');nb.closest('.sp-item').classList.add('sel')}
  const cfg=SPECIES[sp];
  ageInp.setAttribute('max',String(cfg.max));
  if(state.age!==null&&state.age>cfg.max){
    state.age=cfg.max;ageInp.value=String(cfg.max);
  }
  render();
}

function tapAnim(btn){
  btn.classList.remove('pressing','bouncing');
  void btn.offsetWidth;
  btn.classList.add('pressing');
  requestAnimationFrame(()=>{
    setTimeout(()=>{btn.classList.remove('pressing');btn.classList.add('bouncing');
      setTimeout(()=>btn.classList.remove('bouncing'),150);
    },80);
  });
}

document.querySelectorAll('.sp-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{tapAnim(btn);selectSp(btn.dataset.sp)});
});

ageInp.addEventListener('input',()=>{
  const v=clampAge(ageInp.value,state.sp);
  state.age=v;
  if(v!==null&&v!==parseFloat(ageInp.value))ageInp.value=String(v);
  render();
});
ageInp.addEventListener('blur',()=>{
  if(ageInp.value!==''&&parseFloat(ageInp.value)<0){ageInp.value='0';state.age=0;render()}
});

function step(d){
  const cur=state.age===null?0:Number(state.age);
  const cfg=SPECIES[state.sp];
  let n=Math.round((cur+d)*10)/10;
  if(n<0)n=0;if(n>cfg.max)n=cfg.max;
  state.age=n;
  ageInp.value=Number.isInteger(n)?String(n):n.toFixed(1);
  render();
}
btnDec.addEventListener('click',()=>step(-1));
btnInc.addEventListener('click',()=>step(1));
btnDec.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();step(-1)}});
btnInc.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();step(1)}});
ageInp.addEventListener('keydown',e=>{if(e.key==='ArrowUp'){e.preventDefault();step(1)}if(e.key==='ArrowDown'){e.preventDefault();step(-1)}});

// Init
$('btn-dog').closest('.sp-item').classList.add('sel');
ageInp.setAttribute('max','25');ageInp.setAttribute('min','0');ageInp.setAttribute('step','1');
render();

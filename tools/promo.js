// 홍보 소재 만들기: 게임을 브라우저에서 자동으로 여러 판 돌려, 가장 이야깃거리가 많은 인생 하나의
// 결과 카드(9:16 PNG)·릴스 영상(MP4/WebM)·인생 기록(life.json)을 만듭니다. 플레이 통계는 남지 않습니다(file:// 로 엶).
// 사용: node tools/promo.js <출력 폴더> [판 수=8] [시대=rand|1960|1970|1980|1990|2026] [--no-reel]
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const GAME=path.resolve(__dirname,'../public/index.html');

async function playOne(b,era,withReel){
  const pg=await b.newPage({viewport:{width:1100,height:900},reducedMotion:'reduce'});
  const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.route(/^https?:\/\//,r=>r.abort()); // 외부 요청 차단(글꼴·수집 API)
  // 플레이 중에만 타이머를 빠르게 돌립니다.
  await pg.addInitScript(()=>{const st=window.setTimeout;window.__fast=1;window.setTimeout=(f,d,...a)=>st(f,(d||0)*window.__fast,...a);});
  await pg.goto('file://'+GAME);await pg.waitForSelector('.era');
  await pg.click(`.era[data-k="${era}"]`);await pg.click('#startBtn');
  await pg.waitForTimeout(800);if(await pg.isVisible('#skipBtn'))await pg.click('#skipBtn');
  await pg.waitForSelector('#liveBtn:not([disabled])');await pg.click('#liveBtn');
  await pg.evaluate(()=>{speed=30;window.__fast=0.03;document.querySelector('#autoBtn').click();});
  await pg.waitForSelector('#imgBtn',{timeout:240000});
  await pg.evaluate(()=>{window.__fast=1;});
  const info=await pg.evaluate(async(doReel)=>{
    const p=player;const N=1/p.factors().reduce((m,x)=>m*x[2],1);
    const b64=async bl=>{const a=new Uint8Array(await bl.arrayBuffer());let s='';for(let i=0;i<a.length;i+=8192)s+=String.fromCharCode(...a.subarray(i,i+8192));return btoa(s);};
    const img=await b64(await makeCardBlob(p,N));let vid=null,vt=null;
    if(doReel){const v=await makeReel(p,N,()=>{});vt=v.type;vid=await b64(v);}
    const strip=t=>String(t||'').replace(/<[^>]+>/g,'');
    return {name:p.name,sex:p.sex,year:p.E.y,region:p.birthRegion+' '+p.birthDistrict,death:p.deathAt,cause:p.cause,
      edu:p.edu,job:p.mainJob,married:!!p.everMarried,kids:p.kids.length,N,nText:koBig(N),
      factors:p.factors().map(f=>({label:f[0],what:f[1],p:f[2]})),
      logs:p.logs.map(l=>({age:l.age,tone:l.tone||'',text:strip(l.text),stat:strip(l.stat)})),img,vid,vt};
  },withReel);
  info.errors=errs;await pg.close();return info;
}
// 이야깃거리 점수: 너무 이른 죽음은 홍보 글로 쓰기 어려우니 빼고, 드문 인생·사건이 많은 인생을 높게 칩니다.
function score(x){if(x.death<30)return -1;const ev=x.logs.filter(l=>/good|bad|mile|choice/.test(l.tone)).length;return Math.log10(x.N)*2+ev/15+(x.errors.length?-10:0);}

(async()=>{
  const args=process.argv.slice(2);const out=args[0]||'promo-out';const n=+(args[1]||8);const era=args[2]&&!args[2].startsWith('--')?args[2]:'rand';
  const reel=!args.includes('--no-reel');fs.mkdirSync(out,{recursive:true});
  const b=await chromium.launch();const lives=[];
  for(let i=0;i<n;i++){try{const x=await playOne(b,era,reel);lives.push(x);console.log(`${i+1}/${n}`,x.year,x.name,x.death+'세',x.cause,x.nText,'score',score(x).toFixed(2));}catch(e){console.error('판 실패:',e.message);}}
  if(!lives.length){console.error('한 판도 끝내지 못했습니다');process.exit(1);}
  const best=lives.slice().sort((a,b)=>score(b)-score(a))[0];
  fs.writeFileSync(path.join(out,'card.png'),Buffer.from(best.img,'base64'));
  if(best.vid)fs.writeFileSync(path.join(out,'reel.'+(best.vt.includes('mp4')?'mp4':'webm')),Buffer.from(best.vid,'base64'));
  const all=lives.map(x=>({year:x.year,name:x.name,death:x.death,cause:x.cause,N:x.N,score:score(x)}));
  delete best.img;delete best.vid;fs.writeFileSync(path.join(out,'life.json'),JSON.stringify(best,null,1));
  fs.writeFileSync(path.join(out,'all.json'),JSON.stringify(all,null,1));
  console.log('고른 인생:',best.year,best.name,best.death+'세',best.cause,best.nText);await b.close();
})().catch(e=>{console.error(e);process.exit(1)});

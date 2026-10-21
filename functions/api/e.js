// POST /api/e  {uid,sid,ev:[{n,t,era,age,p}]}  → 익명 이벤트 저장
import {kstDay,devOf,clip,int} from './_util.js';
export async function onRequestPost({request,env}){
  if(!env.DB)return new Response(null,{status:204});
  let b;try{b=await request.json();}catch(e){return new Response('bad json',{status:400});}
  const ev=Array.isArray(b.ev)?b.ev.slice(0,60):[];if(!ev.length)return new Response(null,{status:204});
  const uid=clip(b.uid,40),sid=clip(b.sid,40),cc=clip(request.cf&&request.cf.country,4),dev=devOf(request),now=Date.now();
  const st=env.DB.prepare('INSERT INTO events(ts,day,uid,sid,name,era,age,props,country,dev) VALUES(?,?,?,?,?,?,?,?,?,?)');
  const rows=ev.filter(e=>e&&e.n).map(e=>{const t=+e.t;const ts=Number.isFinite(t)&&Math.abs(t-now)<864e5?t:now;const p=e.p==null?null:clip(JSON.stringify(e.p),1500);
    return st.bind(ts,kstDay(ts),uid,sid,clip(e.n,40),int(e.era),int(e.age),p,cc,dev);});
  if(rows.length)await env.DB.batch(rows);
  return new Response(null,{status:204});
}

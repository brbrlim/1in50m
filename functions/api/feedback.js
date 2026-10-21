// POST /api/feedback  {uid,sid,tag,text,era,age,year,ctx}  → 플레이 중 피드백 저장
import {kstDay,devOf,clip,int,json} from './_util.js';
export async function onRequestPost({request,env}){
  if(!env.DB)return json({ok:false,error:'no db'},503);
  let b;try{b=await request.json();}catch(e){return json({ok:false},400);}
  const text=clip((b.text||'').trim(),2000);if(!text)return json({ok:false,error:'empty'},400);
  const now=Date.now();
  await env.DB.prepare('INSERT INTO feedback(ts,day,uid,sid,tag,text,era,age,year,ctx,country,dev) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(now,kstDay(now),clip(b.uid,40),clip(b.sid,40),clip(b.tag,20),text,int(b.era),int(b.age),int(b.year),clip(b.ctx==null?null:JSON.stringify(b.ctx),5000),clip(request.cf&&request.cf.country,4),devOf(request)).run();
  return json({ok:true});
}

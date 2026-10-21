export const kstDay=(ms=Date.now())=>new Date(ms+9*3600e3).toISOString().slice(0,10);
export const devOf=req=>/Mobi|Android|iPhone|iPad/i.test(req.headers.get('user-agent')||'')?'mobile':'desktop';
export const clip=(v,n)=>v==null?null:String(v).slice(0,n);
export const int=v=>Number.isFinite(+v)?Math.round(+v):null;
export const json=(o,status=200)=>new Response(JSON.stringify(o),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});

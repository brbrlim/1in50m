// GET /api/report?key=REPORT_KEY&day=YYYY-MM-DD&days=1  → 데일리 리포트용 집계 (비공개 키 필요)
import {kstDay,json} from './_util.js';
export async function onRequestGet({request,env}){
  const u=new URL(request.url);
  if(!env.REPORT_KEY||u.searchParams.get('key')!==env.REPORT_KEY)return json({error:'forbidden'},403);
  if(!env.DB)return json({error:'no db'},503);
  const days=Math.min(30,Math.max(1,+u.searchParams.get('days')||1));
  const end=u.searchParams.get('day')||kstDay(Date.now()-864e5);
  const start=kstDay(new Date(end+'T00:00:00Z').getTime()-(days-1)*864e5);
  const q=(sql,...a)=>env.DB.prepare(sql).bind(...a).all().then(r=>r.results);
  const W='day BETWEEN ? AND ?';
  const [byName,users,byDay,eras,devs,countries,funnel,lastAge,choices,speeds,shares,feedback,fbTags,endAges]=await Promise.all([
    q(`SELECT name,COUNT(*) n,COUNT(DISTINCT sid) s FROM events WHERE ${W} GROUP BY name ORDER BY n DESC`,start,end),
    q(`SELECT COUNT(DISTINCT uid) users,COUNT(DISTINCT sid) sessions FROM events WHERE ${W}`,start,end),
    q(`SELECT day,COUNT(DISTINCT uid) users,COUNT(DISTINCT sid) sessions,SUM(name='game_start') starts,SUM(name='game_end') ends FROM events WHERE ${W} GROUP BY day ORDER BY day`,start,end),
    q(`SELECT era,COUNT(*) n FROM events WHERE ${W} AND name='game_start' GROUP BY era ORDER BY n DESC`,start,end),
    q(`SELECT dev,COUNT(DISTINCT sid) s FROM events WHERE ${W} GROUP BY dev`,start,end),
    q(`SELECT country,COUNT(DISTINCT sid) s FROM events WHERE ${W} GROUP BY country ORDER BY s DESC LIMIT 10`,start,end),
    q(`SELECT
        COUNT(DISTINCT CASE WHEN name='page_view' THEN sid END) s_view,
        COUNT(DISTINCT CASE WHEN name='era_select' THEN sid END) s_era,
        COUNT(DISTINCT CASE WHEN name='game_start' THEN sid END) s_start,
        COUNT(DISTINCT CASE WHEN name='age' AND age>=10 THEN sid END) s_age10,
        COUNT(DISTINCT CASE WHEN name='age' AND age>=20 THEN sid END) s_age20,
        COUNT(DISTINCT CASE WHEN name='age' AND age>=40 THEN sid END) s_age40,
        COUNT(DISTINCT CASE WHEN name='age' AND age>=60 THEN sid END) s_age60,
        COUNT(DISTINCT CASE WHEN name='game_end' THEN sid END) s_end,
        COUNT(DISTINCT CASE WHEN name IN('share_image','share_reel','share_link','share_text') THEN sid END) s_share,
        COUNT(DISTINCT CASE WHEN name='replay' THEN sid END) s_replay,
        COUNT(DISTINCT CASE WHEN name='feedback' THEN sid END) s_feedback
       FROM events WHERE ${W}`,start,end),
    q(`SELECT age/10*10 band,COUNT(*) n FROM (SELECT sid,MAX(age) age FROM events WHERE ${W} AND age IS NOT NULL GROUP BY sid HAVING SUM(name='game_end')=0) GROUP BY band ORDER BY band`,start,end),
    q(`SELECT json_extract(props,'$.t') title,json_extract(props,'$.o') opt,COUNT(*) n,ROUND(AVG(json_extract(props,'$.ms'))/1000,1) sec FROM events WHERE ${W} AND name='choice' GROUP BY title,opt ORDER BY title,n DESC LIMIT 400`,start,end),
    q(`SELECT json_extract(props,'$.v') v,COUNT(*) n FROM events WHERE ${W} AND name='speed' GROUP BY v ORDER BY n DESC`,start,end),
    q(`SELECT name,COUNT(*) n FROM events WHERE ${W} AND name LIKE 'share_%' GROUP BY name`,start,end),
    q(`SELECT id,day,tag,text,era,age,year,ctx,dev FROM feedback WHERE ${W} ORDER BY id`,start,end),
    q(`SELECT tag,COUNT(*) n FROM feedback WHERE ${W} GROUP BY tag ORDER BY n DESC`,start,end),
    q(`SELECT age/10*10 band,COUNT(*) n,ROUND(AVG(json_extract(props,'$.sec')),0) sec FROM events WHERE ${W} AND name='game_end' GROUP BY band ORDER BY band`,start,end)
  ]);
  return json({range:{start,end,days},users:users[0],byDay,funnel:funnel[0],byName,eras,devs,countries,dropOffAgeBand:lastAge,endAgeBand:endAges,choices,speeds,shares,feedbackTags:fbTags,feedback});
}

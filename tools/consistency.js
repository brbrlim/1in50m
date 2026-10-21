// 정합성 자동 점검: node tools/consistency.js [인생 수/시대]
// public/index.html의 게임 로직으로 수천 명의 인생을 돌리고, 로그가 쓰인 순간의 상태와 문장이 모순되는지 검사합니다.
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','public','index.html'),'utf8');
const js=html.slice(html.indexOf('<script>')+8,html.lastIndexOf('</script>'));
const core="globalThis.matchMedia=()=>({matches:false,addEventListener(){}});globalThis.getComputedStyle=()=>({getPropertyValue:()=>''});"+'\n'+js.slice(0,js.indexOf('/* ---------- intro'));
eval(core+`
Person.prototype.choose=function(title,desc,opts,extra){if(extra&&extra.pause)return;const o=opts[ri(0,opts.length-1)];this._lastChoice=title;o.fn();};
const L0=Person.prototype.log;
Person.prototype.log=function(text,tone,stat,src){const r=L0.apply(this,arguments);const e=this.logs[this.logs.length-1];
  e.snap={y:this.year(),army:!!this.army,region:this.region,married:!!this.married,everMarried:!!this.everMarried,mom:!this.momDead,dad:!this.dadDead,job:this.job,retired:!!this.retired,working:!!this.working,student:!!this.student,leftHome:!!this.leftHome,kids:this.kids.length,pet:!!this.pet,home:!!this.home,indep:!!(this.afterDone||this.married),sex:this.sex,expat:!!this.expat,edu:this.edu};return r;};
const RULES=[
 ['군 복무 중 사회생활',e=>e.snap.army&&/반려|강아지|고양이|MT|동아리|소개팅|데이트|이사했|집을 (샀|마련)|야근|회사|출근|월급|연봉|여행을|해외여행|아르바이트|첫 차|운전면허|결혼|헬스|자취|하숙/.test(e.text)&&!/입대|전역|훈련|부대|휴가|군|면회|위문|편지/.test(e.text)],
 ['해외 거주 중 국내 일상',e=>e.snap.region==='해외'&&/지하철|동네 (시장|목욕탕)|명절에 고향|귀성|반상회|국내|경로당|복지관/.test(e.text)],
 ['부모 사망 후 부모 등장',e=>!e.snap.mom&&!e.snap.dad&&/부모님(께|이|과|을|의|에게|과 함께|께서)|어머니(께|가|와|를)|아버지(께|가|와|를)/.test(e.text)&&!/돌아가|떠나보|산소|제사|기일|추모|성묘|유품|생전|물려|상속|부모님을 모두|빈자리|그리|세상을 떠났|양가|처가|시댁|시부모|장인|장모/.test(e.text)],
 ['미혼인데 배우자',e=>!e.snap.married&&/(배우자|아내|남편)(가|와|를|의|에게|와 함께|는)/.test(e.text)&&!/이혼|사별|떠나|세상을|헤어|재혼|결혼했|결혼할|청혼|만난|소개|선을|찾기|찾아|기일|쓰던 물건|혼자 먹는/.test(e.text)],
 ['자녀 없는데 자녀',e=>e.snap.kids===0&&/(아들|딸|자녀|손주)(가|와|를|의|에게|들)/.test(e.text)&&!/아이를 (가질|갖|낳|잃)|아이 없이|생기지|난임|입양|태어났|임신|유산|어릴|아이였|아이들에게 괴롭|동네 아이|아이들이 몰려|아이들과|조카|이웃|학생|아이처럼|아이가 되/.test(e.text)],
 ['일 없는데 직장 사건',e=>(!e.snap.job||(e.snap.retired&&!e.snap.working))&&/야근|승진|연봉이|회사를 옮|출근|회식|사내|팀장|부장|구조조정|명예퇴직|월급/.test(e.text)&&!/은퇴|퇴직|물러|그만|잃|구했|들어갔|시작했|재취업|떠났|밀려|명단/.test(e.text)],
 ['자영업자가 회사 사건',e=>['owner','startup','founderBig','artist','doctor'].includes(e.snap.job)&&/야근|회사를 옮|승진|구조조정|명예퇴직|회식|사내/.test(e.text)&&!/그만두고|시작|열었|차렸|접었/.test(e.text)],
 ['학생인데 직장',e=>e.snap.student&&/야근|승진|연봉|회사를 옮|퇴근|회식/.test(e.text)],
 ['나이 안 맞음',e=>(e.age<18&&/결혼했습니다|취업|입대|운전면허|첫 차|술자리|집을 마련/.test(e.text))||(e.age>=40&&/^(첫 아르바이트|입대했|국민학교에 입학|초등학교에 입학|중학교에 입학|고등학교에 입학)|학교폭력|괴롭힘을 당/.test(e.text))],
 ['비수도권인데 지하철 무료',e=>/지하철을 무료/.test(e.text)&&!['서울','경기','인천','부산','대구','광주','대전'].includes(e.snap.region)],
 ['자가인데 전월세 사건',e=>e.snap.home&&/전세 사기|월세를 올|집주인이/.test(e.text)],
 ['미래 통계를 과거에 표시',e=>{const st=String(e.stat||'');if(/오늘날|이전이라|가치 환산|당시/.test(st))return false;const ys=[...st.matchAll(/(?:19|20)\\d\\d/g)].map(m=>+m[0]).filter(v=>v>=1950&&v<=2026);return ys.length&&Math.min(...ys)-e.snap.y>=10;}],
];
const hits={};const dup={};
const N=+process.argv[2]||300;
for(const k of ERA_KEYS){for(let i=0;i<N;i++){const p=new Person(false,ERAS[k]);p.isPlayer=i%3===0;p.used=p.used||{};p.start();let g=0;while(p.step()&&g++<130){p.fx=[];}
  const seen={};
  for(const e of p.logs){if(!e.snap)continue;for(const [name,f] of RULES){try{if(f(e)){const key=name+' ‖ '+e.text.replace(/[0-9]+/g,'N').replace(/[가-힣]{2,3}(이|가|과|와|을|를|의) /g,'X$1 ').slice(0,46);hits[key]=hits[key]||{n:0,ex:''};hits[key].n++;if(!hits[key].ex)hits[key].ex=k+'년생 '+e.age+'세('+e.snap.y+') '+e.text.slice(0,70)+(name.startsWith('미래')?' 〔'+String(e.stat).slice(0,80)+'〕':'');}}catch(err){}}
    if(e.tone!=='hist'&&e.tone!=='mile'&&e.text.length>8&&!/^\\[/.test(e.text)){const tk=e.text.replace(/[0-9,.]+/g,'N');if(seen[tk]!=null&&e.age-seen[tk]<=3&&!/세상을 떠났|태어났|무지개|입학|생일/.test(e.text)){const key='3년 안 같은 문장 반복 ‖ '+tk.slice(0,46);dup[key]=dup[key]||{n:0,ex:k+'년생 '+e.age+'세 '+e.text.slice(0,60)};dup[key].n++;}seen[tk]=e.age;}}}}
const all=Object.entries({...hits,...dup}).sort((a,b)=>b[1].n-a[1].n);
console.log('lives',N*ERA_KEYS.length,'issue types',all.length);for(const [k,v] of all.slice(0,80))console.log(String(v.n).padStart(4),'|',k.split(' ‖ ')[0],'|',v.ex);
`);

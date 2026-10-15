'use strict';
// 规则式规划器：只使用公开路线的估算，不访问实时票务服务。
const PLANNER_DATES=DAYS.map(d=>({date:d.date,w:d.w}));
const Planner={
 selected:new Set(),skewer:false,filter:'nature',query:'',result:null,
 init(){
  // v4 使用独立选择记录：首次升级默认改为自然景观，旧版个人备注/待办仍保留。
  const saved=readSaved('planner-selection-v4',null);
  const initIds=saved?.ids?.filter(id=>POOL_INFO[id])||POOL_PRESETS.nature.ids;
  this.selected=new Set(initIds);
  this.skewer=saved?.skewer??POOL_PRESETS.nature.skewer;
  window.PLANNER_SELECTED=this.selected;
  $('#keepSkewer').checked=this.skewer;
  $('#poolFilter').value=this.filter;
  $('#poolFilter').addEventListener('change',e=>{this.filter=e.target.value;this.applyFilter()});
  $('#poolSearch').addEventListener('input',e=>{this.query=e.target.value.trim();this.applyFilter()});
  $('#keepSkewer').addEventListener('change',e=>{this.skewer=e.target.checked;this.recalculate()});
  $$('[data-preset]').forEach(b=>b.addEventListener('click',()=>this.preset(b.dataset.preset)));
  $('#clearPicks').addEventListener('click',()=>{this.selected=new Set();window.PLANNER_SELECTED=this.selected;this.skewer=false;$('#keepSkewer').checked=false;this.syncChecks();this.recalculate()});
  document.addEventListener('change',e=>{if(!e.target.matches('[data-pick]'))return;const id=e.target.dataset.pick;this.pick(id,e.target.checked)});
  renderPlaces();this.applyFilter();this.recalculate();
 },
 pick(id,on){if(on)this.selected.add(id);else this.selected.delete(id);window.PLANNER_SELECTED=this.selected;this.syncChecks();this.recalculate()},
 preset(which){const p=POOL_PRESETS[which];if(!p)return;this.selected=new Set(p.ids);this.skewer=p.skewer;window.PLANNER_SELECTED=this.selected;$('#keepSkewer').checked=this.skewer;this.filter=which==='nature'?'nature':'all';this.query='';$('#poolFilter').value=this.filter;$('#poolSearch').value='';this.syncChecks();this.applyFilter();this.recalculate()},
 syncChecks(){$$('[data-pick]').forEach(el=>{el.checked=this.selected.has(el.dataset.pick);el.closest('.place-card')?.classList.toggle('is-picked',el.checked)});},
 applyFilter(){let shown=0;$$('.place-card').forEach(el=>{
   const info=POOL_INFO[el.dataset.id],s=SPOT_BY_ID[el.dataset.id];
   const yes=(this.filter==='all'||(this.filter==='selected'&&this.selected.has(el.dataset.id))||(this.filter==='nature'&&info.kind!=='human')||(this.filter==='shanxi'&&s.province.startsWith('山西'))||(this.filter==='jiangxi'&&s.province.startsWith('江西')))&&(!this.query||(s.name+s.description+s.province).includes(this.query));
   el.hidden=!yes;if(yes)shown++;
  });$('#poolEmpty').hidden=shown!==0;$('#poolMatch').textContent=`当前显示 ${shown} / ${SPOTS.length} 处`;
 },
 recalculate(){
  save('planner-selection-v4',{ids:[...this.selected],skewer:this.skewer});
  const result=computePlanner(this.selected,this.skewer);
  this.result=result;window.ACTIVE_PLAN=result;
  activeDays=result.days;activeBudget=result.budget;activeTasks=result.tasks;
  renderDays();renderBudget();renderTasks();renderRoute(result);renderPlannerSummary(result);
  this.syncChecks();this.applyFilter();
 },
};
const label=id=>SPOT_BY_ID[id]?.name||id;
function emptyDay(index){return {date:PLANNER_DATES[index].date,w:PLANNER_DATES[index].w,region:'transit',place:'机动',title:'预留时间',sub:'根据天气和交通调整',night:'待定',featured:[],note:'该日期尚未安排景点。可以选择更多景点，也可以保留休息或天气缓冲。',events:[]}}
function addSpot(day,id,time,detail){day.featured.push(id);day.events.push([time,label(id),detail||SPOT_BY_ID[id].description,SPOT_BY_ID[id].search]);}
function computePlanner(selected,skewer){
 // 只有真正勾选山西景点才前往山西；沾串绝不驱动绕路、乘机或额外住宿。
 const ids=new Set(selected),north=[...ids].some(id=>SPOT_BY_ID[id]?.province.startsWith('山西')), south=[...ids].some(id=>SPOT_BY_ID[id]?.province.startsWith('江西'));
 const enRouteSkewer=Boolean(skewer&&north);
 const placed=new Set(),warnings=[],days=Array.from({length:10},(_,i)=>emptyDay(i));let hours=0;
 const assign=(d,id,time,detail)=>{addSpot(days[d],id,time,detail);placed.add(id)};
 const setup=(i,region,place,title,sub,night,note='',events=[])=>Object.assign(days[i],{region,place,title,sub,night,note,events,featured:[]});
 const transit=(i,place,title,sub,night,note,events)=>setup(i,'transit',place,title,sub,night,note,events);
 const move=(from,to)=>{days[from].events.push(['交通','前往'+to,'换乘时间为估算，临行前需查具体班次。',to])};
 transit(0,'广州','梧州 → 广州','11月27日下班后出发','广州（交通便利处）','梧州南至广州南的动车须等待12306开售。',[['晚上','梧州南 → 广州南','尽量选可以稳妥赶上的晚班动车。','广州南站']]);hours+=1.6;
 if(north){
  setup(1,'shanxi','太原','广州 → 太原','上午航班，仅去程乘机','太原市区','去程两张机票和起降时刻尚未确认；若下午才落地，应舍弃较远的景点。',[['上午','广州白云 → 太原武宿（待订）','优先当天上午抵达的直飞，航班与票价需另行查实。','太原武宿国际机场']]);hours+=3;
  if(ids.has('jinci'))assign(1,'jinci','下午13:30—16:30','从机场到晋祠需另计市内交通；若航班晚点，优先取消此项。');
  if(enRouteSkewer)days[1].events.push(['18:00—19:30','小溅沾串（待核实营业）','太原迎泽区开化寺街。可自行更换店铺，不影响后续排程。','小溅沾串 太原']);
  const datongIds=['yungang','datong'].filter(id=>ids.has(id));
  const ruralIds=['hanging','hengshan','pagoda'].filter(id=>ids.has(id));
  const useDatong=datongIds.length+ruralIds.length>0;
  if(useDatong){
   setup(2,'shanxi','大同','太原 → 大同','高铁＋市郊接驳','大同市区','太原南到大同南参考约1.5—2小时；当日以景点开放与冬季日照为准。',[['08:00—10:30','太原南 → 大同南（参考）','具体班次与接驳需再核实。','大同南站']]);hours+=2.0;
   let left=5.3;
   // 周日可用时间有限，不会同时塞入多个大型郊区景点。
   for(const id of datongIds){const need=id==='yungang'?3.8:2.0;
    if(left+0.001<need)continue;
    assign(2,id,id==='yungang'?'11:00—15:00':'16:00—18:00');left-=need;hours+=id==='yungang'?1.4:.4;
   }
   if(!days[2].featured.length){days[2].events.push(['下午','大同古城自由活动','下一天前往浑源或应县方向，今天不过量排景点。','大同古城']);}
   setup(3,'shanxi','浑源 / 应县','大同周边 → 太原','景区包车＋晚间高铁','太原南站附近','需要正规包车；当天晚上必须回到太原，为次日长途高铁留出时间。',[['07:30','从大同出发','包车按晚间大同南至太原南班次倒排，预留充足缓冲。','大同古城']]);
   const order={hengshan:0,hanging:1,pagoda:2};
   const high=ruralIds.slice().sort((a,b)=>order[a]-order[b]);
   let timeUsed=2.7,selectedRural=[];
   for(const id of high){const add={hengshan:3.7,hanging:1.6,pagoda:1.6}[id]+(selectedRural.length?0.45:0);
    if(timeUsed+add<=8.6){selectedRural.push(id);timeUsed+=add;}}
   const textTime={'hengshan':'08:30—12:30','hanging':'依包车顺路安排约1—2小时','pagoda':'依包车顺路安排约1—2小时'};
   for(const id of selectedRural){assign(3,id,textTime[id],id==='hengshan'?'恒山登山只在景区明确开放、道路无结冰风险时执行。':undefined);hours+=.55;}
   days[3].events.push(['傍晚','回到大同南 → 太原南','当晚高铁必须提前确认；不能将返程寄托于末班车。','太原南站']);hours+=2;
   if(ids.has('pingyao'))warnings.push('平遥古城与大同两天安排相冲突。本次不排入平遥，建议取消大同一处景点后再选择。');
  }else{
   setup(2,'shanxi','太原','太原机动日','市内休息或备用','太原市区','没有选择大同景点，可保留这一天休息。',[]);
   if(ids.has('pingyao')){days[2].title='平遥古城';days[2].place='平遥';days[2].night='太原';days[2].events.push(['上午','太原南 → 平遥古城站','动车约40分钟＋接驳，实际以12306为准。','平遥古城站']);assign(2,'pingyao','中午—傍晚');days[2].events.push(['傍晚','回太原','交通需另核实。','太原南站']);hours+=3.0;}
   transit(3,'太原','太原机动日','预留天气或交通缓冲','太原南站周边','第二天如需赴江西，请在今晚回到太原南附近。',[]);
  }
  if(south){
   transit(4,'上饶','太原南 → 上饶','全天高铁转场','上饶市区','G3127目前有07:04—15:38参考班次；12月1日具体开行、车票未确认。',[['07:04—15:38（参考）','G3127 太原南 → 上饶','约8小时34分，只是现行时刻表参考；以12306为准。','上饶站']]);hours+=8.6;
  }else{
   transit(4,'太原','山西自由日','自然景观或休息','太原市区','未选江西景点。若保留山西游玩，12月5日仍需预留整天铁路返广州。',[]);
  }
 }else if(south){
  if(ids.has('wugong')){
   transit(1,'萍乡','广州 → 萍乡北','高铁进入江西，不安排航班','萍乡或武功山山脚','广州南到萍乡北近期有约3—4小时高铁参考班次，正式运行、余票待12306核实。萍乡北至景区另约80分钟（历史班车参考）。',[['上午—下午','广州南 → 萍乡北','高铁参考约3—4小时，需以出游日期开行计划为准。','萍乡北站'],['抵达后','萍乡北 → 景区附近','旅游专线发车时间、换乘与末班车待核实。','萍乡武功山游客服务中心']]);hours+=4.8;
  }else{
   const nearShangrao=['shicheng','jujing','huangling','sanqing'].some(id=>ids.has(id));
   const entry=nearShangrao?['上饶','上饶站',6]:ids.has('guifeng')?['弋阳','弋阳站',5.5]:ids.has('longhu')?['鹰潭','鹰潭北站',5.6]:ids.has('wucheng')?['南昌','南昌西站',4.6]:['上饶','上饶站',6];
   transit(1,entry[0],`广州 → ${entry[0]}`,'高铁进入江西，不乘飞机',entry[0]+'市区','系统只选最近的铁路进入片区；换乘及时间为粗估，出行日期开行和余票以12306为准。',[['上午—下午',`广州 → ${entry[1]}（待核实）`,'所列站点是建议交通方向，并不代表有已确认的直达班次。',entry[1]]]);hours+=entry[2];
  }
 }else{
  transit(1,'广州','广州机动','尚未勾选目的地','广州','没有选择景点，不会自动购票或安排跨省行程。',[]);
 }
 // 按交通方向安排：广州→萍乡武功山（可选）→上饶/三清山→弋阳→鹰潭→南昌（可选），避免为吃沾串绕行山西。
 const restDays=north?[5,6,7]:[2,3,4,5,6,7];let cursor=0,from=days[1].place==='萍乡'?'pingxiang':days[1].place==='南昌'?'nanchang':days[1].place==='弋阳'?'yiyang':days[1].place==='鹰潭'?'yingtan':'shangrao';
 const reserve=(count)=>cursor+count<=restDays.length;
 const current=()=>restDays[cursor];
 const take=()=>restDays[cursor++];
 const has=id=>ids.has(id);
 // 武功山在江西西部，只有纯江西行程适合排在最前；从山西转上饶后再折回萍乡会浪费时间。
 if(south&&has('wugong')&&!north&&reserve(2)){
  const summit=take();
  setup(summit,'jiangxi','萍乡 / 武功山','武功山','金色高山草甸、山脊','萍乡或武功山山脚','高山低温、结冰、索道停运会影响游览，必须以景区开放信息决定徒步路线。',[['上午','萍乡/山脚 → 武功山景区','按当日景区专线或合规接驳前往游客中心，山路和索道时间未锁定。','武功山游客服务中心']]);
  assign(summit,'wugong','09:30—16:00','利用开放的索道及步道游览金顶、草甸等；遇大风结冰需调整。');hours+=1.5;
  const eastMajor=['shicheng','jujing','huangling','sanqing','guifeng','longhu'].some(has);
  const east=eastMajor||has('wucheng');
  const transfer=take();
  if(east){
   const next=eastMajor?'上饶':'南昌',station=eastMajor?'上饶站':'南昌西站';
   transit(transfer,next,`萍乡 → ${next}`,'高铁东行或北上，不折返广州',next+'市区','参考行程约3小时，具体车次与是否换乘须由12306确认。',[['上午—下午',`萍乡北 → ${station}`,'换乘站、车次与接驳均为待确认项目，下午可休息。',station]]);hours+=eastMajor?3.4:2.8;from=eastMajor?'shangrao':'nanchang';
  }else{
   setup(transfer,'jiangxi','萍乡','天气机动 / 休息','按天气补拍或在市区休息','萍乡','武功山如果索道/山路不开放，可保留缓冲；当天不安排无必要的跨市转场。',[]);from='pingxiang';
  }
 }
 const hasWuyuan=['shicheng','jujing','huangling'].some(has);
 if(south&&hasWuyuan){
  if(has('shicheng')){
   if(reserve(2)){
    const first=take(),second=take();
    setup(first,'jiangxi','婺源','婺源村落 → 石城','高铁/包车，住村里','婺源石城附近','石城与篁岭不在同一条村落线上；选择多个时这天将比较紧凑。',[['上午','上饶 → 婺源站','短途高铁；北线村落需局部包车。','婺源站']]);hours+=2.2;
    if(has('huangling')){assign(first,'huangling','上午—中午','篁岭观景约3小时，随后转北线，建议早出发。');hours+=2.0;}
    if(has('jujing')){if(!has('huangling')){assign(first,'jujing','中午—下午','前往石城途中短停，俯瞰村庄。');hours+=.4;}else warnings.push('篁岭＋菊径＋石城同日路程偏满：已优先保留篁岭和石城，菊径未排入。');}
    assign(first,'shicheng','傍晚抵达','入住石城程村附近，提前熟悉次晨拍摄点。');
    setup(second,'jiangxi','婺源','石城清晨','红枫、村落、晨雾','视下一站调整','红枫和晨雾不保证，清晨气温偏低。',[]);assign(second,'shicheng','06:15—09:00','石城拍摄安排跨两天，是同一景点的连续游览。');
    // 清晨后的半天可用于前往三清山，为次日爬山留足时间。
    if(has('sanqing')){days[second].place='婺源 / 三清山';days[second].night='三清山山脚';days[second].events.push(['中午—下午','石城 → 三清山索道口','建议包车约2—3小时，路况以当天为准。','三清山金沙索道']);hours+=2.4;}
    else{days[second].events.push(['中午—下午','前往下一站','根据后续景点选择上饶/弋阳/鹰潭方向。','上饶站']);hours+=1.5;}
    from='wuyuan';
   }
  }else if(reserve(1)){
   const index=take();setup(index,'jiangxi','婺源','婺源村落','景区与乡村公路','婺源或上饶','篁岭与菊径分布在不同方向，若同时选择须预留额外包车时间。',[['上午','上饶 → 婺源站','短途高铁再转景区/村落汽车。','婺源站']]);hours+=1.8;
   if(has('huangling')){assign(index,'huangling','09:30—13:30');hours+=1.0;}
   if(has('jujing')){assign(index,'jujing',has('huangling')?'15:30—16:30':'下午','村落停靠可能需要提前找车。');hours+=1.3;}
   from='wuyuan';
  }
 }
 if(south&&has('sanqing')&&!placed.has('sanqing')){
  if(reserve(1)){
   const n=take();setup(n,'jiangxi','三清山','三清山','花岗岩峰林、栈道','三清山山脚 / 上饶','索道维修、大风或浓雾会改变上山方案。',[['清晨—上午','前往索道入口','如从上饶出发，通常需要额外约1—2小时接驳。','三清山金沙索道']]);
   assign(n,'sanqing','09:30—16:00','沿南清园、东方女神与巨蟒出山景观区选核心步道；实际开放与路线需确认。');hours+=from==='wuyuan'?1.3:2.4;from='sanqing';
  }
 }
 if(south&&has('guifeng')&&!placed.has('guifeng')){
  if(reserve(1)){
   const n=take();setup(n,'jiangxi','弋阳','龟峰丹霞','丹霞地貌、徒步','弋阳县城 / 鹰潭','从上饶或玉山方向坐高铁至弋阳，再转车前往景区；脚程较多。',[['上午','前往弋阳龟峰','高铁＋接驳，前一晚在三清山时需额外预留公路时间。','弋阳站']]);assign(n,'guifeng','10:00—16:00');hours+=from==='sanqing'?2.5:1.8;from='yiyang';
  }
 }
 if(south&&has('longhu')&&!placed.has('longhu')){
  if(reserve(1)){
   const n=take();setup(n,'jiangxi','鹰潭','龙虎山','丹霞河谷、泸溪河','鹰潭 / 南昌','竹筏取决于水位、天气与现场运营；前一晚住鹰潭更方便。',[['上午','前往鹰潭龙虎山','乘高铁至鹰潭北，另乘汽车到景区。','鹰潭北站']]);assign(n,'longhu','10:00—16:30');hours+=from==='yiyang'?1.6:2.4;from='yingtan';
  }
 }
 if(south&&has('wucheng')&&!placed.has('wucheng')){
  if(reserve(2)){
   const n=take(),next=take();setup(n,'jiangxi','南昌 / 永修','转场至吴城','高铁＋城市公交/包车','永修 / 南昌','吴城不在上饶—婺源—三清山短线内，需绕行南昌、永修。',[['白天','前往南昌/永修','根据前一站从上饶、鹰潭或南昌换乘至永修、吴城；出发前核实班车。','永修站'],['傍晚','入住并确认观鸟点','提前核实次晨鸟群位置，避免惊扰野生动物。','吴城候鸟小镇']]);hours+=4.0;
   setup(next,'jiangxi','吴城','鄱阳湖候鸟湿地','清晨观鸟','南昌 / 永修','鸟群位置随水位变化，观鸟需使用安全开放区域。',[]);assign(next,'wucheng','06:30—13:00','到大湖池等允许进入的观鸟点，建议携带长焦和防风衣。');hours+=2.0;from='wucheng';
  }
 }
 // 可用空白天保留天气缓冲，而不是强制塞满。
 for(const n of restDays){if(south&&days[n].title==='预留时间'){
  setup(n,'jiangxi',from==='wucheng'?'南昌':from==='nanchang'?'南昌':from==='yingtan'?'鹰潭':from==='yiyang'?'弋阳':from==='wuyuan'?'婺源':from==='pingxiang'?'萍乡':'上饶','天气机动 / 休息','自由活动或补拍',from==='wucheng'?'南昌':from==='nanchang'?'南昌':from==='yingtan'?'鹰潭':from==='pingxiang'?'萍乡':'上饶','可以保留这一天等天气，或再从景点池选择适合的地方。',[]);
 }}
 const toGuangzhou=!north&&!south?'广州':north&&!south?'太原':from==='wucheng'?'南昌西':from==='nanchang'?'南昌西':from==='yingtan'?'鹰潭北':from==='yiyang'?'弋阳/上饶':from==='pingxiang'?'萍乡北':'上饶';
 transit(8,'广州',!north&&!south?'广州交通备用日':`${toGuangzhou} → 广州`,'高铁 / 动车，不安排中途航班','广州南站附近','请核对真实直达/中转时刻，建议12月5日就抵达广州。',[['上午—下午',`${toGuangzhou} → 广州南（待确认）`,'以12306实际车次为准；路程时间随出发站和换乘而变化。','广州南站']]);hours+=north&&!south?10:from==='wucheng'||from==='nanchang'?4.3:from==='yingtan'?5.8:from==='pingxiang'?3.5:5.5;
 transit(9,'梧州','广州 → 梧州','12月6日必须返回梧州','梧州（返家）','建议选择白天动车，不把返程风险压在末班车上。',[['白天','广州南 → 梧州南','正式车次以12306为准。','梧州南站']]);hours+=1.6;
 const missing=[...ids].filter(id=>!placed.has(id));
 if(!ids.size)warnings.push('尚未选景点：行程只包含基本交通日和空白机动日。');
 if(skewer&&!north)warnings.push('沾串仅顺路安排：当前未选择太原/山西景点，不会为吃沾串增加省份、航班或住宿。');
 if(missing.length)warnings.push(`未排入 ${missing.length} 处：${missing.map(label).join('、')}。当前日期或相邻交通时间不足；请取消其他景点，或选择更集中的区域。`);
 if(north&&south)warnings.push('山西与江西同时保留时，12月1日须整天跨省乘高铁，江西实际只有12月2—4日三个游览日。');
 if(north&&ids.has('wugong'))warnings.push('武功山位于江西西部，而山西跨省高铁先抵上饶：本次不倒走萍乡；建议选择纯江西自然路线。');
 if(ids.has('hengshan'))warnings.push('恒山冬季开放与结冰风险需要临行确认，网页不能实时判定登山是否安全。');
 if(ids.has('wucheng')&&!placed.has('wucheng'))warnings.push('鄱阳湖吴城需预留两日，山西＋江西紧凑版通常容纳不下；更推荐单独选择江西自然线。');
 // 江西单省默认采用铁路，不再为省份与沾串决策生成无必要的提示。
 const unique=[...new Set(missing)].sort();
 const budget=buildEstimate(north,south,placed);
 const tasks=buildTasks(north,south,placed,days);
 const selectedCount=ids.size;
 const visited=placed.size;
 return {north,south,days,visited,selectedCount,assigned:placed,unplaced:unique,warnings,hours:Math.round(hours),budget,tasks,skewer:enRouteSkewer,skewerRequested:Boolean(skewer)};
}
function buildEstimate(north,south,selected){const result=[];const add=(t,l,h)=>result.push([t,l,h]);
 add('往返梧州—广州动车及接驳',350,750);
 if(north){add('广州→太原两人机票',1200,3300);add('太原与大同铁路/接驳',350,850)}
 if(north&&south)add('太原南→上饶两人高铁',1400,1700);
 if(!north&&south)add('广州→江西两人高铁',selected.has('wugong')?650:1000,selected.has('wugong')?1200:1700);
 add(north&&!south?'太原→广州两人铁路':south?'江西→广州两人高铁':'广州当地交通',north&&!south?1500:south?1100:200,north&&!south?2700:south?1700:400);
 let local=selected.has('shicheng')?550:200;
 if(selected.has('wucheng'))local+=700;
 if(selected.has('hanging')||selected.has('hengshan')||selected.has('pagoda'))local+=550;
 if(selected.has('sanqing'))local+=300;
 if(selected.has('wugong'))local+=300;
 if(selected.has('huangling'))local+=250;
 if(selected.has('longhu'))local+=180;
 if(selected.has('guifeng'))local+=160;
 add('景区往返包车/公交等',local,Math.round(local*1.7));
 add('9晚两人住宿',2600,4600);add('两人餐饮',1900,3300);
 let tickets=selected.size*105+150;add('门票/索道（粗估）',tickets,tickets*2);
 return result;
}
function buildTasks(north,south,placed,days){const out=[['11/27 梧州→广州晚间动车','以12306正式车次为准；注意广州南到住宿的接驳']];
 if(north)out.push(['11/28 广州→太原去程航班','两人经济舱，指定日期票价、时刻、行李额待核实']);
 if(north&&(placed.has('yungang')||placed.has('hanging')||placed.has('hengshan')||placed.has('pagoda')))out.push(['大同/浑源用车和高铁','核对大同往返太原的高铁、冬季道路与纯玩车辆']);
 if(north&&south)out.push(['12/1 太原南→上饶','G3127参考07:04—15:38，实际是否开行及两张票待核实']);
 if(!north&&south)out.push(['11/28 广州→江西铁路',placed.has('wugong')?'优先查询广州南→萍乡北高铁，再预订武功山景区接驳':'按选定出发站重新查12306']);
 if(placed.has('wugong'))out.push(['武功山接驳与天气','核实萍乡北旅游专线、景区索道、登山步道及山顶风力/结冰情况']);
 if(placed.has('shicheng'))out.push(['婺源石城住宿与接驳','确认暖气、热水、包车费用及清晨步行距离']);
 if(placed.has('sanqing'))out.push(['三清山索道与天气','确认运营入口、山上气温以及替代线路']);
 if(placed.has('wucheng'))out.push(['吴城湿地观鸟','核对水位、可进入观鸟点及南昌/永修接驳']);
 if(placed.has('longhu'))out.push(['龙虎山游船/竹筏','确认季节性运营、水位和景区交通']);
 out.push(['12/5 回广州、12/6 回梧州','先安排12/5抵广州，避免当日跨省铁路失误']);
 return out;
}
function renderPlannerSummary(plan){
 const total=plan.selectedCount,done=plan.visited;$('#planPickCount').textContent=String(total)+(plan.skewer?' ＋顺路沾串':plan.skewerRequested?'（沾串不绕路）':'');$('#planScheduledCount').textContent=done+' / '+total;
 $('#planTravelHours').textContent='约 '+Math.max(plan.hours-3,0)+'—'+(plan.hours+5)+' 小时';
 $('#planStatus').textContent=plan.unplaced.length?`未排入 ${plan.unplaced.length} 处`:'已按日期排入';
 $('#planStatus').classList.toggle('needs-review',plan.unplaced.length>0);
 const warnings=plan.warnings.slice();$('#planWarnings').innerHTML=warnings.length?warnings.map(s=>`<p>${esc(s)}</p>`).join(''):'<p>已安排全部勾选景点。车次、门票及交通耗时仍需在正式出票时确认。</p>';
 $('#mobilePickCount').textContent=done+'/'+total;
 $('#poolDescription').textContent=plan.north?'已选择山西景点，按条件安排太原入程；沾串只在太原时可选。':'默认走江西铁路自然线；即使选中沾串也不因此增加山西行程。';
 const datongVisited=plan.days.some(d=>d.region==='shanxi'&&d.place.includes('大同'));
 $('#skewerCard').hidden=!plan.skewer;$('#datongFoodCard').hidden=!datongVisited;$('#foodGrid').hidden=!plan.skewer&&!datongVisited;
 $('#foodNotice').textContent=plan.skewer?'已到太原，可顺路安排沾串；营业时间须核实。':plan.north?'太原沾串不是固定目的，想顺路品尝可打开上方选项。':'当前为江西自然路线，不经过太原；无需为沾串增加行程。沿途就近选择当地餐饮。';
 $('#factRouteMode').textContent=plan.north?'含山西：广州飞太原，后续铁路':'江西自然：全程铁路/公路';
 $('#factSelected').textContent=plan.visited+' / '+plan.selectedCount+' 处已排入';
 $('#factNature').textContent=[...plan.assigned].filter(id=>POOL_INFO[id]?.kind==='nature'||POOL_INFO[id]?.kind==='both').length+' 处自然/混合景点';
}
function renderRoute(plan){
 const entry=plan.days[1]?.title||'广州 → 江西';
 const blocks=[['11/27','梧州 → 广州','晚间动车'],[plan.north?'11/28—30':'11/28',plan.north?'太原 / 大同':entry,plan.north?'去程航班＋当地铁路':'高铁进入江西']];
 if(plan.north&&plan.south)blocks.push(['12/01','太原 → 上饶','整天高铁转场']);
 const scenicDates=plan.north?['12/02—04']:['11/29—12/04'];
 const name=plan.south?[...plan.assigned].filter(id=>SPOT_BY_ID[id].province.startsWith('江西')).map(label).join('、')||'江西机动':'山西机动';
 blocks.push([scenicDates[0],name||'自由活动','按勾选自动计算'],['12/05','→ 广州','乘铁路返回'],['12/06','广州 → 梧州','当日到家']);
 $('#routeSteps').innerHTML=blocks.map(b=>`<li><b>${esc(b[0])}</b><strong>${esc(b[1])}</strong><small>${esc(b[2])}</small></li>`).join('');
 $('#routeNote').innerHTML=plan.north&&plan.south?`<b>跨省铁路（参考）</b><span>G3127 太原南 07:04 → 上饶 15:38，约8小时34分。12月1日是否有票、是否按此时刻运行均未确认。</span><a href="https://www.12306.cn/" target="_blank" rel="noopener noreferrer">12306 ↗</a>`:`<b>铁路优先</b><span>${plan.north?'12月5日须查太原至广州当天可到达的高铁／换乘方案。':'11月28日从广州进入江西（根据已选景点选择萍乡、上饶、弋阳、鹰潭或南昌），12月5日返回广州；具体车次按选定站点复核。'}所有时刻均需届时在12306复核。</span><a href="https://www.12306.cn/" target="_blank" rel="noopener noreferrer">12306 ↗</a>`;
}
window.addEventListener('DOMContentLoaded',()=>Planner.init());

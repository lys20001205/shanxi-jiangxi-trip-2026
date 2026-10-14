'use strict';
const $=(q,r=document)=>r.querySelector(q);
const $$=(q,r=document)=>Array.from(r.querySelectorAll(q));
const esc=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=(n)=>new Intl.NumberFormat('zh-CN',{style:'currency',currency:'CNY',maximumFractionDigits:0}).format(n);
const LS='shanxi-jiangxi-trip-2026-';
function readSaved(name,fallback){try{const v=localStorage.getItem(LS+name);return v===null?fallback:JSON.parse(v)}catch(e){return fallback}}
function save(name,v){try{localStorage.setItem(LS+name,JSON.stringify(v))}catch(e){}}
function amap(q){return 'https://uri.amap.com/search?keyword='+encodeURIComponent(q)}
const SPOT_BY_ID=Object.fromEntries(SPOTS.map(s=>[s.id,s]));
let activeDays=DAYS,activeBudget=BUDGET,activeTasks=TASKS;
const LICENSES={
 'CC BY 2.0':'https://creativecommons.org/licenses/by/2.0/',
 'CC BY 3.0':'https://creativecommons.org/licenses/by/3.0/',
 'CC BY 4.0':'https://creativecommons.org/licenses/by/4.0/',
 'CC BY-SA 2.0':'https://creativecommons.org/licenses/by-sa/2.0/',
 'CC BY-SA 3.0':'https://creativecommons.org/licenses/by-sa/3.0/',
 'CC BY-SA 4.0':'https://creativecommons.org/licenses/by-sa/4.0/',
 'CC0':'https://creativecommons.org/publicdomain/zero/1.0/',
 'Public domain':'https://creativecommons.org/publicdomain/mark/1.0/'
};
function imageUrl(p,large=false){return 'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(p[0])+(large?'':'?width=720')}
function sourceUrl(p){return 'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(p[0].replaceAll(' ','_'))}
function getPhotos(ids,desired=4){
 const sources=ids.map(id=>SPOT_BY_ID[id]).filter(Boolean);
 if(!sources.length)return [];
 if(sources.length===1)return sources[0].photos.slice(0,desired).map(p=>({spot:sources[0],p}));
 const results=[];let i=0;
 while(results.length<desired){let added=false;for(const s of sources){if(s.photos[i]){results.push({spot:s,p:s.photos[i]});added=true;if(results.length===desired)break}}if(!added)break;i++}return results;
}
function photoButton(spot,p,mode='gallery'){
 const url=imageUrl(p), original=sourceUrl(p);
 const label=esc(spot.name+'：'+p[1]);
 return `<button type="button" class="photo-btn" data-file="${esc(p[0])}" data-spot="${esc(spot.id)}" aria-label="查看 ${label} 的大图"><img loading="lazy" decoding="async" src="${esc(url)}" alt="${label}" referrerpolicy="no-referrer"><span class="img-fallback">无法载入图片<br>可查看来源</span>${mode==='day'?`<span>${esc(spot.name)}</span>`:''}</button>`;
}
function photoTile(spot,p){return `<figure>${photoButton(spot,p)}<figcaption><b>${esc(p[1])}</b><a href="${sourceUrl(p)}" target="_blank" rel="noopener noreferrer" title="作者 ${esc(p[2])}，${esc(p[3])}">${esc(p[2])} · ${esc(p[3])} · 原图 ↗</a></figcaption></figure>`}
function wirePhotos(root=document){$$('.photo-btn',root).forEach(b=>b.addEventListener('click',()=>openPhoto(b.dataset.spot,b.dataset.file)));$$('.photo-btn img',root).forEach(img=>img.addEventListener('error',()=>img.closest('.photo-btn').classList.add('broken'),{once:true}));}
function openPhoto(id,file){const s=SPOT_BY_ID[id],p=s?.photos.find(x=>x[0]===file);if(!p)return;const dlg=$('#photoDialog');$('#dialogImage').src=imageUrl(p,true);$('#dialogImage').alt=s.name+' · '+p[1];$('#dialogTitle').textContent=s.name+' · '+p[1];$('#dialogSource').textContent=`摄影：${p[2]} · ${p[3]}`;$('#dialogOriginal').href=sourceUrl(p);$('#dialogOriginal').title='原图及授权页面（'+(LICENSES[p[3]]||p[3])+'）';dlg.showModal();}
$('#closePhoto').addEventListener('click',()=>$('#photoDialog').close());$('#photoDialog').addEventListener('click',e=>{if(e.target.id==='photoDialog')e.target.close()});
function renderHero(){const previews=[['yungang',0,'云冈石窟'],['hanging',0,'悬空寺'],['sanqing',0,'三清山']];$('#heroPhotos').innerHTML=previews.map(([id,idx,label])=>{const p=SPOT_BY_ID[id].photos[idx];return `<div class="hero-img"><img src="${imageUrl(p)}" alt="${esc(label)}" referrerpolicy="no-referrer" decoding="async"><span class="img-fallback">图片暂未载入</span><span class="image-label">${esc(label)}</span></div>`}).join('');$$('.hero-img img').forEach(img=>img.addEventListener('error',()=>img.closest('.hero-img').classList.add('broken'),{once:true}));}
let currentFilter='all';
function renderDays(){const notes=readSaved('day-notes',{});const shown=activeDays.filter(d=>currentFilter==='all'||d.region===currentFilter);
 $('#dayList').innerHTML=shown.map(d=>{
  const dateDay=d.date.slice(-2);const month=d.date.slice(5,7);
  const entries=d.events.map(e=>`<div class="slot"><div class="slot-time">${esc(e[0])}</div><div><b>${esc(e[1])}</b><p>${esc(e[2])}</p><a href="${amap(e[3])}" target="_blank" rel="noopener noreferrer">地图查询 ↗</a></div></div>`).join('');
  const pictures=getPhotos(d.featured,4);const gallery=pictures.length?`<div class="day-photo-strip">${pictures.map(({spot,p})=>photoButton(spot,p,'day')).join('')}</div>`:'';
  return `<details class="day-card panel" id="day-${d.date}" ${d.date==='2026-11-29'?'open':''}><summary><span class="date"><strong>${dateDay}</strong><small>${month}月 · ${d.w}</small></span><div><div class="day-label">${esc(d.title)}</div><div class="day-sub">${esc(d.sub)}</div></div><span class="region">${esc(d.place)}</span><span class="chev">⌄</span></summary><div class="day-content">${gallery}<p class="day-note">${esc(d.note)}</p><div class="slot-list">${entries}</div><div class="day-footer">住宿：${esc(d.night)}</div><label class="notes-label" for="note-${d.date}">个人备注（仅保存当前设备）</label><textarea class="notes-box" id="note-${d.date}" data-day="${d.date}" placeholder="酒店地址、预订编号提醒、交通备注……"></textarea></div></details>`;
 }).join('');
 $$('textarea[data-day]').forEach(ta=>{ta.value=notes[ta.dataset.day]||'';ta.addEventListener('input',()=>{const v=readSaved('day-notes',{});v[ta.dataset.day]=ta.value;save('day-notes',v)});});wirePhotos($('#dayList'));}
function renderPlaces(){const root=$('#placeList');root.innerHTML=SPOTS.map(s=>`<article class="place-card panel" id="place-${esc(s.id)}" data-id="${esc(s.id)}"><div class="place-top"><div class="place-title"><small>${esc(s.province)}</small><h3>${esc(s.name)}</h3><p>${esc(s.description)}</p></div><div class="place-side"><span class="place-kind">${POOL_INFO[s.id].kind==='nature'?'自然':POOL_INFO[s.id].kind==='both'?'自然 / 人文':'人文'}</span><span>${esc(POOL_INFO[s.id].time)}</span><label class="pick-control"><input type="checkbox" data-pick="${esc(s.id)}" ${window.PLANNER_SELECTED?.has(s.id)?'checked':''}><span>加入行程</span></label></div></div><div class="gallery">${s.photos.map(p=>photoTile(s,p)).join('')}</div><div class="pool-access"><span>接驳：${esc(POOL_INFO[s.id].transport)}</span><span>季节：${esc(POOL_INFO[s.id].season)}</span></div><div class="place-footer"><span>${esc(s.risk)}</span><a href="${amap(s.search)}" target="_blank" rel="noopener noreferrer">查看位置 ↗</a></div></article>`).join('');wirePhotos(root);}
function setFilter(filter){currentFilter=filter;$$('[data-filter]').forEach(b=>{const on=b.dataset.filter===filter;b.setAttribute('aria-pressed',String(on));b.classList.toggle('selected',on)});renderDays();}
$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>setFilter(b.dataset.filter)));
function renderBudget(){let t=Number($('#budgetRange').value)/100,total=0;$('#budgetItems').innerHTML=activeBudget.map(([title,lo,hi])=>{const num=Math.round((lo+(hi-lo)*t)/10)*10;total+=num;return `<div class="budget-row"><span>${esc(title)}</span><b>${money(num)}</b></div>`}).join('');$('#budgetValue').textContent=money(total);$('#budgetPerPerson').textContent='人均约 '+money(Math.round(total/2));save('budget',Number($('#budgetRange').value));}
$('#budgetRange').value=readSaved('budget',50);$('#budgetRange').addEventListener('input',renderBudget);
function updateTaskCount(){const n=$$('[data-task]:checked').length;$('#taskCounter').textContent=n+' / '+activeTasks.length;$('#taskProgress').style.width=(activeTasks.length?n/activeTasks.length*100:0)+'%'}
function renderTasks(){const completed=readSaved('planner-tasks',{});$('#tasksList').innerHTML=activeTasks.map(([title,sub],i)=>`<label class="task"><input type="checkbox" data-task="${i}" ${completed[title]?'checked':''}><span><b>${esc(title)}</b><small>${esc(sub)}</small></span></label>`).join('');$$('[data-task]').forEach(c=>c.addEventListener('change',()=>{const saved=readSaved('planner-tasks',{});saved[activeTasks[Number(c.dataset.task)][0]]=c.checked;save('planner-tasks',saved);updateTaskCount()}));updateTaskCount();}
function renderReferences(){$('#referenceList').innerHTML=LINKS.map(([name,url,detail])=>`<a class="reference" href="${esc(url)}" target="_blank" rel="noopener noreferrer"><span><strong>${esc(name)}</strong><small>${esc(detail)}</small></span><em aria-hidden="true">↗</em></a>`).join('');}
function announce(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(window.toastTimeout);window.toastTimeout=setTimeout(()=>el.classList.remove('show'),2200)}
$('#copyLink').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);announce('链接已复制')}catch(e){announce('可从浏览器地址栏复制链接')}});
function icsEsc(s){return String(s).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;')}
$('#exportCalendar').addEventListener('click',()=>{const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SHANXI JIANGXI TRIP//2026//ZH','CALSCALE:GREGORIAN'];activeDays.forEach((d,i)=>{const dt=new Date(d.date+'T12:00:00Z');dt.setUTCDate(dt.getUTCDate()+1);const end=dt.toISOString().slice(0,10).replaceAll('-','');lines.push('BEGIN:VEVENT','UID:sz2026-'+d.date+'@travel-notes','DTSTAMP:20261014T000000Z','DTSTART;VALUE=DATE:'+d.date.replaceAll('-',''),'DTEND;VALUE=DATE:'+end,'SUMMARY:'+icsEsc(d.title),'DESCRIPTION:'+icsEsc(d.note+'\n住宿：'+d.night),'END:VEVENT')});lines.push('END:VCALENDAR');const u=URL.createObjectURL(new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download='山西江西2026旅行.ics';a.click();setTimeout(()=>URL.revokeObjectURL(u),1500);announce('日历文件已生成')});
$('#printPage').addEventListener('click',()=>{const state=$$('.day-card').map(el=>[el,el.open]);$$('.day-card').forEach(el=>el.open=true);window.print();state.forEach(([el,v])=>el.open=v)});
function updateCountdown(){const days=Math.ceil((Date.parse('2026-11-27T00:00:00+08:00')-Date.now())/86400000);$('#countdown').textContent=days>0?`距离出发 ${days} 天`:days>=-10?'行程日期内':'行程日期已过';}
$('#skewerMap').href=amap('小溅沾串 太原 开化寺街');
$('#siteVersion').textContent=TRIP_META.version;
renderHero();renderDays();renderPlaces();renderBudget();renderTasks();renderReferences();updateCountdown();
function openHashedDay(){const hash=decodeURIComponent(location.hash);if(!hash.startsWith('#day-'))return;const el=document.getElementById(hash.substring(1));if(!el&&currentFilter!=='all'){setFilter('all')};const dest=document.getElementById(hash.substring(1));if(dest)dest.open=true;}
window.addEventListener('hashchange',openHashedDay);openHashedDay();
if('serviceWorker' in navigator && location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));

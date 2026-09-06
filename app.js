import { store } from "./storage.js";
import { initFileTest } from "./file-test.js";

const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const dateKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const todayKey = dateKey(new Date());
const keys = { plans:"plans", people:"people", activities:"activities" };
const viewNames = { today:"Today", people:"People", calendar:"Calendar", activities:"Activities" };
let shownMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1), selectedDate = todayKey, peopleFilter = "Alla", activityFilter = "all", activityCategory = "all", activitySort = "newest";
const uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
const read = (key, fallback=[]) => store.get(key, fallback);
const write = (key, value) => store.set(key, value);
const prettyDate = (key, options={weekday:"long",day:"numeric",month:"long"}) => { const [y,m,d] = key.split("-").map(Number); return new Intl.DateTimeFormat("sv-SE",options).format(new Date(y,m-1,d)); };
const initials = (name) => name.split(/\s+/).slice(0,2).map(w=>w[0]).join("").toUpperCase();

function showView() {
  const wanted = location.hash.slice(1), active = viewNames[wanted] ? wanted : "today";
  $$('[data-view]').forEach(v=>v.classList.toggle("is-active",v.dataset.view===active));
  $$('[data-nav]').forEach(item=>{ const on=item.dataset.nav===active; item.classList.toggle("is-active",on); on ? item.setAttribute("aria-current","page") : item.removeAttribute("aria-current"); });
  document.title=`${viewNames[active]} · Social Circle`; if(active==="calendar") renderCalendar();
}

function makePlanCard(plan, allPlans, target) {
  const card=document.createElement("article"); card.className="plan-card clickable-card"; card.tabIndex=0; card.setAttribute("role","button"); card.setAttribute("aria-label",`Öppna ${plan.title}`); card.onclick=()=>openPlanDialog("",plan); card.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openPlanDialog("",plan);}};
  const time=document.createElement("span"); time.className="plan-time"; time.textContent=plan.time;
  const details=document.createElement("div"), title=document.createElement("h3"), sub=document.createElement("p"); title.textContent=plan.title; sub.textContent=plan.date===todayKey?"Idag":prettyDate(plan.date,{day:"numeric",month:"short"}); details.append(title,sub);
  const remove=document.createElement("button"); remove.type="button"; remove.textContent="×"; remove.setAttribute("aria-label",`Ta bort ${plan.title}`); remove.onclick=e=>{e.stopPropagation();write(keys.plans,allPlans.filter(i=>i.id!==plan.id));};
  card.append(time,details,remove); target.append(card);
}

function renderToday() {
  const all=read(keys.plans).map(p=>({...p,date:p.date||todayKey})), plans=all.filter(p=>p.date===todayKey).sort((a,b)=>a.time.localeCompare(b.time));
  $("#plan-list").replaceChildren(); $("#empty-state").hidden=plans.length>0; $("#plan-count").textContent=`${plans.length} ${plans.length===1?"plan":"planer"}`; plans.forEach(p=>makePlanCard(p,all,$("#plan-list")));
}

function renderPeople() {
  const people=read(keys.people), visible=peopleFilter==="Alla"?people:people.filter(p=>p.group===peopleFilter); $("#people-list").replaceChildren(); $("#people-empty").hidden=visible.length>0;
  visible.forEach(person=>{
    const card=document.createElement("article"); card.className="person-card clickable-card"; card.tabIndex=0; card.setAttribute("role","button"); card.setAttribute("aria-label",`Öppna ${person.name}`); card.onclick=()=>openPersonDialog(person); card.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openPersonDialog(person);}}; const avatar=document.createElement("span"); avatar.className="person-avatar"; avatar.textContent=initials(person.name);
    const info=document.createElement("div"), name=document.createElement("h2"), meta=document.createElement("p"); name.textContent=person.name; meta.textContent=`${person.group} · kontakt var ${person.frequency} dag`; info.append(name,meta);
    const actions=document.createElement("div"); actions.className="card-actions"; const contacted=document.createElement("button"); contacted.className="small-button"; contacted.textContent=person.lastContact===todayKey?"✓ Hörts idag":"Hörts idag"; contacted.disabled=person.lastContact===todayKey; contacted.onclick=e=>{e.stopPropagation();person.lastContact=todayKey;write(keys.people,people);};
    const remove=document.createElement("button"); remove.className="icon-button"; remove.textContent="×"; remove.setAttribute("aria-label",`Ta bort ${person.name}`); remove.onclick=e=>{e.stopPropagation();write(keys.people,people.filter(i=>i.id!==person.id));}; actions.append(contacted,remove); card.append(avatar,info,actions); $("#people-list").append(card);
  });
}

function renderCalendar() {
  const plans=read(keys.plans).map(p=>({...p,date:p.date||todayKey})), y=shownMonth.getFullYear(), m=shownMonth.getMonth(); $("#month-label").textContent=new Intl.DateTimeFormat("sv-SE",{month:"long",year:"numeric"}).format(shownMonth);
  const grid=$("#calendar-grid"); grid.replaceChildren(); const offset=(new Date(y,m,1).getDay()+6)%7, total=new Date(y,m+1,0).getDate();
  for(let i=0;i<offset;i++){const blank=document.createElement("span");blank.className="calendar-blank";grid.append(blank);}
  for(let day=1;day<=total;day++){const key=dateKey(new Date(y,m,day)), button=document.createElement("button"); button.type="button";button.textContent=day;button.className="calendar-day";if(key===todayKey)button.classList.add("is-today");if(key===selectedDate)button.classList.add("is-selected");if(plans.some(p=>p.date===key))button.classList.add("has-plan");button.setAttribute("aria-label",prettyDate(key));button.onclick=()=>{selectedDate=key;renderCalendar();};grid.append(button);}
  $("#selected-date-label").textContent=selectedDate===todayKey?"Idag":prettyDate(selectedDate); const selected=plans.filter(p=>p.date===selectedDate).sort((a,b)=>a.time.localeCompare(b.time)); $("#calendar-plans").replaceChildren(); $("#calendar-empty").hidden=selected.length>0;selected.forEach(p=>makePlanCard(p,plans,$("#calendar-plans")));
}

const activityIcons={Fika:"☕",Mat:"🍽",Utomhus:"🌿",Kultur:"🎭",Träning:"⚡",Annat:"✦"};
function renderActivities() {
  const defaults=[{id:"default-fika",title:"Ta en fika",category:"Fika",cost:1,duration:60,place:"Café",favorite:false},{id:"default-walk",title:"Gå en promenad",category:"Utomhus",cost:0,duration:60,place:"Utomhus",favorite:false},{id:"default-dinner",title:"Laga middag ihop",category:"Mat",cost:2,duration:120,place:"Hemma",favorite:false}];
  let activities=read(keys.activities,null);if(!activities?.length){activities=defaults;store.set(keys.activities,activities);} activities=activities.map(a=>({...a,cost:Number(a.cost??0),duration:Number(a.duration??60),place:a.place||"Ej angivet"})); let visible=activities.filter(a=>(activityFilter!=="favorite"||a.favorite)&&(activityCategory==="all"||a.category===activityCategory));
  const sorters={newest:(a,b)=>activities.indexOf(b)-activities.indexOf(a),title:(a,b)=>a.title.localeCompare(b.title,"sv"),cost:(a,b)=>a.cost-b.cost,duration:(a,b)=>a.duration-b.duration,place:(a,b)=>a.place.localeCompare(b.place,"sv")}; visible=visible.slice().sort(sorters[activitySort]); $("#activity-grid").replaceChildren();
  visible.forEach(activity=>{const card=document.createElement("article");card.className="activity-card";const top=document.createElement("div");top.className="activity-top";const icon=document.createElement("span");icon.textContent=activityIcons[activity.category]||"✦";const favorite=document.createElement("button");favorite.className=`favorite-button${activity.favorite?" is-favorite":""}`;favorite.textContent=activity.favorite?"♥":"♡";favorite.setAttribute("aria-label","Markera som favorit");favorite.onclick=()=>{activity.favorite=!activity.favorite;write(keys.activities,activities);};top.append(icon,favorite);const title=document.createElement("h2");title.textContent=activity.title;const category=document.createElement("p");category.className="activity-meta";const costs=["Gratis","Billigt","Mellan","Dyrare"];category.textContent=`${activity.category} · ${costs[activity.cost]||"Gratis"} · ${activity.duration<60?activity.duration+" min":activity.duration/60+" tim"} · ${activity.place}`;const actions=document.createElement("div");actions.className="activity-actions";const plan=document.createElement("button");plan.className="small-button";plan.textContent="Planera";plan.onclick=()=>openPlanDialog(activity.title);const edit=document.createElement("button");edit.className="text-button";edit.textContent="Redigera";edit.onclick=()=>openActivityDialog(activity);const remove=document.createElement("button");remove.className="text-button danger";remove.textContent="Ta bort";remove.onclick=()=>write(keys.activities,activities.filter(i=>i.id!==activity.id));actions.append(plan,edit,remove);card.append(top,title,category,actions);$("#activity-grid").append(card);});
  if(!visible.length){const empty=document.createElement("div");empty.className="mini-empty activity-empty";empty.innerHTML="<span>♡</span><h2>Inga favoriter ännu</h2><p>Tryck på hjärtat vid en idé för att spara den här.</p>";$("#activity-grid").append(empty);}
}

function renderAll(){renderToday();renderPeople();renderCalendar();renderActivities();}
function openPlanDialog(title="",plan=null){const f=$("#plan-form");f.reset();f.elements.id.value=plan?.id||"";f.elements.title.value=plan?.title||title;f.elements.date.value=plan?.date||selectedDate||todayKey;f.elements.time.value=plan?.time||"18:00";$("#plan-dialog-title").textContent=plan?"Redigera plan":"Lägg till en plan";$("#plan-dialog").showModal();setTimeout(()=>f.elements.title.focus(),50);}
function openPersonDialog(person=null){const f=$("#person-form");f.reset();f.elements.id.value=person?.id||"";f.elements.name.value=person?.name||"";f.elements.group.value=person?.group||"Vänner";f.elements.frequency.value=person?.frequency||7;f.elements.notes.value=person?.notes||"";$("#person-dialog-title").textContent=person?person.name:"Ny person";$("#person-dialog").showModal();}
function openActivityDialog(activity=null){const f=$("#activity-form");f.reset();f.elements.id.value=activity?.id||"";f.elements.title.value=activity?.title||"";f.elements.category.value=activity?.category||"Fika";f.elements.cost.value=activity?.cost??0;f.elements.duration.value=activity?.duration??60;f.elements.place.value=activity?.place||"";$("#activity-dialog-title").textContent=activity?"Redigera aktivitet":"Ny idé";$("#activity-dialog").showModal();}
$$('[data-open]').forEach(button=>button.onclick=()=>button.dataset.open==="person-dialog"?openPersonDialog():openActivityDialog()); $$('[data-add-plan]').forEach(button=>button.onclick=()=>openPlanDialog()); $$('dialog').forEach(d=>d.addEventListener("click",e=>{if(e.target===d)d.close();}));
$("#plan-form").onsubmit=e=>{if(e.submitter?.value==="cancel")return;e.preventDefault();const d=new FormData(e.currentTarget),plans=read(keys.plans),item={id:d.get("id")||uid(),title:d.get("title").trim(),date:d.get("date"),time:d.get("time")},index=plans.findIndex(p=>p.id===item.id);index>=0?plans[index]=item:plans.push(item);write(keys.plans,plans);$("#plan-dialog").close();};
$("#person-form").onsubmit=e=>{if(e.submitter?.value==="cancel")return;e.preventDefault();const d=new FormData(e.currentTarget),people=read(keys.people),old=people.find(p=>p.id===d.get("id")),item={id:d.get("id")||uid(),name:d.get("name").trim(),group:d.get("group"),frequency:Number(d.get("frequency")),notes:d.get("notes").trim(),lastContact:old?.lastContact||null},index=people.findIndex(p=>p.id===item.id);index>=0?people[index]=item:people.push(item);write(keys.people,people);$("#person-dialog").close();};
$("#activity-form").onsubmit=e=>{if(e.submitter?.value==="cancel")return;e.preventDefault();const d=new FormData(e.currentTarget),activities=read(keys.activities),old=activities.find(a=>a.id===d.get("id")),item={id:d.get("id")||uid(),title:d.get("title").trim(),category:d.get("category"),cost:Number(d.get("cost")),duration:Number(d.get("duration")),place:d.get("place").trim()||"Ej angivet",favorite:old?.favorite||false},index=activities.findIndex(a=>a.id===item.id);index>=0?activities[index]=item:activities.push(item);write(keys.activities,activities);$("#activity-dialog").close();};
$("#people-filters").onclick=e=>{if(!e.target.dataset.group)return;peopleFilter=e.target.dataset.group;$$('#people-filters .filter-chip').forEach(b=>b.classList.toggle("is-active",b===e.target));renderPeople();}; $("#activity-filters").onclick=e=>{if(!e.target.dataset.activityFilter)return;activityFilter=e.target.dataset.activityFilter;$$('#activity-filters .filter-chip').forEach(b=>b.classList.toggle("is-active",b===e.target));renderActivities();};
$("#activity-category-filter").onchange=e=>{activityCategory=e.target.value;renderActivities();}; $("#activity-sort").onchange=e=>{activitySort=e.target.value;renderActivities();};
$("#prev-month").onclick=()=>{shownMonth=new Date(shownMonth.getFullYear(),shownMonth.getMonth()-1,1);renderCalendar();}; $("#next-month").onclick=()=>{shownMonth=new Date(shownMonth.getFullYear(),shownMonth.getMonth()+1,1);renderCalendar();};
const formatted=prettyDate(todayKey);$("#today-date").textContent=formatted.charAt(0).toUpperCase()+formatted.slice(1);$("#plan-date").value=todayKey;store.subscribe(renderAll);window.addEventListener("hashchange",showView);initFileTest();showView();renderAll();

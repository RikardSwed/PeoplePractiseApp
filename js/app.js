const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const dateKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const todayKey = dateKey(new Date());
const keys = { plans:"social-circle-plans", people:"social-circle-people", activities:"social-circle-activities" };
const viewNames = { today:"Today", people:"People", calendar:"Calendar", activities:"Activities" };
let shownMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1), selectedDate = todayKey, peopleFilter = "Alla", activityFilter = "all";
const uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
const read = (key, fallback=[]) => { try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; } catch { return fallback; } };
const write = (key, value) => { localStorage.setItem(key, JSON.stringify(value)); renderAll(); };
const prettyDate = (key, options={weekday:"long",day:"numeric",month:"long"}) => { const [y,m,d] = key.split("-").map(Number); return new Intl.DateTimeFormat("sv-SE",options).format(new Date(y,m-1,d)); };
const initials = (name) => name.split(/\s+/).slice(0,2).map(w=>w[0]).join("").toUpperCase();

function showView() {
  const wanted = location.hash.slice(1), active = viewNames[wanted] ? wanted : "today";
  $$('[data-view]').forEach(v=>v.classList.toggle("is-active",v.dataset.view===active));
  $$('[data-nav]').forEach(item=>{ const on=item.dataset.nav===active; item.classList.toggle("is-active",on); on ? item.setAttribute("aria-current","page") : item.removeAttribute("aria-current"); });
  document.title=`${viewNames[active]} · Social Circle`; if(active==="calendar") renderCalendar();
}

function makePlanCard(plan, allPlans, target) {
  const card=document.createElement("article"); card.className="plan-card";
  const time=document.createElement("span"); time.className="plan-time"; time.textContent=plan.time;
  const details=document.createElement("div"), title=document.createElement("h3"), sub=document.createElement("p"); title.textContent=plan.title; sub.textContent=plan.date===todayKey?"Idag":prettyDate(plan.date,{day:"numeric",month:"short"}); details.append(title,sub);
  const remove=document.createElement("button"); remove.type="button"; remove.textContent="×"; remove.setAttribute("aria-label",`Ta bort ${plan.title}`); remove.onclick=()=>write(keys.plans,allPlans.filter(i=>i.id!==plan.id));
  card.append(time,details,remove); target.append(card);
}

function renderToday() {
  const all=read(keys.plans).map(p=>({...p,date:p.date||todayKey})), plans=all.filter(p=>p.date===todayKey).sort((a,b)=>a.time.localeCompare(b.time));
  $("#plan-list").replaceChildren(); $("#empty-state").hidden=plans.length>0; $("#plan-count").textContent=`${plans.length} ${plans.length===1?"plan":"planer"}`; plans.forEach(p=>makePlanCard(p,all,$("#plan-list")));
}

function renderPeople() {
  const people=read(keys.people), visible=peopleFilter==="Alla"?people:people.filter(p=>p.group===peopleFilter); $("#people-list").replaceChildren(); $("#people-empty").hidden=visible.length>0;
  visible.forEach(person=>{
    const card=document.createElement("article"); card.className="person-card"; const avatar=document.createElement("span"); avatar.className="person-avatar"; avatar.textContent=initials(person.name);
    const info=document.createElement("div"), name=document.createElement("h2"), meta=document.createElement("p"); name.textContent=person.name; meta.textContent=`${person.group} · kontakt var ${person.frequency} dag`; info.append(name,meta);
    const actions=document.createElement("div"); actions.className="card-actions"; const contacted=document.createElement("button"); contacted.className="small-button"; contacted.textContent=person.lastContact===todayKey?"✓ Hörts idag":"Hörts idag"; contacted.disabled=person.lastContact===todayKey; contacted.onclick=()=>{person.lastContact=todayKey;write(keys.people,people);};
    const remove=document.createElement("button"); remove.className="icon-button"; remove.textContent="×"; remove.setAttribute("aria-label",`Ta bort ${person.name}`); remove.onclick=()=>write(keys.people,people.filter(i=>i.id!==person.id)); actions.append(contacted,remove); card.append(avatar,info,actions); $("#people-list").append(card);
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
  const defaults=[{id:"default-fika",title:"Ta en fika",category:"Fika",favorite:false},{id:"default-walk",title:"Gå en promenad",category:"Utomhus",favorite:false},{id:"default-dinner",title:"Laga middag ihop",category:"Mat",favorite:false}];
  let activities=read(keys.activities,null);if(!activities){activities=defaults;localStorage.setItem(keys.activities,JSON.stringify(activities));} const visible=activityFilter==="favorite"?activities.filter(a=>a.favorite):activities; $("#activity-grid").replaceChildren();
  visible.forEach(activity=>{const card=document.createElement("article");card.className="activity-card";const top=document.createElement("div");top.className="activity-top";const icon=document.createElement("span");icon.textContent=activityIcons[activity.category]||"✦";const favorite=document.createElement("button");favorite.className=`favorite-button${activity.favorite?" is-favorite":""}`;favorite.textContent=activity.favorite?"♥":"♡";favorite.setAttribute("aria-label","Markera som favorit");favorite.onclick=()=>{activity.favorite=!activity.favorite;write(keys.activities,activities);};top.append(icon,favorite);const title=document.createElement("h2");title.textContent=activity.title;const category=document.createElement("p");category.textContent=activity.category;const actions=document.createElement("div");actions.className="activity-actions";const plan=document.createElement("button");plan.className="small-button";plan.textContent="Planera";plan.onclick=()=>openPlanDialog(activity.title);const remove=document.createElement("button");remove.className="text-button danger";remove.textContent="Ta bort";remove.onclick=()=>write(keys.activities,activities.filter(i=>i.id!==activity.id));actions.append(plan,remove);card.append(top,title,category,actions);$("#activity-grid").append(card);});
  if(!visible.length){const empty=document.createElement("div");empty.className="mini-empty activity-empty";empty.innerHTML="<span>♡</span><h2>Inga favoriter ännu</h2><p>Tryck på hjärtat vid en idé för att spara den här.</p>";$("#activity-grid").append(empty);}
}

function renderAll(){renderToday();renderPeople();renderCalendar();renderActivities();}
function openPlanDialog(title=""){$("#plan-title").value=title;$("#plan-date").value=selectedDate||todayKey;$("#plan-dialog").showModal();setTimeout(()=>$("#plan-title").focus(),50);}
$$('[data-open]').forEach(button=>button.onclick=()=>$("#"+button.dataset.open).showModal()); $$('[data-add-plan]').forEach(button=>button.onclick=()=>openPlanDialog()); $$('dialog').forEach(d=>d.addEventListener("click",e=>{if(e.target===d)d.close();}));
$("#plan-form").onsubmit=e=>{if(e.submitter?.value==="cancel")return;e.preventDefault();const d=new FormData(e.currentTarget),plans=read(keys.plans);plans.push({id:uid(),title:d.get("title").trim(),date:d.get("date"),time:d.get("time")});write(keys.plans,plans);e.currentTarget.reset();$("#plan-time").value="18:00";$("#plan-dialog").close();};
$("#person-form").onsubmit=e=>{if(e.submitter?.value==="cancel")return;e.preventDefault();const d=new FormData(e.currentTarget),people=read(keys.people);people.push({id:uid(),name:d.get("name").trim(),group:d.get("group"),frequency:Number(d.get("frequency")),lastContact:null});write(keys.people,people);e.currentTarget.reset();$("#person-dialog").close();};
$("#activity-form").onsubmit=e=>{if(e.submitter?.value==="cancel")return;e.preventDefault();const d=new FormData(e.currentTarget),activities=read(keys.activities);activities.push({id:uid(),title:d.get("title").trim(),category:d.get("category"),favorite:false});write(keys.activities,activities);e.currentTarget.reset();$("#activity-dialog").close();};
$("#people-filters").onclick=e=>{if(!e.target.dataset.group)return;peopleFilter=e.target.dataset.group;$$('#people-filters .filter-chip').forEach(b=>b.classList.toggle("is-active",b===e.target));renderPeople();}; $("#activity-filters").onclick=e=>{if(!e.target.dataset.activityFilter)return;activityFilter=e.target.dataset.activityFilter;$$('#activity-filters .filter-chip').forEach(b=>b.classList.toggle("is-active",b===e.target));renderActivities();};
$("#prev-month").onclick=()=>{shownMonth=new Date(shownMonth.getFullYear(),shownMonth.getMonth()-1,1);renderCalendar();}; $("#next-month").onclick=()=>{shownMonth=new Date(shownMonth.getFullYear(),shownMonth.getMonth()+1,1);renderCalendar();};
const formatted=prettyDate(todayKey);$("#today-date").textContent=formatted.charAt(0).toUpperCase()+formatted.slice(1);$("#plan-date").value=todayKey;window.addEventListener("hashchange",showView);showView();renderAll();

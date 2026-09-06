import { store } from "./storage.js";
import { initFileTest } from "./file-test.js";

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const keys = { plans:"plans", people:"people", activities:"activities", circles:"circles", agenda:"agenda", events:"events" };
const viewNames = { today:"Today", people:"People", calendar:"Calendar", activities:"Activities" };
const activityIcons = { Fika:"☕", Mat:"🍽", Utomhus:"🌿", Kultur:"🎭", Träning:"⚡", Annat:"✦" };
const uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
const dateKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const todayKey = dateKey(new Date());
const read = (key, fallback=[]) => store.get(key, fallback);
const write = (key, value) => store.set(key, value);
const prettyDate = (key, options={weekday:"long",day:"numeric",month:"long"}) => { const [y,m,d]=key.split("-").map(Number); return new Intl.DateTimeFormat("sv-SE",options).format(new Date(y,m-1,d)); };
const initials = (name) => name.split(/\s+/).slice(0,2).map(w=>w[0]).join("").toUpperCase();

let shownMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let selectedDate = todayKey, peopleFilter = "Alla", relationshipMode = "people";
let activityFilter = "all", activityCategory = "all", activitySort = "newest";
let currentEntity = null;

function namesFor(ids, collection, labelKey="name") {
  return ids.map(id=>collection.find(item=>item.id===id)?.[labelKey]).filter(Boolean);
}

function expandCircleMembers(personIds, circleIds) {
  const circles=read(keys.circles);
  return [...new Set([...personIds, ...circleIds.flatMap(id=>circles.find(c=>c.id===id)?.personIds||[])])];
}

function checkboxList(target, items, name, selected=[]) {
  target.replaceChildren();
  if (!items.length) { const p=document.createElement("p"); p.className="field-empty"; p.textContent="Inga att välja ännu"; target.append(p); return; }
  items.forEach(item=>{const label=document.createElement("label");label.className="check-option";const input=document.createElement("input");input.type="checkbox";input.name=name;input.value=item.id;input.checked=selected.includes(item.id);const span=document.createElement("span");span.textContent=item.name||item.title;label.append(input,span);target.append(label);});
}

function fillActivitySelect(select, selected="") {
  const first=select.querySelector("option[value='']"); select.replaceChildren(first||new Option("Ingen vald aktivitet",""));
  read(keys.activities).forEach(activity=>select.add(new Option(activity.title,activity.id)));
  select.value=selected||"";
}

function showView() {
  const wanted=location.hash.slice(1), active=viewNames[wanted]?wanted:"today";
  $$('[data-view]').forEach(v=>v.classList.toggle("is-active",v.dataset.view===active));
  $$('[data-nav]').forEach(item=>{const on=item.dataset.nav===active;item.classList.toggle("is-active",on);on?item.setAttribute("aria-current","page"):item.removeAttribute("aria-current");});
  document.title=`${viewNames[active]} · Social Circle`;
}

function completePlan(plan) {
  const plans=read(keys.plans), index=plans.findIndex(p=>p.id===plan.id); if(index<0)return;
  plans[index]={...plans[index],status:"completed",completedAt:new Date().toISOString()};
  const events=read(keys.events);
  if(!events.some(event=>event.sourcePlanId===plan.id)) events.push({id:uid(),sourcePlanId:plan.id,title:plan.title,date:plan.date,time:plan.time||"",activityId:plan.activityId||"",personIds:expandCircleMembers(plan.personIds||[],plan.circleIds||[]),circleIds:plan.circleIds||[],notes:plan.notes||"",createdAt:new Date().toISOString()});
  store.set(keys.events,events); store.set(keys.plans,plans);
}

function makePlanCard(plan, allPlans, target) {
  const card=document.createElement("article");card.className=`plan-card clickable-card${plan.status==="completed"?" is-completed":""}`;card.tabIndex=0;card.setAttribute("role","button");card.onclick=()=>openPlanDialog("",plan);card.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openPlanDialog("",plan);}};
  const time=document.createElement("span");time.className="plan-time";time.textContent=plan.time;
  const details=document.createElement("div"),title=document.createElement("h3"),sub=document.createElement("p");title.textContent=plan.title;
  const people=namesFor(plan.personIds||[],read(keys.people)); const circles=namesFor(plan.circleIds||[],read(keys.circles)); sub.textContent=[plan.date===todayKey?"Idag":prettyDate(plan.date,{day:"numeric",month:"short"}),...people,...circles].join(" · ");details.append(title,sub);
  const actions=document.createElement("div");actions.className="plan-actions";
  if(plan.status!=="completed"){const done=document.createElement("button");done.type="button";done.className="complete-button";done.textContent="✓";done.title="Markera som genomförd";done.onclick=e=>{e.stopPropagation();completePlan(plan);};actions.append(done);}
  const remove=document.createElement("button");remove.type="button";remove.textContent="×";remove.setAttribute("aria-label",`Ta bort ${plan.title}`);remove.onclick=e=>{e.stopPropagation();write(keys.plans,allPlans.filter(i=>i.id!==plan.id));};actions.append(remove);card.append(time,details,actions);target.append(card);
}

function makeEventCard(event, target) {
  const card=document.createElement("article");card.className="history-card";
  const activity=read(keys.activities).find(a=>a.id===event.activityId);const people=namesFor(event.personIds||[],read(keys.people));const circles=namesFor(event.circleIds||[],read(keys.circles));
  const date=document.createElement("time");date.textContent=`${prettyDate(event.date,{day:"numeric",month:"short"})}${event.time?` · ${event.time}`:""}`;
  const title=document.createElement("h3");title.textContent=event.title;
  const meta=document.createElement("p");meta.textContent=[activity?.title,...people,...circles].filter(Boolean).join(" · ")||"Social händelse";
  card.append(date,title,meta);if(event.notes){const notes=document.createElement("p");notes.className="history-notes";notes.textContent=event.notes;card.append(notes);}target.append(card);
}

function renderToday() {
  const all=read(keys.plans).map(p=>({...p,date:p.date||todayKey,status:p.status||"planned"})),plans=all.filter(p=>p.date===todayKey).sort((a,b)=>a.time.localeCompare(b.time));
  $("#plan-list").replaceChildren();$("#empty-state").hidden=plans.length>0;$("#plan-count").textContent=`${plans.length} ${plans.length===1?"plan":"planer"}`;plans.forEach(p=>makePlanCard(p,all,$("#plan-list")));
}

function renderPeople() {
  const people=read(keys.people),visible=peopleFilter==="Alla"?people:people.filter(p=>p.group===peopleFilter);$("#people-list").replaceChildren();$("#people-empty").hidden=visible.length>0;
  visible.forEach(person=>{const card=document.createElement("article");card.className="person-card clickable-card";card.tabIndex=0;card.setAttribute("role","button");card.onclick=()=>openEntity("person",person.id);card.onkeydown=e=>{if(e.key==="Enter"||e.key===" ")openEntity("person",person.id);};const avatar=document.createElement("span");avatar.className="person-avatar";avatar.textContent=initials(person.name);const info=document.createElement("div"),name=document.createElement("h2"),meta=document.createElement("p");name.textContent=person.name;const agendaCount=read(keys.agenda).filter(a=>a.ownerType==="person"&&a.ownerId===person.id&&!a.completedAt).length;meta.textContent=`${person.group} · ${agendaCount} på agendan`;info.append(name,meta);const arrow=document.createElement("span");arrow.className="card-arrow";arrow.textContent="›";card.append(avatar,info,arrow);$("#people-list").append(card);});
  renderCircles();
}

function renderCircles() {
  const circles=read(keys.circles),people=read(keys.people);$("#circles-list").replaceChildren();$("#circles-empty").hidden=circles.length>0;
  circles.forEach(circle=>{const card=document.createElement("article");card.className="person-card circle-card clickable-card";card.tabIndex=0;card.setAttribute("role","button");card.onclick=()=>openEntity("circle",circle.id);const avatar=document.createElement("span");avatar.className="person-avatar circle-avatar";avatar.textContent="◯";const info=document.createElement("div"),name=document.createElement("h2"),meta=document.createElement("p");name.textContent=circle.name;const members=namesFor(circle.personIds||[],people);meta.textContent=members.length?members.join(", "):"Inga personer ännu";info.append(name,meta);const arrow=document.createElement("span");arrow.className="card-arrow";arrow.textContent="›";card.append(avatar,info,arrow);$("#circles-list").append(card);});
}

function renderCalendar() {
  const plans=read(keys.plans).map(p=>({...p,date:p.date||todayKey})),events=read(keys.events),y=shownMonth.getFullYear(),m=shownMonth.getMonth();$("#month-label").textContent=new Intl.DateTimeFormat("sv-SE",{month:"long",year:"numeric"}).format(shownMonth);
  const grid=$("#calendar-grid");grid.replaceChildren();const offset=(new Date(y,m,1).getDay()+6)%7,total=new Date(y,m+1,0).getDate();for(let i=0;i<offset;i++){const blank=document.createElement("span");blank.className="calendar-blank";grid.append(blank);}
  for(let day=1;day<=total;day++){const key=dateKey(new Date(y,m,day)),button=document.createElement("button");button.type="button";button.textContent=day;button.className="calendar-day";if(key===todayKey)button.classList.add("is-today");if(key===selectedDate)button.classList.add("is-selected");if(plans.some(p=>p.date===key)||events.some(e=>e.date===key))button.classList.add("has-plan");button.onclick=()=>{selectedDate=key;renderCalendar();};grid.append(button);}
  $("#selected-date-label").textContent=selectedDate===todayKey?"Idag":prettyDate(selectedDate);const selectedPlans=plans.filter(p=>p.date===selectedDate).sort((a,b)=>a.time.localeCompare(b.time)),selectedEvents=events.filter(e=>e.date===selectedDate&&(!e.sourcePlanId||!plans.some(p=>p.id===e.sourcePlanId))).sort((a,b)=>(a.time||"").localeCompare(b.time||""));$("#calendar-plans").replaceChildren();$("#calendar-empty").hidden=selectedPlans.length+selectedEvents.length>0;selectedPlans.forEach(p=>makePlanCard(p,plans,$("#calendar-plans")));selectedEvents.forEach(e=>makeEventCard(e,$("#calendar-plans")));
}

function renderActivities() {
  const defaults=[{id:"default-fika",title:"Ta en fika",category:"Fika",cost:1,duration:60,place:"Café",favorite:false},{id:"default-walk",title:"Gå en promenad",category:"Utomhus",cost:0,duration:60,place:"Utomhus",favorite:false},{id:"default-dinner",title:"Laga middag ihop",category:"Mat",cost:2,duration:120,place:"Hemma",favorite:false}];
  let activities=read(keys.activities);if(!activities.length){activities=defaults;store.set(keys.activities,activities);}activities=activities.map(a=>({...a,cost:Number(a.cost??0),duration:Number(a.duration??60),place:a.place||"Ej angivet"}));let visible=activities.filter(a=>(activityFilter!=="favorite"||a.favorite)&&(activityCategory==="all"||a.category===activityCategory));const sorters={newest:(a,b)=>activities.indexOf(b)-activities.indexOf(a),title:(a,b)=>a.title.localeCompare(b.title,"sv"),cost:(a,b)=>a.cost-b.cost,duration:(a,b)=>a.duration-b.duration,place:(a,b)=>a.place.localeCompare(b.place,"sv")};visible=visible.slice().sort(sorters[activitySort]);$("#activity-grid").replaceChildren();
  visible.forEach(activity=>{const card=document.createElement("article");card.className="activity-card";const top=document.createElement("div");top.className="activity-top";const icon=document.createElement("span");icon.textContent=activityIcons[activity.category]||"✦";const favorite=document.createElement("button");favorite.className=`favorite-button${activity.favorite?" is-favorite":""}`;favorite.textContent=activity.favorite?"♥":"♡";favorite.onclick=()=>{activity.favorite=!activity.favorite;write(keys.activities,activities);};top.append(icon,favorite);const title=document.createElement("h2");title.textContent=activity.title;const meta=document.createElement("p");meta.className="activity-meta";const costs=["Gratis","Billigt","Mellan","Dyrare"];meta.textContent=`${activity.category} · ${costs[activity.cost]} · ${activity.duration<60?activity.duration+" min":activity.duration/60+" tim"} · ${activity.place}`;const actions=document.createElement("div");actions.className="activity-actions";const plan=document.createElement("button");plan.className="small-button";plan.textContent="Planera";plan.onclick=()=>openPlanDialog(activity.title,null,activity.id);const history=document.createElement("button");history.className="text-button";history.textContent="Historik";history.onclick=()=>openEntity("activity",activity.id);const edit=document.createElement("button");edit.className="text-button";edit.textContent="Redigera";edit.onclick=()=>openActivityDialog(activity);actions.append(plan,history,edit);card.append(top,title,meta,actions);$("#activity-grid").append(card);});
  if(!visible.length){const empty=document.createElement("div");empty.className="mini-empty activity-empty";empty.innerHTML="<span>♡</span><h2>Inga träffar</h2><p>Prova ett annat filter.</p>";$("#activity-grid").append(empty);}
}

function renderEntity() {
  if(!currentEntity)return;const collection=currentEntity.type==="person"?read(keys.people):currentEntity.type==="circle"?read(keys.circles):read(keys.activities);const item=collection.find(i=>i.id===currentEntity.id);if(!item){$("#entity-dialog").close();return;}
  $("#entity-type").textContent=currentEntity.type==="person"?"Person":currentEntity.type==="circle"?"Cirkel":"Aktivitet";$("#entity-title").textContent=item.name||item.title;$("#entity-subtitle").textContent=currentEntity.type==="person"?`${item.group} · kontakt var ${item.frequency} dag`:currentEntity.type==="circle"?`${(item.personIds||[]).length} personer`:item.category;
  const agendaAvailable=currentEntity.type!=="activity";$("#entity-tabs").hidden=!agendaAvailable;$("#agenda-panel").hidden=!agendaAvailable;$("#history-panel").hidden=agendaAvailable; if(agendaAvailable){$$('#entity-tabs button').forEach(b=>b.classList.toggle("is-active",b.dataset.entityTab==="agenda"));renderAgenda();}
  renderEntityHistory();
}

function openEntity(type,id){currentEntity={type,id};renderEntity();$("#entity-dialog").showModal();}

function renderAgenda(){const items=read(keys.agenda).filter(a=>a.ownerType===currentEntity.type&&a.ownerId===currentEntity.id);const active=$("#agenda-active"),history=$("#agenda-history");active.replaceChildren();history.replaceChildren();items.filter(a=>!a.completedAt).forEach(item=>makeAgendaItem(item,active,false));items.filter(a=>a.completedAt).sort((a,b)=>b.completedAt.localeCompare(a.completedAt)).forEach(item=>makeAgendaItem(item,history,true));if(!active.children.length)active.innerHTML='<p class="field-empty">Agendan är tom.</p>';if(!history.children.length)history.innerHTML='<p class="field-empty">Inget avbockat ännu.</p>';}
function makeAgendaItem(item,target,done){const row=document.createElement("div");row.className=`agenda-item${done?" is-done":""}`;const button=document.createElement("button");button.className="agenda-check";button.textContent=done?"✓":"";button.setAttribute("aria-label",done?"Flytta tillbaka till agendan":"Bocka av");button.onclick=()=>{const all=read(keys.agenda),found=all.find(a=>a.id===item.id);found.completedAt=done?null:new Date().toISOString();write(keys.agenda,all);renderEntity();};const text=document.createElement("span");text.textContent=item.text;row.append(button,text);target.append(row);}

function renderEntityHistory(){const events=read(keys.events).filter(event=>currentEntity.type==="person"?(event.personIds||[]).includes(currentEntity.id):currentEntity.type==="circle"?(event.circleIds||[]).includes(currentEntity.id):event.activityId===currentEntity.id).sort((a,b)=>`${b.date} ${b.time||""}`.localeCompare(`${a.date} ${a.time||""}`));$("#entity-history").replaceChildren();$("#entity-history-empty").hidden=events.length>0;events.forEach(event=>makeEventCard(event,$("#entity-history")));}

function openPlanDialog(title="",plan=null,activityId="") {const f=$("#plan-form");f.reset();fillActivitySelect(f.elements.activityId,plan?.activityId||activityId);checkboxList($("#plan-people"),read(keys.people),"personIds",plan?.personIds||[]);checkboxList($("#plan-circles"),read(keys.circles),"circleIds",plan?.circleIds||[]);f.elements.id.value=plan?.id||"";f.elements.title.value=plan?.title||title;f.elements.date.value=plan?.date||selectedDate;f.elements.time.value=plan?.time||"18:00";f.elements.notes.value=plan?.notes||"";$("#plan-dialog-title").textContent=plan?"Redigera plan":"Lägg till en plan";$("#plan-dialog").showModal();}
function openPersonDialog(person=null){const f=$("#person-form");f.reset();f.elements.id.value=person?.id||"";f.elements.name.value=person?.name||"";f.elements.group.value=person?.group||"Vänner";f.elements.frequency.value=person?.frequency||7;f.elements.notes.value=person?.notes||"";$("#person-dialog-title").textContent=person?person.name:"Ny person";$("#person-dialog").showModal();}
function openCircleDialog(circle=null){const f=$("#circle-form");f.reset();f.elements.id.value=circle?.id||"";f.elements.name.value=circle?.name||"";f.elements.notes.value=circle?.notes||"";checkboxList($("#circle-people"),read(keys.people),"personIds",circle?.personIds||[]);$("#circle-dialog-title").textContent=circle?circle.name:"Ny cirkel";$("#circle-dialog").showModal();}
function openActivityDialog(activity=null){const f=$("#activity-form");f.reset();f.elements.id.value=activity?.id||"";f.elements.title.value=activity?.title||"";f.elements.category.value=activity?.category||"Fika";f.elements.cost.value=activity?.cost??0;f.elements.duration.value=activity?.duration??60;f.elements.place.value=activity?.place||"";$("#activity-dialog-title").textContent=activity?"Redigera aktivitet":"Ny idé";$("#activity-dialog").showModal();}
function openEventDialog(prefill=currentEntity){const f=$("#event-form");f.reset();f.elements.date.value=todayKey;f.elements.time.value="18:00";fillActivitySelect(f.elements.activityId,prefill?.type==="activity"?prefill.id:"");checkboxList($("#event-people"),read(keys.people),"personIds",prefill?.type==="person"?[prefill.id]:[]);checkboxList($("#event-circles"),read(keys.circles),"circleIds",prefill?.type==="circle"?[prefill.id]:[]);$("#event-dialog").showModal();}

function renderAll(){renderToday();renderPeople();renderCalendar();renderActivities();if($("#entity-dialog").open)renderEntity();}

$$('[data-open]').forEach(button=>button.onclick=()=>button.dataset.open==="person-dialog"?openPersonDialog():button.dataset.open==="circle-dialog"?openCircleDialog():openActivityDialog());
$$('[data-add-plan]').forEach(button=>button.onclick=()=>openPlanDialog());$$('[data-close]').forEach(button=>button.onclick=()=>$("#"+button.dataset.close).close());$$('dialog').forEach(d=>d.addEventListener("click",e=>{if(e.target===d)d.close();}));
$("#add-relationship").onclick=()=>relationshipMode==="people"?openPersonDialog():openCircleDialog();
$("#relationship-tabs").onclick=e=>{if(!e.target.dataset.mode)return;relationshipMode=e.target.dataset.mode;$$('#relationship-tabs button').forEach(b=>b.classList.toggle("is-active",b===e.target));$("#people-panel").hidden=relationshipMode!=="people";$("#circles-panel").hidden=relationshipMode!=="circles";$("#add-relationship").setAttribute("aria-label",relationshipMode==="people"?"Lägg till person":"Skapa cirkel");};
$("#entity-tabs").onclick=e=>{if(!e.target.dataset.entityTab)return;$$('#entity-tabs button').forEach(b=>b.classList.toggle("is-active",b===e.target));$("#agenda-panel").hidden=e.target.dataset.entityTab!=="agenda";$("#history-panel").hidden=e.target.dataset.entityTab!=="history";};
$("#edit-entity").onclick=()=>{const type=currentEntity.type,id=currentEntity.id;$("#entity-dialog").close();type==="person"?openPersonDialog(read(keys.people).find(i=>i.id===id)):type==="circle"?openCircleDialog(read(keys.circles).find(i=>i.id===id)):openActivityDialog(read(keys.activities).find(i=>i.id===id));};$("#log-for-entity").onclick=()=>openEventDialog();

$("#agenda-form").onsubmit=e=>{e.preventDefault();const text=new FormData(e.currentTarget).get("text").trim();if(!text)return;const agenda=read(keys.agenda);agenda.push({id:uid(),ownerType:currentEntity.type,ownerId:currentEntity.id,text,createdAt:new Date().toISOString(),completedAt:null});write(keys.agenda,agenda);e.currentTarget.reset();renderEntity();};
$("#plan-form").onsubmit=e=>{if(e.submitter?.value==="cancel")return;e.preventDefault();const d=new FormData(e.currentTarget),plans=read(keys.plans),old=plans.find(p=>p.id===d.get("id")),item={id:d.get("id")||uid(),title:d.get("title").trim(),date:d.get("date"),time:d.get("time"),activityId:d.get("activityId"),personIds:d.getAll("personIds"),circleIds:d.getAll("circleIds"),notes:d.get("notes").trim(),status:old?.status||"planned",createdAt:old?.createdAt||new Date().toISOString()},index=plans.findIndex(p=>p.id===item.id);index>=0?plans[index]=item:plans.push(item);if(item.status==="completed"){const events=read(keys.events),linked=events.find(event=>event.sourcePlanId===item.id);if(linked){Object.assign(linked,{title:item.title,date:item.date,time:item.time,activityId:item.activityId,personIds:expandCircleMembers(item.personIds,item.circleIds),circleIds:item.circleIds,notes:item.notes});store.set(keys.events,events);}}write(keys.plans,plans);$("#plan-dialog").close();};
$("#person-form").onsubmit=e=>{if(e.submitter?.value==="cancel")return;e.preventDefault();const d=new FormData(e.currentTarget),people=read(keys.people),old=people.find(p=>p.id===d.get("id")),item={id:d.get("id")||uid(),name:d.get("name").trim(),group:d.get("group"),frequency:Number(d.get("frequency")),notes:d.get("notes").trim(),lastContact:old?.lastContact||null},index=people.findIndex(p=>p.id===item.id);index>=0?people[index]=item:people.push(item);write(keys.people,people);$("#person-dialog").close();};
$("#circle-form").onsubmit=e=>{if(e.submitter?.value==="cancel")return;e.preventDefault();const d=new FormData(e.currentTarget),circles=read(keys.circles),item={id:d.get("id")||uid(),name:d.get("name").trim(),personIds:d.getAll("personIds"),notes:d.get("notes").trim()},index=circles.findIndex(c=>c.id===item.id);index>=0?circles[index]=item:circles.push(item);write(keys.circles,circles);$("#circle-dialog").close();};
$("#activity-form").onsubmit=e=>{if(e.submitter?.value==="cancel")return;e.preventDefault();const d=new FormData(e.currentTarget),activities=read(keys.activities),old=activities.find(a=>a.id===d.get("id")),item={id:d.get("id")||uid(),title:d.get("title").trim(),category:d.get("category"),cost:Number(d.get("cost")),duration:Number(d.get("duration")),place:d.get("place").trim()||"Ej angivet",favorite:old?.favorite||false},index=activities.findIndex(a=>a.id===item.id);index>=0?activities[index]=item:activities.push(item);write(keys.activities,activities);$("#activity-dialog").close();};
$("#event-form").onsubmit=e=>{if(e.submitter?.value==="cancel")return;e.preventDefault();const d=new FormData(e.currentTarget),circleIds=d.getAll("circleIds"),events=read(keys.events);events.push({id:uid(),title:d.get("title").trim(),date:d.get("date"),time:d.get("time"),activityId:d.get("activityId"),personIds:expandCircleMembers(d.getAll("personIds"),circleIds),circleIds,notes:d.get("notes").trim(),createdAt:new Date().toISOString()});write(keys.events,events);$("#event-dialog").close();renderEntity();};

$("#people-filters").onclick=e=>{if(!e.target.dataset.group)return;peopleFilter=e.target.dataset.group;$$('#people-filters .filter-chip').forEach(b=>b.classList.toggle("is-active",b===e.target));renderPeople();};$("#activity-filters").onclick=e=>{if(!e.target.dataset.activityFilter)return;activityFilter=e.target.dataset.activityFilter;$$('#activity-filters .filter-chip').forEach(b=>b.classList.toggle("is-active",b===e.target));renderActivities();};$("#activity-category-filter").onchange=e=>{activityCategory=e.target.value;renderActivities();};$("#activity-sort").onchange=e=>{activitySort=e.target.value;renderActivities();};$("#prev-month").onclick=()=>{shownMonth=new Date(shownMonth.getFullYear(),shownMonth.getMonth()-1,1);renderCalendar();};$("#next-month").onclick=()=>{shownMonth=new Date(shownMonth.getFullYear(),shownMonth.getMonth()+1,1);renderCalendar();};

const formatted=prettyDate(todayKey);$("#today-date").textContent=formatted.charAt(0).toUpperCase()+formatted.slice(1);store.subscribe(renderAll);window.addEventListener("hashchange",showView);initFileTest();showView();renderAll();

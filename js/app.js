const views = [...document.querySelectorAll("[data-view]")];
const navItems = [...document.querySelectorAll("[data-nav]")];
const dialog = document.querySelector("#plan-dialog");
const form = document.querySelector("#plan-form");
const planList = document.querySelector("#plan-list");
const emptyState = document.querySelector("#empty-state");
const planCount = document.querySelector("#plan-count");
const storageKey = "social-circle-plans";

const icons = {
  today: "Today",
  people: "People",
  calendar: "Calendar",
  activities: "Activities",
};

function currentView() {
  const requested = location.hash.slice(1);
  return icons[requested] ? requested : "today";
}

function showView() {
  const active = currentView();
  views.forEach((view) => view.classList.toggle("is-active", view.dataset.view === active));
  navItems.forEach((item) => {
    const selected = item.dataset.nav === active;
    item.classList.toggle("is-active", selected);
    selected ? item.setAttribute("aria-current", "page") : item.removeAttribute("aria-current");
  });
  document.title = `${icons[active]} · Social Circle`;
  document.querySelector(`[data-view="${active}"]`).focus?.();
}

function loadPlans() {
  try { return JSON.parse(localStorage.getItem(storageKey)) || []; }
  catch { return []; }
}

function savePlans(plans) {
  localStorage.setItem(storageKey, JSON.stringify(plans));
  renderPlans();
}

function renderPlans() {
  const plans = loadPlans().sort((a, b) => a.time.localeCompare(b.time));
  planList.replaceChildren();
  emptyState.hidden = plans.length > 0;
  planCount.textContent = `${plans.length} ${plans.length === 1 ? "plan" : "planer"}`;

  plans.forEach((plan) => {
    const card = document.createElement("article");
    card.className = "plan-card";

    const time = document.createElement("span");
    time.className = "plan-time";
    time.textContent = plan.time;

    const details = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = plan.title;
    const subtitle = document.createElement("p");
    subtitle.textContent = "Idag";
    details.append(title, subtitle);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Ta bort ${plan.title}`);
    remove.addEventListener("click", () => savePlans(plans.filter((item) => item.id !== plan.id)));

    card.append(time, details, remove);
    planList.append(card);
  });
}

document.querySelectorAll("[data-add-plan]").forEach((button) => button.addEventListener("click", () => {
  dialog.showModal();
  setTimeout(() => document.querySelector("#plan-title").focus(), 50);
}));

form.addEventListener("submit", (event) => {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  const data = new FormData(form);
  const plans = loadPlans();
  plans.push({ id: crypto.randomUUID?.() || String(Date.now()), title: data.get("title").trim(), time: data.get("time") });
  savePlans(plans);
  form.reset();
  document.querySelector("#plan-time").value = "18:00";
  dialog.close();
});

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

const formattedDate = new Intl.DateTimeFormat("sv-SE", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
document.querySelector("#today-date").textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
window.addEventListener("hashchange", showView);
showView();
renderPlans();

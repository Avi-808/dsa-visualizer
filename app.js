const $ = (id) => document.getElementById(id);
const barsEl = $("bars");
const sizeInput = $("size");
const speedInput = $("speed");
const algorithmInput = $("algorithm");
let values = [];
let operations = [];
let operationIndex = 0;
let timer = null;
let running = false;
let sortedFrom = new Set();

function makeArray(size = Number(sizeInput.value)) {
  values = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
  operations = [];
  operationIndex = 0;
  sortedFrom = new Set();
  stopPlayback();
  render();
  setStatus("Ready to sort");
  setProgress(0);
}

function record(type, a, b, snapshot, extra = {}) {
  operations.push({ type, a, b, snapshot: snapshot.slice(), ...extra });
}

function createPlan(input, kind) {
  const a = input.slice();
  const log = [];
  const add = (type, i, j, extra = {}) => log.push({ type, a: i, b: j, snapshot: a.slice(), ...extra });
  if (kind === "bubble") {
    for (let end = a.length - 1; end > 0; end--) {
      for (let i = 0; i < end; i++) {
        add("compare", i, i + 1);
        if (a[i] > a[i + 1]) { [a[i], a[i + 1]] = [a[i + 1], a[i]]; add("swap", i, i + 1); }
      }
      add("sorted", end, end);
    }
    add("sorted", 0, 0);
  } else if (kind === "selection") {
    for (let start = 0; start < a.length; start++) {
      let min = start;
      for (let i = start + 1; i < a.length; i++) {
        add("compare", min, i);
        if (a[i] < a[min]) min = i;
      }
      if (min !== start) { [a[start], a[min]] = [a[min], a[start]]; add("swap", start, min); }
      add("sorted", start, start);
    }
  } else if (kind === "insertion") {
    add("sorted", 0, 0);
    for (let i = 1; i < a.length; i++) {
      const key = a[i]; let j = i - 1;
      while (j >= 0) {
        add("compare", j, j + 1);
        if (a[j] <= key) break;
        a[j + 1] = a[j]; add("swap", j, j + 1); j--;
      }
      a[j + 1] = key; add("sorted", i, i);
    }
  } else {
    const quick = (lo, hi) => {
      if (lo >= hi) { if (lo === hi) add("sorted", lo, lo); return; }
      const pivot = a[hi]; let wall = lo;
      for (let i = lo; i < hi; i++) {
        add("compare", i, hi, { pivot: hi });
        if (a[i] < pivot) { if (i !== wall) [a[i], a[wall]] = [a[wall], a[i]]; add("swap", i, wall, { pivot: hi }); wall++; }
      }
      if (wall !== hi) [a[wall], a[hi]] = [a[hi], a[wall]];
      add("pivot", wall, wall); quick(lo, wall - 1); quick(wall + 1, hi);
    };
    quick(0, a.length - 1);
  }
  return log;
}

function render(op = null) {
  const max = Math.max(...values, 1);
  const step = op?.snapshot ?? values;
  barsEl.replaceChildren();
  step.forEach((value, index) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = `${Math.max(5, value / max * 100)}%`;
    bar.title = `Value: ${value}`;
    if (op && (index === op.a || index === op.b) && op.type !== "sorted") bar.classList.add("active");
    if (op?.type === "pivot" && index === op.a) bar.classList.add("pivot");
    if (sortedFrom.has(index) || op?.type === "sorted" && index === op.a) bar.classList.add("sorted");
    barsEl.append(bar);
  });
  $("stepCount").textContent = `${operationIndex.toLocaleString()} OPERATIONS`;
}

function setProgress(percent) {
  const safe = Math.max(0, Math.min(100, percent));
  $("progressBar").style.width = `${safe}%`;
  $("progressPercent").textContent = `${Math.round(safe)}%`;
}

function setStatus(message, busy = false) {
  $("statusText").textContent = message;
  document.querySelector(".status").classList.toggle("busy", busy);
}

function setAlgorithm(kind) {
  algorithmInput.value = kind;
  document.querySelectorAll(".algo-card").forEach(card => card.classList.toggle("selected", card.dataset.algo === kind));
  if (operations.length) resetSort();
}

function buildPlan() {
  operations = createPlan(values, algorithmInput.value);
  operationIndex = 0;
  sortedFrom = new Set();
  render();
  setProgress(0);
}

function stepOnce() {
  if (!operations.length) buildPlan();
  if (operationIndex >= operations.length) { finish(); return false; }
  const op = operations[operationIndex++];
  values = op.snapshot.slice();
  if (op.type === "sorted") sortedFrom.add(op.a);
  render(op);
  setProgress(operationIndex / operations.length * 100);
  return true;
}

function delay() { return [1050, 680, 390, 190, 70][Number(speedInput.value) - 1]; }
function scheduleStep() {
  if (!running) return;
  if (!stepOnce()) return;
  timer = window.setTimeout(scheduleStep, delay());
}
function stopPlayback() { if (timer) window.clearTimeout(timer); timer = null; running = false; }
function finish() {
  stopPlayback();
  sortedFrom = new Set(values.map((_, i) => i));
  render();
  setStatus("Sorted successfully");
  $("playIcon").textContent = "▶";
  $("playLabel").textContent = "Run again";
  setProgress(100);
}
function startSort() {
  if (!operations.length || operationIndex >= operations.length) buildPlan();
  running = true;
  setStatus("Sorting in progress", true);
  $("playIcon").textContent = "Ⅱ";
  $("playLabel").textContent = "Pause";
  scheduleStep();
}
function resetSort() {
  stopPlayback();
  operationIndex = 0;
  operations = [];
  sortedFrom = new Set();
  render();
  setStatus("Ready to sort");
  $("playIcon").textContent = "▶";
  $("playLabel").textContent = "Start sorting";
  setProgress(0);
}

$("play").addEventListener("click", () => {
  if (running) {
    stopPlayback(); setStatus("Paused"); $("playIcon").textContent = "▶"; $("playLabel").textContent = "Resume";
  } else startSort();
});
$("step").addEventListener("click", () => {
  if (running) stopPlayback();
  if (!operations.length) buildPlan();
  setStatus("Stepping through");
  $("playIcon").textContent = "▶"; $("playLabel").textContent = "Continue";
  stepOnce();
  if (operationIndex >= operations.length) finish();
});
$("reset").addEventListener("click", resetSort);
$("shuffle").addEventListener("click", () => makeArray());
sizeInput.addEventListener("input", () => { $("sizeValue").textContent = sizeInput.value; makeArray(); });
speedInput.addEventListener("input", () => { $("speedValue").textContent = `${speedInput.value}×`; });
algorithmInput.addEventListener("change", () => setAlgorithm(algorithmInput.value));
document.querySelectorAll(".algo-card").forEach(card => {
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `Select ${card.querySelector("h3").textContent}`);
  card.addEventListener("click", () => setAlgorithm(card.dataset.algo));
  card.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setAlgorithm(card.dataset.algo); } });
});

makeArray();

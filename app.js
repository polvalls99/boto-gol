"use strict";

const $ = (sel) => document.querySelector(sel);
const audio = $("#player");

const SOUNDS = (window.SOUNDS || []).map((s) => ({ ...s }));

const state = {
  playing: false,
  random: true,
  volume: 60,
  activeFile: null,   // himne fix (quan NO és aleatori)
  currentFile: null,  // el que sona ara
  ready: SOUNDS.length > 0,
};

const nameOf = (f) => (SOUNDS.find((s) => s.file === f) || {}).name || f || "";

function buzz(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (_) {} }

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 2800);
}

/* ------------------------------------------------------------------ render */
function render() {
  document.body.classList.toggle("offline", !state.ready);

  $("#led-so").className = "led " + (state.ready ? "led-green" : "led-off");
  $("#led-rnd").className = "led " + (state.random ? "led-amber" : "led-off");
  $("#led-air").className = "led " + (state.playing ? "led-red" : "led-off");

  $("#goal").classList.toggle("is-playing", state.playing);
  $("#random").setAttribute("aria-pressed", state.random ? "true" : "false");
  $("#random").classList.toggle("lit", state.random);
  $("#stop").classList.toggle("lit", state.playing);

  $("#bt-name").textContent = state.playing
    ? "▶ " + nameOf(state.currentFile)
    : (state.ready ? "A punt" : "Sense himnes");

  $("#sound-mode").textContent = state.random
    ? "ALEATORI"
    : (nameOf(state.activeFile) || "—").toUpperCase();

  const sel = $("#sound-select");
  const want = state.random ? "__random__" : (state.activeFile || "__random__");
  if (sel.value !== want && document.activeElement !== sel) sel.value = want;

  const v = $("#vol");
  if (document.activeElement !== v) v.value = state.volume;
  v.style.setProperty("--v", state.volume + "%");
  $("#vol-val").textContent = Math.round(state.volume) + "%";
}

function fillSelect() {
  const sel = $("#sound-select");
  sel.innerHTML = '<option value="__random__">🎲  Aleatori</option>';
  for (const s of SOUNDS) {
    const o = document.createElement("option");
    o.value = s.file;
    o.textContent = s.name;
    sel.appendChild(o);
  }
  render();
}

/* ------------------------------------------------------------------ àudio */
function pickFile() {
  if (!SOUNDS.length) return null;
  if (!state.random) return state.activeFile || SOUNDS[0].file;
  const pool = SOUNDS.filter((s) => s.file !== state.currentFile);
  const from = pool.length ? pool : SOUNDS;
  return from[Math.floor(Math.random() * from.length)].file;
}

function playGoal() {
  const file = pickFile();
  if (!file) { toast("No hi ha himnes"); return; }
  state.currentFile = file;
  audio.src = file;
  audio.volume = state.volume / 100;
  try { audio.currentTime = 0; } catch (_) {}
  audio.play()
    .then(() => { state.playing = true; render(); })
    .catch(() => { state.playing = false; render(); toast("Torna a prémer GOL per activar el so"); });
}

function stopGoal() {
  audio.pause();
  try { audio.currentTime = 0; } catch (_) {}
  state.playing = false;
  state.currentFile = null;
  render();
}

audio.addEventListener("ended", () => {
  state.playing = false;
  state.currentFile = null;
  render();
});

/* ------------------------------------------------------------------ controls */
$("#goal").addEventListener("click", () => {
  buzz(45);
  state.playing ? stopGoal() : playGoal();
});

$("#stop").addEventListener("click", () => {
  buzz(20);
  if (!state.playing) { toast("Ja està aturat"); return; }
  stopGoal();
});

$("#random").addEventListener("click", () => {
  buzz(15);
  state.random = true;
  render();
  toast("Mode aleatori");
});

$("#sound-select").addEventListener("change", (ev) => {
  buzz(10);
  if (ev.target.value === "__random__") {
    state.random = true;
    toast("Mode aleatori");
  } else {
    state.random = false;
    state.activeFile = ev.target.value;
  }
  render();
});

$("#vol").addEventListener("input", (ev) => {
  state.volume = Number(ev.target.value);
  audio.volume = state.volume / 100;
  ev.target.style.setProperty("--v", state.volume + "%");
  $("#vol-val").textContent = state.volume + "%";
});

$("#help").addEventListener("click", () => {
  buzz(10);
  $("#help-panel").classList.toggle("show");
});
$("#help-panel").addEventListener("click", () => $("#help-panel").classList.remove("show"));

/* ------------------------------------------------------------------ instal·lar (PWA) */
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  $("#install").hidden = false;
});
$("#install").addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  $("#install").hidden = true;
});
window.addEventListener("appinstalled", () => { $("#install").hidden = true; });

/* ------------------------------------------------------------------ pantalla encesa */
let wakeLock = null;
async function keepAwake() {
  try {
    if (!("wakeLock" in navigator)) return;
    if (document.visibilityState !== "visible") return;
    if (wakeLock && !wakeLock.released) return;
    wakeLock = await navigator.wakeLock.request("screen");
    wakeLock.addEventListener("release", () => { wakeLock = null; });
  } catch (_) { /* el navegador no ho permet ara mateix */ }
}
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") keepAwake();
});
document.addEventListener("pointerdown", keepAwake);
keepAwake();

/* ------------------------------------------------------------------ offline / SW */
function updateFoot() {
  const f = $("#foot");
  if (!navigator.onLine) f.textContent = "sense connexió · funciona igual";
  else f.textContent = "connecta el mòbil a l'altaveu · el so surt pel mòbil";
}
window.addEventListener("online", updateFoot);
window.addEventListener("offline", updateFoot);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").then((reg) => {
    reg.addEventListener("updatefound", () => {
      const nw = reg.installing;
      nw && nw.addEventListener("statechange", () => {
        if (nw.state === "installed" && navigator.serviceWorker.controller) {
          toast("Actualització a punt — reobre l'app");
        }
      });
    });
  }).catch(() => {});
}

/* ------------------------------------------------------------------ arrencada */
fillSelect();
updateFoot();

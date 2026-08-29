"use strict";

const $ = (sel) => document.querySelector(sel);
const SOUNDS = (window.SOUNDS || []).map((s) => ({ ...s }));
const nameOf = (f) => (SOUNDS.find((s) => s.file === f) || {}).name || f || "";

const state = {
  playing: false,
  random: true,
  volume: 80,
  activeFile: null,   // himne fix (quan NO és aleatori)
  currentFile: null,  // el que sona ara
  ready: false,       // sons descodificats a memòria
};

function buzz(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (_) {} }

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 2800);
}

/* ================================================================= àudio
   Web Audio API: descodifiquem els sons a memòria en obrir l'app i els
   reproduïm amb latència zero. El volum va per un GainNode (funciona a iOS,
   on `audio.volume` s'ignora). */
const AC = window.AudioContext || window.webkitAudioContext;
let actx = null;
let gain = null;
let currentSrc = null;
const buffers = new Map();      // file -> AudioBuffer

// iOS: fes que el so ignori l'interruptor de silenci (com una app de música)
function forcePlaybackSession() {
  try {
    if ("audioSession" in navigator) navigator.audioSession.type = "playback";
  } catch (_) {}
}
forcePlaybackSession();

function audioInit() {
  if (actx || !AC) return;
  actx = new AC();
  gain = actx.createGain();
  gain.gain.value = state.volume / 100;
  gain.connect(actx.destination);
  forcePlaybackSession();
}

function audioResume() {
  audioInit();
  if (actx && actx.state === "suspended") actx.resume().catch(() => {});
}

function decode(arrayBuffer) {
  return new Promise((resolve, reject) => {
    const p = actx.decodeAudioData(arrayBuffer, resolve, reject);
    if (p && typeof p.then === "function") p.then(resolve, reject);
  });
}

async function loadSounds() {
  audioInit();
  if (!actx) { state.ready = false; render(); return; }
  await Promise.all(SOUNDS.map(async (s) => {
    try {
      const arr = await fetch(s.file).then((r) => r.arrayBuffer());
      buffers.set(s.file, await decode(arr));
    } catch (_) { /* aquest himne no s'ha pogut carregar */ }
  }));
  state.ready = buffers.size > 0;
  render();
}

function stopSrc() {
  if (currentSrc) {
    try { currentSrc.onended = null; currentSrc.stop(); } catch (_) {}
    currentSrc = null;
  }
}

function playGoal() {
  const file = pickFile();
  if (!file) { toast("No hi ha himnes"); return; }
  audioResume();
  if (!buffers.has(file)) { toast("Encara carregant l'himne…"); return; }
  stopSrc();
  const src = actx.createBufferSource();
  src.buffer = buffers.get(file);
  src.connect(gain);
  src.onended = () => {
    if (currentSrc === src) {
      currentSrc = null;
      state.playing = false;
      state.currentFile = null;
      render();
    }
  };
  src.start();
  currentSrc = src;
  state.currentFile = file;
  state.playing = true;
  render();
}

function stopGoal() {
  stopSrc();
  state.playing = false;
  state.currentFile = null;
  render();
}

/* ------------------------------------------------------------------ render */
function render() {
  $("#led-so").className = "led " + (state.ready ? "led-green" : "led-off");
  $("#led-rnd").className = "led " + (state.random ? "led-amber" : "led-off");
  $("#led-air").className = "led " + (state.playing ? "led-red" : "led-off");

  $("#goal").classList.toggle("is-playing", state.playing);
  $("#random").setAttribute("aria-pressed", state.random ? "true" : "false");
  $("#random").classList.toggle("lit", state.random);
  $("#stop").classList.toggle("lit", state.playing);

  $("#bt-name").textContent = state.playing
    ? "▶ " + nameOf(state.currentFile)
    : (!SOUNDS.length ? "Sense himnes" : (state.ready ? "A punt" : "Carregant…"));

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

function pickFile() {
  if (!SOUNDS.length) return null;
  if (!state.random) return state.activeFile || SOUNDS[0].file;
  const pool = SOUNDS.filter((s) => s.file !== state.currentFile);
  const from = pool.length ? pool : SOUNDS;
  return from[Math.floor(Math.random() * from.length)].file;
}

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
  if (gain && actx) {
    try { gain.gain.setTargetAtTime(state.volume / 100, actx.currentTime, 0.01); }
    catch (_) { gain.gain.value = state.volume / 100; }
  }
  ev.target.style.setProperty("--v", state.volume + "%");
  $("#vol-val").textContent = state.volume + "%";
});

$("#help").addEventListener("click", () => {
  buzz(10);
  $("#help-panel").classList.toggle("show");
});
$("#help-panel").addEventListener("click", () => $("#help-panel").classList.remove("show"));

/* ------------------------------------------------------------------ instal·lar (PWA) */
const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

const isIOS = () =>
  /iP(hone|ad|od)/.test(navigator.platform) ||
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.userAgent.includes("Mac") && "ontouchend" in document);

const INSTALLED_KEY = "botogol.installed";
function markInstalled() { try { localStorage.setItem(INSTALLED_KEY, "1"); } catch (_) {} }
function isInstalled() {
  if (isStandalone()) return true;
  try { return localStorage.getItem(INSTALLED_KEY) === "1"; } catch (_) { return false; }
}
function refreshInstallUI() { $("#install").hidden = isInstalled(); }

if (isStandalone()) markInstalled();

let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferredPrompt = e; refreshInstallUI(); });
window.addEventListener("appinstalled", () => { markInstalled(); refreshInstallUI(); });

$("#install").addEventListener("click", async () => {
  buzz(10);
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (outcome === "accepted") { markInstalled(); refreshInstallUI(); }
    return;
  }
  document.body.dataset.plat = isIOS() ? "ios" : "other";
  $("#install-panel").classList.add("show");
});
$("#install-panel").addEventListener("click", () => $("#install-panel").classList.remove("show"));

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") refreshInstallUI();
});
refreshInstallUI();

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
document.addEventListener("pointerdown", () => { audioResume(); keepAwake(); });
keepAwake();

/* ------------------------------------------------------------------ offline */
function updateFoot() {
  $("#foot").textContent = navigator.onLine
    ? "connecta el mòbil a l'altaveu · el so surt pel mòbil"
    : "sense connexió · funciona igual";
}
window.addEventListener("online", updateFoot);
window.addEventListener("offline", updateFoot);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

/* ------------------------------------------------------------------ arrencada */
fillSelect();
updateFoot();
loadSounds();

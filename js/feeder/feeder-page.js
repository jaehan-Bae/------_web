// feeder-page.js = Feeder 상세 페이지의 “메인 컨트롤러”
// 좌측 Feeder Plate 이미지 + Hole 오버레이
// 우측 요약 카드(숫자, 도넛, 미니바)
// 하단 주간 공정 차트
// 하단 지연 리스트
// 상단 컨텍스트 탭(Pickering / Cernavoda, Upper/Middle/Lower)
// Demo / Reset 버튼
// 즉, 페이지 단위 상태 관리 + 렌더 트리거 역할
// ======================================================

// ======================================================
// 0) 전역 캐시/상태
// ======================================================
let HOLES_CACHE = null;            // holes.json 캐시
let OVERLAY = null;                // svg overlay element
let HOLE_ELEMS_BY_KEY = new Map(); // key -> { base, dot, rim, hi }
let ROW_Y_MAP = null;              // { rowName: snappedY }

// (선택) 팝업 등에서 현재 컨텍스트 참조하고 싶을 때
window.__activeFeederContext = window.__activeFeederContext || "pickering-upper";

// (선택) hole key -> 공정명 매핑(없으면 "")
// holes.json에 proc가 없어서 팝업에 proc가 꼭 필요하면 여기에 매핑해도 됨
window.holeProcByContext = window.holeProcByContext || {}; // { contextId: { holeKey: "PBC" } }

document.addEventListener("DOMContentLoaded", () => {
  window.holeStatusByContext = window.holeStatusByContext || {};

  initTabs();
  initFeederTools();

  const first =
    document.querySelector(".feeder-btn.active")?.dataset.context ||
    document.querySelector(".feeder-btn")?.dataset.context ||
    "pickering-upper";

  // ✅ 초기 컨텍스트는 무조건 빈 상태로 시작
  window.holeStatusByContext[first] = {};

  renderAll(first);
});


// ======================================================
// 1) 탭/툴 버튼
// ======================================================
function initTabs() {
  const btns = document.querySelectorAll(".feeder-btn");
  if (!btns.length) return;

  let current =
    document.querySelector(".feeder-btn.active")?.dataset.context ||
    btns[0].dataset.context;

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = btn.dataset.context;
      if (!next || next === current) return;

      btns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      current = next;

      renderAll(current);
    });
  });
}

function initFeederTools() {
  const demoBtn = document.getElementById("demoBtn");
  const resetBtn = document.getElementById("resetBtn");

  if (demoBtn) {
    demoBtn.addEventListener("click", () => {
      const active =
        document.querySelector(".feeder-btn.active")?.dataset.context ||
        "pickering-upper";
      randomizeHoleStatuses(active);
      applyHoleStatuses(active);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      const active =
        document.querySelector(".feeder-btn.active")?.dataset.context ||
        "pickering-upper";
      resetHoleStatuses(active);
      applyHoleStatuses(active);
    });
  }
}

// ======================================================
// 2) 페이지 렌더(딱 1개만 존재)
// ======================================================
function renderAll(contextId) {
  const [plantId, position] = contextId.split("-");

  window.__activeFeederContext = contextId;

  // 테마 토글
  document.body.classList.toggle("theme-cernavoda", plantId === "cernavoda");

  // 2-1) 좌측 이미지 + holes 오버레이 + 상태색
  renderFeederPlate(contextId);

  // 2-2) 도넛 + mini bars
  renderSummaryCard(contextId, plantId, position);
  function renderMapBottomCards() {
  const grid = document.querySelector(".map-bottom-grid");
  if (!grid) return;

  // ✅ 카드 여러 개 처리해야 하므로 querySelectorAll
  const cards = grid.querySelectorAll(".card.card--big[data-context]");
  if (!cards.length) {
    console.warn('[feeder] map-bottom cards missing data-context');
    return;
  }

  cards.forEach((card) => {
    const ctx = card.dataset.context; // 예: pickering-upper / pickering-middle / cernavoda-upper ...
    const data = window.feederSummaryDummyByContext?.[ctx];
    if (!data) {
      console.warn("[feeder] feederSummaryDummyByContext missing for", ctx);
      return;
    }

    const produced = Number(data.produced ?? 0);
    const total = Number(data.total ?? 0);
    const pct = total > 0 ? Math.round((produced / total) * 100) : 0;

    // 텍스트 세팅
    const titleEl = card.querySelector('[data-field="title"]');
    const prodEl  = card.querySelector('[data-field="produced"]');
    const totalEl = card.querySelector('[data-field="total"]');
    const pctEl   = card.querySelector('[data-field="percent"]');

    if (titleEl) titleEl.textContent = data.title ?? "";
    if (prodEl)  prodEl.textContent  = produced.toLocaleString();
    if (totalEl) totalEl.textContent = total.toLocaleString();
    if (pctEl)   pctEl.textContent   = `${pct}%`;

    // ✅ 도넛 드로잉 (여기가 핵심)
    const canvas = card.querySelector("canvas.feeder-canvas");
    if (canvas && typeof window.drawFeederDonut === "function") {
      const plantId = ctx.split("-")[0]; // pickering / cernavoda
      const colors =
        plantId === "pickering"
          ? { from: "#6CCBFF", to: "#2F7BEF" }
          : { from: "#FFC266", to: "#FF8A00" };

      window.drawFeederDonut(canvas, pct, colors);
    }
  });
}

  // 2-3) 주간 차트
  renderWeeklyChart(contextId);

  // 2-4) 지연 리스트
  renderDelay(contextId);
}

// ======================================================
// 3) 우측: 요약 + 도넛 + mini bars
// ======================================================
function renderSummaryCard(contextId, plantId, position) {
  const card = document.querySelector('[data-role="summary-card"]');
  if (!card) return;

  const data = window.feederSummaryDummyByContext?.[contextId];
  if (!data) {
    console.warn("[feeder] feederSummaryDummyByContext missing for", contextId);
    return;
  }

  const produced = Number(data.produced ?? 0);
  const total = Number(data.total ?? 0);
  const pct = total > 0 ? Math.round((produced / total) * 100) : 0;

  const titleEl = card.querySelector('[data-field="title"]');
  const subEl = card.querySelector('[data-field="subtitle"]');
  const prodEl = card.querySelector('[data-field="produced"]');
  const totalEl = card.querySelector('[data-field="total"]');
  const pctEl = card.querySelector('[data-field="percent"]');

  if (titleEl) titleEl.textContent = data.title ?? "";
  if (subEl) subEl.textContent = data.subtitle ?? (position?.toUpperCase() ?? "");
  if (prodEl) prodEl.textContent = produced.toLocaleString();
  if (totalEl) totalEl.textContent = total.toLocaleString();
  if (pctEl) pctEl.textContent = `${pct}%`;

  // 도넛
  const canvas = card.querySelector(".feeder-canvas");
  if (canvas && typeof window.drawFeederDonut === "function") {
    const colors =
      plantId === "pickering"
        ? { from: "#6CCBFF", to: "#2F7BEF" }
        : { from: "#FFC266", to: "#FF8A00" };

    window.drawFeederDonut(canvas, pct, colors);
  } else {
    console.warn("[feeder] drawFeederDonut missing or canvas missing");
  }

  // UPPER / MIDDLE / LOWER 미니바
  renderMiniBars(card, plantId, data.bars);
}

function renderMiniBars(card, plantId, bars) {
  const upperFill  = card.querySelector('[data-role="mini-upper"]');
  const middleFill = card.querySelector('[data-role="mini-middle"]');
  const lowerFill  = card.querySelector('[data-role="mini-lower"]');

  const upperPctEl  = card.querySelector('[data-role="mini-upper-pct"]');
  const middlePctEl = card.querySelector('[data-role="mini-middle-pct"]');
  const lowerPctEl  = card.querySelector('[data-role="mini-lower-pct"]');

  const toPct = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    const pct = (n <= 1) ? n * 100 : n;
    return Math.max(0, Math.min(100, Math.round(pct)));
  };

  const middleRow = middleFill?.closest(".mini-row");
  if (middleRow) middleRow.style.display = (plantId === "cernavoda") ? "none" : "";

  const u = toPct(bars?.upper);
  const m = toPct(bars?.middle);
  const l = toPct(bars?.lower);

  if (upperFill)  upperFill.style.width  = `${u}%`;
  if (middleFill) middleFill.style.width = `${m}%`;
  if (lowerFill)  lowerFill.style.width  = `${l}%`;

  if (upperPctEl)  upperPctEl.textContent  = `${u}%`;
  if (middlePctEl) middlePctEl.textContent = `${m}%`;
  if (lowerPctEl)  lowerPctEl.textContent  = `${l}%`;
}

// ======================================================
// 4) 주간 차트
// ======================================================
function renderWeeklyChart(contextId) {
  const items = (typeof window.getProcWeeklyRowsByContext === "function")
    ? window.getProcWeeklyRowsByContext(contextId)
    : [];

  const daily =
    window.procDailyAccumDummyByContext?.[contextId] ||
    window.procDailyAccumDummy ||
    [];

  if (typeof window.renderWeeklyProcChart === "function") {
    window.renderWeeklyProcChart(contextId);
  } else {
    console.warn("[feeder] renderWeeklyProcChart missing");
  }
}

// ======================================================
// 5) 지연 리스트
// ======================================================
function renderDelay(contextId) {
  const ul = document.querySelector(".delay-list");
  if (!ul) return;

  const list = window.delayDummyByContext?.[contextId] || window.delayDummy || [];
  ul.innerHTML = list.map((d) => `<li><span>${d.label}</span><b>${d.count}</b></li>`).join("");
}

// ======================================================
// 6) 좌측 원판: holes.json + 홀 렌더링/색상 규칙
//    - base/lip는 항상 렌더
//    - status dot/rim/hi는 상태 있을 때만 노출
//    - base circle에 data-code/data-status를 심어서 클릭 타겟으로 사용
// ======================================================
async function renderFeederPlate(contextId) {
  const mount = document.getElementById("feederMount");
  const img = mount?.querySelector(".feeder-bg");
  if (!mount || !img) {
    console.warn("[feeder] feederMount or .feeder-bg missing");
    return;
  }

  await waitImageReady(img);

  const holes = await loadHolesJsonOnce();
  ensureOverlay(mount);

  // 컨텍스트마다 다시 그림 (middle 202개 때문에)
  await buildHolesForContext(contextId, holes);

  // 상태색 + base.dataset.status 갱신
  applyHoleStatuses(contextId);
}

function waitImageReady(img) {
  return new Promise((resolve) => {
    if (img.complete && img.naturalWidth > 0) return resolve();
    img.addEventListener("load", () => resolve(), { once: true });
    img.addEventListener("error", () => resolve(), { once: true });
  });
}

async function loadHolesJsonOnce() {
  if (HOLES_CACHE) return HOLES_CACHE;

  const url = "./js/feeder/holes.json";
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`[feeder] holes.json fetch failed: ${res.status}`);

  const json = await res.json();
  const list =
    Array.isArray(json) ? json :
    Array.isArray(json.holes) ? json.holes :
    Array.isArray(json.data) ? json.data :
    [];

  HOLES_CACHE = list;
  return HOLES_CACHE;
}

function ensureOverlay(mount) {
  if (OVERLAY && mount.contains(OVERLAY)) return;

  mount.querySelectorAll("svg.feeder-overlay").forEach((el) => el.remove());

  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.classList.add("feeder-overlay");

  // holes.json 만든 기준 좌표계로 고정
  const FEEDER_VB = { w: 1201, h: 822 };
  svg.setAttribute("viewBox", `0 0 ${FEEDER_VB.w} ${FEEDER_VB.h}`);
  svg.setAttribute("preserveAspectRatio", "none");

  svg.innerHTML = `
    <defs>
      <radialGradient id="concaveGrad" cx="50%" cy="50%" r="60%">
        <stop offset="0%"   stop-color="#3d4248ff"/>
        <stop offset="50%"  stop-color="#4e5156ff"/>
        <stop offset="80%"  stop-color="#525354ff"/>
        <stop offset="100%" stop-color="#AEB6C0"/>
      </radialGradient>

      <radialGradient id="lipGrad" cx="50%" cy="50%" r="60%">
        <stop offset="78%" stop-color="#ffffff" stop-opacity="0"/>
        <stop offset="90%" stop-color="#ffffff" stop-opacity="0.25"/>
      </radialGradient>

      <linearGradient id="bevelStroke" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%"   stop-color="#ffffff" stop-opacity="0.70"/>
        <stop offset="45%"  stop-color="#ffffff" stop-opacity="0.12"/>
        <stop offset="55%"  stop-color="#000000ff" stop-opacity="0.10"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.55"/>
      </linearGradient>

      <radialGradient id="statusSpec" cx="35%" cy="35%" r="60%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
        <stop offset="40%" stop-color="#ffffff" stop-opacity="0.20"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <g id="holesLayer"></g>
  `;

  mount.appendChild(svg);

  OVERLAY = svg;
  HOLE_ELEMS_BY_KEY = new Map();
}

function normalizeHole(h) {
  const key = String(h.id ?? h.key ?? h.name ?? h.holeId ?? "");
  const x = Number(h.x ?? h.cx ?? h.posX ?? h.left ?? 0);
  const y = Number(h.y ?? h.cy ?? h.posY ?? h.top ?? 0);
  const row = h.row ?? h.rowName ?? h.rlabel ?? h.line ?? null;

  // (선택) holes.json에 proc 들어있으면 읽음
  const proc = h.proc ?? h.process ?? h.procName ?? "";

  // 반응형용 0~1 좌표도 허용
  const isUnit = x > 0 && x <= 1 && y > 0 && y <= 1;
  return { key, x, y, row, proc, isUnit };
}

// row 기준 스냅: 중앙값(median)으로 행 Y 고정
function buildRowYMap(list) {
  const byRow = new Map();
  list.forEach((h) => {
    const row = h?.row;
    const y = Number(h?.y);
    if (!row || Number.isNaN(y)) return;
    if (!byRow.has(row)) byRow.set(row, []);
    byRow.get(row).push(y);
  });

  const map = {};
  for (const [row, ys] of byRow.entries()) {
    ys.sort((a, b) => a - b);
    const mid = Math.floor(ys.length / 2);
    map[row] = (ys.length % 2) ? ys[mid] : (ys[mid - 1] + ys[mid]) / 2;
  }
  return map;
}

// 상태 색상(사이니지 동일): 초록/빨강/하양만
function colorOf(status) {
  switch (status) {
    case "ok":     return "#159C61";
    case "before": return "#F3F4F6";
    case "delay":  return "#E6243C";
    default:       return "transparent";
  }
}

// feeder-page.js 내부 상태키를 사이니지 키로 매핑
function mapStatusToSignageKey(st) {
  switch (st) {
    case "ok":    return "ok";
    case "delay": return "delay";
    case "warn":  return "before";
    case "done":  return "before";
    default:      return ""; // idle 포함
  }
}

async function buildHolesForContext(contextId, holes) {
  if (!OVERLAY) return;

  const [plantId, position] = contextId.split("-");
  const layer = OVERLAY.querySelector("#holesLayer");
  if (!layer) return;

  // 컨텍스트마다 다시 그림
  layer.innerHTML = "";
  HOLE_ELEMS_BY_KEY = new Map();

  let normalized = holes.map(normalizeHole).filter((h) => h.key);

  // unit(0~1) 좌표 지원
  const anyUnit = normalized.some((h) => h.isUnit);
  const vbW = anyUnit ? 1000 : 1201;
  const vbH = anyUnit ? 1000 : 822;
  if (anyUnit) OVERLAY.setAttribute("viewBox", `0 0 ${vbW} ${vbH}`);

  // Pickering-middle만 202개 선택
  if (plantId === "pickering" && position === "middle") {
    normalized = selectSymmetricByRow(normalized, 202);
  }

  // row Y 스냅 맵
  ROW_Y_MAP = null;
  const hasRow = normalized.some((h) => h.row);
  if (hasRow) {
    const forMap = normalized.map((h) => ({
      row: h.row,
      y: anyUnit ? (h.y * vbH) : h.y,
    }));
    ROW_Y_MAP = buildRowYMap(forMap);
    window.__rowYMap = ROW_Y_MAP; // debug
  }

  const ns = "http://www.w3.org/2000/svg";
  const BASE_R   = 13.4;
  const LIP_R    = 13.9;
  const STATUS_R = 12.2;

  normalized.forEach((h) => {
    const cx = anyUnit ? h.x * vbW : h.x;
    const rawCy = anyUnit ? h.y * vbH : h.y;
    const cy = (h.row && ROW_Y_MAP && ROW_Y_MAP[h.row] != null) ? ROW_Y_MAP[h.row] : rawCy;

    // [1] concave base (✅ 클릭 타겟)
    const base = document.createElementNS(ns, "circle");
    base.setAttribute("cx", String(cx));
    base.setAttribute("cy", String(cy));
    base.setAttribute("r", String(BASE_R));
    base.setAttribute("fill", "url(#concaveGrad)");
    base.setAttribute("opacity", "1");

    // ✅ 팝업 트리거용 dataset
    base.dataset.code = h.key;
    // proc 우선순위: holes.json proc -> holeProcByContext 매핑
    const procMap = window.holeProcByContext?.[contextId] || {};
    base.dataset.proc = (h.proc || procMap[h.key] || "");
    base.dataset.status = "idle"; // applyHoleStatuses에서 갱신
    base.style.cursor = "pointer";
    base.style.pointerEvents = "all";

    layer.appendChild(base);

    // [2] lip (클릭 방해 금지)
    const lip = document.createElementNS(ns, "circle");
    lip.setAttribute("cx", String(cx));
    lip.setAttribute("cy", String(cy));
    lip.setAttribute("r", String(LIP_R));
    lip.setAttribute("fill", "url(#lipGrad)");
    lip.setAttribute("opacity", "1");
    lip.style.pointerEvents = "none";
    layer.appendChild(lip);

    // [3] status dot + rim + spec (클릭은 base로만 받게)
    const dot = document.createElementNS(ns, "circle");
    dot.setAttribute("cx", String(cx));
    dot.setAttribute("cy", String(cy));
    dot.setAttribute("r", String(STATUS_R));
    dot.setAttribute("fill", "transparent");
    dot.setAttribute("opacity", "0.92");
    dot.style.display = "none";
    dot.style.pointerEvents = "none";
    layer.appendChild(dot);

    const rim = document.createElementNS(ns, "circle");
    rim.setAttribute("cx", String(cx));
    rim.setAttribute("cy", String(cy));
    rim.setAttribute("r", String(STATUS_R - 0.5));
    rim.setAttribute("fill", "none");
    rim.setAttribute("stroke", "url(#bevelStroke)");
    rim.setAttribute("vector-effect", "non-scaling-stroke");
    rim.setAttribute("opacity", "0.95");
    rim.style.display = "none";
    rim.style.pointerEvents = "none";
    layer.appendChild(rim);

    const hi = document.createElementNS(ns, "circle");
    hi.setAttribute("cx", String(cx - STATUS_R * 0.28));
    hi.setAttribute("cy", String(cy - STATUS_R * 0.30));
    hi.setAttribute("r", String(STATUS_R * 0.55));
    hi.setAttribute("fill", "url(#statusSpec)");
    hi.setAttribute("opacity", "0.35");
    hi.style.display = "none";
    hi.style.pointerEvents = "none";
    layer.appendChild(hi);

    HOLE_ELEMS_BY_KEY.set(h.key, { base, dot, rim, hi });
  });
}

// Pickering-middle 전용: 202개 대칭 선택
function selectSymmetricByRow(list, targetCount) {
  const ROWS = ["A","B","C","D","E","F","G","H","J","K","L","M","N","O","P","Q","R","S","T","U","V","W"];
  const CENTER_ROWS = ["L", "M"];

  const byRow = new Map();
  ROWS.forEach(r => byRow.set(r, []));
  list.forEach(h => {
    const r = String(h.row || "");
    if (byRow.has(r)) byRow.get(r).push(h);
  });

  for (const arr of byRow.values()) {
    arr.sort((a, b) => (a.x ?? 0) - (b.x ?? 0));
  }

  const picked = [];
  const used = new Set();

  const takeRowCenterOut = (arr) => {
    if (!arr || !arr.length) return false;

    const n = arr.length;
    let L = Math.floor((n - 1) / 2);
    let R = L + 1;

    while (picked.length < targetCount && (L >= 0 || R < n)) {
      if (L >= 0) {
        const h = arr[L];
        if (h?.key && !used.has(h.key)) {
          picked.push(h);
          used.add(h.key);
          if (picked.length >= targetCount) return true;
        }
        L -= 1;
      }

      if (picked.length < targetCount && R < n) {
        const h = arr[R];
        if (h?.key && !used.has(h.key)) {
          picked.push(h);
          used.add(h.key);
          if (picked.length >= targetCount) return true;
        }
        R += 1;
      }
    }
    return false;
  };

  for (const r of CENTER_ROWS) {
    if (takeRowCenterOut(byRow.get(r))) return picked.slice(0, targetCount);
  }

  const centerIdx = ROWS.indexOf(CENTER_ROWS[0]);
  if (centerIdx < 0) return list.slice(0, targetCount);

  let step = 1;
  while (picked.length < targetCount) {
    const upIdx = centerIdx - step;
    const dnIdx = centerIdx + step;

    let progressed = false;

    if (upIdx >= 0) {
      progressed = true;
      if (takeRowCenterOut(byRow.get(ROWS[upIdx]))) break;
    }
    if (picked.length < targetCount && dnIdx < ROWS.length) {
      progressed = true;
      if (takeRowCenterOut(byRow.get(ROWS[dnIdx]))) break;
    }

    if (!progressed) break;
    step += 1;
  }

  return picked.slice(0, targetCount);
}

function applyHoleStatuses(contextId) {
  const map = window.holeStatusByContext?.[contextId] || {};

  HOLE_ELEMS_BY_KEY.forEach((obj, key) => {
    const raw = map[key] || "idle";           // ok / warn / delay / done / idle
    const signageKey = mapStatusToSignageKey(raw); // ok / before / delay / ""

    // ✅ 팝업이 읽을 현재 상태를 base에 저장
    if (obj?.base) obj.base.dataset.status = raw;

    const fill = colorOf(signageKey);
    const show = fill !== "transparent";

    if (obj?.dot) {
      obj.dot.setAttribute("fill", fill);
      obj.dot.style.display = show ? "" : "none";
    }
    if (obj?.rim) obj.rim.style.display = show ? "" : "none";
    if (obj?.hi)  obj.hi.style.display  = show ? "" : "none";
  });
}

// ======================================================
// 7) Demo / Reset
// ======================================================
function randomizeHoleStatuses(contextId) {
  const keys = Array.from(HOLE_ELEMS_BY_KEY.keys());
  if (!keys.length) return;

  const out = {};
  keys.forEach((k) => {
    const r = Math.random();
    const st =
      r < 0.55 ? "idle" :
      r < 0.75 ? "ok" :
      r < 0.90 ? "warn" : "delay";
    out[k] = st;
  });

  window.holeStatusByContext = window.holeStatusByContext || {};
  window.holeStatusByContext[contextId] = out;
}

function resetHoleStatuses(contextId) {
  window.holeStatusByContext = window.holeStatusByContext || {};
  window.holeStatusByContext[contextId] = {};
}

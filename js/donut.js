function drawFeederDonut(canvas, percent, colors, style = {}) {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(w, h) / 2 - 10;

  ctx.clearRect(0, 0, w, h);

  // 배경 원
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "#eeeeee";
  ctx.lineWidth = style?.lineWidth ?? 20;
  ctx.lineCap = "round";
  ctx.stroke();

  // 진행 원
  const start = -Math.PI / 2;
  const end = start + (2 * Math.PI * percent) / 100;

  ctx.beginPath();
  ctx.arc(cx, cy, radius, start, end);

  const gradient = ctx.createLinearGradient(cx - radius, 0, cx + radius, 0);
  gradient.addColorStop(0, colors.from);
  gradient.addColorStop(1, colors.to);

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 20;
  ctx.lineCap = "round";
  ctx.stroke();
}

function renderProcBarChart(targetId, items, daily = []) {
  const container = document.getElementById(targetId);
  if (!container) return;

  container.innerHTML = "";

  // 일간 데이터(라인)까지 포함해서 축 최대값 결정
  const dailyArr =
    (Array.isArray(daily) && daily.length) ? daily : (window.procDailyAccumDummy || []);

  const barMax =
    Math.max(...items.map(item => Math.max(item.plan, item.actual))) || 1;

  const dailyMax =
    Math.max(...dailyArr.map(d => Number(d.value ?? 0))) || 0;

  const maxVal = Math.max(barMax, dailyMax, 1);


  // 막대 생성
  items.forEach((item) => {
    const col = document.createElement("div");
    col.className = "proc-bar-column";

    const wrapper = document.createElement("div");
    wrapper.className = "proc-bar-wrapper";

    const planBar = document.createElement("div");
    planBar.className = "proc-bar--plan";
    planBar.style.height = `${(item.plan / maxVal) * 100}%`;

    const actualBar = document.createElement("div");
    actualBar.className = "proc-bar--actual";
    actualBar.style.height = `${(item.actual / maxVal) * 100}%`;

    wrapper.appendChild(planBar);
    wrapper.appendChild(actualBar);

    const label = document.createElement("div");
    label.className = "proc-bar-label";
    label.textContent = item.uiLabel ?? item.shortLabel ?? item.label;

    col.appendChild(wrapper);
    col.appendChild(label);
    container.appendChild(col);
  });

  // ============================
  // Daily 누적 실적(라인/도트) 오버레이
  // ============================

  const dailyMap = new Map(dailyArr.map((d) => [String(d.key), Number(d.value ?? 0)]));

  const plantId = document.body.classList.contains("theme-cernavoda")
    ? "cernavoda"
    : "pickering";
  const style = window.PROC_DAILY_LINE_STYLE?.[plantId] || {
    line: "#69DCF6",
    dot: "#0C77EA",
  };

  container.querySelectorAll("svg.proc-daily-overlay").forEach((el) => el.remove());

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.classList.add("proc-daily-overlay");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("preserveAspectRatio", "none");

  const W = container.clientWidth || 1;
  const H = container.clientHeight || 1;
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

  const cols = container.querySelectorAll(".proc-bar-column");
  const contRect = container.getBoundingClientRect();

  const points = [];
  cols.forEach((colEl, idx) => {
    const item = items[idx];
    if (!item) return;

    const wrap = colEl.querySelector(".proc-bar-wrapper");
    if (!wrap) return;

    const v = dailyMap.get(String(item.key));
    if (!Number.isFinite(v)) return;

    const wrapRect = wrap.getBoundingClientRect();
    const x = (wrapRect.left - contRect.left) + wrapRect.width / 2;

    const y = H - (v / maxVal) * H;
    points.push({ x, y });
  });

  if (points.length >= 2) {
    const pl = document.createElementNS(svgNS, "polyline");
    pl.setAttribute("fill", "none");
    pl.setAttribute("stroke", style.line);
    pl.setAttribute("stroke-width", "1");
    pl.setAttribute("points", points.map((p) => `${p.x},${p.y}`).join(" "));
    svg.appendChild(pl);

    points.forEach((p) => {
      const c = document.createElementNS(svgNS, "circle");
      c.setAttribute("cx", String(p.x));
      c.setAttribute("cy", String(p.y));
      c.setAttribute("r", "2.5");
      c.setAttribute("fill", style.dot);
      svg.appendChild(c);
    });

    container.appendChild(svg);
  }
}

function calcPercent(actual, plan) {
  if (!plan || plan <= 0) return 0;
  const p = Math.round((Number(actual || 0) / Number(plan || 0)) * 100);
  return Math.max(0, Math.min(100, p));
}

/**
 * project-total-progress.js가 호출하는 API
 * - gridElOrId: "procDonutGrid-pickering" 같은 id 문자열 또는 엘리먼트
 * - plantId: "pickering" | "cernavoda"
 * - plantName: "Pickering" | "Cernavoda" (있으면 color-rules 연동 가능)
 */
function renderProcDonutGrid(gridElOrId, plantId, plantName = "") {
  const grid =
    typeof gridElOrId === "string"
      ? document.getElementById(gridElOrId)
      : gridElOrId;

  if (!grid) {
    console.warn("[donut] grid missing:", gridElOrId);
    return;
  }

  const source = window.procDonutByPlantDummy || [];
  const items = source.filter((d) => d.plantId === plantId);

  if (!items.length) {
    console.warn("[donut] no donut items for", plantId);
    grid.innerHTML = "";
    return;
  }

  grid.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card proc-donut-card";

    const title = document.createElement("div");
    title.className = "proc-donut-title";
    title.textContent = item.title ?? "";

    const divider = document.createElement("div");
    divider.className = "proc-donut-divider";

    const body = document.createElement("div");
    body.className = "proc-donut-body";

    const canvasWrap = document.createElement("div");
    canvasWrap.className = "proc-donut-canvas-wrap";

    const canvas = document.createElement("canvas");
    canvas.className = "proc-donut-canvas";
    canvas.width = 170;
    canvas.height = 170;

    canvasWrap.appendChild(canvas);

    const dl = document.createElement("dl");
    dl.className = "proc-donut-metrics";

    const dt1 = document.createElement("dt");
    dt1.textContent = "목표";
    const dd1 = document.createElement("dd");
    dd1.textContent = String(item.plan ?? 0);

    const dt2 = document.createElement("dt");
    dt2.textContent = "달성";
    const dd2 = document.createElement("dd");
    dd2.textContent = String(item.actual ?? 0);

    dl.appendChild(dt1); dl.appendChild(dd1);
    dl.appendChild(dt2); dl.appendChild(dd2);

    body.appendChild(canvasWrap);
    body.appendChild(dl);

    card.appendChild(title);
    card.appendChild(divider);
    card.appendChild(body);

    grid.appendChild(card);

    const percent = calcPercent(item.actual, item.plan);

    // 색 규칙: plantId 기준으로 기본값
    const colors =
      plantId === "pickering"
        ? { from: "#6CCBFF", to: "#2F7BEF" }
        : { from: "#FFC266", to: "#FF8A00" };

    // drawFeederDonut는 이미 전역/파일 내 존재한다고 가정
    drawFeederDonut(canvas, percent, colors);

    // (선택) 도넛 중앙 % 텍스트가 필요하면 여기서 추가 가능
    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.fillStyle = colors.to;
    ctx.font = "700 24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${percent}%`, canvas.width / 2, canvas.height / 2);
    ctx.restore();
  });
}

// project-total-progress.js가 찾는 전역 이름으로 export
window.renderProcDonutGrid = renderProcDonutGrid;


// 전역 노출
window.drawFeederDonut = drawFeederDonut;
window.renderProcBarChart = renderProcBarChart;

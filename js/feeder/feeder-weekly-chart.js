// js/feeder-weekly-chart.js
// - 역할: 주간 공정 차트 렌더를 한 곳에서 묶어 호출만 제공
// - renderProcBarChart(막대 구현)는 donut.js 것을 그대로 사용

// ======================================================
// Weekly 공정별 바차트 + 그리드 엔트리
// contextId: pickering-upper | pickering-middle | pickering-lower
//            cernavoda-upper | cernavoda-lower
// ======================================================
window.renderWeeklyProcChart = function renderWeeklyProcChart(contextId) {
  // 1) 컨텍스트별 공정 rows
  const items =
    typeof window.getProcWeeklyRowsByContext === "function"
      ? window.getProcWeeklyRowsByContext(contextId)
      : [];

  // 2) 일간(라인용) 데이터 (있으면 사용)
  const daily =
    window.procDailyAccumDummyByContext?.[contextId] ||
    window.procDailyAccumDummy ||
    [];

  // 3) 막대 차트 렌더 (먼저!)
  if (typeof window.renderProcBarChart === "function") {
    window.renderProcBarChart("procBarChart", items, daily);
  } else {
    console.warn("[weekly] renderProcBarChart missing");
  }

  // 4) 그리드 렌더 (레이아웃 확정 후)
  const gridSvg = document.querySelector("#procBarChartWrap .proc-grid");
  if (gridSvg) {
    renderGridLines(gridSvg, 4);
  }
  
};

// grid 함수는 여기 둬도 됨(이름 충돌 없음)
function renderGridLines(svgEl, rows = 3) {
  if (!svgEl) return;

  const rect = svgEl.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  if (!w || !h) return;

  svgEl.setAttribute("viewBox", `0 0 ${w} ${h}`);
  svgEl.setAttribute("preserveAspectRatio", "none");
  svgEl.setAttribute("shape-rendering", "crispEdges");
  svgEl.innerHTML = "";

  const step = h / rows;

  for (let i = 0; i <= rows; i++) {
    // ★ 바닥(0선)을 정확히 bottom에 고정
    // i=0 => y = h-0.5
    // i=rows => y = 0.5
    const yRaw = h - i * step;
    const y = Math.round(yRaw - 0.5) + 0.5; // 픽셀 스냅

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "0");
    line.setAttribute("x2", String(w));
    line.setAttribute("y1", String(y));
    line.setAttribute("y2", String(y));
    line.setAttribute("stroke", "#D9D9D9");
    line.setAttribute("stroke-width", "1");
    line.setAttribute("stroke-linecap", "butt");

    svgEl.appendChild(line);
  }
}


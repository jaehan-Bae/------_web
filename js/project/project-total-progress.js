// js/project-total-progress.js
document.addEventListener("DOMContentLoaded", () => {
  if (typeof feederSummaryDummy === "undefined") {
    console.warn("[project-total-progress] feederSummaryDummy missing");
    return;
  }
  if (typeof procDonutByPlantDummy === "undefined") {
    console.warn("[project-total-progress] procDonutByPlantDummy missing");
    return;
  }

  const clampPct = (v) => Math.max(0, Math.min(100, Number(v) || 0));

  function renderXAxisLabels() {
    return `
      <div class="bar-x-labels" aria-hidden="true">
        <span data-pct="0">0%</span>
        <span data-pct="10">10%</span>
        <span data-pct="20">20%</span>
        <span data-pct="30">30%</span>
        <span data-pct="40">40%</span>
        <span data-pct="50">50%</span>
        <span data-pct="60">60%</span>
        <span data-pct="70">70%</span>
        <span data-pct="80">80%</span>
        <span data-pct="90">90%</span>
        <span data-pct="100">100%</span>
      </div>
    `;
  }

  function applyPercentLabels(container) {
    if (!container) return;
    container.querySelectorAll(".bar-x-labels span").forEach((el) => {
      el.style.left = `${Number(el.dataset.pct)}%`;
    });
  }

  function renderTotalSummary(totalBarEl, badgeEl, plantId) {
    if (!totalBarEl) return false;

    const summary = feederSummaryDummy.find((d) => d.groupId === plantId);
    if (!summary) {
      console.warn("[project-total-progress] feederSummaryDummy not found for:", plantId);
      return false;
    }

    const plan = summary.total || 0;
    const actual = summary.produced || 0;
    const pct = plan > 0 ? Math.round((actual / plan) * 100) : 0;

    if (badgeEl) badgeEl.textContent = `전체 ${clampPct(pct)}%`;

    totalBarEl.innerHTML = `
      <div class="bar-row">
        <span class="bar-label">실적</span>
        <div class="bar-track">
          <div class="bar bar-actual" style="width:${clampPct(pct)}%"></div>
        </div>
      </div>

      <div class="bar-row">
        <span class="bar-label">계획</span>
        <div class="bar-track">
          <div class="bar bar-plan" style="width:100%"></div>
        </div>
      </div>

      ${renderXAxisLabels()}
    `;
    applyPercentLabels(totalBarEl);

    // ✅ bar-track이 실제로 생성됐는지 반환
    return totalBarEl.querySelectorAll(".bar-track").length > 0;
  }

  function renderProcBars(procBarsEl, plantId) {
    if (!procBarsEl) return false;

    const wantedKeys = ["final_ins", "dimension_ins", "attach_welding", "welding", "bending"];

    const rows = procDonutByPlantDummy
      .filter((d) => d.plantId === plantId && wantedKeys.includes(d.key))
      .sort((a, b) => wantedKeys.indexOf(a.key) - wantedKeys.indexOf(b.key));

    procBarsEl.innerHTML = `
      ${rows
        .map((r) => {
          const plan = r.plan || 0;
          const actual = r.actual || 0;
          const pct = plan > 0 ? Math.round((actual / plan) * 100) : 0;

          return `
            <div class="proc-row">
              <div class="proc-label">${r.title}</div>
              <div class="proc-bars">
                <div class="bar-track">
                  <div class="bar bar-actual" style="width:${clampPct(pct)}%"></div>
                </div>
                <div class="bar-track">
                  <div class="bar bar-plan" style="width:100%"></div>
                </div>
              </div>
            </div>
          `;
        })
        .join("")}
      ${renderXAxisLabels()}
    `;
    applyPercentLabels(procBarsEl);

    return procBarsEl.querySelectorAll(".bar-track").length > 0;
  }

  const slides = Array.from(document.querySelectorAll(".progress-slide"));
  const rendered = new Set();

  function renderSlideByIndex(idx) {
    const slideEl = slides[idx] || slides[0];
    if (!slideEl) return;

    const plantId = slideEl.dataset.plant || (idx === 0 ? "pickering" : "cernavoda");
    const plantName = slideEl.dataset.plantName || "";

    const badgeEl = slideEl.querySelector('[data-role="total-badge"]');
    const totalBarEl = slideEl.querySelector('[data-role="total-bar"]');
    const procBarsEl = slideEl.querySelector('[data-role="proc-bars"]');
    const donutGridEl = slideEl.querySelector('[data-role="donut-grid"]');

    // ✅ 이미 렌더된 슬라이드라도, bar-track이 없으면 다시 렌더하도록
    const key = `${idx}:${plantId}`;
    const hasBarsNow =
      (totalBarEl && totalBarEl.querySelectorAll(".bar-track").length > 0) ||
      (procBarsEl && procBarsEl.querySelectorAll(".bar-track").length > 0);

    if (rendered.has(key) && hasBarsNow) {
      return;
    }

    const ok1 = renderTotalSummary(totalBarEl, badgeEl, plantId);
    const ok2 = renderProcBars(procBarsEl, plantId);

    if (donutGridEl && typeof window.renderProcDonutGrid === "function") {
      window.renderProcDonutGrid(donutGridEl.id, plantId, plantName);
    } else {
      console.warn("[donut] missing", { donutGridEl, fn: window.renderProcDonutGrid });
    }

    // “진짜로 그려졌을 때만” rendered 처리
    if (ok1 || ok2) rendered.add(key);
  }

  // 최초 0번 강제 렌더(이게 없으면 0번은 event 전까지 비어있을 수 있음)
  renderSlideByIndex(0);

  // 슬라이더 이벤트로 렌더
  document.addEventListener("progress:slideChange", (e) => {
    const idx = e?.detail?.index ?? 0;
    // 슬라이더 transform 직후 DOM 안정화용 1프레임 딜레이
    requestAnimationFrame(() => renderSlideByIndex(idx));
  });

  // 디버깅/수동 렌더용(필요하면 유지)
  window.__renderProjectSlide = renderSlideByIndex;
});
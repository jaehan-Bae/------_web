// js/pages/index-page.js
document.addEventListener("DOMContentLoaded", () => {
  // ===== 1) Summary cards (Pickering / Cernavoda) =====
const summaryCards = document.querySelectorAll(
  '.card.card--big[data-card^="pickering"], .card.card--big[data-card^="cernavoda"]'
);
summaryCards.forEach((card) => {
  const key = card.dataset.card; // pickering5, pickering6, cernavoda7 등
  const model = window.adaptHomeSummaryToModel?.(key);

  if (model && window.renderSummaryCardInto) {
    window.renderSummaryCardInto(card, model);
  } else {
    console.warn("[summary] missing", {
      key,
      model: !!model,
      renderSummaryCardInto: typeof window.renderSummaryCardInto
    });
  }
});

  // ===== 2) Process cards (left/right) =====
  const pickEl = document.querySelector('[data-role="proc-card"][data-plant="pickering"]');
  const cerEl  = document.querySelector('[data-role="proc-card"][data-plant="cernavoda"]');

  if (pickEl && cerEl && window.adaptProcWeeklyRows && window.renderProcCard) {
    const pickRows = window.adaptProcWeeklyRows("pickering");
    const cerRows  = window.adaptProcWeeklyRows("cernavoda");

    window.renderProcCard(pickEl, "PICKERING", pickRows);
    window.renderProcCard(cerEl, "CERENAVODA", cerRows);
  } else {
    console.warn("[proc] missing elements or functions", {
      pickEl: !!pickEl,
      cerEl: !!cerEl,
      adaptProcWeeklyRows: typeof window.adaptProcWeeklyRows,
      renderProcCard: typeof window.renderProcCard
    });
  }

  // ===== 3) Weekly/Monthly small KPI cards =====
  const smallIds = [
  "weekly-pickering",
  "weekly-cernavoda",
  "monthly-pickering",
  "monthly-cernavoda"
];

smallIds.forEach((id) => {
  const cards = document.querySelectorAll(`[data-card="${id}"]`);
  const model = window.adaptSmallKpiToModel?.(id);
  if (!model || !window.renderSmallKpiCardInto) return;

  cards.forEach((card) => window.renderSmallKpiCardInto(card, model));
});

  // 인덱스페이지 오른쪽 타이틀 색상
document.querySelectorAll(".progress-block").forEach((block) => {
  const plant = String(block.dataset.plant || "").toLowerCase();
  const unit  = String(block.dataset.unit || "").trim(); // 5/6/7
  const titleEl = block.querySelector('[data-role="progress-title"]');
  if (!titleEl) return;

  // 텍스트
  const plantLabel = plant ? plant.toUpperCase() : "";
  titleEl.textContent = unit ? `${plantLabel} #${unit}` : plantLabel;

  // 배경색
  if (plant === "pickering") titleEl.style.background = "#e7f0f9";
  else if (plant === "cernavoda") titleEl.style.background = "#FFF4E9";
});

});

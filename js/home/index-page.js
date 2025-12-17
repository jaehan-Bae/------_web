// js/pages/index-page.js
document.addEventListener("DOMContentLoaded", () => {
  const pickeringCard = document.querySelector('[data-card="pickering"]');
  const cernavodaCard = document.querySelector('[data-card="cernavoda"]');

  const pickModel = window.adaptHomeSummaryToModel?.("pickering");
  const cerModel  = window.adaptHomeSummaryToModel?.("cernavoda");

  if (pickeringCard && pickModel && window.renderSummaryCardInto) {
    window.renderSummaryCardInto(pickeringCard, pickModel);
  }

  // ============ weklly, monthly small kpi cards ============
  if (cernavodaCard && cerModel && window.renderSummaryCardInto) {
    window.renderSummaryCardInto(cernavodaCard, cerModel);
  }

    const smallIds = [
    "weekly-pickering",
    "weekly-cernavoda",
    "monthly-pickering",
    "monthly-cernavoda"
  ];

  smallIds.forEach((id) => {
    const card = document.querySelector(`[data-card="${id}"]`);
    const model = window.adaptSmallKpiToModel?.(id);
    if (card && model && window.renderSmallKpiCardInto) {
      window.renderSmallKpiCardInto(card, model);
    }
  });
});

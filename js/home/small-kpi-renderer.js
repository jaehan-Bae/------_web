// js/home/small-kpi-renderer.js
(function () {
  function drawSparkline(canvas, series, lineColor) {
    if (!canvas || !series || series.length < 2) return;

    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = Math.max(1, max - min);

    const pad = 4;
    const xStep = (w - pad * 2) / (series.length - 1);

    const yOf = (v) => {
      const t = (v - min) / range;       // 0..1
      return h - pad - t * (h - pad * 2);
    };

    ctx.beginPath();
    series.forEach((v, i) => {
      const x = pad + i * xStep;
      const y = yOf(v);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }

  function renderSmallKpiCardInto(card, model) {
    if (!card || !model) return;

    // 배경
    if (model.theme?.bg) card.style.background = model.theme.bg;

    // title + stitle
    const titleEl = card.querySelector('[data-field="title"]');
    if (titleEl) {
      // 기존 textContent로 밀어버리면 span 사라지니 innerHTML로 구성
      titleEl.innerHTML = `${model.title} <span class="stitle">${model.stitle}</span>`;
    }

    const valueEl = card.querySelector('[data-field="value"]');
    if (valueEl) valueEl.textContent = Number(model.value ?? 0).toLocaleString();

    const labelEl = card.querySelector('[data-field="label"]');
    if (labelEl) labelEl.textContent = model.label ?? "";

    const deltaEl = card.querySelector('[data-field="delta"]');
    if (deltaEl) {
      deltaEl.innerHTML = `
        <img class="delta-arrow" src="${model.arrowSrc}" alt="up">
        <span class="delta-text">${model.deltaPct}%</span>
      `;
      const txt = deltaEl.querySelector(".delta-text");
      if (txt) txt.style.color = model.deltaColor || "#5DAF3B";
    }

    const canvas = card.querySelector("canvas.spark");
    if (canvas) {
      // 레이아웃 안정적으로 고정
      if (!canvas.width) canvas.width = 92;
      if (!canvas.height) canvas.height = 32;
      drawSparkline(canvas, model.series, model.theme?.line || "#90BDEF");
    }
  }

  window.renderSmallKpiCardInto = renderSmallKpiCardInto;
})();

// js/home/small-kpi-renderer.js
(function () {
  /**
   * 1) 캔버스를 CSS 크기에 맞춰서(레티나 포함) 선명하게 그리기 위한 헬퍼
   *    - canvas의 실제 픽셀 해상도 = CSS 크기 * dpr
   *    - 이후 ctx 좌표계는 CSS 픽셀 기준으로 사용 가능
   */
  function fitCanvasToCSS(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // rect가 0이면(숨김/레이아웃 전) fallback
    const cssW = Math.max(1, rect.width || 90);
    const cssH = Math.max(1, rect.height || 32);

    const pxW = Math.round(cssW * dpr);
    const pxH = Math.round(cssH * dpr);

    if (canvas.width !== pxW) canvas.width = pxW;
    if (canvas.height !== pxH) canvas.height = pxH;

    const ctx = canvas.getContext("2d");
    // 좌표계를 CSS px 기준으로 맞춤
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    return { ctx, w: cssW, h: cssH };
  }

  /**
   * 2) 스파크라인 (선 + 선 아래 면 채움)
   * @param {HTMLCanvasElement} canvas
   * @param {number[]} series
   * @param {string} lineColor
   * @param {string|null} fillColor  ex) "rgba(144,189,239,0.18)"
   */
  function drawSparkline(canvas, series, lineColor, fillColor) {
    if (!canvas || !series || series.length < 2) return;

    const { ctx, w, h } = fitCanvasToCSS(canvas);

    ctx.clearRect(0, 0, w, h);

    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = Math.max(1, max - min);

    const pad = 10;
    const fillBottomGap = -100; // ★ 여기서 조절 (선 아래 면 채움 여유 공간)

    const xStep = (w - pad * 2) / (series.length - 1);
    const yOf = (v) => {
      const t = (v - min) / range;
      return h - pad - t * (h - pad * 2);
    };

    const firstX = pad;
    const lastX  = pad + (series.length - 1) * xStep;

    const strokeBottomY = h - pad;
    const fillBottomY   = h - pad - fillBottomGap;

    // 1) 선 path
    ctx.beginPath();
    series.forEach((v, i) => {
      const x = pad + i * xStep;
      const y = yOf(v);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    // 2) 선 아래 면 채우기 (여유 공간 있음)
    if (fillColor) {
      ctx.lineTo(lastX, fillBottomY);
      ctx.lineTo(firstX, fillBottomY);
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
    }

    // 3) 선 다시 그리기
    ctx.beginPath();
    series.forEach((v, i) => {
      const x = pad + i * xStep;
      const y = yOf(v);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.5; // 얇으면 2.75~3.0까지 올리세요
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }

  /**
   * 3) 카드 렌더
   */
  function renderSmallKpiCardInto(card, model) {
    if (!card || !model) return;

    // 카드 전체 배경은 흰색 유지 (전체에 색 먹는 문제 방지)
    card.style.background = "#fff";

    // title + stitle
    const titleEl = card.querySelector('[data-field="title"]');
    if (titleEl) {
      titleEl.innerHTML = `${model.title} <span class="stitle">${model.stitle}</span>`;
    }

    // value
    const valueEl = card.querySelector('[data-field="value"]');
    if (valueEl) valueEl.textContent = Number(model.value ?? 0).toLocaleString();

    // label
    const labelEl = card.querySelector('[data-field="label"]');
    if (labelEl) labelEl.textContent = model.label ?? "";

    // delta (arrow + %)
    const deltaEl = card.querySelector('[data-field="delta"]');
    if (deltaEl) {
      deltaEl.innerHTML = `
        <img class="delta-arrow" src="${model.arrowSrc}" alt="up">
        <span class="delta-text">${model.deltaPct}%</span>
      `;
      const txt = deltaEl.querySelector(".delta-text");
      if (txt) txt.style.color = model.deltaColor || "#5DAF3B";
    }

    // spark-box 배경 (캔버스 영역에만 연한 배경)
    const box = card.querySelector('[data-field="spark-box"]');
    if (box) {
      box.style.background = model.theme?.bg || "transparent";
    }


    // canvas
    const canvas = card.querySelector("canvas.spark");
    if (canvas) {
      if (!canvas.width) canvas.width = 90;
      if (!canvas.height) canvas.height = 40;

      // ✅ 1) 카드 키(weekly/monthly 판별)
      const cardKey = (card.getAttribute("data-card") || "").toLowerCase();
      const isWeekly  = cardKey.indexOf("weekly") === 0;
      const isMonthly = cardKey.indexOf("monthly") === 0;

      // ✅ 2) 상위 progress-block(plant/unit 판별)
      const block = card.closest(".progress-block");
      const plant = block ? block.getAttribute("data-plant") : "";
      const unit  = block ? block.getAttribute("data-unit") : "";

      // ✅ 3) 기본 테마(기본색)
      let line = model.theme?.line || "#90BDEF";
      let fill = "rgba(59,130,246,0.18)";

      if (plant === "pickering") {
      if (isWeekly) {
        // Weekly → 기존 하늘색 유지 (조금 또렷하게)
        line = "rgba(144,189,239,1)";   // #90BDEF
        fill = "rgba(144,189,239,0.18)";
      } else if (isMonthly) {
        // Monthly → 같은 계열, 다른 색
        line = "rgba(37,99,235,1)";    // #60A5FA
        fill = "rgba(37,99,235,0.18)";
      }
    }


      // ===========================
      // ✅ 원하는 조합만 덮어쓰기
      // ===========================

      // PICKERING #6 : Weekly/Monthly 서로 다른 파랑
      if (plant === "pickering" && unit === "6") {
        if (isWeekly) {
          line = "rgba(59,130,246,1)";   // Weekly
          fill = "rgba(59,130,246,0.18)";
        } else if (isMonthly) {
          line = "rgba(96,165,250,1)";   // Monthly
          fill = "rgba(96,165,250,0.18)";
        }
      }

      // CERNAVODA #1 : Weekly/Monthly 서로 다른 주황
      if (plant === "cernavoda" && unit === "1") {
        if (isWeekly) {
          line = "rgba(246,162,85,1)";   // Weekly (#F6A255)
          fill = "rgba(246,162,85,0.18)";
        } else if (isMonthly) {
          line = "rgba(218, 112, 14, 0.73)";   // Monthly (#EA7C18)
          fill = "rgba(255,149,51,0.18)";
        }
      }

      drawSparkline(canvas, model.series || [], line, fill);
    }

  }

  // 전역 노출
  window.renderSmallKpiCardInto = renderSmallKpiCardInto;
})();

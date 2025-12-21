(function () {
  const POP_ID = "feederFirstPopup";
  const popup = document.getElementById(POP_ID);
  if (!popup) return;

  const titleEl = document.getElementById("fpairTitle");
  const colLeftEl = document.getElementById("fpairColLeft");
  const colRightEl = document.getElementById("fpairColRight");
  const tbody = document.getElementById("fpairTbody");

  const sumLeftCode = document.getElementById("fpairSumLeftCode");
  const sumRightCode = document.getElementById("fpairSumRightCode");
  const leftDone = document.getElementById("fpairLeftDone");
  const leftDelay = document.getElementById("fpairLeftDelay");
  const rightDone = document.getElementById("fpairRightDone");
  const rightDelay = document.getElementById("fpairRightDelay");

  const closeBtn = popup.querySelector(".fpair-close");

  function openPopup(data) {
    // title / cols
    const leftCode = data?.leftCode || "A9W";
    const rightCode = data?.rightCode || "A14E";

    if (titleEl) titleEl.textContent = `${leftCode} - ${rightCode}`;
    if (colLeftEl) colLeftEl.textContent = leftCode;
    if (colRightEl) colRightEl.textContent = rightCode;

    if (sumLeftCode) sumLeftCode.textContent = leftCode;
    if (sumRightCode) sumRightCode.textContent = rightCode;

    // rows
    const rows = Array.isArray(data?.rows) ? data.rows : [];
    if (tbody) {
      tbody.innerHTML = rows.map(r => {
        const l = r?.leftStatus || "ok";   // ok/delay/wait
        const rr = r?.rightStatus || "ok";
        return `
          <tr>
            <td class="fpair-name">${r?.name ?? "-"}</td>
            <td><span class="fpair-dot ${l}"></span></td>
            <td><span class="fpair-dot ${rr}"></span></td>
          </tr>
        `;
      }).join("");
    }

    // summary
    const sL = data?.summary?.left || {};
    const sR = data?.summary?.right || {};
    if (leftDone) leftDone.textContent = String(sL.done ?? 0);
    if (leftDelay) leftDelay.textContent = String(sL.delay ?? 0);
    if (rightDone) rightDone.textContent = String(sR.done ?? 0);
    if (rightDelay) rightDelay.textContent = String(sR.delay ?? 0);

    popup.classList.remove("hidden");
  }

  function closePopup() {
    popup.classList.add("hidden");
  }

  if (closeBtn) closeBtn.addEventListener("click", closePopup);
  popup.addEventListener("click", (e) => {
    if (e.target === popup) closePopup();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePopup();
  });

  // ✅ 원판 클릭 트리거
  // - 홀(circle[data-code]) 클릭이면 이 팝업은 열지 않음
  // - 원판: feeder-bg 이미지 또는 feederMount 자체 클릭을 허용
  document.addEventListener("click", (e) => {
    // 홀 클릭이면 무시(홀 팝업 유지)
    if (e.target.closest && e.target.closest("circle[data-code]")) return;

    const plateImg = e.target.closest && e.target.closest(".feeder-bg");
    const mount = e.target.closest && e.target.closest("#feederMount");
    if (!plateImg && !mount) return;

    // 컨텍스트 기반으로 데이터를 찾게 설계 (없으면 더미)
    const ctx = window.__activeFeederContext || "pickering-upper";

    const data =
      window.feederFirstPopupDataByContext?.[ctx] ||
      window.feederFirstPopupData ||
      {
        leftCode: "A9W",
        rightCode: "A14E",
        rows: [
          { name: "Default", leftStatus: "ok", rightStatus: "delay" },
          { name: "Swage", leftStatus: "ok", rightStatus: "ok" },
          { name: "CRB", leftStatus: "delay", rightStatus: "delay" },
          { name: "열처리", leftStatus: "ok", rightStatus: "delay" },
          { name: "P+PBO", leftStatus: "delay", rightStatus: "ok" },
          { name: "P+FE", leftStatus: "delay", rightStatus: "delay" },
          { name: "Adoptor", leftStatus: "ok", rightStatus: "ok" },
          { name: "Hub", leftStatus: "delay", rightStatus: "ok" },
          { name: "Final", leftStatus: "ok", rightStatus: "delay" },
        ],
        summary: {
          left: { done: 8, delay: 3 },
          right: { done: 8, delay: 3 }
        }
      };

    openPopup(data);
  });

})();

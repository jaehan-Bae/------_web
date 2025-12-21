(function () {
  const popup = document.getElementById("feederTablePopup");
  const tbody = document.getElementById("feederTableBody");

  if (!popup || !tbody) return;

  // 닫기
  popup.querySelector(".popup-close").onclick = () =>
    popup.classList.add("hidden");

  // SVG 원 클릭
  document.addEventListener("click", (e) => {
    const circle = e.target.closest("circle[data-code]");
    if (!circle) return;

    // === 더미 데이터 (나중에 실제 데이터 연결) ===
    const rows = [
      { name: "Default", status: "ok" },
      { name: "Swage", status: "ok" },
      { name: "CRB", status: "ok" },
      { name: "열처리", status: "delay" },
      { name: "P+PBO", status: "ok" },
      { name: "Adaptor", status: "delay" },
      { name: "Final", status: "ok" },
    ];

    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>
          <span class="name-dot ${r.status === "ok" ? "dot-ok" : "dot-delay"}"></span>
          ${r.name}
        </td>
        <td>2026-01-24</td>
        <td>2026-02-18</td>
        <td>2026-01-24</td>
        <td>2026-02-18</td>
      </tr>
    `).join("");

    popup.classList.remove("hidden");
  });
})();

// js/layout.js

document.addEventListener("DOMContentLoaded", () => {
  // 1) sidebar 로드
  fetch("./sidebar.html")
    .then((res) => res.text())
    .then((html) => {
      const sidebarEl = document.getElementById("sidebar");
      if (!sidebarEl) return;
      sidebarEl.innerHTML = html;

      // sidebar가 로드된 후에 active 처리
      setActiveMenu();
    });

  // 2) header 로드
  fetch("./header.html")
    .then((res) => res.text())
    .then((html) => {
      const headerEl = document.getElementById("header");
      if (!headerEl) return;
      headerEl.innerHTML = html;

      // 헤더가 DOM에 들어온 뒤에 타이틀 세팅
      setPageTitle();
    });
});

// 현재 페이지 기준으로 사이드바 active 클래스 붙이기
function setActiveMenu() {
  const path = window.location.pathname;
  const currentPage = path.split("/").pop() || "index.html";

  document.querySelectorAll("#sidebar .menu-item").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// 현재 페이지에 따라 상단 타이틀 바꾸기
function setPageTitle() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  // 페이지별 타이틀 매핑
  const titles = {
    "index.html": "전체 대시보드",
    "project.html": "프로젝트 진행현황",
    "feeder.html": "피더 파이프 제조 현황"
  };

  const titleText = titles[currentPage] || "전체 대시보드";

  const titleEl = document.querySelector(".page-title");
  if (titleEl) {
    titleEl.textContent = titleText;
  }
}
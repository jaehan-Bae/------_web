function getChartColors(name) {
  const upper = (name || "").toUpperCase();

  if (upper.includes("PICKERING")) {
    return { from: "#005BEA", to: "#00C6FB" }; // 파랑
  }

  return { from: "#F7971E", to: "#FFD200" };   // 주황
}

// 공정별 데일리 누적 실적(라인) 스타일
window.PROC_DAILY_LINE_STYLE = {
  pickering: { line: "#69DCF6", dot: "#0C77EA" },
  cernavoda: { line: "#FFC54E", dot: "#FF6002" },
};

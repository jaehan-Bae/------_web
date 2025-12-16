// js/feeder-weekly-config.js
// ======================================================
// 공정별 진행현황(Weekly) - 컨텍스트별 공정 포함 규칙 + 필터
// contextId 형식: "pickering-upper" | "pickering-middle" | "pickering-lower"
//                "cernavoda-upper" | "cernavoda-lower"
// ======================================================

window.PROC_CONTEXT_KEYS = {
  // Pickering
  "pickering-upper":  ["default","swage","bend","heat","ptop","pipe_pbo","pipe_fe","final"],
  "pickering-middle": ["default","swage","bend","ptop","final"],
  "pickering-lower":  ["default","swage","bend_crb","heat_crb","ptop","bend_lrb","heat_lrb","hub","final"],

  // Cernavoda
  "cernavoda-upper":  ["default","swage","bend","heat","ptop","pipe_pbo","pipe_fe","adaptor","final"],
  "cernavoda-lower":  ["default","swage","bend_crb","heat","ptop","pipe_pbo","bend_lrb","heat_lrb","hub","final"],
};

/**
 * contextId에 맞는 공정 row들을 "표시 순서대로" 반환
 * - 데이터 소스: window.procWeeklyByPlantDummy (dummy-data.js에서 세팅됨)
 * - 각 row는 uiLabel을 이미 갖고 있다고 가정 (1번에서 추가)
 */
window.getProcWeeklyRowsByContext = function getProcWeeklyRowsByContext(contextId) {
  const [plantId] = String(contextId).split("-"); // pickering | cernavoda
  const keys = window.PROC_CONTEXT_KEYS?.[contextId] || [];

  const src = window.procWeeklyByPlantDummy || [];
  const byKey = new Map(
    src.filter(r => r.plantId === plantId).map(r => [r.key, r])
  );

  return keys.map(k => byKey.get(k)).filter(Boolean);
};

// 공정별 데일리 누적 실적 (선 그래프용)
window.procDailyAccumDummy = [
  { key: "default", value: 14 },
  { key: "swage", value: 30 },
  { key: "bend", value: 9 },
  { key: "bend_crb", value: 9 },
  { key: "bend_lrb", value: 13 },
  { key: "heat", value: 23 },
  { key: "ptop", value: 13 },
  { key: "pipe_pbo", value: 17 },
  { key: "adaptor", value: 19 },
  { key: "final", value: 9 },
];

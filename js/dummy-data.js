// 전체 계획 대비 실적 (플랜트 단위 요약)
const feederSummaryDummy = [
  {
    id: "pickering-total",
    groupId: "pickering",
    groupName: "Pickering",
    produced: 1700, // 예시값
    total: 2220
  },
  {
    id: "cernavoda-total",
    groupId: "cernavoda",
    groupName: "Cernavoda",
    produced: 980,  // 예시값
    total: 1200
  }
];
// => 원형 그래프 / 전체 진도율 바 등에서 사용
// ex) produced / total * 100 으로 % 계산해서 쓰면 됨


// 더미 데이터 원형 그래프
// 피더 원형/바 공통 더미데이터
const feederDummy = [
  {
    id: "pickering-upper",
    groupId: "pickering",
    groupName: "Pickering",
    name: "Pickering#1",
    position: "Upper",
    produced: 540,
    total: 740
  },
  {
    id: "pickering-middle",
    groupId: "pickering",
    groupName: "Pickering",
    name: "Pickering#1",
    position: "Middle",
    produced: 420,
    total: 740
  },
  {
    id: "pickering-lower",
    groupId: "pickering",
    groupName: "Pickering",
    name: "Pickering#1",
    position: "Lower",
    produced: 740,
    total: 740
  },
  {
    id: "cernavoda-upper",
    groupId: "cernavoda",
    groupName: "Cernavoda",
    name: "Cernavoda#1",
    position: "Upper",
    produced: 380,
    total: 600
  },
  {
    id: "cernavoda-lower",
    groupId: "cernavoda",
    groupName: "Cernavoda",
    name: "Cernavoda#1",
    position: "Lower",
    produced: 600,
    total: 600
  }
];

// pickering-upper, pickering-middle, pickering-lower, Cernavoda-upper, Cernavoda-lower

// 더미 데이터 막대 그래프
// 플랜트 + 공정별 주간 계획/실적/잔여 더미 데이터
// 플랜트 + 공정별 주간 계획/실적/잔여 더미 데이터 (+ uiLabel 추가)
const procWeeklyByPlantDummy = [
  // ===== Pickering 공정별 =====
  {
    plantId: "pickering",
    plantName: "Pickering",
    key: "default",
    label: "Material Inspection & cutting (Default)",
    shortLabel: "Default",
    uiLabel: "Def",
    plan: 40,
    actual: 32,
    remaining: 8
  },
  {
    plantId: "pickering",
    plantName: "Pickering",
    key: "swage",
    label: "Swage",
    shortLabel: "Swage",
    uiLabel: "Swg",
    plan: 40,
    actual: 35,
    remaining: 5
  },
  {
    plantId: "pickering",
    plantName: "Pickering",
    key: "bend",
    label: "Bending",
    shortLabel: "Bend",
    uiLabel: "Bnd",
    plan: 40,
    actual: 37,
    remaining: 3
  },
  {
    plantId: "pickering",
    plantName: "Pickering",
    key: "bend_crb",
    label: "Bending (CRB)",
    shortLabel: "Bend(CRB)",
    uiLabel: "CRB",
    plan: 40,
    actual: 28,
    remaining: 12
  },
  {
    plantId: "pickering",
    plantName: "Pickering",
    key: "bend_lrb",
    label: "Bending (LRB)",
    shortLabel: "Bend(LRB)",
    uiLabel: "LRB",
    plan: 40,
    actual: 38,
    remaining: 2
  },
  {
    plantId: "pickering",
    plantName: "Pickering",
    key: "heat",
    label: "열처리",
    shortLabel: "열처리",
    uiLabel: "HT",
    plan: 40,
    actual: 31,
    remaining: 9
  },
  {
    plantId: "pickering",
    plantName: "Pickering",
    key: "heat_crb",
    label: "열처리 (CRB)",
    shortLabel: "HT(CRB)",
    uiLabel: "HT-C",
    plan: 40,
    actual: 30,
    remaining: 10
  },
  {
    plantId: "pickering",
    plantName: "Pickering",
    key: "heat_lrb",
    label: "열처리 (LRB)",
    shortLabel: "HT(LRB)",
    uiLabel: "HT-L",
    plan: 40,
    actual: 36,
    remaining: 4
  },
  {
    plantId: "pickering",
    plantName: "Pickering",
    key: "ptop",
    label: "Pipe to Pipe Welding",
    shortLabel: "PtoP",
    uiLabel: "P2P",
    plan: 40,
    actual: 29,
    remaining: 11
  },
  {
    plantId: "pickering",
    plantName: "Pickering",
    key: "pipe_pbo",
    label: "Pipe+PBO 용접",
    shortLabel: "P+PBO",
    uiLabel: "PBO",
    plan: 40,
    actual: 39,
    remaining: 1
  },
  {
    plantId: "pickering",
    plantName: "Pickering",
    key: "pipe_fe",
    label: "Pipe+FE 용접",
    shortLabel: "P+FE",
    uiLabel: "FE",
    plan: 40,
    actual: 34,
    remaining: 6
  },
  {
    plantId: "pickering",
    plantName: "Pickering",
    key: "hub",
    label: "Hub welding",
    shortLabel: "Hub",
    uiLabel: "Hub",
    plan: 40,
    actual: 33,
    remaining: 7
  },
  {
    plantId: "pickering",
    plantName: "Pickering",
    key: "final",
    label: "Final inspection",
    shortLabel: "Final",
    uiLabel: "Fin",
    plan: 40,
    actual: 32,
    remaining: 8
  },

  // ===== Cernavoda 공정별 =====
  {
    plantId: "cernavoda",
    plantName: "Cernavoda",
    key: "default",
    label: "Material Inspection & cutting (Default)",
    shortLabel: "Default",
    uiLabel: "Def",
    plan: 30,
    actual: 22,
    remaining: 8
  },
  {
    plantId: "cernavoda",
    plantName: "Cernavoda",
    key: "swage",
    label: "Swage",
    shortLabel: "Swage",
    uiLabel: "Swg",
    plan: 30,
    actual: 24,
    remaining: 6
  },
  {
    plantId: "cernavoda",
    plantName: "Cernavoda",
    key: "bend",
    label: "Bending",
    shortLabel: "Bend",
    uiLabel: "Bnd",
    plan: 30,
    actual: 27,
    remaining: 3
  },
  {
    plantId: "cernavoda",
    plantName: "Cernavoda",
    key: "bend_crb",
    label: "Bending (CRB)",
    shortLabel: "Bend(CRB)",
    uiLabel: "CRB",
    plan: 30,
    actual: 20,
    remaining: 10
  },
  {
    plantId: "cernavoda",
    plantName: "Cernavoda",
    key: "bend_lrb",
    label: "Bending (LRB)",
    shortLabel: "Bend(LRB)",
    uiLabel: "LRB",
    plan: 30,
    actual: 28,
    remaining: 2
  },
  {
    plantId: "cernavoda",
    plantName: "Cernavoda",
    key: "heat",
    label: "열처리",
    shortLabel: "열처리",
    uiLabel: "HT",
    plan: 30,
    actual: 21,
    remaining: 9
  },
  {
    plantId: "cernavoda",
    plantName: "Cernavoda",
    key: "heat_lrb",
    label: "열처리 (LRB)",
    shortLabel: "HT(LRB)",
    uiLabel: "HT-L",
    plan: 30,
    actual: 26,
    remaining: 4
  },
  {
    plantId: "cernavoda",
    plantName: "Cernavoda",
    key: "ptop",
    label: "Pipe to Pipe Welding",
    shortLabel: "PtoP",
    uiLabel: "P2P",
    plan: 30,
    actual: 23,
    remaining: 7
  },
  {
    plantId: "cernavoda",
    plantName: "Cernavoda",
    key: "pipe_pbo",
    label: "Pipe+PBO 용접",
    shortLabel: "P+PBO",
    uiLabel: "PBO",
    plan: 30,
    actual: 29,
    remaining: 1
  },
  {
    plantId: "cernavoda",
    plantName: "Cernavoda",
    key: "pipe_fe",
    label: "Pipe+FE 용접",
    shortLabel: "P+FE",
    uiLabel: "FE",
    plan: 30,
    actual: 25,
    remaining: 5
  },
  {
    plantId: "cernavoda",
    plantName: "Cernavoda",
    key: "hub",
    label: "Hub welding",
    shortLabel: "Hub",
    uiLabel: "Hub",
    plan: 30,
    actual: 24,
    remaining: 6
  },
  {
    plantId: "cernavoda",
    plantName: "Cernavoda",
    key: "adaptor",
    label: "Adaptor",
    shortLabel: "Adaptor",
    uiLabel: "Adp",
    plan: 30,
    actual: 27,
    remaining: 3
  },
  {
    plantId: "cernavoda",
    plantName: "Cernavoda",
    key: "final",
    label: "Final inspection",
    shortLabel: "Final",
    uiLabel: "Fin",
    plan: 30,
    actual: 23,
    remaining: 7
  }
];

// feeder-page.js에서 쓰는 형태로 맞추기 위해 전역에도 걸어두는 걸 추천
window.procWeeklyByPlantDummy = procWeeklyByPlantDummy;


// 프로젝트 진행현황 도넛 카드용(6개 고정 공정) 더미 데이터
// plantId 별로 Swage/Bending/Welding/Attach Welding/Dimension Ins/Final Ins 제공
const procDonutByPlantDummy = [
  { plantId: "pickering", key: "swage",           title: "Swage",          plan: 740, actual: 340 },
  { plantId: "pickering", key: "bending",         title: "Bending",        plan: 740, actual: 290 },
  { plantId: "pickering", key: "welding",         title: "Welding",        plan: 740, actual: 420 },
  { plantId: "pickering", key: "attach_welding",  title: "Attach Welding", plan: 740, actual: 670 },
  { plantId: "pickering", key: "dimension_ins",   title: "Dimension.", plan: 740, actual: 210 },
  { plantId: "pickering", key: "final_ins",       title: "Final.",     plan: 740, actual: 540 },
];
// 체르보나다
procDonutByPlantDummy.push(
  { plantId: "cernavoda", key: "swage",          title: "Swage",          plan: 600, actual: 280 },
  { plantId: "cernavoda", key: "bending",        title: "Bending",        plan: 600, actual: 310 },
  { plantId: "cernavoda", key: "welding",        title: "Welding",        plan: 600, actual: 360 },
  { plantId: "cernavoda", key: "attach_welding", title: "Attach Welding", plan: 600, actual: 520 },
  { plantId: "cernavoda", key: "dimension_ins",  title: "Dimension Ins.", plan: 600, actual: 190 },
  { plantId: "cernavoda", key: "final_ins",      title: "Final Ins.",     plan: 600, actual: 380 },
)




// ================= feeder page dummy
// 예시: contextId 별로 hole 상태를 들고 있는 더미
// key: holes.json의 id/name/key 중 하나와 일치해야 함
window.holeStatusByContext = {
  "pickering-upper": {
    "H01": "ok",
    "H02": "warn",
    "H03": "delay",
  },
  "pickering-middle": {},
  "pickering-lower": {},
  "cernavoda-upper": {},
  "cernavoda-lower": {},
};

window.feederSummaryDummyByContext = {
  "pickering-upper": {
    title: "PICKERING#1",
    subtitle: "UPPER",
    produced: 320,
    total: 1000,
    bars: {
      upper: 80,   // % or 0.8 둘 다 가능
      middle: 45,
      lower: 60
    }
  },

  "pickering-middle": {
    title: "PICKERING#1",
    subtitle: "MIDDLE",
    produced: 210,
    total: 1000,
    bars: {
      upper: 70,
      middle: 60,
      lower: 30
    }
  },

  "pickering-lower": {
    title: "PICKERING#1",
    subtitle: "LOWER",
    produced: 150,
    total: 1000,
    bars: {
      upper: 60,
      middle: 40,
      lower: 50
    }
  },

  "cernavoda-upper": {
    title: "CERNAVODA",
    subtitle: "UPPER",
    produced: 180,
    total: 800,
    bars: {
      upper: 65,
      lower: 10
    }
  },

  "cernavoda-lower": {
    title: "CERNAVODA",
    subtitle: "LOWER",
    produced: 120,
    total: 800,
    bars: {
      upper: 50,
      lower: 40
    }
  }
};


window.feederSummaryDummy = feederSummaryDummy;
window.procDonutByPlantDummy = procDonutByPlantDummy;
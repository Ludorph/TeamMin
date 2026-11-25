// 사주 계산 검증용 사례. 기대값은 외부 만세력 앱이 아니라
// (1) 일진 순환 공식(1900-01-01 = 갑술일), (2) 오시·자시 등 시주 규칙(오서둔),
// (3) 입춘 절입 시각(한국천문연구원 발표 값으로 알려진 시각), (4) 널리 알려진 날짜의 사주로 정했다.
const { calculateSaju } = require("../services/sajuCalc");

const PILLAR_CASES = [
  {
    id: "P-01", title: "2000-01-01 12:00 (양력)", input: { year: 2000, month: 1, day: 1, hour: 12 },
    expected: { year: "기묘", month: "병자", day: "무오", hour: "무오" },
    basis: "입춘 이전이라 전년(기묘) 기준, 소한 이전이라 자월, 2000-01-01은 무오일로 널리 알려짐",
  },
  {
    id: "P-02", title: "1900-01-01 12:00 (양력)", input: { year: 1900, month: 1, day: 1, hour: 12 },
    expected: { day: "갑술" },
    basis: "일진 계산의 기준일(1900-01-01 = 갑술일)",
  },
  {
    id: "P-03", title: "2024-02-04 17:00 (입춘 17:27 직전)", input: { year: 2024, month: 2, day: 4, hour: 17, minute: 0 },
    expected: { year: "계묘", month: "을축", day: "무술" },
    basis: "입춘 이전이라 전년(계묘)·축월, 설날(2024-02-10)이 갑진일이므로 6일 전은 무술일",
  },
  {
    id: "P-04", title: "2024-02-04 18:00 (입춘 직후)", input: { year: 2024, month: 2, day: 4, hour: 18, minute: 0 },
    expected: { year: "갑진", month: "병인", day: "무술" },
    basis: "입춘(17:27) 이후라 연주·월주가 바뀜",
  },
  {
    id: "P-05", title: "1990-05-15 14:30 (양력)", input: { year: 1990, month: 5, day: 15, hour: 14, minute: 30 },
    expected: { year: "경오", month: "신사", day: "경진", hour: "계미" },
    basis: "경일 미시(13~15시)는 계미(오서둔), 입하(5/6) 이후 사월",
  },
  {
    id: "P-06", title: "음력 1990-04-21 14:30", input: { year: 1990, month: 4, day: 21, hour: 14, minute: 30, calendar: "lunar" },
    expected: { year: "경오", month: "신사", day: "경진", hour: "계미" },
    basis: "음력 1990-04-21은 양력 1990-05-15이므로 P-05와 같아야 함",
  },
  {
    id: "P-07", title: "2000-02-04 21:00 (입춘 21:40 직전)", input: { year: 2000, month: 2, day: 4, hour: 21, minute: 0 },
    expected: { year: "기묘" },
    basis: "2000년 입춘 21:40 이전이라 전년(기묘) 기준",
  },
  {
    id: "P-08", title: "2000-02-04 22:00 (입춘 직후)", input: { year: 2000, month: 2, day: 4, hour: 22, minute: 0 },
    expected: { year: "경진" },
    basis: "2000년 입춘 21:40 이후라 경진년",
  },
  {
    id: "P-09", title: "2000-01-01 23:30 (자시 경계)", input: { year: 2000, month: 1, day: 1, hour: 23, minute: 30 },
    expected: { day: "무오", hour: "임자" },
    basis: "현재 채택 기준: 23시대는 일주를 바꾸지 않고(야자시) 당일 무일의 자시(임자)로 계산. 만세력마다 기준이 다름",
  },
];

// 입춘 절입 시각(KST). 알려진 발표 값과 라이브러리 값을 ±2분 안에서 비교한다.
const IPCHUN_CASES = [
  { year: 1990, kst: "1990-02-04T11:14:00+09:00" },
  { year: 2000, kst: "2000-02-04T21:40:00+09:00" },
  { year: 2023, kst: "2023-02-04T11:43:00+09:00" },
  { year: 2024, kst: "2024-02-04T17:27:00+09:00" },
  { year: 2025, kst: "2025-02-03T23:10:00+09:00" },
  { year: 2026, kst: "2026-02-04T05:02:00+09:00" },
];

const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];

// 독립 계산: 1900-01-01(갑술일)부터의 일수로 일주, 오서둔 규칙으로 시주를 구한다.
function independentDay(y, m, d) {
  const days = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1900, 0, 1)) / 86400000);
  const idx = (((days + 10) % 60) + 60) % 60;
  return { text: STEMS[idx % 10] + BRANCHES[idx % 12], stemIdx: idx % 10 };
}
function independentHour(dayStemIdx, hour) {
  const branchIdx = Math.floor(((hour + 1) % 24) / 2); // 23~01시=자(0), 01~03시=축(1) ...
  const startStem = (dayStemIdx % 5) * 2; // 갑·기일 자시=갑(0), 을·경=병(2), ...
  return STEMS[(startStem + branchIdx) % 10] + BRANCHES[branchIdx];
}

function runPillars(input) {
  const r = calculateSaju(input);
  return {
    year: r.pillars.year.text,
    month: r.pillars.month.text,
    day: r.pillars.day.text,
    hour: r.pillars.hour ? r.pillars.hour.text : null,
  };
}

module.exports = { PILLAR_CASES, IPCHUN_CASES, independentDay, independentHour, runPillars, STEMS, BRANCHES };

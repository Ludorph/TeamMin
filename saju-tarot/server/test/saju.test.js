// 실행: npm test  (Node 내장 테스트 러너 사용, 별도 설치 없음)
const test = require("node:test");
const assert = require("node:assert/strict");
const { getSolarTermsOfYear, getTenGod, lunarToSolar } = require("manseryeok");
const { calculateSaju } = require("../services/sajuCalc");
const { yearlyFortune } = require("../services/periods");
const { computeMatch } = require("../services/match");
const { PILLAR_CASES, IPCHUN_CASES, independentDay, independentHour, runPillars } = require("./cases");

for (const c of PILLAR_CASES) {
  test(`${c.id} ${c.title}`, () => {
    const actual = runPillars(c.input);
    for (const [k, v] of Object.entries(c.expected)) assert.equal(actual[k], v, `${k}주`);
  });
}

test("일주·시주: 독립 공식과 라이브러리가 1900~2050년 샘플 전체에서 일치", () => {
  let n = 0;
  for (let y = 1900; y <= 2050; y += 1) {
    for (const [m, d] of [[1, 1], [3, 17], [6, 30], [9, 9], [12, 25]]) {
      for (const hour of [0, 5, 12, 18, 22]) {
        const ref = independentDay(y, m, d);
        const r = calculateSaju({ year: y, month: m, day: d, hour });
        assert.equal(r.pillars.day.text, ref.text, `${y}-${m}-${d} 일주`);
        assert.equal(r.pillars.hour.text, independentHour(ref.stemIdx, hour), `${y}-${m}-${d} ${hour}시 시주`);
        n += 1;
      }
    }
  }
  assert.equal(n, 151 * 5 * 5);
});

test("입춘 절입 시각이 알려진 발표 값과 ±2분 이내로 일치", () => {
  for (const c of IPCHUN_CASES) {
    const ipchun = getSolarTermsOfYear(c.year).find((t) => t.index === 2);
    const diffMin = Math.abs(ipchun.date.getTime() - new Date(c.kst).getTime()) / 60000;
    assert.ok(diffMin <= 2, `${c.year}년 입춘 차이 ${diffMin.toFixed(1)}분`);
  }
});

test("음력 윤달 환산: 2023년 윤2월 1일 = 양력 2023-03-22", () => {
  const s = lunarToSolar(2023, 2, 1, true);
  assert.deepEqual([s.year, s.month, s.day], [2023, 3, 22]);
});

test("십신: 갑목 일간 기준 10개 천간의 관계", () => {
  const expected = ["비견", "겁재", "식신", "상관", "편재", "정재", "편관", "정관", "편인", "정인"];
  ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"].forEach((s, i) => {
    assert.equal(getTenGod("갑", s), expected[i], `갑 → ${s}`);
  });
});

test("대운 방향: 양년 남자 순행, 양년 여자 역행", () => {
  const base = { year: 1990, month: 5, day: 15, hour: 14 };
  assert.equal(calculateSaju({ ...base, gender: "male" }).luck.forward, true);
  assert.equal(calculateSaju({ ...base, gender: "female" }).luck.forward, false);
});

test("잘못된 입력은 400 오류로 거절", () => {
  assert.throws(() => calculateSaju({ year: 2023, month: 2, day: 30 }), (e) => e.status === 400);
  assert.throws(() => calculateSaju({ year: 1800, month: 1, day: 1 }), (e) => e.status === 400);
  assert.throws(() => calculateSaju({ year: 1990, month: 5, day: 15, hour: 25 }), (e) => e.status === 400);
});

test("세운: 입춘 이전에는 전년도를 올해로 본다", () => {
  assert.equal(yearlyFortune("경", new Date("2026-02-04T04:00:00+09:00"))[0].year, 2025); // 입춘 05:02 이전
  assert.equal(yearlyFortune("경", new Date("2026-02-04T06:00:00+09:00"))[0].year, 2026);
  assert.equal(yearlyFortune("경", new Date("2027-01-15T12:00:00+09:00"))[0].year, 2026);
});

// 궁합 규칙 확인용: 필요한 값만 가진 사람 객체
const person = (stem, element, branch, elements) => ({
  dayMaster: stem,
  pillars: { day: { element: { stem: element }, branch } },
  elements,
});

test("궁합: 천간합·육합·충 판정", () => {
  const a = person("갑", "목", "자", { 목: 2, 수: 1 });
  const hap = computeMatch(a, person("기", "토", "축", { 토: 2, 화: 1 }));
  assert.equal(hap.ilgan.key, "hap"); // 갑기합
  assert.equal(hap.ilji.key, "yukhap"); // 자축합
  const chung = computeMatch(a, person("병", "화", "오", { 화: 2, 목: 1 }));
  assert.equal(chung.ilji.key, "chung"); // 자오충
  assert.equal(chung.ilgan.key, "a_gen_b"); // 목생화
});

test("궁합: 점수는 40~100 범위", () => {
  const r = computeMatch(person("경", "금", "진", { 금: 3, 토: 2 }), person("계", "수", "미", { 수: 2, 토: 2 }));
  assert.ok(r.score >= 40 && r.score <= 100, `score=${r.score}`);
});

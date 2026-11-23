// 오늘의 운세: 오늘의 일진(천간·지지)과 내 일간의 관계(십신)로 문구를 고른다.
// 날짜는 한국 표준시 기준이고, 일이 바뀌는 시각 문제를 피하려고 정오로 계산한다.
const { calculateFourPillars, getTenGod } = require("manseryeok");

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function todayFortune(dayMaster, now = new Date()) {
  const k = new Date(now.getTime() + KST_OFFSET_MS);
  const year = k.getUTCFullYear();
  const month = k.getUTCMonth() + 1;
  const day = k.getUTCDate();
  const r = calculateFourPillars({ year, month, day, hour: 12, minute: 0 });
  return {
    date: { year, month, day, weekday: WEEKDAYS[k.getUTCDay()] },
    ganji: r.dayString,
    hanja: r.dayHanja,
    tenGod: getTenGod(dayMaster, r.day.heavenlyStem),
  };
}

module.exports = { todayFortune };

// 월간운세: 앞으로 12개월의 월주 천간이 내 일간과 어떤 관계(십신)인지로 문구를 고른다.
// 월 중간(15일 정오)을 기준으로 월주를 구해 절기 경계에 걸리지 않게 한다.
const { calculateFourPillars, getTenGod } = require("manseryeok");

function monthlyFortune(dayMaster, now = new Date(), count = 12) {
  const list = [];
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  for (let i = 0; i < count; i++) {
    try {
      const r = calculateFourPillars({ year, month, day: 15, hour: 12, minute: 0 });
      list.push({
        year,
        month,
        ganji: r.monthString,
        hanja: r.monthHanja,
        tenGod: getTenGod(dayMaster, r.month.heavenlyStem),
        isCurrent: i === 0,
      });
    } catch {
      break; // 라이브러리 지원 범위를 벗어나면 거기서 멈춘다
    }
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return list;
}

module.exports = { monthlyFortune };

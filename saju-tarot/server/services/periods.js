// 세운(올해부터 10년): 해당 연도 간지의 천간·지지가 내 일간과 어떤 관계(십신)인지 계산한다.
// 사주에서 해가 바뀌는 기준은 1월 1일이 아니라 입춘이므로, 입춘 이전에는 전년도를 '올해'로 본다.
const {
  getTenGod, getBranchTenGod, getSolarTermsOfYear,
  HEAVENLY_STEMS, HEAVENLY_STEMS_HANJA, EARTHLY_BRANCHES, EARTHLY_BRANCHES_HANJA,
} = require("manseryeok");

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const mod = (n, m) => ((n % m) + m) % m;

// 입춘(절기 인덱스 2)을 기준으로 현재의 사주 연도를 구한다.
function sajuYearOf(now) {
  const calendarYear = new Date(now.getTime() + KST_OFFSET_MS).getUTCFullYear();
  try {
    const ipchun = getSolarTermsOfYear(calendarYear).find((t) => t.index === 2);
    if (ipchun && now.getTime() < ipchun.date.getTime()) return calendarYear - 1;
  } catch {
    /* 지원 범위 밖이면 양력 연도를 그대로 쓴다 */
  }
  return calendarYear;
}

function yearlyFortune(dayMaster, now = new Date(), count = 10) {
  const start = sajuYearOf(now);
  return Array.from({ length: count }, (_, i) => {
    const year = start + i;
    const stem = HEAVENLY_STEMS[mod(year - 4, 10)];
    const branch = EARTHLY_BRANCHES[mod(year - 4, 12)];
    return {
      year,
      text: stem + branch,
      hanja: HEAVENLY_STEMS_HANJA[mod(year - 4, 10)] + EARTHLY_BRANCHES_HANJA[mod(year - 4, 12)],
      stemTenGod: getTenGod(dayMaster, stem),
      branchTenGod: getBranchTenGod(dayMaster, branch),
      isCurrent: i === 0,
    };
  });
}

module.exports = { yearlyFortune, sajuYearOf };

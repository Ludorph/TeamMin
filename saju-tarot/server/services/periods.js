// 세운(올해부터 10년): 해당 연도 간지의 천간·지지가 내 일간과 어떤 관계(십신)인지 계산한다.
const {
  getTenGod, getBranchTenGod, HEAVENLY_STEMS, HEAVENLY_STEMS_HANJA, EARTHLY_BRANCHES, EARTHLY_BRANCHES_HANJA,
} = require("manseryeok");

const mod = (n, m) => ((n % m) + m) % m;

function yearlyFortune(dayMaster, now = new Date(), count = 10) {
  const start = now.getFullYear();
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

module.exports = { yearlyFortune };

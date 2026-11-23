// 궁합 계산(규칙 기반): 두 사람의 사주 결과에서 일간 관계, 일지 관계, 오행 보완, 십신 관계를 구한다.
// 점수는 오락용 참고 지표이며 각 항목 최대 25점, 합계 100점이다.
const { getTenGod } = require("manseryeok");

const ELEMENTS = ["목", "화", "토", "금", "수"];
const GEN = { 목: "화", 화: "토", 토: "금", 금: "수", 수: "목" }; // 상생
const CTL = { 목: "토", 토: "수", 수: "화", 화: "금", 금: "목" }; // 상극
const STEM_HAP = [["갑", "기"], ["을", "경"], ["병", "신"], ["정", "임"], ["무", "계"]];
const YUKHAP = [["자", "축"], ["인", "해"], ["묘", "술"], ["진", "유"], ["사", "신"], ["오", "미"]];
const CHUNG = [["자", "오"], ["축", "미"], ["인", "신"], ["묘", "유"], ["진", "술"], ["사", "해"]];
const SAMHAP = [["신", "자", "진"], ["해", "묘", "미"], ["인", "오", "술"], ["사", "유", "축"]];

const pairIn = (list, x, y) => list.some(([p, q]) => (p === x && q === y) || (p === y && q === x));
const count = (person, el) => person.elements[el] || 0;

function ilganRelation(a, b) {
  const ea = a.pillars.day.element.stem;
  const eb = b.pillars.day.element.stem;
  if (pairIn(STEM_HAP, a.dayMaster, b.dayMaster)) return { key: "hap", points: 25, label: "일간 합" };
  if (ea === eb) return { key: "same", points: 15, label: "같은 오행" };
  if (GEN[ea] === eb) return { key: "a_gen_b", points: 20, label: "내가 상대를 생함" };
  if (GEN[eb] === ea) return { key: "b_gen_a", points: 20, label: "상대가 나를 생함" };
  if (CTL[ea] === eb) return { key: "a_ctl_b", points: 10, label: "내가 상대를 극함" };
  return { key: "b_ctl_a", points: 10, label: "상대가 나를 극함" };
}

function iljiRelation(a, b) {
  const x = a.pillars.day.branch;
  const y = b.pillars.day.branch;
  if (pairIn(YUKHAP, x, y)) return { key: "yukhap", points: 25, label: "육합" };
  if (pairIn(CHUNG, x, y)) return { key: "chung", points: 8, label: "충" };
  if (x === y) return { key: "same", points: 15, label: "같은 일지" };
  if (SAMHAP.some((g) => g.includes(x) && g.includes(y))) return { key: "samhap", points: 20, label: "삼합(일부)" };
  return { key: "none", points: 15, label: "특별한 관계 없음" };
}

function balance(a, b) {
  const lackA = ELEMENTS.filter((el) => count(a, el) === 0);
  const lackB = ELEMENTS.filter((el) => count(b, el) === 0);
  const filledForMe = lackA.filter((el) => count(b, el) >= 1);
  const filledForPartner = lackB.filter((el) => count(a, el) >= 1);
  const total = filledForMe.length + filledForPartner.length;
  const key = total >= 2 ? "high" : total === 1 ? "mid" : "low";
  const points = { high: 25, mid: 17, low: 10 }[key];
  return { key, points, filledForMe, filledForPartner };
}

const GOOD = ["식신", "정재", "정관", "정인"];
const tenGodPoints = (g) => (GOOD.includes(g) ? 24 : g === "비견" ? 18 : g === "편관" ? 14 : g === "겁재" ? 12 : 17);

function computeMatch(a, b) {
  const ilgan = ilganRelation(a, b);
  const ilji = iljiRelation(a, b);
  const bal = balance(a, b);
  const toPartner = getTenGod(a.dayMaster, b.dayMaster);
  const toMe = getTenGod(b.dayMaster, a.dayMaster);
  const tenPoints = Math.round((tenGodPoints(toPartner) + tenGodPoints(toMe)) / 2);
  const score = ilgan.points + ilji.points + bal.points + tenPoints;
  const band = score >= 85 ? "high" : score >= 70 ? "good" : score >= 55 ? "mid" : "low";
  const rating = (p) => Math.max(1, Math.min(5, Math.round(p / 5)));
  return {
    score,
    band,
    ilgan: { ...ilgan, rating: rating(ilgan.points) },
    ilji: { ...ilji, rating: rating(ilji.points) },
    balance: { ...bal, rating: rating(bal.points) },
    tengod: { toPartner, toMe, points: tenPoints, rating: rating(tenPoints) },
  };
}

module.exports = { computeMatch };

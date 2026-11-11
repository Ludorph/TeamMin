// 사주 계산: 오픈소스 manseryeok(MIT) 라이브러리 사용.
// 주의: 정확도 검증 전 상태. 입춘 전후, 자시(23~01시) 경계 날짜를 알려진 만세력과 비교할 것.
const {
  calculateFourPillars, lunarToSolar, solarToLunar, getSolarTermsOfYear,
  getTenGod, getEarthlyBranchElement, getHeavenlyStemElement,
  HEAVENLY_STEMS, HEAVENLY_STEMS_HANJA, EARTHLY_BRANCHES, EARTHLY_BRANCHES_HANJA,
} = require("manseryeok");

const MIN_YEAR = 1900;
const MAX_YEAR = 2050;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const ELEMENT_LIST = ["목", "화", "토", "금", "수"];
const HOUR_RANGE = {
  자: "23~01시", 축: "01~03시", 인: "03~05시", 묘: "05~07시", 진: "07~09시", 사: "09~11시",
  오: "11~13시", 미: "13~15시", 신: "15~17시", 유: "17~19시", 술: "19~21시", 해: "21~23시",
};

function toInt(value) {
  const n = Number(value);
  return Number.isInteger(n) ? n : NaN;
}

function validate(input) {
  const year = toInt(input.year);
  const month = toInt(input.month);
  const day = toInt(input.day);
  const hasHour = input.hour !== undefined && input.hour !== null && input.hour !== "";
  const hour = hasHour ? toInt(input.hour) : 12;
  const hasMinute = input.minute !== undefined && input.minute !== null && input.minute !== "";
  const minute = hasHour && hasMinute ? toInt(input.minute) : 0;

  const err = (message) => Object.assign(new Error(message), { status: 400 });
  if (Number.isNaN(year) || year < MIN_YEAR || year > MAX_YEAR) throw err(`연도는 ${MIN_YEAR}~${MAX_YEAR} 사이여야 합니다.`);
  if (Number.isNaN(month) || month < 1 || month > 12) throw err("월은 1~12 사이여야 합니다.");
  if (Number.isNaN(day) || day < 1 || day > 31) throw err("일은 1~31 사이여야 합니다.");
  if (Number.isNaN(hour) || hour < 0 || hour > 23) throw err("시는 0~23 사이여야 합니다.");
  if (Number.isNaN(minute) || minute < 0 || minute > 59) throw err("분은 0~59 사이여야 합니다.");

  const isLunar = input.calendar === "lunar";
  if (!isLunar) {
    const d = new Date(Date.UTC(year, month - 1, day));
    if (d.getUTCMonth() !== month - 1) throw err("존재하지 않는 날짜입니다.");
  }
  const gender = input.gender === "male" || input.gender === "female" ? input.gender : undefined;
  return { year, month, day, hour, minute, hasHour, isLunar, isLeapMonth: !!input.isLeapMonth, gender };
}

// 절입 시각을 한국 표준시 "5월 6일 03:35" 형식으로 표기한다.
const kst = (date) => {
  const d = new Date(new Date(date).getTime() + KST_OFFSET_MS);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
};

const hanjaOf = (stem, branch) =>
  HEAVENLY_STEMS_HANJA[HEAVENLY_STEMS.indexOf(stem)] + EARTHLY_BRANCHES_HANJA[EARTHLY_BRANCHES.indexOf(branch)];

// 입력을 양력/음력으로 모두 환산한다.
function resolveDates(v) {
  let solar;
  let lunar = null;
  if (v.isLunar) {
    solar = lunarToSolar(v.year, v.month, v.day, v.isLeapMonth);
    lunar = { year: v.year, month: v.month, day: v.day, isLeapMonth: v.isLeapMonth };
  } else {
    solar = { year: v.year, month: v.month, day: v.day };
    try {
      lunar = solarToLunar(v.year, v.month, v.day);
    } catch {
      lunar = null;
    }
  }
  return { solar, lunar };
}

// 출생 순간 앞뒤의 절(節) — 월주가 바뀌는 기준 — 과 입춘(연주 기준)을 찾는다.
function findTerms(solar, v) {
  const instant = Date.UTC(solar.year, solar.month - 1, solar.day, v.hour, v.minute) - KST_OFFSET_MS;
  const terms = [];
  for (const y of [solar.year - 1, solar.year, solar.year + 1]) {
    try {
      terms.push(...getSolarTermsOfYear(y));
    } catch {
      /* 지원 범위 밖이면 건너뜀 */
    }
  }
  const jeol = terms.filter((t) => t.index % 2 === 0).sort((a, b) => a.date - b.date);
  const prev = [...jeol].reverse().find((t) => t.date.getTime() <= instant);
  const next = jeol.find((t) => t.date.getTime() > instant);
  const ipchun = terms.find((t) => t.index === 2 && t.date.getUTCFullYear() === solar.year);
  const sajuYear = ipchun && instant < ipchun.date.getTime() ? solar.year - 1 : solar.year;
  return { prev, next, ipchun, sajuYear };
}

// 풀이 과정: 결과가 어떤 순서로 나왔는지 단계별로 설명한다.
function buildProcess(v, r, dates, terms, counts) {
  const { solar, lunar } = dates;
  const timeText = v.hasHour ? `${v.hour}시 ${String(v.minute).padStart(2, "0")}분` : "시간 모름";
  const steps = [];
  const inputText = v.isLunar
    ? `음력 ${v.year}년 ${v.isLeapMonth ? "윤" : ""}${v.month}월 ${v.day}일 ${timeText}`
    : `양력 ${v.year}년 ${v.month}월 ${v.day}일 ${timeText}`;
  steps.push({ title: "입력 확인", detail: inputText });

  let convText = "양력 날짜를 그대로 사용합니다.";
  if (v.isLunar) {
    convText = `음력을 양력 ${solar.year}년 ${solar.month}월 ${solar.day}일로 환산해 계산합니다.`;
  } else if (lunar) {
    convText = `참고: 음력으로는 ${lunar.year}년 ${lunar.isLeapMonth ? "윤" : ""}${lunar.month}월 ${lunar.day}일입니다. 사주 계산은 양력 날짜와 절기를 기준으로 합니다.`;
  }
  steps.push({ title: "양력·음력 환산", detail: convText });

  const ipchunText = terms.ipchun ? `입춘(${kst(terms.ipchun.date)})` : "입춘";
  steps.push({
    title: "년주(태어난 해)",
    detail: `해가 바뀌는 기준은 1월 1일이 아니라 ${ipchunText}입니다. ${terms.sajuYear === solar.year ? "입춘 이후" : "입춘 이전"} 출생이라 ${terms.sajuYear}년 기준으로 ${r.yearString}년(${r.yearHanja})이 됩니다.`,
  });

  const prevText = terms.prev ? `${terms.prev.name}(${kst(terms.prev.date)})` : "이전 절기";
  const nextText = terms.next ? `${terms.next.name}(${kst(terms.next.date)})` : "다음 절기";
  steps.push({
    title: "월주(태어난 달)",
    detail: `달이 바뀌는 기준은 매월 1일이 아니라 절기입니다. ${prevText} 이후부터 ${nextText} 이전에 태어나 ${r.monthString}월(${r.monthHanja})이 됩니다.`,
  });

  steps.push({
    title: "일주(태어난 날)",
    detail: `만세력의 일진(60갑자가 날마다 이어지는 순서)으로 ${r.dayString}일(${r.dayHanja})입니다. 이 날의 천간 '${r.day.heavenlyStem}'이 나를 나타내는 일간입니다.`,
  });

  steps.push({
    title: "시주(태어난 시간)",
    detail: v.hasHour
      ? `${timeText}은 ${r.hour.earthlyBranch}시(일반적으로 ${HOUR_RANGE[r.hour.earthlyBranch]})입니다. 일간 '${r.day.heavenlyStem}' 기준으로 ${r.hourString}시(${r.hourHanja})가 됩니다.`
      : "태어난 시간을 입력하지 않아 시주는 계산하지 않았습니다(6글자로 풀이).",
  });

  const countText = ELEMENT_LIST.map((el) => `${el} ${counts[el]}`).join(" · ");
  steps.push({
    title: "오행 집계",
    detail: `${v.hasHour ? "여덟" : "여섯"} 글자(천간·지지)를 오행으로 나눠 셉니다. ${countText}`,
  });

  steps.push({
    title: "풀이 연결",
    detail: `일간 '${r.day.heavenlyStem}'(${getHeavenlyStemElement(r.day.heavenlyStem)})으로 성향을, 가장 많은 오행과 없는 오행으로 강점과 보완점을, 일지(${r.day.earthlyBranch})로 가까운 관계에서의 모습을 풀이합니다. 분야별 운은 일간 기준, 월간·연간 운은 해당 기간의 천간과 일간의 관계(십신)로 고릅니다.`,
  });
  return steps;
}

// 반환: { pillars, elements, dayMaster, tenGods, voidBranches, luck, birth, process }
function calculateSaju(input) {
  const v = validate(input || {});
  let r;
  try {
    r = calculateFourPillars({
      year: v.year, month: v.month, day: v.day, hour: v.hour, minute: v.minute,
      isLunar: v.isLunar, isLeapMonth: v.isLeapMonth, gender: v.gender,
    });
  } catch (e) {
    throw Object.assign(new Error("사주를 계산할 수 없는 날짜입니다. 입력을 확인하세요."), { status: 400 });
  }

  const pillar = (str, hanja, el, stem, branch) => ({ text: str, hanja, stem, branch, element: el });
  const pillars = {
    year: pillar(r.yearString, r.yearHanja, r.yearElement, r.year.heavenlyStem, r.year.earthlyBranch),
    month: pillar(r.monthString, r.monthHanja, r.monthElement, r.month.heavenlyStem, r.month.earthlyBranch),
    day: pillar(r.dayString, r.dayHanja, r.dayElement, r.day.heavenlyStem, r.day.earthlyBranch),
    hour: v.hasHour ? pillar(r.hourString, r.hourHanja, r.hourElement, r.hour.heavenlyStem, r.hour.earthlyBranch) : null,
  };

  const elements = {};
  for (const p of Object.values(pillars)) {
    if (!p) continue;
    for (const el of [p.element.stem, p.element.branch]) elements[el] = (elements[el] || 0) + 1;
  }
  const counts = Object.fromEntries(ELEMENT_LIST.map((el) => [el, elements[el] || 0]));

  const dates = resolveDates(v);
  const terms = findTerms(dates.solar, v);
  const dayMaster = pillars.day.stem;

  const tenGods = {
    year: r.tenGods.year,
    month: r.tenGods.month,
    day: r.tenGods.day,
    hour: v.hasHour ? r.tenGods.hour : null,
  };

  const luck = r.luckPillars
    ? {
        forward: r.luckPillars.forward,
        startAge: r.luckPillars.startAge,
        pillars: r.luckPillars.pillars.map((p) => ({
          age: p.age,
          text: p.korean,
          hanja: hanjaOf(p.pillar.heavenlyStem, p.pillar.earthlyBranch),
          stem: p.pillar.heavenlyStem,
          branch: p.pillar.earthlyBranch,
          element: {
            stem: getHeavenlyStemElement(p.pillar.heavenlyStem),
            branch: getEarthlyBranchElement(p.pillar.earthlyBranch),
          },
          tenGod: getTenGod(dayMaster, p.pillar.heavenlyStem),
        })),
      }
    : null;

  return {
    pillars,
    elements,
    dayMaster,
    tenGods,
    voidBranches: r.voidBranches,
    luck,
    birth: { solar: dates.solar, lunar: dates.lunar, hasHour: v.hasHour, hour: v.hour, minute: v.minute, gender: v.gender || null },
    process: buildProcess(v, r, dates, terms, counts),
  };
}

module.exports = { calculateSaju };

const express = require("express");
const db = require("../db");
const { calculateSaju } = require("../services/sajuCalc");
const { monthlyFortune } = require("../services/monthly");
const { yearlyFortune } = require("../services/periods");
const router = express.Router();

const getText = db.prepare("SELECT text FROM saju_texts WHERE category = ? AND key = ?");
const textOf = (category, key) => getText.get(category, key)?.text ?? "";
const ELEMENTS = ["목", "화", "토", "금", "수"];
const ILGAN_TITLE = {
  갑: "갑목(甲木)", 을: "을목(乙木)", 병: "병화(丙火)", 정: "정화(丁火)", 무: "무토(戊土)",
  기: "기토(己土)", 경: "경금(庚金)", 신: "신금(辛金)", 임: "임수(壬水)", 계: "계수(癸水)",
};
// MVP 분야별 풀이 (총운 외)
const TOPICS = [
  { key: "love", label: "애정" },
  { key: "money", label: "재물" },
  { key: "work", label: "업무" },
  { key: "study", label: "학업" },
  { key: "health", label: "건강" },
  { key: "relation", label: "대인관계" },
];

// POST /api/saju  { year, month, day, hour?, minute?, calendar: 'solar'|'lunar', isLeapMonth?, gender? }
router.post("/", (req, res) => {
  try {
    const result = calculateSaju(req.body);
    const counts = Object.fromEntries(ELEMENTS.map((el) => [el, result.elements[el] || 0]));
    const max = Math.max(...Object.values(counts));
    const dominant = ELEMENTS.filter((el) => counts[el] === max && max > 0);
    const lacking = ELEMENTS.filter((el) => counts[el] === 0);

    // 총운(정통사주) 풀이
    const summary = [];
    const add = (title, category, key) => {
      const text = textOf(category, key);
      if (text) summary.push({ title, text });
    };
    add(`나의 일간 · ${ILGAN_TITLE[result.dayMaster] ?? result.dayMaster}`, "ilgan", result.dayMaster);
    if (dominant[0]) add(`강한 오행 · ${dominant[0]}`, "oheng", dominant[0]);
    if (lacking[0]) add(`부족한 오행 · ${lacking[0]}`, "lack", lacking[0]);
    add(`일지 · ${result.pillars.day.branch}`, "ilji", result.pillars.day.branch);

    // 분야별 풀이 (일간 기준)
    // 각 분야는 핵심 풀이(일간) + 내 사주에서 강한 오행(최대 2개)에 따른 세부 풀이를 함께 담는다.
    const topics = TOPICS.map(({ key, label }) => ({
      key,
      label,
      text: textOf(`topic_${key}`, result.dayMaster),
      elementTexts: dominant.slice(0, 2).map((el) => ({ element: el, text: textOf(`topic_${key}_el`, el) })),
    }));
    // 상세 화면에서 근거로 보여 줄 기본 풀이
    const profile = {
      ilgan: { title: `일간 ${ILGAN_TITLE[result.dayMaster] ?? result.dayMaster}`, text: textOf("ilgan", result.dayMaster) },
      ilji: { title: `일지 ${result.pillars.day.branch}`, text: textOf("ilji", result.pillars.day.branch) },
    };

    // 월간운세 (앞으로 12개월)
    const monthly = monthlyFortune(result.dayMaster).map((m) => ({ ...m, text: textOf("monthly", m.tenGod) }));

    // 만세력: 원국 십신, 대운(성별 입력 시), 세운(올해부터 10년)
    const now = new Date();
    const koreanAge = now.getFullYear() - result.birth.solar.year + 1;
    const luck = result.luck && {
      ...result.luck,
      pillars: result.luck.pillars.map((p) => ({
        ...p,
        isCurrent: koreanAge >= p.age && koreanAge < p.age + 10,
        desc: textOf("decade", p.tenGod),
      })),
    };
    const yearly = yearlyFortune(result.dayMaster, now).map((y) => ({ ...y, desc: textOf("yearly", y.stemTenGod) }));

    const { tenGods, voidBranches, birth, process: steps, ...rest } = result;
    res.json({
      ...rest,
      elements: counts,
      dominant,
      lacking,
      summary,
      topics,
      profile,
      monthly,
      process: steps,
      manse: { birth, tenGods, voidBranches, luck, yearly, koreanAge },
    });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.status ? e.message : "사주 계산 중 오류가 발생했습니다." });
  }
});

module.exports = router;

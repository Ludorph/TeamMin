const express = require("express");
const db = require("../db");
const { calculateSaju } = require("../services/sajuCalc");
const { computeMatch } = require("../services/match");
const router = express.Router();

const getText = db.prepare("SELECT text FROM saju_texts WHERE category = ? AND key = ?");
const textOf = (category, key) => getText.get(category, key)?.text ?? "";

// 어느 쪽 입력이 잘못됐는지 알려 주도록 오류 앞에 "나"/"상대"를 붙인다.
function calc(input, label) {
  try {
    return calculateSaju(input);
  } catch (e) {
    throw Object.assign(new Error(`${label} 정보: ${e.message}`), { status: e.status || 500 });
  }
}

// POST /api/match  { me: {year, month, day, hour?, minute?, calendar, isLeapMonth?}, partner: {...} }
router.post("/", (req, res) => {
  try {
    const me = calc(req.body?.me || {}, "나의");
    const partner = calc(req.body?.partner || {}, "상대");
    const m = computeMatch(me, partner);

    const person = (label, p) => ({
      label,
      dayPillar: p.pillars.day.text,
      dayHanja: p.pillars.day.hanja,
      dayMaster: p.dayMaster,
      element: p.pillars.day.element.stem,
    });

    const items = [
      {
        key: "ilgan", title: "일간의 관계", headline: m.ilgan.label, rating: m.ilgan.rating,
        texts: [{ text: textOf("match_ilgan", m.ilgan.key) }],
      },
      {
        key: "ilji", title: "일지의 관계 (가까운 사이에서의 궁합)", headline: m.ilji.label, rating: m.ilji.rating,
        texts: [{ text: textOf("match_ilji", m.ilji.key) }],
      },
      {
        key: "balance", title: "오행의 보완", rating: m.balance.rating,
        headline:
          m.balance.filledForMe.length + m.balance.filledForPartner.length === 0
            ? "서로 채워 주는 오행이 없음"
            : [
                m.balance.filledForMe.length ? `내게 부족한 ${m.balance.filledForMe.join("·")} 기운을 상대가 채움` : null,
                m.balance.filledForPartner.length ? `상대에게 부족한 ${m.balance.filledForPartner.join("·")} 기운을 내가 채움` : null,
              ].filter(Boolean).join(" / "),
        texts: [{ text: textOf("match_balance", m.balance.key) }],
      },
      {
        key: "tengod", title: "서로를 느끼는 방식", rating: m.tengod.rating,
        headline: `내가 보는 상대: ${m.tengod.toPartner} · 상대가 보는 나: ${m.tengod.toMe}`,
        texts: [
          { label: "나는 상대를", text: textOf("match_tengod", m.tengod.toPartner) },
          { label: "상대는 나를", text: textOf("match_tengod", m.tengod.toMe) },
        ],
      },
    ];

    res.json({
      people: [person("나", me), person("상대", partner)],
      score: m.score,
      summary: textOf("match_total", m.band),
      items,
    });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.status ? e.message : "궁합 계산 중 오류가 발생했습니다." });
  }
});

module.exports = router;

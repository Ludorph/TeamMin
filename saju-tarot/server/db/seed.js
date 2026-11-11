// 사용법: npm run seed  (data/saju_texts.json -> SQLite)
// 현재 문구는 임시 문구. 팀에서 작성한 해석 문구로 교체할 것.
const db = require("./index");

// 정통사주 풀이(일간·오행·일지) + 분야별 풀이(애정·재물·업무·학업·건강·대인관계) + 월간운세(십신)
// + 만세력의 세운(연도별)·대운(10년 단위) 문구
const sajuTexts = [
  ...require("../data/saju_texts.json"),
  ...require("../data/topic_texts.json"),
  ...require("../data/period_texts.json"),
  ...require("../data/topic_element_texts.json"), // 분야별 상세(강한 오행에 따른 풀이)
];
const insertSaju = db.prepare("INSERT OR REPLACE INTO saju_texts (category, key, text) VALUES (@category, @key, @text)");
db.transaction(() => {
  db.exec("DELETE FROM saju_texts"); // 이전 문구가 남지 않도록 비우고 다시 채움
  sajuTexts.forEach((t) => insertSaju.run(t));
})();
console.log(`사주 문구 ${sajuTexts.length}개 시드 완료`);

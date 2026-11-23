// 홈 화면 카드 목록. 카드를 누르면 입력 → 결과 화면의 해당 운세(sectionId)로 이동한다.
// category: 홈의 카테고리 탭과 연결. disabled: 후순위(준비 중) 기능.
export const CATEGORIES = [
  { id: "all", label: "전체" },
  { id: "total", label: "총운" },
  { id: "relation", label: "연애·관계" },
  { id: "work", label: "재물·일" },
  { id: "life", label: "학업·건강" },
  { id: "period", label: "기간별 운세" },
];

export const FORTUNES = [
  {
    id: "total", sectionId: "sec-total", category: "total", tag: "정통사주",
    title: "정통사주 총운", sub: "“타고난 기질과 평생의 흐름이 궁금하다면”", glyph: "命", hue: "indigo", image: "/cards/card_total.webp",
  },
  {
    id: "love", sectionId: "sec-love", category: "relation", tag: "연애 성향",
    title: "애정운", sub: "“나는 어떤 사랑을 하는 사람일까?”", glyph: "愛", hue: "rose", image: "/cards/card_love.webp",
  },
  {
    id: "relation", sectionId: "sec-relation", category: "relation", tag: "사람 사이",
    title: "대인관계운", sub: "“사람 사이, 어떻게 풀어갈까?”", glyph: "緣", hue: "violet", image: "/cards/card_relation.webp",
  },
  {
    id: "money", sectionId: "sec-money", category: "work", tag: "재물 흐름",
    title: "재물운", sub: "“돈은 어떻게 모이는 스타일일까?”", glyph: "財", hue: "gold", image: "/cards/card_money.webp",
  },
  {
    id: "work", sectionId: "sec-work", category: "work", tag: "직업과 일",
    title: "업무운", sub: "“지금의 일, 나에게 맞을까?”", glyph: "業", hue: "teal", image: "/cards/card_work_full.webp", imagePos: "28%",
  },
  {
    id: "study", sectionId: "sec-study", category: "life", tag: "공부 스타일",
    title: "학업운", sub: "“나에게 맞는 공부법은?”", glyph: "學", hue: "blue", image: "/cards/card_study_full.webp", imagePos: "56%",
  },
  {
    id: "health", sectionId: "sec-health", category: "life", tag: "컨디션 관리",
    title: "건강운", sub: "“내 몸과 마음, 어떻게 챙길까?”", glyph: "健", hue: "green", image: "/cards/card_health_full.webp", imagePos: "64%",
  },
  {
    id: "monthly", sectionId: "sec-monthly", category: "period", tag: "앞으로 12개월",
    title: "월간운세", sub: "“이번 달부터 1년의 흐름”", glyph: "月", hue: "orange", image: "/cards/card_monthly_full.webp", imagePos: "100%",
  },
  {
    id: "manse", sectionId: "manse", category: "period", tag: "대운 · 세운",
    title: "만세력 보기", sub: "“10년 단위, 해마다의 큰 흐름”", glyph: "曆", hue: "brown", image: "/cards/card_manse.webp",
  },
  {
    id: "process", sectionId: "sec-process", category: "total", tag: "풀이 근거",
    title: "풀이 과정 보기", sub: "“내 사주는 어떻게 나왔을까?”", glyph: "理", hue: "slate", image: "/cards/card_process.webp",
  },
  {
    id: "today", sectionId: "sec-today", category: "period", tag: "오늘 하루",
    title: "오늘의 운세", sub: "“오늘 하루는 어떨까?”", glyph: "日", hue: "slate", image: "/cards/card_today.webp",
  },
  {
    id: "match", sectionId: "sec-match", category: "relation", tag: "두 사람",
    title: "궁합", sub: "“이 사람과 나, 잘 맞을까?”", glyph: "合", hue: "slate", image: "/cards/card_match.webp",
  },
];

# 사주 웹사이트

React(Vite) + Express + SQLite. 구조 설계는 `../프로젝트_구조_설계.md` 참고. (초안, 구체적 기능은 미확정)

## 실행
```bash
# 서버 (http://localhost:3000)
cd server
npm install
npm run seed
npm run dev

# 클라이언트 (http://localhost:5173, /api는 3000으로 프록시)
cd client
npm install
npm run dev
```

## TODO
- 사주 계산 정확도 검증 (`server/services/sajuCalc.js`)
- `server/data/saju_texts.json`을 팀 작성 해석 문구로 교체
- 화면(홈/사주 입력/결과)을 `client/src/pages`에 구현

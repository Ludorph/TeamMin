# 사주 웹사이트

React(Vite) + Express + SQLite. 만세력 계산은 오픈소스 `manseryeok` 라이브러리를 사용합니다.
구조 설계는 `../프로젝트_구조_설계.md`, 유스케이스는 `../유스케이스_명세.md`를 참고하세요.

## 기능
- 홈: 운세 카드(카테고리 탭) 12종
- 총운, 애정·재물·업무·학업·건강·대인관계, 월간운세, 풀이 과정, 만세력(원국·대운·세운)
- 오늘의 운세, 궁합(두 사람 입력)
- 가입 없이 이용하며, 입력한 정보는 서버에 저장하지 않습니다.

## 개발 환경 실행 (Node.js 22.13 이상(내장 SQLite 사용))
```bash
# 서버 (http://localhost:3000)
cd server
npm install
npm run seed      # 해석 문구를 SQLite에 넣기
npm run dev

# 클라이언트 (http://localhost:5173, /api는 3000으로 프록시)
cd client
npm install
npm run dev
```

## 배포용 실행 (서버 하나가 화면과 API를 함께 제공)
```bash
cd client && npm install && npm run build   # client/dist 생성
cd ../server && npm install && npm start    # 시드 후 서버 실행 (PORT 환경 변수, 기본 3000)
```

## Render 배포
저장소 루트의 `render.yaml`(Blueprint)을 사용합니다.
1. Render 대시보드 → New → Blueprint → 이 GitHub 저장소 선택
2. `saju-fortune` 웹 서비스가 만들어지고 빌드·시작 명령은 `render.yaml`에 이미 들어 있습니다.
3. 배포가 끝나면 Render가 알려 주는 주소로 접속합니다. 무료 플랜은 한동안 접속이 없으면 잠들어 첫 접속이 느릴 수 있습니다.

## 폴더
- `client/` React 화면, `server/` Express API·SQLite·계산 로직, `docs/` 구조도·플로우차트·유스케이스 다이어그램

## 남은 일
- 사주 계산 정확도 검증(외부 만세력과 대조)
- 해석·궁합·오늘의 운세 문구를 팀 검수 후 확정

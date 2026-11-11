# React 수업 분석 (https://phyzikyh.github.io/react/)

출처: 신기홍, 2026학년도 2학기 강의 사이트. GitHub 링크는 없고 소스는 각 주차 `weekNN_code.html`에 있음. 8주차 없음.
(서브에이전트 요약 기반. 원문 대조는 하지 않음.)

## 주차별 개념
| 주차 | 주제 | 핵심 |
|---|---|---|
| 1 | HTML | 시맨틱 태그, label/for, fieldset, 접근성 |
| 2 | CSS | 명시도, box-sizing, Flex/Grid, mobile-first `@media`, `:root` 변수 |
| 3 | JSX | Vite 설정, main.jsx→App.jsx, className/htmlFor, Fragment, `{}`는 표현식만 |
| 4 | 컴포넌트/Props | PascalCase, 구조분해 Props, 기본값, children, export default |
| 5 | State/이벤트 | `onClick={fn}`(괄호 X), useState, setter만 사용, 제어 입력 value+onChange |
| 6 | Hook | useEffect(의존성, cleanup), useRef, Hook 규칙 |
| 7 | 조건부/리스트 | `? :`, `&&`(0 함정), map+key, filter 파생 목록 |
| 9 | 폼 | 제어 입력, onSubmit+preventDefault, 객체 State, errors 객체 검증 |
| 10 | 끌어올리기 | 공통 부모에 State, 값은 아래로/함수는 위로, 파생값은 계산 |
| 11 | 합성 | children, 슬롯 Props, variant/size, 파일 분리 |

## 핵심 코드 패턴
```jsx
// Vite
// npm create vite@latest my-app -- --template react

// State 토글 / 조건부
const [liked, setLiked] = useState(false);
<button onClick={() => setLiked(!liked)}>{liked ? "♥" : "♡"}</button>

// 리스트
{cards.map((c) => <Card key={c.id} card={c} />)}

// 폼: 객체 State 하나 + 검증
setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
setErrors(nextErrors);
if (Object.keys(nextErrors).length > 0) return;

// useEffect + cleanup
useEffect(() => {
  const id = setInterval(() => setNow(new Date()), 1000);
  return () => clearInterval(id);
}, []);

// 합성
function Card({ title, children }) { return <div className="card"><h2>{title}</h2>{children}</div>; }
```

## 수업 컨벤션
- React + Vite + npm만 사용. 라우터/전역 상태 라이브러리는 나오지 않음.
- 컴포넌트 PascalCase, props/변수 camelCase, CSS는 kebab-case(BEM 스타일).
- 파일: `src/App.jsx`, `src/components/*.jsx`, `App.css`, `index.css`.
- State 직접 변경 금지(`push` 대신 `[...prev, x]`), key는 고유 id, 파생값은 State로 저장하지 않음.

## 사주 사이트 설계 제안 (수업 범위 내)
- App State: `step`, `form`(이름/생년월일/시간), `errors`.
- 단계: 입력(9주차 폼) → 결과(계산, 11주차 합성).
- 컴포넌트: `Layout`, `Button(variant)`, `BirthForm`, `Result`.
- 사주 계산: 서버에서 오픈소스 만세력 라이브러리로 처리.
- 효과: 로딩 연출은 useEffect+setTimeout(cleanup 필수), 이름 입력 자동 포커스는 useRef.

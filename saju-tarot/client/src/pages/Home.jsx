import { useState } from "react";
import Button from "../components/Button";
import { CATEGORIES, FORTUNES } from "../fortunes";

function FortuneCard({ item, onPick }) {
  return (
    <li>
      <button
        type="button"
        className={`fcard hue-${item.hue}${item.disabled ? " disabled" : ""}`}
        onClick={() => onPick(item)}
        disabled={item.disabled}
        aria-label={item.disabled ? `${item.title} (준비 중)` : `${item.title} 보기`}
      >
        <span className="fcard-tag">{item.tag}</span>
        {item.disabled && <span className="fcard-badge">준비 중</span>}
        <span className="fcard-glyph" aria-hidden="true">{item.glyph}</span>
        <span className="fcard-body">
          <strong className="fcard-title">{item.title}</strong>
          <span className="fcard-sub">{item.sub}</span>
          <span className="fcard-go">{item.disabled ? "곧 만나요" : "무료로 보기 →"}</span>
        </span>
      </button>
    </li>
  );
}

// info: 이미 입력한 정보가 있으면 { text } — 카드를 누르면 입력 없이 바로 결과로 간다.
function Home({ info, onPick, onReset }) {
  const [category, setCategory] = useState("all");
  const items = FORTUNES.filter((f) => category === "all" || f.category === category);

  return (
    <section>
      <div className="hero compact">
        <h1>
          내 사주, <span className="accent">가입 없이 무료로</span>
        </h1>
        <p>궁금한 운세를 골라 보세요. 생년월일시만 입력하면 바로 볼 수 있어요.</p>
      </div>

      {info && (
        <div className="info-bar" role="status">
          <span>{info}</span>
          <Button variant="ghost" size="small" onClick={onReset}>다른 사람 보기</Button>
        </div>
      )}

      <div className="cats" role="group" aria-label="운세 카테고리">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`cat${category === c.id ? " active" : ""}`}
            aria-pressed={category === c.id}
            onClick={() => setCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <ul className="fgrid">
        {items.map((f) => <FortuneCard key={f.id} item={f} onPick={onPick} />)}
      </ul>

      <ul className="points">
        <li><b>1</b> 회원가입·결제 없이 이용</li>
        <li><b>2</b> 입력한 정보는 서버에 저장하지 않음</li>
      </ul>
    </section>
  );
}

export default Home;

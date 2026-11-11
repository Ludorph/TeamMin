import Button from "../components/Button";
import { elementClass } from "../constants";

const COLUMNS = [
  { key: "hour", label: "시주" },
  { key: "day", label: "일주" },
  { key: "month", label: "월주" },
  { key: "year", label: "년주" },
];

function birthText(birth) {
  const { solar, lunar, hasHour, hour, minute } = birth;
  const time = hasHour ? ` ${hour}시 ${String(minute).padStart(2, "0")}분` : " (시간 모름)";
  const lunarText = lunar ? ` / 음력 ${lunar.year}.${lunar.isLeapMonth ? "윤" : ""}${lunar.month}.${lunar.day}` : "";
  return `양력 ${solar.year}.${solar.month}.${solar.day}${time}${lunarText}`;
}

function ManseTable({ pillars, tenGods }) {
  return (
    <table className="manse">
      <thead>
        <tr>
          <th scope="col" />
          {COLUMNS.map((c) => <th key={c.key} scope="col">{c.label}</th>)}
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">십신</th>
          {COLUMNS.map((c) => <td key={c.key}>{tenGods[c.key]?.stem ?? "-"}</td>)}
        </tr>
        <tr>
          <th scope="row">천간</th>
          {COLUMNS.map((c) => {
            const p = pillars[c.key];
            return (
              <td key={c.key} className="big">
                {p ? <span className={elementClass(p.element.stem)}>{p.hanja[0]}<small>{p.stem}·{p.element.stem}</small></span> : "-"}
              </td>
            );
          })}
        </tr>
        <tr>
          <th scope="row">지지</th>
          {COLUMNS.map((c) => {
            const p = pillars[c.key];
            return (
              <td key={c.key} className="big">
                {p ? <span className={elementClass(p.element.branch)}>{p.hanja[1]}<small>{p.branch}·{p.element.branch}</small></span> : "-"}
              </td>
            );
          })}
        </tr>
        <tr>
          <th scope="row">십신</th>
          {COLUMNS.map((c) => <td key={c.key}>{tenGods[c.key]?.branch ?? "-"}</td>)}
        </tr>
      </tbody>
    </table>
  );
}

function ManseView({ result, onBack, onSetGender, loading, error }) {
  const { pillars, manse } = result;
  const luck = manse.luck;

  return (
    <section>
      <div className="manse-top">
        <h1 className="page-title">만세력</h1>
        <Button variant="ghost" size="small" onClick={onBack}>← 결과로</Button>
      </div>
      <p className="greeting">{birthText(manse.birth)}</p>

      <div className="panel">
        <h2>원국 (사주 팔자)</h2>
        <ManseTable pillars={pillars} tenGods={manse.tenGods} />
        <p className="note">
          십신은 일간(나)을 기준으로 각 글자가 어떤 관계인지 나타냅니다.
          {manse.voidBranches?.length > 0 && <> 공망: {manse.voidBranches.join(", ")}</>}
        </p>
      </div>

      <div className="panel">
        <h2>대운 (10년 단위 흐름)</h2>
        {luck ? (
          <>
            <p className="note">{luck.forward ? "순행" : "역행"} · 첫 대운 {luck.startAge}세부터 10년마다 바뀝니다. 현재 {manse.koreanAge}세(만 나이 아님).</p>
            <ol className="months">
              {luck.pillars.map((p) => (
                <li key={p.age} className={`month${p.isCurrent ? " current" : ""}`}>
                  <div className="month-head">
                    <strong>{p.age}세 ~ {p.age + 9}세</strong>
                    <span className="month-tag">
                      <span className={elementClass(p.element.stem)}>{p.hanja[0]}</span>
                      <span className={elementClass(p.element.branch)}>{p.hanja[1]}</span> {p.text} · {p.tenGod}
                    </span>
                    {p.isCurrent && <span className="month-now">현재</span>}
                  </div>
                  <p>{p.desc}</p>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <>
            <p>대운은 성별에 따라 흐르는 방향이 달라서 성별이 필요해요. 선택하면 바로 보여 드립니다.</p>
            <div className="actions">
              <Button variant="ghost" disabled={loading} onClick={() => onSetGender("female")}>여성으로 보기</Button>
              <Button variant="ghost" disabled={loading} onClick={() => onSetGender("male")}>남성으로 보기</Button>
            </div>
            {error && <p className="error" role="alert">{error}</p>}
          </>
        )}
      </div>

      <div className="panel">
        <h2>세운 (올해부터 10년)</h2>
        <p className="note">해마다 바뀌는 연도의 간지가 나의 일간과 만나는 관계(십신)로 풀이합니다.</p>
        <ol className="months">
          {manse.yearly.map((y) => (
            <li key={y.year} className={`month${y.isCurrent ? " current" : ""}`}>
              <div className="month-head">
                <strong>{y.year}년</strong>
                <span className="month-tag">{y.hanja} {y.text} · {y.stemTenGod}/{y.branchTenGod}</span>
                {y.isCurrent && <span className="month-now">올해</span>}
              </div>
              <p>{y.desc}</p>
            </li>
          ))}
        </ol>
      </div>

      <p className="note">풀이 문구는 초안이며 오락·참고용입니다.</p>
      <div className="actions">
        <Button variant="ghost" block onClick={onBack}>← 결과로 돌아가기</Button>
      </div>
    </section>
  );
}

export default ManseView;

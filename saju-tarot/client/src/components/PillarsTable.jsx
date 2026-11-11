import { elementClass } from "../constants";

// 전통 표기 순서: 시주 · 일주 · 월주 · 년주 (오른쪽에서 왼쪽으로 읽는 관례)
const COLUMNS = [
  { key: "hour", label: "시주" },
  { key: "day", label: "일주 (나)" },
  { key: "month", label: "월주" },
  { key: "year", label: "년주" },
];

function PillarCell({ pillar, isMe }) {
  if (!pillar) {
    return <td className="pillar-cell empty">시간 모름</td>;
  }
  return (
    <td className={`pillar-cell${isMe ? " me" : ""}`}>
      <span className="hanja">
        <span className={elementClass(pillar.element.stem)}>{pillar.hanja[0]}</span>
        <span className={elementClass(pillar.element.branch)}>{pillar.hanja[1]}</span>
      </span>
      <span className="hangul">{pillar.text}</span>
      <span className="chip">
        <span className={elementClass(pillar.element.stem)}>{pillar.element.stem}</span>
        {" · "}
        <span className={elementClass(pillar.element.branch)}>{pillar.element.branch}</span>
      </span>
    </td>
  );
}

function PillarsTable({ pillars }) {
  return (
    <table className="pillars">
      <caption className="sr-only" style={{ position: "absolute", left: "-9999px" }}>사주 팔자 표</caption>
      <thead>
        <tr>
          {COLUMNS.map((c) => (
            <th key={c.key} scope="col">{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {COLUMNS.map((c) => (
            <PillarCell key={c.key} pillar={pillars[c.key]} isMe={c.key === "day"} />
          ))}
        </tr>
      </tbody>
    </table>
  );
}

export default PillarsTable;

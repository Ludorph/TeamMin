function MonthlyList({ monthly }) {
  if (monthly.length === 0) return <p>표시할 월간운세가 없습니다.</p>;
  return (
    <div>
      <p className="note">각 달 중순을 기준으로 나의 일간과 그 달의 기운(십신)이 만나는 흐름을 봅니다.</p>
      <ol className="months">
        {monthly.map((m) => (
          <li key={`${m.year}-${m.month}`} className={`month${m.isCurrent ? " current" : ""}`}>
            <div className="month-head">
              <strong>{m.year}년 {m.month}월</strong>
              <span className="month-tag">{m.hanja} · {m.tenGod}</span>
              {m.isCurrent && <span className="month-now">이번 달</span>}
            </div>
            <p>{m.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default MonthlyList;

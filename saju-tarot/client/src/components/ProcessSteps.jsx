// 풀이 과정: 서버가 계산한 단계(입력 → 환산 → 년·월·일·시주 → 오행 집계 → 풀이 연결)를 순서대로 보여 준다.
function ProcessSteps({ steps }) {
  return (
    <ol className="steps">
      {steps.map((s, i) => (
        <li key={s.title} className="step">
          <span className="step-no" aria-hidden="true">{i + 1}</span>
          <div>
            <h3>{s.title}</h3>
            <p>{s.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default ProcessSteps;

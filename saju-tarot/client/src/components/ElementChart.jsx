import { ELEMENTS, elementClass } from "../constants";

function ElementChart({ elements, hasHour }) {
  const total = hasHour ? 8 : 6;
  return (
    <div className="bars">
      {ELEMENTS.map((el) => {
        const count = elements[el] ?? 0;
        return (
          <div className="bar-row" key={el}>
            <span className={elementClass(el)}>{el}</span>
            <div
              className="bar-track"
              role="img"
              aria-label={`${el} ${count}개 (총 ${total}글자 중)`}
            >
              <div className={`bar-fill ${elementClass(el)}`} style={{ width: `${(count / total) * 100}%` }} />
            </div>
            <span>{count}</span>
          </div>
        );
      })}
    </div>
  );
}

export default ElementChart;

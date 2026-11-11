import { useEffect, useRef, useState } from "react";
import Button from "../components/Button";
import { MAX_YEAR, MIN_YEAR } from "../constants";

const YEARS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MAX_YEAR - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

function daysInMonth(form) {
  if (form.calendar === "lunar") return 30;
  const y = Number(form.year) || 2000;
  const m = Number(form.month) || 1;
  return new Date(y, m, 0).getDate();
}

function validate(form) {
  const errors = {};
  if (!form.year) errors.year = "연도를 선택하세요.";
  if (!form.month) errors.month = "월을 선택하세요.";
  if (!form.day) errors.day = "일을 선택하세요.";
  else if (Number(form.day) > daysInMonth(form)) errors.day = "존재하지 않는 날짜입니다.";
  return errors;
}

function SajuInput({ form, onChange, onSubmit, loading, serverError, targetTitle }) {
  const [errors, setErrors] = useState({});
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  function handleChange(event) {
    const { name, type, value, checked } = event.target;
    const next = { ...form, [name]: type === "checkbox" ? checked : value };
    if (name === "calendar" && value === "solar") next.isLeapMonth = false;
    if (name === "hour" && value === "") next.minute = "";
    onChange(next);
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit();
  }

  const dayOptions = Array.from({ length: daysInMonth(form) }, (_, i) => i + 1);

  return (
    <section>
      <h1 className="page-title">사주 정보를 입력하세요</h1>
      {targetTitle && <p className="greeting">선택한 운세: <b>{targetTitle}</b> · 입력하면 바로 보여 드려요.</p>}
      <form className="form panel" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="name">이름 또는 닉네임 (선택)</label>
          <input
            id="name" name="name" ref={nameRef} className="input" maxLength={20}
            value={form.name} onChange={handleChange} autoComplete="nickname" placeholder="결과 화면에 표시돼요"
          />
        </div>

        <fieldset className="field">
          <legend>달력</legend>
          <div className="choices">
            {[["solar", "양력"], ["lunar", "음력"]].map(([v, label]) => (
              <label className="choice" key={v}>
                <input type="radio" name="calendar" value={v} checked={form.calendar === v} onChange={handleChange} />
                <span>{label}</span>
              </label>
            ))}
          </div>
          {form.calendar === "lunar" && (
            <label className="check">
              <input type="checkbox" name="isLeapMonth" checked={form.isLeapMonth} onChange={handleChange} />
              윤달이에요
            </label>
          )}
        </fieldset>

        <fieldset className="field">
          <legend>생년월일</legend>
          <div className="row">
            <select name="year" aria-label="연도" className={`select${errors.year ? " invalid" : ""}`} value={form.year} onChange={handleChange}>
              <option value="">연도</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}년</option>)}
            </select>
            <select name="month" aria-label="월" className={`select${errors.month ? " invalid" : ""}`} value={form.month} onChange={handleChange}>
              <option value="">월</option>
              {MONTHS.map((m) => <option key={m} value={m}>{m}월</option>)}
            </select>
            <select name="day" aria-label="일" className={`select${errors.day ? " invalid" : ""}`} value={form.day} onChange={handleChange}>
              <option value="">일</option>
              {dayOptions.map((d) => <option key={d} value={d}>{d}일</option>)}
            </select>
          </div>
          {(errors.year || errors.month || errors.day) && (
            <p className="error" role="alert">{errors.year || errors.month || errors.day}</p>
          )}
        </fieldset>

        <fieldset className="field">
          <legend>태어난 시간</legend>
          <div className="row two">
            <select name="hour" aria-label="시" className="select" value={form.hour} onChange={handleChange}>
              <option value="">시간 모름</option>
              {HOURS.map((h) => <option key={h} value={h}>{h}시</option>)}
            </select>
            <select
              name="minute" aria-label="분" className="select"
              value={form.minute} onChange={handleChange} disabled={form.hour === ""}
            >
              <option value="">분</option>
              {MINUTES.map((m) => <option key={m} value={m}>{m}분</option>)}
            </select>
          </div>
          <span className="hint">모르면 &quot;시간 모름&quot;으로 두세요. 시주를 제외하고 계산해요. 분을 고르지 않으면 0분으로 봅니다.</span>
        </fieldset>

        <fieldset className="field">
          <legend>성별 (선택)</legend>
          <div className="choices">
            {[["", "선택 안 함"], ["female", "여성"], ["male", "남성"]].map(([v, label]) => (
              <label className="choice" key={v || "none"}>
                <input type="radio" name="gender" value={v} checked={form.gender === v} onChange={handleChange} />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {serverError && <p className="error" role="alert">{serverError}</p>}
        <Button type="submit" block disabled={loading}>{loading ? "계산 중…" : "풀이 보기"}</Button>
      </form>
    </section>
  );
}

export default SajuInput;

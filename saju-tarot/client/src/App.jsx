import { useEffect, useState } from "react";
import { getSaju } from "./api/client";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import SajuInput from "./pages/SajuInput";
import SajuResult from "./pages/SajuResult";
import "./App.css";

const EMPTY_FORM = {
  name: "",
  calendar: "solar",
  isLeapMonth: false,
  year: "",
  month: "",
  day: "",
  hour: "",
  minute: "",
  gender: "",
};

const toRequest = (form, gender = form.gender) => ({
  year: form.year,
  month: form.month,
  day: form.day,
  hour: form.hour,
  minute: form.minute,
  calendar: form.calendar,
  isLeapMonth: form.isLeapMonth,
  gender: gender || undefined,
});

// step: "home" | "input" | "loading" | "result"
// target: 홈에서 고른 운세 카드 (결과 화면에서 해당 위치로 이동)
function App() {
  const [step, setStep] = useState("home");
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState(null);
  const [target, setTarget] = useState(null);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  // 화면(step)이나 선택한 운세가 바뀌면 맨 위에서 시작한다.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [step, target]);

  async function handleSubmit() {
    setError("");
    setStep("loading");
    try {
      setResult(await getSaju(toRequest(form)));
      setStep("result");
    } catch (e) {
      setError(e.message);
      setStep("input");
    }
  }

  // 만세력에서 성별을 고르면 결과 화면을 벗어나지 않고 대운까지 포함해 다시 계산한다.
  async function handleSetGender(gender) {
    setError("");
    setUpdating(true);
    try {
      setResult(await getSaju(toRequest(form, gender)));
      setForm({ ...form, gender });
    } catch (e) {
      setError(e.message);
    } finally {
      setUpdating(false);
    }
  }

  // 카드를 누르면: 이미 계산한 결과가 있으면 바로 결과로, 없으면 입력 화면으로 간다.
  function handlePick(item) {
    setTarget(item);
    setError("");
    setStep(result ? "result" : "input");
  }

  function goHome() {
    setStep("home");
  }

  function resetAll() {
    setForm(EMPTY_FORM);
    setResult(null);
    setTarget(null);
    setError("");
    setStep("home");
  }

  const info = result
    ? `${form.name.trim() || "내 정보"} · ${form.calendar === "lunar" ? "음력" : "양력"} ${form.year}.${form.month}.${form.day}`
    : null;

  return (
    <Layout onHome={goHome}>
      {step === "home" && <Home info={info} onPick={handlePick} onReset={resetAll} />}
      {step === "input" && (
        <SajuInput
          form={form}
          onChange={setForm}
          onSubmit={handleSubmit}
          loading={false}
          serverError={error}
          targetTitle={target?.title}
        />
      )}
      {step === "loading" && (
        <div className="loading" role="status">
          <div className="spinner" />
          <p>사주 팔자를 계산하고 있어요…</p>
        </div>
      )}
      {step === "result" && (
        <SajuResult
          key={target?.id ?? "all"}
          result={result}
          name={form.name.trim()}
          target={target}
          onRetry={() => setStep("input")}
          onHome={goHome}
          onSetGender={handleSetGender}
          loading={updating}
          error={error}
        />
      )}
    </Layout>
  );
}

export default App;

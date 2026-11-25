import { useEffect, useState } from "react";
import { getMatch, getSaju } from "./api/client";
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

// step: "home" | "input"(내 정보) | "partner"(궁합 상대 정보) | "loading" | "result"
// target: 홈에서 고른 운세 카드
function App() {
  const [step, setStep] = useState("home");
  const [form, setForm] = useState(EMPTY_FORM);
  const [partnerForm, setPartnerForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [target, setTarget] = useState(null);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [loadingText, setLoadingText] = useState("사주 팔자를 계산하고 있어요…");

  // 화면(step)이나 선택한 운세가 바뀌면 맨 위에서 시작한다.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [step, target]);

  // 모든 화면에서 같은 궁궐 배경을 유지한다. 홈이 아닌 화면은 글자가 잘 읽히도록 막을 조금 더 진하게 한다.
  useEffect(() => {
    document.body.classList.add("home-bg");
    document.body.classList.toggle("inner-bg", step !== "home");
    return () => document.body.classList.remove("home-bg", "inner-bg");
  }, [step]);

  // 내 정보 제출: 궁합 카드로 들어왔다면 이어서 상대 정보를 받는다.
  async function handleSubmit() {
    setError("");
    setLoadingText("사주 팔자를 계산하고 있어요…");
    setStep("loading");
    try {
      setResult(await getSaju(toRequest(form)));
      setMatchResult(null); // 내 정보가 바뀌면 이전 궁합 결과는 무효
      setStep(target?.id === "match" ? "partner" : "result");
    } catch (e) {
      setError(e.message);
      setStep("input");
    }
  }

  // 상대 정보 제출: 두 사람의 사주로 궁합을 계산한다.
  async function handlePartnerSubmit() {
    setError("");
    setLoadingText("두 사람의 궁합을 보고 있어요…");
    setStep("loading");
    try {
      setMatchResult(await getMatch(toRequest(form), toRequest(partnerForm)));
      setStep("result");
    } catch (e) {
      setError(e.message);
      setStep("partner");
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
  // 궁합은 내 정보 → 상대 정보 순서로 받는다.
  function handlePick(item) {
    setTarget(item);
    setError("");
    if (!result) setStep("input");
    else if (item.id === "match" && !matchResult) setStep("partner");
    else setStep("result");
  }

  function goHome() {
    setStep("home");
  }

  function resetAll() {
    setForm(EMPTY_FORM);
    setPartnerForm(EMPTY_FORM);
    setResult(null);
    setMatchResult(null);
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
          heading={target?.id === "match" ? "먼저 내 정보를 입력하세요" : undefined}
          nameLabel={target?.id === "match" ? "내 이름 또는 닉네임 (선택)" : undefined}
          submitLabel={target?.id === "match" ? "다음: 상대 정보 입력" : undefined}
        />
      )}
      {step === "partner" && (
        <SajuInput
          key="partner"
          form={partnerForm}
          onChange={setPartnerForm}
          onSubmit={handlePartnerSubmit}
          loading={false}
          serverError={error}
          heading="궁합을 볼 상대 정보를 입력하세요"
          notice={`${form.name.trim() ? `${form.name.trim()}님` : "내 정보"}와(과) 상대의 궁합을 봅니다. 상대 정보도 서버에 저장하지 않아요.`}
          nameLabel="상대 이름 또는 닉네임 (선택)"
          submitLabel="궁합 보기"
        />
      )}
      {step === "loading" && (
        <div className="loading" role="status">
          <div className="spinner" />
          <p>{loadingText}</p>
        </div>
      )}
      {step === "result" && (
        <SajuResult
          key={target?.id ?? "all"}
          result={result}
          matchResult={matchResult}
          name={form.name.trim()}
          partnerName={partnerForm.name.trim()}
          target={target}
          onRetry={() => setStep("input")}
          onRetryPartner={() => setStep("partner")}
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

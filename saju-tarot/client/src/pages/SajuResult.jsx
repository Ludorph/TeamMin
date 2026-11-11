import Button from "../components/Button";
import ElementChart from "../components/ElementChart";
import MonthlyList from "../components/MonthlyList";
import PillarsTable from "../components/PillarsTable";
import ProcessSteps from "../components/ProcessSteps";
import ManseView from "./ManseView";

function Reading({ title, children }) {
  return (
    <article className="reading">
      {title && <h3>{title}</h3>}
      <p>{children}</p>
    </article>
  );
}

// 분야별(애정·재물·업무·학업·건강·대인관계) 상세: 선택한 운의 내용만 보여 준다.
function TopicDetail({ result, topic }) {
  const thisMonth = result.monthly[0];
  const thisYear = result.manse.yearly[0];
  const showIlji = topic.key === "love" || topic.key === "relation";

  return (
    <>
      <div className="panel">
        <h2>핵심 풀이</h2>
        <p className="reading-text">{topic.text}</p>
      </div>

      {topic.elementTexts.length > 0 && (
        <div className="panel">
          <h2>내 사주의 기운으로 본 {topic.label}</h2>
          {topic.elementTexts.map((e) => (
            <Reading key={e.element} title={`강한 오행 · ${e.element}`}>{e.text}</Reading>
          ))}
        </div>
      )}

      <div className="panel">
        <h2>타고난 성향</h2>
        <Reading title={result.profile.ilgan.title}>{result.profile.ilgan.text}</Reading>
        {showIlji && <Reading title={`${result.profile.ilji.title} · 가까운 사이에서의 모습`}>{result.profile.ilji.text}</Reading>}
      </div>

      <div className="panel">
        <h2>올해와 이번 달의 흐름</h2>
        {thisYear && (
          <Reading title={`올해 ${thisYear.year}년 · ${thisYear.hanja} ${thisYear.text} (${thisYear.stemTenGod})`}>{thisYear.desc}</Reading>
        )}
        {thisMonth && (
          <Reading title={`이번 달 ${thisMonth.month}월 · ${thisMonth.hanja} (${thisMonth.tenGod})`}>{thisMonth.text}</Reading>
        )}
        <p className="note">전체 월별 흐름은 홈의 &quot;월간운세&quot; 카드에서 볼 수 있어요.</p>
      </div>

      {topic.key === "health" && (
        <p className="note">생활 습관에 대한 참고 조언이며 의학적 진단이 아닙니다. 건강 문제는 전문가와 상담하세요.</p>
      )}
    </>
  );
}

// 정통사주 총운: 사주 팔자, 오행 분포, 일간·오행·일지 풀이
function TotalDetail({ result }) {
  const hasHour = Boolean(result.pillars.hour);
  return (
    <>
      <div className="panel">
        <h2>사주 팔자</h2>
        <PillarsTable pillars={result.pillars} />
        {!hasHour && <p className="note">태어난 시간을 입력하지 않아 시주는 제외했어요.</p>}
      </div>
      <div className="panel">
        <h2>오행 분포</h2>
        <ElementChart elements={result.elements} hasHour={hasHour} />
      </div>
      <div className="panel">
        <h2>총운 풀이</h2>
        {result.summary.length === 0 && <p>표시할 풀이가 아직 없습니다.</p>}
        {result.summary.map((item) => <Reading key={item.title} title={item.title}>{item.text}</Reading>)}
      </div>
    </>
  );
}

// 홈에서 고른 카드(target)에 해당하는 운의 상세 내용만 보여 준다.
function SajuResult({ result, name, target, onRetry, onHome, onSetGender, loading, error }) {
  const id = target?.id ?? "total";

  if (id === "manse") {
    return <ManseView result={result} onBack={onHome} onSetGender={onSetGender} loading={loading} error={error} />;
  }

  const topic = result.topics.find((t) => t.key === id);
  const title = target?.title ?? "정통사주 총운";

  return (
    <section>
      <Button variant="ghost" size="small" onClick={onHome}>← 다른 운세 보기</Button>

      <div className={`detail-hero hue-${target?.hue ?? "indigo"}`}>
        <span className="fcard-glyph" aria-hidden="true">{target?.glyph}</span>
        <span className="fcard-tag">{target?.tag}</span>
        <h1>{name ? `${name}님의 ${title}` : `나의 ${title}`}</h1>
        {target?.sub && <p>{target.sub}</p>}
      </div>

      <p className="greeting">
        일간은 <b>{result.dayMaster}</b>
        {result.dominant.length > 0 && <> · 강한 오행은 <b>{result.dominant.join(", ")}</b></>}
        {result.lacking.length > 0 && <> · 부족한 오행은 <b>{result.lacking.join(", ")}</b></>}
        입니다.
      </p>

      {topic && <TopicDetail result={result} topic={topic} />}
      {id === "total" && <TotalDetail result={result} />}
      {id === "monthly" && (
        <div className="panel">
          <h2>월간운세</h2>
          <MonthlyList monthly={result.monthly} />
        </div>
      )}
      {id === "process" && (
        <div className="panel">
          <h2>풀이 과정</h2>
          <p className="note">입력한 정보가 어떤 순서로 사주와 풀이가 되었는지 보여 드려요.</p>
          <ProcessSteps steps={result.process} />
        </div>
      )}

      <p className="note">풀이 문구는 초안이며 오락·참고용입니다.</p>

      <div className="actions">
        <Button variant="ghost" block onClick={onRetry}>정보 다시 입력하기</Button>
        <Button block onClick={onHome}>← 다른 운세 보기</Button>
      </div>
    </section>
  );
}

export default SajuResult;

// 서버 요청 도우미. 네트워크 오류나 서버가 응답하지 않는 경우에도 이해하기 쉬운 문구로 알린다.
async function request(path, options) {
  let res;
  try {
    res = await fetch(`/api${path}`, options);
  } catch {
    throw new Error("서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.");
  }
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("서버 응답을 읽지 못했어요. 잠시 후 다시 시도해 주세요.");
  }
  if (!res.ok) throw new Error(data.error || "요청에 실패했습니다.");
  return data;
}

const post = (path, body) =>
  request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const getSaju = (body) => post("/saju", body);

// 궁합: 나와 상대의 입력을 함께 보낸다.
export const getMatch = (me, partner) => post("/match", { me, partner });

// 무료 서버는 한동안 접속이 없으면 잠들어서 첫 요청이 느리다. 화면을 열 때 미리 깨워 둔다.
export const wakeServer = () => fetch("/api/health").catch(() => {});

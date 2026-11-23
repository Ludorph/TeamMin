async function request(path, options) {
  const res = await fetch(`/api${path}`, options);
  const data = await res.json();
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

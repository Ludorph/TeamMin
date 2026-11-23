const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/saju", require("./routes/saju"));
app.use("/api/match", require("./routes/match"));
app.use("/api", (req, res) => res.status(404).json({ error: "찾을 수 없는 경로입니다." }));

// 배포 환경: 빌드된 React 화면(client/dist)을 같은 서버에서 함께 제공한다.
// (개발 중에는 Vite 개발 서버를 쓰므로 dist가 없어도 API 서버는 그대로 동작한다.)
const distDir = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(path.join(distDir, "index.html"))) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.use((req, res) => res.status(404).json({ error: "찾을 수 없는 경로입니다." }));

app.listen(PORT, () => console.log(`서버 실행: http://localhost:${PORT}`));

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/saju", require("./routes/saju"));

app.use((req, res) => res.status(404).json({ error: "찾을 수 없는 경로입니다." }));

app.listen(PORT, () => console.log(`서버 실행: http://localhost:${PORT}`));

const path = require("path");
const fs = require("fs");
// Node 내장 SQLite(node:sqlite, Node 22.13+)를 사용한다. 별도 네이티브 모듈 설치가 필요 없어
// 배포 환경에서 모듈 빌드·호환 문제가 생기지 않는다.
const { DatabaseSync } = require("node:sqlite");

const db = new DatabaseSync(path.join(__dirname, "app.db"));
db.exec("PRAGMA foreign_keys = ON");
db.exec(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8"));

// seed.js 가 쓰는 db.transaction(fn) 도우미 (여러 쓰기를 한 번에 커밋)
db.transaction = (fn) => (...args) => {
  db.exec("BEGIN");
  try {
    const result = fn(...args);
    db.exec("COMMIT");
    return result;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
};

module.exports = db;

-- 5천만분의 1: 익명 플레이 이벤트와 피드백 (Cloudflare D1)
CREATE TABLE IF NOT EXISTS events(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,          -- ms (클라이언트 시각)
  day TEXT NOT NULL,            -- 한국 날짜 YYYY-MM-DD
  uid TEXT, sid TEXT,           -- 무작위 익명 ID (기기·세션)
  name TEXT NOT NULL,           -- 이벤트 이름
  era INTEGER, age INTEGER,     -- 출생 연도, 게임 속 나이
  props TEXT,                   -- JSON
  country TEXT, dev TEXT
);
CREATE INDEX IF NOT EXISTS ev_day_name ON events(day,name);
CREATE INDEX IF NOT EXISTS ev_sid ON events(sid);
CREATE TABLE IF NOT EXISTS feedback(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL, day TEXT NOT NULL,
  uid TEXT, sid TEXT,
  tag TEXT, text TEXT NOT NULL,
  era INTEGER, age INTEGER, year INTEGER,
  ctx TEXT,                     -- JSON: 최근 기록 몇 줄, 상태
  country TEXT, dev TEXT,
  status TEXT DEFAULT 'new'
);
CREATE INDEX IF NOT EXISTS fb_day ON feedback(day);

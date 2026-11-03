# 5천만분의 1

한국의 주요 통계로 한 사람의 삶을 살아 보는 웹 게임. [80억분의 1](https://1in8b.life)에서 영감을 받았습니다.

- 정적 사이트: `public/index.html` 한 파일
- 배포: Cloudflare Pages (Git 연동, 빌드 명령 없음, 출력 디렉터리 `public`)
- 통계 출처는 게임 안의 각 숫자 옆에 표시됩니다. 시대 사진은 위키미디어 공용의 퍼블릭 도메인·공공누리 제1유형·CC0 이미지입니다.

## 익명 플레이 통계 · 피드백

- `functions/api/e.js`: 이벤트 수집 (POST `/api/e`), `functions/api/feedback.js`: 플레이 중 의견 (POST `/api/feedback`)
- `functions/api/report.js`: 데일리 리포트용 집계 (GET `/api/report?key=…&day=YYYY-MM-DD&days=N`, `REPORT_KEY` 비밀값 필요)
- 저장소: Cloudflare D1 `1in50m-db` (Pages 바인딩 이름 `DB`), 스키마는 `schema.sql`
- 이름·연락처 등 개인 정보는 받지 않고, 기기마다 무작위 익명 ID만 씁니다.

## 정합성 점검

`node tools/consistency.js 300` — 시대마다 300명의 인생을 돌려 앞뒤 모순을 찾습니다.

## 홍보 소재

`node tools/promo.js <출력 폴더> [판 수=8] [시대=rand]` — 게임을 헤드리스 브라우저(Playwright)로 여러 판 자동 플레이해, 이야깃거리가 가장 많은 인생의 결과 카드(9:16 PNG)·릴스 영상·인생 기록(`life.json`)을 만듭니다. `file://`로 열어 플레이 통계는 남지 않습니다.

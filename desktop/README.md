# Windows 원클릭 EXE 배포

비개발 사용자에게 `관광탄소발자국대시보드.exe` 하나만 전달할 때 사용합니다.

## 빌드 (배포자 PC)

사전 요구: Node.js, .NET SDK 8+, 인터넷(빌드 중 portable Node 다운로드)

```bash
npm run desktop:exe
```

결과:

- `release/관광탄소발자국대시보드.exe`
- `release/사용방법.txt`

## 받는 사람

1. EXE 더블클릭
2. 브라우저가 `http://127.0.0.1:3000` (또는 대체 포트)으로 열림
3. AI 기능은 우측 상단 **환경 설정**에서 본인 Hugging Face 토큰 등록
4. 콘솔 창을 닫으면 종료

Node.js / Docker 설치는 필요 없습니다.

## 보안

- 빌드 페이로드에 `.env`, `data/runtime` 을 넣지 않습니다.
- 런처가 `HUGGINGFACE_API_KEY` 등 환경변수를 비운 뒤 서버를 시작합니다.
- 사용자가 등록한 토큰은 `%LOCALAPPDATA%\TourismCarbonDashboard\app\data\runtime\` 에만 저장됩니다.

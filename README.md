# AI 진로 큐레이터

중고등학생을 위한 AI 기반 진로 상담 및 맞춤 추천 웹 서비스입니다.
지역에 따른 교육 기회 격차를 데이터로 보여주고, 학생 개개인에게 맞는 영재교육기관·진로체험프로그램을 추천합니다.

## 주요 기능

- **AI 진로 상담**: Claude AI와 7턴 이상 대화하며 관심분야를 발견
- **맞춤 추천**: 관심분야 + 거주 지역 기반으로 영재교육기관·체험프로그램 추천
- **직업·학과 탐색**: 관심분야 관련 직업 목록 및 커리어넷 학과 탐색 연결
- **지역 격차 분석**: 시도별 영재교육기관 수 시각화 (Chart.js)

## 기술 스택

| 분류 | 기술 |
|------|------|
| 백엔드 | Python 3.11, FastAPI, Uvicorn |
| AI | Claude claude-sonnet-4-5 (Anthropic) |
| 프론트엔드 | HTML / CSS / Vanilla JS (FastAPI 직접 서빙) |
| 데이터 처리 | pandas, openpyxl, xlrd |
| 외부 API | 커리어넷 OpenAPI (직업정보) |
| 배포 | Render |

## 사용 데이터

| 데이터 | 출처 | 파일 |
|--------|------|------|
| 전국 영재교육기관 현황 | 한국교육개발원 (공공데이터포털) | `한국교육개발원_전국영재교육기관현황_20230501.csv` |
| 진로체험프로그램 목록 | 교육부 꿈길 (ggoomgil.go.kr) | `체험프로그램 목록.xls`, `체험프로그램 목록 (1).xls` |
| 학교기본정보 (중학교) | 교육부 학교알리미 (schoolinfo.go.kr) | `학교기본정보(중)_전체.xlsx` |

## 로컬 실행 방법

### 1. 환경 변수 설정

`.env` 파일을 프로젝트 루트에 생성합니다.

```
ANTHROPIC_API_KEY=your_api_key_here
```

### 2. 의존성 설치

```bash
pip install -r requirements.txt
```

### 3. 서버 실행

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

브라우저에서 `http://localhost:8000` 접속

## Render 배포 방법

1. 이 저장소를 GitHub에 push
2. [Render](https://render.com) 대시보드에서 **New Web Service** 선택
3. GitHub 저장소 연결
4. 환경 변수 `ANTHROPIC_API_KEY` 설정 (Render 대시보드 → Environment)
5. `render.yaml`이 자동으로 빌드/시작 명령을 설정함

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/chat` | AI 상담 (일반) |
| POST | `/chat/stream` | AI 상담 (스트리밍) |
| POST | `/recommend` | 직접 추천 요청 |
| GET | `/school/{name}` | 학교명 → 지역 변환 |
| GET | `/stats/regional-gap` | 지역별 영재기관 격차 통계 |
| GET | `/careers?keyword=` | 커리어넷 직업정보 |
| GET | `/majors?keyword=` | 커리어넷 학과 탐색 링크 |

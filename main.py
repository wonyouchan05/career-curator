import asyncio
import json
import os

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import anthropic

from data_loader import load_gifted, load_experience, load_school, school_to_region, INTEREST_MAP
from recommender import recommend

load_dotenv()

_api_key = os.getenv("ANTHROPIC_API_KEY", "")
client       = anthropic.Anthropic(api_key=_api_key)
async_client = anthropic.AsyncAnthropic(api_key=_api_key)

CAREER_NET_KEY  = os.getenv("CAREER_NET_API_KEY", "822968249348095bf6d67cac11bb3d79")
CAREER_NET_BASE = "https://www.career.go.kr/cnet/openapi/getOpenApi.xml"

# 관심분야 → profession 키워드 매핑 (CareerNet JOB API 필터용)
_PROFESSION_HINT = {
    "컴퓨터": "IT",  "AI": "IT",      "코딩": "IT",    "프로그래밍": "IT",
    "게임": "IT",    "로봇": "공학",   "로봇공학": "공학", "건축": "공학",
    "환경": "공학",  "천문": "공학",   "의학": "보건",  "생명과학": "보건",
    "경제": "회계",  "스타트업": "경영", "음악": "음악",  "미술": "미술",
    "영상": "IT",    "사진": "미술",   "글쓰기": "언론", "심리": "사회",
    "체육": "스포츠", "패션": "패션",   "수학": "공학",  "과학": "공학",
    "발명": "공학",  "인문": "사회",   "영어": "언어",
}

app = FastAPI(title="AI 진로 큐레이터")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── 시작 시 데이터 미리 로딩 ─────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    load_gifted()
    load_experience()
    load_school()


# ── Pydantic 모델 ─────────────────────────────────────────────────────────────

class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]
    user_info: dict


class RecommendRequest(BaseModel):
    region: str
    interests: list[str]
    grade: str


# ── 유틸 ──────────────────────────────────────────────────────────────────────

def detect_interests(messages: list[Message]) -> list[str]:
    # 키워드 매칭 — 보조수단 (AI 분석 실패 시 fallback)
    text = " ".join(m.content for m in messages if m.role == "user")
    detected = []
    for keyword in INTEREST_MAP:
        if keyword in text and keyword not in detected:
            detected.append(keyword)
    return detected


async def detect_interests_with_ai(messages: list[Message]) -> list[str]:
    conversation = "\n".join(
        f"{'학생' if m.role == 'user' else 'AI'}: {m.content}"
        for m in messages
    )
    analysis_prompt = (
        "아래 대화를 분석해서 학생의 관심분야를 다음 목록 중에서 1~3개 골라줘.\n"
        "목록에 없으면 가장 가까운 걸로.\n"
        '반드시 JSON 형식으로만 답해: {"interests": ["분야1", "분야2"]}\n\n'
        "관심분야 목록:\n"
        "수학, 과학, 화학, 물리, 생물, 바이러스, 지구과학, 나노, 우주,\n"
        "컴퓨터, AI, 코딩, 게임, 반도체, 전자, 로봇, 로봇공학, 발명,\n"
        "미술, 음악, 영어, 인문, 체육, 태권도, 군인, 특전부사관,\n"
        "건축, 경제, 심리, 환경, 의학, 요리, 패션, 영상,\n"
        "글쓰기, 천문, 스타트업, 사회문제, 문제해결, 생명과학\n\n"
        f"대화 내용:\n{conversation}"
    )
    try:
        resp = await async_client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=200,
            messages=[{"role": "user", "content": analysis_prompt}],
        )
        result = json.loads(resp.content[0].text)
        return result.get("interests", [])
    except Exception:
        return []


def grade_to_school_type(grade: str) -> str:
    if grade.startswith("고"):
        return "고등학교"
    return "중학교"


def build_system_prompt(school: str, grade: str, region: str) -> str:
    return f"""너는 중고등학생 전문 진로 상담사야.
학생 정보: 학교={school}, 학년={grade}, 지역={region}

[핵심 원칙 — 가장 중요]
- 사용자가 보낸 메시지 수가 7개 미만이면 마무리 문장("찾아볼게요", "기회를 찾아볼게요" 등)을 절대 쓰지 마.
- 관심사가 나왔다고 해서 바로 마무리하지 마. 왜 좋아하는지, 어떻게 시작했는지, 어떤 꿈이 있는지 최소 3~4번 더 물어봐.
- 질문은 한 번에 딱 하나만. 여러 질문을 한꺼번에 쏟아내지 마.
- 매 응답은 짧고 자연스럽게. 긴 설명보다 짧은 공감 + 질문 하나.

[상담 철학]
- 학생이 말한 것에 진심으로 공감하고 더 깊이 파고들어
- 한 가지 관심사를 들으면 왜, 언제, 어떤 부분이 좋은지 꼬리에 꼬리를 물며 물어봐
- 학생 스스로 자기 관심사를 발견하도록 도와줘
- 절대 서두르지 마. 충분히 대화하고 나서 마무리해

[대화 흐름 - 반드시 이 순서로]

PHASE 1 - 아이스브레이킹 (1~2턴)
첫 메시지 고정:
"안녕하세요! 저는 여러분의 진로를 함께 찾아드리는 AI 큐레이터예요 😊
요즘 학교생활은 어때요? 좋아하는 과목이나 활동이 있나요?
수학, 과학, 코딩, 음악, 미술, 운동 같은 거 뭐든 좋아요 😊"

학생 답변에 진심으로 공감:
"오, 그렇구나! ~가 재미있군요 😊"

PHASE 2 - 관심사 탐색 (3~5턴)
관심사가 있다고 하면 아래 질문들을 한 번에 하나씩, 대화 흐름에 맞게 골라서 사용해:
- "어떤 계기로 관심 갖게 됐어요?"
- "그 중에서 특히 어떤 부분이 재미있어요?"
- "관련해서 해본 게 있어요? 수업이든 유튜브든 뭐든요"
- "나중에 그 분야로 뭔가 만들어보고 싶다거나 해보고 싶은 게 있어요?"
- "혹시 그거 하면서 어려웠던 점이나 더 알고 싶었던 게 있었어요?"

관심사가 없다고 하면:
- "그렇구나~ 그럼 학교에서 그나마 덜 지루한 과목은요? ㅋㅋ\n수학, 과학, 체육, 미술, 음악, 국어 중에서요 ㅋㅋ"
- "시간 가는 줄 모르고 하는 게 있어요?\n게임, 유튜브, 요리, 그림 그리기, 운동 같은 거요!"
- "친구들이 너 이거 진짜 잘한다고 하는 게 있어요?"
- "만약 학교 공부 말고 뭔가 배울 수 있다면 뭘 배우고 싶어요?"
숨겨진 관심사 찾아주기:
예) "게임 좋아해요" → "오 게임 만드는 것도 관심 있어요? 아니면 하는 게 좋아요?"

PHASE 3 - 심화 탐색 (2~3턴)
관심사가 어느 정도 파악되면 아래 질문들을 하나씩:
- "그럼 나중에 어떤 사람이 되고 싶어요? 꿈이 있어요?"
- "그 분야에서 해결하고 싶은 문제나 만들고 싶은 게 있어요?"
- "혹시 그 분야 전문가를 만날 수 있다면 뭘 물어보고 싶어요?"
- "지금까지 그 관심사 때문에 뭔가 특별히 해본 적 있어요?"

PHASE 4 - 마무리 (1턴)
★ 사용자 메시지 수가 반드시 7개 이상일 때만 ★:
"정말 좋은 이야기 많이 해줬어요! 😊
[학생 관심사 요약 1~2문장]
이런 분야에서 {region}에서 참여할 수 있는 기회들을 찾아볼게요!"

[절대 금지]
- 사용자 메시지 7개 미만에서 마무리 표현 사용 금지 (이건 가장 중요한 규칙)
- "찾아볼게요", "기회를 찾아볼게요", "맞춤 추천" 등 마무리 뉘앙스 7턴 전 사용 금지
- detected_interests, 시스템 메시지, 기관명 출력 금지
- 마크다운 **굵게** 남용 금지
- 한 번에 질문 두 개 이상 금지 (항상 질문 하나만)
- 딱딱하거나 공식적인 말투 금지
- 관심사 하나 들었다고 바로 다음 단계로 넘어가는 것 금지 (최소 2~3번 더 파고들어)

[말투]
- 친근하고 자연스럽게
- 가끔 "ㅋㅋ", "😊", "오~" 같은 자연스러운 반응
- 학생이 한 말 그대로 반영해서 공감
  예) 학생: "수학이 좋아요" → "오, 수학! 어떤 부분이 재미있어요?"
- 짧고 명확하게, 한 번에 질문 하나만
- 존댓말 유지하되 딱딱하지 않게
"""


# ── API 엔드포인트 ────────────────────────────────────────────────────────────

@app.post("/chat")
async def chat(req: ChatRequest):
    if not _api_key or _api_key == "여기에_키_입력":
        raise HTTPException(status_code=500, detail=".env 파일에 ANTHROPIC_API_KEY를 설정해주세요.")

    school = req.user_info.get("school", "")
    grade  = req.user_info.get("grade", "")
    region = req.user_info.get("region", "")

    if not region and school:
        region = school_to_region(school) or ""

    messages_for_api = [{"role": m.role, "content": m.content} for m in req.messages]
    if not messages_for_api:
        messages_for_api = [{"role": "user", "content": "상담을 시작하고 싶어요."}]

    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1024,
        system=build_system_prompt(school, grade, region),
        messages=messages_for_api,
    )
    reply_text = response.content[0].text

    all_messages = list(req.messages) + [Message(role="assistant", content=reply_text)]
    user_turn_count = sum(1 for m in req.messages if m.role == "user")

    if user_turn_count >= 7:
        ai_interests = await detect_interests_with_ai(all_messages)
        detected = ai_interests if ai_interests else detect_interests(all_messages)
    else:
        detected = detect_interests(all_messages)

    auto_recommend = None
    if detected and region and user_turn_count >= 7:
        auto_recommend = recommend(region, detected, grade_to_school_type(grade))

    return {
        "reply": reply_text,
        "detected_interests": detected,
        "auto_recommend": auto_recommend,
        "turn_count": user_turn_count,
    }


@app.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    if not _api_key or _api_key == "여기에_키_입력":
        raise HTTPException(status_code=500, detail=".env 파일에 ANTHROPIC_API_KEY를 설정해주세요.")

    school = req.user_info.get("school", "")
    grade  = req.user_info.get("grade", "")
    region = req.user_info.get("region", "")

    if not region and school:
        region = school_to_region(school) or ""

    messages_for_api = [{"role": m.role, "content": m.content} for m in req.messages]
    if not messages_for_api:
        messages_for_api = [{"role": "user", "content": "상담을 시작하고 싶어요."}]

    async def generate():
        reply_parts: list[str] = []
        async with async_client.messages.stream(
            model="claude-sonnet-4-5",
            max_tokens=1024,
            system=build_system_prompt(school, grade, region),
            messages=messages_for_api,
        ) as stream:
            async for text in stream.text_stream:
                reply_parts.append(text)
                yield f"data: {json.dumps({'type': 'text', 'chunk': text}, ensure_ascii=False)}\n\n"

        reply_text = "".join(reply_parts)
        all_messages = list(req.messages) + [Message(role="assistant", content=reply_text)]
        user_turn_count = sum(1 for m in req.messages if m.role == "user")

        if user_turn_count >= 7:
            ai_interests = await detect_interests_with_ai(all_messages)
            detected = ai_interests if ai_interests else detect_interests(all_messages)
        else:
            detected = detect_interests(all_messages)

        auto_recommend = None
        if detected and region and user_turn_count >= 7:
            auto_recommend = recommend(region, detected, grade_to_school_type(grade))

        meta = {
            "type": "meta",
            "detected_interests": detected,
            "auto_recommend": auto_recommend,
            "turn_count": user_turn_count,
        }
        yield f"data: {json.dumps(meta, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/recommend")
async def recommend_endpoint(req: RecommendRequest):
    return recommend(req.region, req.interests, req.grade)


@app.get("/school/{school_name}")
async def get_school(school_name: str):
    region = school_to_region(school_name)
    return {"school": school_name, "region": region}


@app.get("/stats/regional-gap")
async def regional_gap():
    import pandas as pd
    df = load_gifted()
    stats = (
        df.groupby("시도")
        .size()
        .reset_index(name="기관수")
        .sort_values("기관수", ascending=False)
    )
    max_row = stats.iloc[0]
    min_row = stats.iloc[-1]
    ratio   = round(max_row["기관수"] / max(int(min_row["기관수"]), 1), 1)
    insight = (
        f"{max_row['시도']}({int(max_row['기관수'])}개)이 "
        f"최소지역({min_row['시도']}, {int(min_row['기관수'])}개)보다 {ratio}배 많음"
    )
    return {
        "total": int(df.shape[0]),
        "regional_stats": stats.rename(columns={"기관수": "기관수"}).to_dict(orient="records"),
        "insight": insight,
    }


# ── 커리어넷 API 프록시 ───────────────────────────────────────────────────────

@app.get("/careers")
async def get_careers(keyword: str):
    profession_hint = _PROFESSION_HINT.get(keyword, "")

    # pageIndex 무시됨 → 다양한 검색어로 각 20개씩 병렬 요청해 커버리지 확보
    search_terms = list(dict.fromkeys(filter(None, [keyword, profession_hint])))

    try:
        async with httpx.AsyncClient(timeout=5.0) as http:
            reqs = [
                http.get(CAREER_NET_BASE, params={
                    "apiKey": CAREER_NET_KEY, "svcType": "api", "svcCode": "JOB",
                    "contentType": "json", "keyword": term,
                })
                for term in search_terms
            ]
            responses = await asyncio.gather(*reqs, return_exceptions=True)

        # 중복 제거 (jobdicSeq 기준)
        all_jobs: list = []
        seen: set = set()
        for resp in responses:
            if isinstance(resp, Exception):
                continue
            content = (resp.json().get("dataSearch") or {}).get("content") or []
            for job in content:
                uid = str(job.get("jobdicSeq") or job.get("job", ""))
                if uid not in seen:
                    seen.add(uid)
                    all_jobs.append(job)

        if profession_hint:
            # 1차: profession 필드 strict 필터 (오탐 방지)
            jobs = [j for j in all_jobs if profession_hint in (j.get("profession") or "")]

            # 2차: 매칭된 항목의 similarJob에서 추가 직업명 추출
            if len(jobs) < 6:
                seen_names = {j.get("job", "") for j in jobs}
                for base in jobs[:3]:
                    for sj in (base.get("similarJob") or "").split(","):
                        sj = sj.strip()
                        if sj and sj not in seen_names and len(jobs) < 6:
                            seen_names.add(sj)
                            jobs.append({"job": sj, "jobdicSeq": f"sim_{sj}"})
        else:
            # profession_hint 없는 관심분야 → 프론트 CAREER_MAP 사용
            jobs = []

        is_partial = bool(profession_hint) and len(jobs) < 3
        return {"jobs": jobs[:6], "keyword": keyword, "has_hint": bool(profession_hint), "is_partial": is_partial}
    except Exception:
        return {"jobs": [], "keyword": keyword}


class HomeActivitiesRequest(BaseModel):
    interests: list[str]
    messages:  list[Message]
    grade:     str = ""
    region:    str = ""


@app.post("/home-activities")
async def get_home_activities(req: HomeActivitiesRequest):
    conversation = "\n".join(
        f"{'학생' if m.role == 'user' else 'AI'}: {m.content}"
        for m in req.messages[-10:]  # 최근 10개만
    )
    prompt = (
        f"학생 정보: {req.grade}, {req.region}\n"
        f"관심분야: {', '.join(req.interests)}\n\n"
        f"대화 내용:\n{conversation}\n\n"
        "위 학생이 지금 당장 집에서 할 수 있는 구체적인 활동 4가지를 제안해줘.\n"
        "조건: 무료 또는 저비용, 인터넷/집에서 가능, 관심분야에 직접 연결, 구체적인 도구/웹사이트/방법 포함.\n"
        '반드시 JSON만: {"activities": ["활동1", "활동2", "활동3", "활동4"]}'
    )
    try:
        resp = await async_client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}],
        )
        result = json.loads(resp.content[0].text)
        return {"activities": result.get("activities", [])}
    except Exception:
        return {"activities": []}


@app.get("/majors")
async def get_majors(keyword: str):
    # MAJOR API는 현재 API 키로 데이터 반환 안 됨 → 커리어넷 링크 URL만 제공
    career_url = (
        "https://www.career.go.kr/cnet/front/base/major/FunMajorList.do"
        f"?searchKeyword={keyword}"
    )
    return {"majors": [], "keyword": keyword, "career_url": career_url}


# ── 정적 파일 서빙 (반드시 마지막) ───────────────────────────────────────────

app.mount("/", StaticFiles(directory="static", html=True), name="static")

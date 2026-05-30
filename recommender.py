import random
import pandas as pd
from data_loader import load_gifted, load_experience, INTEREST_MAP

ATTENDANCE_MAP = {
    "79001": "대면",
    "79002": "비대면",
    "79003": "대면+비대면",
}

# 지역 부족 시 자동 확장 매핑
NEARBY_REGIONS: dict[str, list[str]] = {
    "충남": ["대전", "세종"],
    "충북": ["대전", "세종"],
    "세종": ["대전", "충남"],
    "경남": ["부산", "울산", "대구"],
    "경북": ["대구", "경남"],
    "전남": ["광주", "전북"],
    "전북": ["광주", "전남"],
    "강원": ["경기"],
    "울산": ["부산", "경남"],
    "제주": [],  # 전국 대학영재교육원만 추가
}

# 전국 대학영재교육원 우선 검색 키워드
NATIONAL_UNIV_KEYWORDS = [
    "KAIST", "카이스트", "서울대", "연세대", "고려대",
    "포스텍", "POSTECH", "한양대", "성균관대", "인하대",
    "이화여대", "경희대", "부산대", "전남대", "충남대",
    "전북대", "경북대", "충북대",
]

TYPE_LIMITS = {"대학영재교육원": 2, "교육청영재교육원": 2, "영재학급": 2}
NATIONAL_SLOTS = 2   # 전국 대학영재교육원 최대 포함 수
LOCAL_THRESHOLD = 3  # 이 수 미만이면 인근 지역 확장


def _gifted_keywords(interests: list[str]) -> list[str]:
    keywords = []
    for interest in interests:
        keywords.extend(INTEREST_MAP.get(interest, {}).get("gifted", []))
    return list(dict.fromkeys(keywords))


def _job_keywords(interests: list[str]) -> list[str]:
    keywords = []
    for interest in interests:
        keywords.extend(INTEREST_MAP.get(interest, {}).get("job", []))
    return list(dict.fromkeys(keywords))


def _to_dict(row) -> dict:
    return {
        "기관명":   str(row.get("기관명",  "")),
        "기관유형": str(row.get("기관유형", "")),
        "모집영역": row.get("모집영역", ""),
        "홈페이지": row.get("홈페이지", ""),
        "주소":     row.get("주소",    ""),
    }


def _shuffled_rows(df: pd.DataFrame) -> list:
    return [row for _, row in df.sample(frac=1, random_state=None).iterrows()]


def recommend_gifted(
    region: str, interests: list[str], limit: int = 5
) -> tuple[list[dict], str | None]:
    df = load_gifted()
    keywords = _gifted_keywords(interests)
    kw_pattern = "|".join(keywords) if keywords else None

    def filter_region(region_str: str) -> pd.DataFrame:
        sub = df[df["시도"].str.contains(region_str, na=False)].copy()
        if kw_pattern:
            sub = sub[sub["모집영역"].str.contains(kw_pattern, na=False)]
        return sub

    local_df = filter_region(region)

    # ── 인근 지역 확장 ──────────────────────────────────────────────────────────
    expansion_used: list[str] = []
    expansion_dfs: list[pd.DataFrame] = []
    if len(local_df) < LOCAL_THRESHOLD:
        for nr in NEARBY_REGIONS.get(region, []):
            nr_df = filter_region(nr)
            if not nr_df.empty:
                expansion_used.append(nr)
                expansion_dfs.append(nr_df)

    # ── 전국 대학영재교육원 후보 (로컬+확장 지역 제외) ─────────────────────────
    univ_df = df[df["기관유형"] == "대학영재교육원"].copy()
    if kw_pattern:
        univ_df = univ_df[univ_df["모집영역"].str.contains(kw_pattern, na=False)]
    for r in [region] + expansion_used:
        univ_df = univ_df[~univ_df["시도"].str.contains(r, na=False)]

    known_pat = "|".join(NATIONAL_UNIV_KEYWORDS)
    known_mask = univ_df["기관명"].str.contains(known_pat, na=False)
    # 유명 대학 우선, 각 그룹 내부 셔플
    univ_rows = _shuffled_rows(univ_df[known_mask]) + _shuffled_rows(univ_df[~known_mask])

    # ── 선택 로직 ───────────────────────────────────────────────────────────────
    seen_names: set[str] = set()
    type_counts: dict[str, int] = {}
    results: list[dict] = []
    local_cnt = 0
    expand_cnt = 0

    def try_add(row, source: str, bypass_type: bool = False) -> bool:
        nonlocal local_cnt, expand_cnt
        name  = str(row.get("기관명",  ""))
        type_ = str(row.get("기관유형", ""))
        if name in seen_names:
            return False
        if not bypass_type and type_counts.get(type_, 0) >= TYPE_LIMITS.get(type_, 2):
            return False
        results.append(_to_dict(row))
        seen_names.add(name)
        type_counts[type_] = type_counts.get(type_, 0) + 1
        if source == "local":
            local_cnt += 1
        elif source == "expansion":
            expand_cnt += 1
        return True

    # 전국 대학 슬롯 수만큼 로컬 한도 조정
    local_limit = limit - min(NATIONAL_SLOTS, len(univ_rows))

    # 로컬: 타입별 셔플 후 선택
    for inst_type in ["대학영재교육원", "교육청영재교육원", "영재학급"]:
        for row in _shuffled_rows(local_df[local_df["기관유형"] == inst_type]):
            if len(results) >= local_limit:
                break
            try_add(row, "local")

    # 확장 지역: 타입별 셔플 후 선택
    if expansion_dfs:
        exp_df = pd.concat(expansion_dfs).drop_duplicates(subset=["기관명"])
        for inst_type in ["대학영재교육원", "교육청영재교육원", "영재학급"]:
            for row in _shuffled_rows(exp_df[exp_df["기관유형"] == inst_type]):
                if len(results) >= local_limit:
                    break
                try_add(row, "expansion")

    # 전국 대학영재교육원 1~2개 추가
    univ_added = 0
    for row in univ_rows:
        if len(results) >= limit or univ_added >= NATIONAL_SLOTS:
            break
        if try_add(row, "national", bypass_type=True):
            univ_added += 1

    # ── 지역 확장 안내 메시지 ────────────────────────────────────────────────────
    region_note: str | None = None
    if expansion_used or univ_added > 0:
        parts: list[str] = []
        if local_cnt > 0:
            parts.append(f"{region} {local_cnt}개")
        if expand_cnt > 0:
            parts.append(f"인근 {'·'.join(expansion_used)} {expand_cnt}개")
        if univ_added > 0:
            parts.append(f"전국 대학영재교육원 {univ_added}개")
        region_note = " + ".join(parts)

    return results, region_note


def recommend_experience(
    region: str, interests: list[str], grade: str, limit: int = 5
) -> tuple[list[dict], bool]:
    """Returns (results, is_fallback). is_fallback=True 이면 전국 비대면 대체."""
    df = load_experience()

    if grade == "중학교":
        df = df[df["중학교대상여부"] == "Y"]
    elif grade == "고등학교":
        df = df[df["고등학교대상여부"] == "Y"]

    def to_records(sub: pd.DataFrame, n: int) -> list[dict]:
        out = []
        for _, row in sub.head(n).iterrows():
            attend_code = str(row.get("대면비대면구분", ""))
            out.append({
                "체험프로그램명": row["체험프로그램명"],
                "체험처명":     row["체험처명"],
                "직업유형":     row["체험프로그램 직업유형"],
                "체험지역명":   row["체험지역명"],
                "대면비대면구분": ATTENDANCE_MAP.get(attend_code, attend_code),
                "유무료구분":   row.get("유무료구분", ""),
            })
        return out

    keywords = _job_keywords(interests)
    if keywords:
        kw_pattern = "|".join(keywords)
        filtered = df[df["체험프로그램 직업유형"].str.contains(kw_pattern, case=False, na=False)]
    else:
        filtered = df

    region_mask = filtered["체험지역명"].str.contains(region, na=False)
    online_mask = filtered["대면비대면구분"].isin(["79002", "79003"])
    combined = pd.concat([filtered[region_mask], filtered[online_mask & ~region_mask]]).drop_duplicates()

    if not combined.empty:
        return to_records(combined, limit), False

    # fallback: 키워드 무관 전국 비대면 최대 3개
    online_all = df[df["대면비대면구분"].isin(["79002", "79003"])].sample(frac=1, random_state=None)
    if not online_all.empty:
        return to_records(online_all, 3), True

    return [], False


def recommend(region: str, interests: list[str], grade: str) -> dict:
    gifted, region_note   = recommend_gifted(region, interests)
    experience, exp_fallback = recommend_experience(region, interests, grade)
    result: dict = {
        "영재교육기관":    gifted,
        "진로체험프로그램": experience,
        "데이터출처": {
            "영재교육기관": "한국교육개발원 전국영재교육기관현황 (2023.05.01 기준)",
            "진로체험":    "교육부 진로체험망 꿈길",
            "안내":       "최신 모집일정은 각 기관 홈페이지에서 확인하세요",
        },
    }
    if region_note:
        result["지역확장안내"] = region_note
    if exp_fallback:
        result["체험확장안내"] = True
    return result


if __name__ == "__main__":
    import sys, io, json
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

    print("=== 샘플 테스트: 지역=경북, 관심=컴퓨터, 학년=중학교 ===\n")
    result = recommend("경북", ["컴퓨터"], "중학교")

    print(f"[지역확장안내] {result.get('지역확장안내', '없음')}\n")

    print("[영재교육기관]")
    for i, item in enumerate(result["영재교육기관"], 1):
        print(f"  {i}. [{item['기관유형']}] {item['기관명']}")
        print(f"     모집영역: {item['모집영역']}")
        print(f"     주소: {item['주소']}")

    print("\n[진로체험프로그램]")
    for i, item in enumerate(result["진로체험프로그램"], 1):
        print(f"  {i}. {item['체험프로그램명']}")
        print(f"     체험처: {item['체험처명']} / 지역: {item['체험지역명']}")
        print(f"     {item['대면비대면구분']} / {item['유무료구분']}")

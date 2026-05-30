import pandas as pd
from data_loader import load_gifted, load_experience, INTEREST_MAP

ATTENDANCE_MAP = {
    "79001": "대면",
    "79002": "비대면",
    "79003": "대면+비대면",
}

INSTITUTION_ORDER = {"대학영재교육원": 0, "교육청영재교육원": 1, "영재학급": 2}


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


def recommend_gifted(region: str, interests: list[str], limit: int = 5) -> list[dict]:
    df = load_gifted()
    df = df[df["시도"].str.contains(region, na=False)].copy()

    keywords = _gifted_keywords(interests)
    if keywords:
        kw_pattern = "|".join(keywords)
        df = df[df["모집영역"].str.contains(kw_pattern, na=False)]

    df["_order"] = df["기관유형"].map(INSTITUTION_ORDER).fillna(9)
    df = df.sort_values("_order").reset_index(drop=True)

    TYPE_LIMITS = {"대학영재교육원": 2, "교육청영재교육원": 2, "영재학급": 1}
    type_counts: dict[str, int] = {}
    seen_names: set[str] = set()
    seen_areas: set[str] = set()
    results: list[dict] = []

    all_rows = [row for _, row in df.iterrows()]

    def try_add(row) -> bool:
        name  = str(row.get("기관명",  ""))
        type_ = str(row.get("기관유형", ""))
        if name in seen_names:
            return False
        if type_counts.get(type_, 0) >= TYPE_LIMITS.get(type_, 1):
            return False
        areas = {a.strip() for a in str(row.get("모집영역", "")).split(",") if a.strip()}
        results.append({
            "기관명":   name,
            "기관유형": type_,
            "모집영역": row.get("모집영역", ""),
            "홈페이지": row.get("홈페이지", ""),
            "주소":     row.get("주소",    ""),
        })
        seen_names.add(name)
        seen_areas.update(areas)
        type_counts[type_] = type_counts.get(type_, 0) + 1
        return True

    # 1차: 모집영역이 겹치지 않는 기관 우선
    for row in all_rows:
        if len(results) >= limit:
            break
        areas = {a.strip() for a in str(row.get("모집영역", "")).split(",") if a.strip()}
        if not (areas & seen_areas):
            try_add(row)

    # 2차: 나머지 슬롯 채우기
    for row in all_rows:
        if len(results) >= limit:
            break
        try_add(row)

    return results


def recommend_experience(
    region: str, interests: list[str], grade: str, limit: int = 5
) -> list[dict]:
    df = load_experience()

    if grade == "중학교":
        df = df[df["중학교대상여부"] == "Y"]
    elif grade == "고등학교":
        df = df[df["고등학교대상여부"] == "Y"]

    keywords = _job_keywords(interests)
    if keywords:
        kw_pattern = "|".join(keywords)
        df = df[df["체험프로그램 직업유형"].str.contains(kw_pattern, case=False, na=False)]

    region_mask = df["체험지역명"].str.contains(region, na=False)
    regional = df[region_mask]

    online_mask = df["대면비대면구분"].isin(["79002", "79003"])
    online = df[online_mask & ~region_mask]

    combined = pd.concat([regional, online]).drop_duplicates()

    results = []
    for _, row in combined.head(limit).iterrows():
        attend_code = str(row.get("대면비대면구분", ""))
        results.append({
            "체험프로그램명": row["체험프로그램명"],
            "체험처명": row["체험처명"],
            "직업유형": row["체험프로그램 직업유형"],
            "체험지역명": row["체험지역명"],
            "대면비대면구분": ATTENDANCE_MAP.get(attend_code, attend_code),
            "유무료구분": row.get("유무료구분", ""),
        })
    return results


def recommend(
    region: str, interests: list[str], grade: str
) -> dict:
    gifted = recommend_gifted(region, interests)
    experience = recommend_experience(region, interests, grade)
    return {
        "영재교육기관": gifted,
        "진로체험프로그램": experience,
        "데이터출처": {
            "영재교육기관": "한국교육개발원 전국영재교육기관현황 (2023.05.01 기준)",
            "진로체험": "교육부 진로체험망 꿈길",
            "안내": "최신 모집일정은 각 기관 홈페이지에서 확인하세요",
        },
    }


if __name__ == "__main__":
    import sys, io, json
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

    print("=== 샘플 테스트: 지역=경북, 관심=컴퓨터, 학년=중학교 ===\n")
    result = recommend("경북", ["컴퓨터"], "중학교")

    print("[영재교육기관]")
    for i, item in enumerate(result["영재교육기관"], 1):
        print(f"  {i}. [{item['기관유형']}] {item['기관명']}")
        print(f"     모집영역: {item['모집영역']}")
        print(f"     홈페이지: {item['홈페이지']}")
        print(f"     주소: {item['주소']}")

    print(f"\n[진로체험프로그램]")
    for i, item in enumerate(result["진로체험프로그램"], 1):
        print(f"  {i}. {item['체험프로그램명']}")
        print(f"     체험처: {item['체험처명']} / 지역: {item['체험지역명']}")
        print(f"     직업유형: {item['직업유형']}")
        print(f"     {item['대면비대면구분']} / {item['유무료구분']}")

    print(f"\n[데이터출처]")
    for k, v in result["데이터출처"].items():
        print(f"  {k}: {v}")

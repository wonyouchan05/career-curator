import os
import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

INTEREST_MAP = {
    # ── 기존 11개 ──────────────────────────────────────────────────────────────
    "수학":       {"gifted": ["수학", "수.과학", "융합"],
                  "job": ["수학", "통계"]},
    "과학":       {"gifted": ["과학", "수.과학", "융합"],
                  "job": ["과학", "화학", "물리", "생물"]},
    "컴퓨터":     {"gifted": ["정보과학", "수학", "융합"],
                  "job": ["소프트웨어", "컴퓨터", "AI", "데이터"]},
    "AI":         {"gifted": ["정보과학", "융합", "수학"],
                  "job": ["인공지능", "AI", "소프트웨어", "데이터"]},
    "발명":       {"gifted": ["발명", "융합", "과학"],
                  "job": ["발명", "특허", "기계", "로봇"]},
    "로봇":       {"gifted": ["정보과학", "융합", "과학", "수학"],
                  "job": ["로봇", "기계", "전자"]},
    "미술":       {"gifted": ["미술", "문화"],
                  "job": ["미술", "디자인", "미디어"]},
    "음악":       {"gifted": ["음악", "문화"],
                  "job": ["음악", "예술"]},
    "영어":       {"gifted": ["외국어", "인문사회", "융합"],
                  "job": ["외국어", "번역", "통역"]},
    "인문":       {"gifted": ["인문사회", "융합"],
                  "job": ["인문", "사회", "역사", "철학"]},
    "체육":       {"gifted": ["체육", "융합", "과학"],
                  "job": ["체육", "스포츠(?!직)"]},
    # ── 추가 20개 ──────────────────────────────────────────────────────────────
    "문제해결":   {"gifted": ["발명", "융합", "인문사회"],
                  "job": ["발명", "설계", "기획"]},
    "일상개선":   {"gifted": ["발명", "융합"],
                  "job": ["발명", "생활", "서비스"]},
    "아이디어":   {"gifted": ["발명", "융합"],
                  "job": ["발명", "기획", "디자인"]},
    "코딩":       {"gifted": ["정보과학", "수학", "융합"],
                  "job": ["소프트웨어", "컴퓨터", "프로그래밍"]},
    "프로그래밍": {"gifted": ["정보과학", "융합"],
                  "job": ["소프트웨어", "컴퓨터", "데이터"]},
    "게임":       {"gifted": ["정보과학", "융합"],
                  "job": ["게임", "소프트웨어"]},
    "건축":       {"gifted": ["수학", "과학", "융합"],
                  "job": ["건축", "설계", "디자인"]},
    "경제":       {"gifted": ["수학", "인문사회", "융합"],
                  "job": ["경제", "금융", "경영"]},
    "심리":       {"gifted": ["인문사회", "융합"],
                  "job": ["심리", "상담", "사회"]},
    "환경":       {"gifted": ["과학", "수.과학", "융합"],
                  "job": ["환경", "생태", "지구과학"]},
    "의학":       {"gifted": ["과학", "수.과학", "융합"],
                  "job": ["의학", "생명과학", "바이오"]},
    "요리":       {"gifted": ["문화", "융합"],
                  "job": ["요리", "식품", "영양"]},
    "패션":       {"gifted": ["미술", "문화", "융합"],
                  "job": ["패션", "디자인", "미술"]},
    "영상":       {"gifted": ["미술", "정보과학", "융합"],
                  "job": ["영상", "미디어", "콘텐츠"]},
    "글쓰기":     {"gifted": ["인문사회", "외국어", "융합"],
                  "job": ["작가", "언론", "출판"]},
    "천문":       {"gifted": ["과학", "수학", "수.과학", "융합"],
                  "job": ["천문", "우주", "물리"]},
    "로봇공학":   {"gifted": ["정보과학", "융합", "과학", "수학"],
                  "job": ["로봇", "기계", "전자"]},
    "생명과학":   {"gifted": ["과학", "수.과학", "융합"],
                  "job": ["생명과학", "바이오", "의학"]},
    "사진":       {"gifted": ["미술", "문화", "융합"],
                  "job": ["사진", "미디어", "디자인"]},
    "스타트업":   {"gifted": ["발명", "융합", "정보과학"],
                  "job": ["창업", "기획", "경영"]},
    # ── 군사/체육 ──────────────────────────────────────────────────────────────
    "태권도":     {"gifted": ["체육", "융합", "발명"],
                  "job": ["체육", "스포츠(?!직)", "무도"]},
    "군인":       {"gifted": ["체육", "융합", "발명"],
                  "job": ["군인", "체육", "리더십"]},
    "특전부사관": {"gifted": ["체육", "융합", "발명"],
                  "job": ["군인", "체육", "리더십"]},
    # ── 과학 세분화 ────────────────────────────────────────────────────────────
    "화학":       {"gifted": ["과학", "수.과학", "융합"],
                  "job": ["화학", "화학공학", "제약"]},
    "바이러스":   {"gifted": ["과학", "수.과학", "융합"],
                  "job": ["생명과학", "바이오", "의학", "바이러스"]},
    "생물":       {"gifted": ["과학", "수.과학"],
                  "job": ["생명과학", "바이오", "생물"]},
    "물리":       {"gifted": ["과학", "수.과학", "융합"],
                  "job": ["물리", "공학", "천문"]},
    "지구과학":   {"gifted": ["과학", "융합"],
                  "job": ["환경", "지구과학", "기상"]},
    "나노":       {"gifted": ["과학", "융합", "수.과학"],
                  "job": ["나노", "신소재", "화학"]},
    "우주":       {"gifted": ["과학", "수.과학"],
                  "job": ["천문", "우주", "항공"]},
    "전자":       {"gifted": ["정보과학", "융합"],
                  "job": ["전자", "반도체", "전기"]},
    "반도체":     {"gifted": ["정보과학", "과학", "융합"],
                  "job": ["반도체", "전자", "공학"]},
}

_gifted_df = None
_experience_df = None
_school_df = None


def load_gifted() -> pd.DataFrame:
    global _gifted_df
    if _gifted_df is None:
        path = os.path.join(DATA_DIR, "한국교육개발원_전국영재교육기관현황_20230501.csv")
        _gifted_df = pd.read_csv(path, encoding="cp949")
        _gifted_df.columns = _gifted_df.columns.str.strip()
        _gifted_df["모집영역"] = _gifted_df["모집영역"].fillna("").str.strip().str.rstrip(",")
    return _gifted_df


def load_experience() -> pd.DataFrame:
    global _experience_df
    if _experience_df is None:
        p1 = os.path.join(DATA_DIR, "체험프로그램 목록.xls")
        p2 = os.path.join(DATA_DIR, "체험프로그램 목록 (1).xls")
        df1 = pd.read_excel(p1, header=1)
        df2 = pd.read_excel(p2, header=1)
        _experience_df = pd.concat([df1, df2], ignore_index=True)
        _experience_df.columns = _experience_df.columns.str.strip()
        for col in ["중학교대상여부", "고등학교대상여부", "초등학교대상여부",
                    "대면비대면구분", "유무료구분", "체험지역명",
                    "체험프로그램 직업유형", "체험프로그램명", "체험처명"]:
            if col in _experience_df.columns:
                _experience_df[col] = _experience_df[col].fillna("").astype(str).str.strip()
    return _experience_df


def load_school() -> pd.DataFrame:
    global _school_df
    if _school_df is None:
        path = os.path.join(DATA_DIR, "학교기본정보(중)_전체.xlsx")
        _school_df = pd.read_excel(path)
        _school_df.columns = _school_df.columns.str.strip()
        _school_df["학교명"] = _school_df["학교명"].fillna("").astype(str).str.strip()
        _school_df["시도교육청"] = _school_df["시도교육청"].fillna("").astype(str).str.strip()
    return _school_df


SIDO_MAP = {
    "서울특별시": "서울", "부산광역시": "부산", "대구광역시": "대구",
    "인천광역시": "인천", "광주광역시": "광주", "대전광역시": "대전",
    "울산광역시": "울산", "세종특별자치시": "세종", "경기도": "경기",
    "강원도": "강원", "강원특별자치도": "강원", "충청북도": "충북",
    "충청남도": "충남", "전라북도": "전북", "전북특별자치도": "전북",
    "전라남도": "전남", "경상북도": "경북", "경상남도": "경남",
    "제주특별자치도": "제주",
}


def school_to_region(school_name: str) -> str | None:
    df = load_school()
    matched = df[df["학교명"].str.contains(school_name, na=False)]
    if matched.empty:
        return None
    sido_full = matched.iloc[0]["시도교육청"]
    for full, short in SIDO_MAP.items():
        if full in sido_full:
            return short
    return None


if __name__ == "__main__":
    print("=== 영재교육기관 현황 ===")
    gifted = load_gifted()
    print(f"총 {len(gifted)}행")
    print(gifted.columns.tolist())
    print(gifted.head(3).to_string())

    print("\n=== 진로체험 프로그램 ===")
    exp = load_experience()
    print(f"총 {len(exp)}행")
    print(exp.columns.tolist())
    print(exp.head(3).to_string())

    print("\n=== 학교기본정보 ===")
    school = load_school()
    print(f"총 {len(school)}행")
    print(school.columns.tolist())
    print(school.head(3).to_string())

    print("\n=== 학교 → 지역 변환 테스트 ===")
    test_schools = ["경주중학교", "서울중학교", "광주중학교"]
    for s in test_schools:
        print(f"  {s} → {school_to_region(s)}")

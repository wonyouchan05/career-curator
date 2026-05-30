/* ── 상태 ────────────────────────────────────────────────── */
const state = {
  userInfo:          { school: '', grade: '', region: '' },
  messages:          [],   // { role, content }
  autoRecommend:     null,
  detectedInterests: [],
  gapLoaded:         false,
  gapChart:          null,
  sending:           false,
};

/* ── 관심분야별 직업 목록 ──────────────────────────────────── */
const CAREER_MAP = {
  수학:       ["수학교사", "통계학자", "데이터분석가", "보험계리사", "금융분석가"],
  과학:       ["과학교사", "연구원", "화학자", "물리학자", "환경과학자"],
  컴퓨터:     ["소프트웨어개발자", "앱개발자", "시스템엔지니어", "데이터분석가", "IT컨설턴트"],
  AI:         ["AI연구원", "머신러닝엔지니어", "데이터사이언티스트", "AI서비스기획자", "로봇공학자"],
  코딩:       ["소프트웨어개발자", "웹개발자", "앱개발자", "게임개발자", "보안전문가"],
  게임:       ["게임개발자", "게임디자이너", "게임기획자", "3D모델러", "게임테스터"],
  발명:       ["발명가", "특허전문가", "제품디자이너", "기계공학자", "창업가"],
  문제해결:   ["사회적기업가", "정책기획자", "컨설턴트", "프로젝트매니저", "UX디자이너"],
  사회문제:   ["사회복지사", "NGO활동가", "정책연구원", "사회적기업가", "공무원"],
  사회문제해결:["사회적기업가", "AI정책연구원", "데이터기반정책가", "NGO활동가", "공공서비스기획자"],
  인공지능사회:["AI윤리연구원", "AI정책기획자", "데이터사이언티스트", "사회혁신가", "AI서비스기획자"],
  일상개선:   ["UX디자이너", "제품기획자", "사용자연구원", "서비스디자이너", "창업가"],
  로봇:       ["로봇공학자", "자동화엔지니어", "AI연구원", "기계공학자", "드론전문가"],
  미술:       ["그래픽디자이너", "일러스트레이터", "UI디자이너", "영상편집자", "아트디렉터"],
  영상:       ["영상PD", "유튜브크리에이터", "영상편집자", "영화감독", "미디어기획자"],
  음악:       ["음악가", "작곡가", "음향엔지니어", "음악교사", "뮤직프로듀서"],
  영어:       ["번역가", "통역사", "외교관", "국제기구활동가", "영어교사"],
  인문:       ["작가", "역사학자", "철학자", "사회학자", "저널리스트"],
  글쓰기:     ["작가", "기자", "카피라이터", "콘텐츠크리에이터", "출판편집자"],
  경제:       ["경제학자", "금융분석가", "투자전문가", "경영컨설턴트", "회계사"],
  심리:       ["심리상담사", "임상심리사", "정신건강전문가", "HRD전문가", "코치"],
  환경:       ["환경공학자", "기후과학자", "환경정책연구원", "지속가능경영전문가", "생태학자"],
  의학:       ["의사", "간호사", "의생명과학자", "약사", "의료기기개발자"],
  생명과학:   ["바이오연구원", "유전공학자", "제약연구원", "의생명과학자", "생물교사"],
  천문:       ["천문학자", "우주과학자", "항공우주엔지니어", "NASA연구원", "물리학자"],
  건축:       ["건축가", "인테리어디자이너", "도시계획가", "건설엔지니어", "조경설계사"],
  체육:       ["스포츠트레이너", "체육교사", "스포츠에이전트", "운동처방사", "스포츠마케터"],
  스타트업:   ["창업가", "벤처투자가", "제품기획자", "비즈니스개발자", "마케터"],
  패션:       ["패션디자이너", "스타일리스트", "패션MD", "의류브랜드기획자", "패션에디터"],
  요리:       ["셰프", "푸드스타일리스트", "식품연구원", "영양사", "푸드크리에이터"],
  태권도:     ["체육교사", "태권도사범", "스포츠트레이너", "무도지도자", "체육행정가"],
  군인:       ["부사관", "장교", "군무원", "경호원", "소방관"],
  특전부사관: ["특전부사관", "부사관", "경호원", "소방관", "경찰관"],
};

/* ── 관심분야별 집에서 할 수 있는 활동 ────────────────────── */
const HOME_ACTIVITIES = {
  수학:       ["칸아카데미(khanacademy.org)로 수학 무료 학습", "수학올림피아드 기출문제 풀어보기", "엑셀로 데이터 통계 분석해보기"],
  과학:       ["집에서 할 수 있는 과학실험 키트 구매 (산화환원, 전기분해 등)", "유튜브 '과학쿠키' 채널로 개념 탐구", "국립과천과학관 온라인 콘텐츠 활용"],
  컴퓨터:     ["파이썬 설치하고 코딩 시작 (점프투파이썬 무료)", "scratch.mit.edu에서 게임 만들어보기", "앱인벤터로 간단한 앱 만들기"],
  AI:         ["구글 티처블머신으로 AI 모델 만들어보기 (teachablemachine.withgoogle.com)", "ChatGPT로 간단한 챗봇 아이디어 실험하기", "캐글(kaggle.com) 입문 튜토리얼 따라하기"],
  코딩:       ["파이썬 설치하고 점프투파이썬으로 무료 학습", "백준 온라인 저지(boj.kr)에서 문제 풀기", "깃허브 계정 만들고 포트폴리오 시작"],
  게임:       ["유니티(Unity) 무료 버전으로 게임 개발 입문", "RPG메이커 체험판으로 게임 기획", "게임기획서 직접 써보기 (종이로도 OK)"],
  발명:       ["아두이노 스타터 키트로 LED/센서 실험", "레고로 메커니즘 설계해보기", "생활 속 불편한 점 찾아서 해결 아이디어 스케치"],
  문제해결:   ["주변 불편함 찾아서 해결책 아이디어 노트 만들기", "디자인씽킹 방법론으로 문제 정의해보기", "아두이노로 생활 불편 해결 프로토타입 만들기"],
  사회문제:   ["사회문제 관련 TED 강연 보고 느낀 점 기록", "주변 사회문제 찾아서 해결책 아이디어 정리", "사회적기업 사례 조사하고 비즈니스모델 분석"],
  사회문제해결:["생활 속 불편함을 AI로 해결하는 아이디어 기획해보기", "구글 티처블머신으로 사회문제 해결 AI 모델 실험", "마이크로소프트 AI for Good 사례 조사"],
  인공지능사회:["AI 윤리 관련 책 읽기 (AI 지도 원리 등)", "구글 티처블머신으로 이미지 분류 AI 만들기", "AI가 사회에 미치는 영향 에세이 써보기"],
  미술:       ["클립스튜디오 체험판으로 디지털 드로잉 시작", "유튜브로 수채화/펜화 따라 그리기", "캔바(canva.com)로 포스터 디자인 해보기"],
  영상:       ["다빈치 리졸브(무료)로 영상 편집 배우기", "스마트폰으로 단편영상 촬영/편집해보기", "유튜브 채널 만들어서 관심분야 영상 올리기"],
  음악:       ["개러지밴드(Mac/iPad 무료)로 작곡 입문", "유튜브로 기타/피아노 독학 시작", "무료 악보 사이트에서 연주 연습"],
  영어:       ["듀오링고로 매일 10분 영어 학습", "영어 유튜브 채널 자막 없이 듣기 도전", "영어로 일기 쓰기 (ChatGPT에게 첨삭 받기)"],
  환경:       ["집에서 탄소발자국 계산해보기", "텃밭 가꾸기 또는 식물 키우기 실험", "재활용 소재로 업사이클링 작품 만들기"],
  의학:       ["유튜브 '의학채널 비온뒤' 시청", "응급처치 유튜브 강의 보고 심폐소생술 배우기", "현미경 키트로 세포 관찰 실험"],
  생명과학:   ["현미경 키트로 직접 세포 관찰하기", "유튜브 생명과학 채널로 개념 탐구", "집에서 식물 성장 실험 기록하기"],
  천문:       ["스텔라리움(stellarium.org) 무료 앱으로 별 관찰", "NASA 홈페이지에서 우주 사진 탐구", "망원경 없이 맨눈으로 행성 관찰 도전"],
  체육:       ["유튜브로 홈트레이닝 루틴 만들기", "스포츠 경기 분석 일지 쓰기", "줄넘기/요가 등 실내 스포츠 루틴 개발"],
  경제:       ["용돈 가계부 앱으로 재무관리 시작", "모의 주식투자 앱으로 경제 공부", "유튜브 '슈카월드' 보고 경제 개념 정리"],
  심리:       ["MBTI/DISC 검사 무료로 해보고 결과 분석", "마음챙김 명상 앱(마보, 코끼리) 시도", "심리학 입문책 읽기 (청소년용 심리학)"],
  건축:       ["스케치업(무료)으로 3D 건물 설계 입문", "레고로 건축물 만들고 설계도 그려보기", "유명 건축물 사진 수집 후 분석 일지 쓰기"],
  스타트업:   ["린 캔버스로 나만의 창업 아이디어 정리", "네이버 블로그/인스타로 관심분야 콘텐츠 만들기", "학교 창업동아리 또는 비즈쿨 프로그램 참여"],
  패션:       ["클로버추얼 패션 앱으로 스타일링 연습", "좋아하는 패션 브랜드 분석 일지 쓰기", "손바느질로 간단한 패치워크 만들기"],
  요리:       ["유튜브로 간단한 요리 레시피 따라 만들기", "나만의 레시피 노트 만들기", "식재료 원산지/영양성분 공부하기"],
  글쓰기:     ["매일 짧은 글쓰기 연습 (일기, 수필, 단편)", "관심 주제로 블로그 시작하기", "좋아하는 작가의 문체 분석해서 따라 써보기"],
  인문:       ["고전 소설/철학 입문서 읽기", "역사 유튜브 채널 보고 느낀 점 기록", "관심 주제로 에세이 써보기"],
  사진:       ["스마트폰으로 사진 구도 연습 (3분할 법칙)", "무료 편집 앱(스냅시드)으로 보정 연습", "일상 사진 포트폴리오 만들기"],
  태권도:     ["공인 품새 영상 보고 혼자 연습하기", "체력 기초훈련 루틴 만들기", "국군 체력측정 기준표로 목표 세우기"],
  군인:       ["국군 체력측정 기준표로 현재 체력 점검", "부사관 선발 기준 공식 사이트에서 조사", "리더십 관련 책 읽기"],
  특전부사관: ["특전사 공식 홈페이지에서 선발 기준 조사", "체력훈련 루틴 만들기", "국군 부사관학교 정보 찾아보기"],
};

/* ── DOM 참조 ──────────────────────────────────────────── */
const $ = id => document.getElementById(id);

/* ── 화면 전환 ──────────────────────────────────────────── */
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(`screen-${name}`).classList.add('active');

  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.screen === name);
  });

  if (name === 'gap' && !state.gapLoaded) loadGapChart();
}

// 네비 링크 & 로고 클릭
document.querySelectorAll('[data-screen]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    showScreen(el.dataset.screen);
  });
});

/* ── 화면1: 기본정보 입력 ────────────────────────────────── */
const schoolInput  = $('school-input');
const regionSelect = $('region-select');
const gradeSelect  = $('grade-select');
const schoolHint   = $('school-hint');

let schoolTimer = null;
schoolInput.addEventListener('input', () => {
  clearTimeout(schoolTimer);
  schoolHint.textContent = '';
  const val = schoolInput.value.trim();
  if (val.length < 2) return;

  schoolTimer = setTimeout(async () => {
    try {
      const res  = await fetch(`/school/${encodeURIComponent(val)}`);
      const data = await res.json();
      if (data.region) {
        regionSelect.value  = data.region;
        schoolHint.textContent = `✓ ${data.region}`;
      }
    } catch { /* 자동완성 실패는 무시 */ }
  }, 500);
});

$('form-start').addEventListener('submit', e => {
  e.preventDefault();
  const grade  = gradeSelect.value;
  const region = regionSelect.value;
  if (!grade)  { alert('학년을 선택해주세요.'); return; }
  if (!region) { alert('거주지역을 선택해주세요.'); return; }

  state.userInfo = { school: schoolInput.value.trim(), grade, region };
  state.messages = [];
  state.autoRecommend = null;
  state.detectedInterests = [];

  showScreen('chat');
  $('chat-label').textContent = `${region} · ${grade} AI 상담`;
  $('messages').innerHTML = '';
  $('recommend-banner').classList.remove('show');
  // 커리어넷 섹션 초기화
  $('section-careers').style.display = '';
  $('section-majors').style.display  = '';
  $('career-cards').innerHTML = '<div class="empty-msg">상담 완료 후 자동으로 불러옵니다.</div>';
  $('major-cards').innerHTML  = '<div class="empty-msg">상담 완료 후 자동으로 불러옵니다.</div>';
  $('career-count').textContent = '';
  $('major-count').textContent  = '';
  initChat();
});

/* ── 화면2: AI 상담 ─────────────────────────────────────── */
function addMessage(role, content) {
  const wrap = document.createElement('div');
  wrap.className = `msg ${role}`;

  if (role === 'ai') {
    wrap.innerHTML = `
      <div class="avatar">🤖</div>
      <div class="bubble">${escHtml(content)}</div>`;
  } else {
    wrap.innerHTML = `<div class="bubble">${escHtml(content)}</div>`;
  }
  $('messages').appendChild(wrap);
  scrollBottom();
}

function addStreamingBubble(role) {
  const wrap   = document.createElement('div');
  wrap.className = `msg ${role}`;
  if (role === 'ai') {
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = '🤖';
    wrap.appendChild(avatar);
  }
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  wrap.appendChild(bubble);
  $('messages').appendChild(wrap);
  scrollBottom();
  return bubble;
}

function showLoading() {
  const el = document.createElement('div');
  el.className = 'msg ai';
  el.id = 'loading-msg';
  el.innerHTML = `
    <div class="avatar">🤖</div>
    <div class="bubble dots"><span></span><span></span><span></span></div>`;
  $('messages').appendChild(el);
  scrollBottom();
}

function hideLoading() {
  const el = $('loading-msg');
  if (el) el.remove();
}

function scrollBottom() {
  const box = $('messages');
  box.scrollTop = box.scrollHeight;
}

async function sendToAPIStream(messages, onChunk, onMeta) {
  const res = await fetch('/chat/stream', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ messages, user_info: state.userInfo }),
  });
  if (!res.ok) throw new Error(await res.text());

  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let nlnl;
      while ((nlnl = buffer.indexOf('\n\n')) !== -1) {
        const line = buffer.slice(0, nlnl);
        buffer = buffer.slice(nlnl + 2);
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6);
        if (payload === '[DONE]') return;
        try {
          const obj = JSON.parse(payload);
          if (obj.type === 'text') onChunk(obj.chunk);
          else if (obj.type === 'meta') onMeta(obj);
        } catch { /* ignore parse errors */ }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

async function initChat() {
  setSending(true);
  showLoading();
  let bubble   = null;
  let fullText = '';

  try {
    await sendToAPIStream(
      [],
      (chunk) => {
        if (!bubble) { hideLoading(); bubble = addStreamingBubble('ai'); }
        fullText += chunk;
        bubble.textContent = fullText;
        scrollBottom();
      },
      (meta) => {
        state.messages.push({ role: 'assistant', content: fullText });
        handleRecommend({ ...meta, reply: fullText });
      }
    );
    if (!bubble) hideLoading();
  } catch (err) {
    hideLoading();
    addMessage('ai', '⚠️ 서버 연결에 문제가 생겼어요. 잠시 후 다시 시도해주세요.\n(' + err.message + ')');
  } finally {
    setSending(false);
  }
}

async function handleSend() {
  const text = $('chat-input').value.trim();
  if (!text || state.sending) return;

  $('chat-input').value = '';
  addMessage('user', text);
  state.messages.push({ role: 'user', content: text });

  setSending(true);
  showLoading();
  let bubble   = null;
  let fullText = '';

  try {
    await sendToAPIStream(
      state.messages,
      (chunk) => {
        if (!bubble) { hideLoading(); bubble = addStreamingBubble('ai'); }
        fullText += chunk;
        bubble.textContent = fullText;
        scrollBottom();
      },
      (meta) => {
        state.messages.push({ role: 'assistant', content: fullText });
        handleRecommend({ ...meta, reply: fullText });
      }
    );
    if (!bubble) hideLoading();
  } catch (err) {
    hideLoading();
    addMessage('ai', '⚠️ 오류가 발생했어요. 다시 시도해주세요.');
  } finally {
    setSending(false);
  }
}

function handleRecommend(data) {
  const userTurns = state.messages.filter(m => m.role === 'user').length;
  console.log(
    `[턴 확인] userTurns=${userTurns}` +
    ` | server turn_count=${data.turn_count}` +
    ` | detected=${JSON.stringify(data.detected_interests)}` +
    ` | auto_recommend=${data.auto_recommend ? '있음' : 'null'}`
  );

  if (data.auto_recommend) {
    state.autoRecommend = data.auto_recommend;
    console.log('[✓] state.autoRecommend 저장됨');
  }
  if (data.detected_interests?.length > 0) {
    state.detectedInterests = data.detected_interests;
  }

  if (data.turn_count >= 7 && data.detected_interests?.length > 0) {
    $('recommend-banner').classList.add('show');
    console.log('[✓] 결과 보기 버튼 표시됨 (turn_count=' + data.turn_count + ')');
  }
}

function setSending(val) {
  state.sending = val;
  $('btn-send').disabled      = val;
  $('chat-input').disabled    = val;
}

$('btn-send').addEventListener('click', handleSend);
$('chat-input').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
});
$('btn-back-chat').addEventListener('click', () => showScreen('home'));
$('btn-see-result').addEventListener('click', () => {
  renderResults();
  showScreen('result');
  renderCareerSection(state.detectedInterests);
  renderMajorSection(state.detectedInterests[0] || '');
  renderHomeActivities(state.detectedInterests);
});

/* ── 화면3: 추천 결과 ─────────────────────────────────────── */
function renderResults() {
  const rec       = state.autoRecommend;
  const region    = state.userInfo.region;
  const interests = state.detectedInterests;

  console.log('[renderResults] state.autoRecommend:', rec);

  // region-note 초기화
  const regionNoteEl = $('region-note');
  regionNoteEl.style.display = 'none';
  regionNoteEl.textContent = '';

  if (!rec) {
    $('result-title').textContent    = '상담을 먼저 진행해주세요 💬';
    $('result-subtitle').textContent = 'AI 상담을 7턴 이상 진행하면 맞춤 결과가 나타납니다.';
    $('gifted-cards').innerHTML  = '<div class="empty-msg">상담 후 결과가 표시됩니다.</div>';
    $('exp-cards').innerHTML     = '<div class="empty-msg">상담 후 결과가 표시됩니다.</div>';
    $('gifted-count').textContent = '0개';
    $('exp-count').textContent    = '0개';
    return;
  }

  $('result-title').textContent =
    `${region}에서 딱 맞는 기회를 찾았어요! 🎯`;
  $('result-subtitle').textContent =
    interests.length
      ? `관심분야 [${interests.join(', ')}] · 지역 [${region}] 기반 추천`
      : `지역 [${region}] 기반 추천`;

  const reasonText = `추천 근거: 관심분야 [${interests.join(', ')}] · 지역 [${region}]`;

  // 지역 확장 안내
  if (rec['지역확장안내']) {
    regionNoteEl.textContent = '📍 ' + rec['지역확장안내'];
    regionNoteEl.style.display = 'block';
  }

  // 영재교육기관 카드
  const gifted = rec['영재교육기관'] || [];
  const sectionGifted = $('section-gifted');
  const sectionExp    = $('section-exp');
  const sectionHome   = $('section-home-activities');

  if (gifted.length < 2) {
    $('gifted-count').textContent = gifted.length ? gifted.length + '개' : '';
    $('gifted-cards').innerHTML =
      '<div class="gifted-alt-msg">' +
      '<span class="gifted-alt-icon">💡</span>' +
      '<p>이 분야는 영재원보다 실전 활동이 더 중요해요!<br>' +
      '아래 진로체험과 집에서 할 활동을 참고해보세요 😊</p>' +
      '</div>';
    sectionGifted.classList.add('section-muted');
    sectionExp.classList.add('section-highlighted');
    sectionHome.classList.add('section-highlighted');
  } else {
    $('gifted-count').textContent = gifted.length + '개';
    $('gifted-cards').innerHTML = gifted.map(g => giftedCard(g, reasonText)).join('');
    sectionGifted.classList.remove('section-muted');
    sectionExp.classList.remove('section-highlighted');
    sectionHome.classList.remove('section-highlighted');
  }

  // 체험프로그램 카드
  const exps        = rec['진로체험프로그램'] || [];
  const expFallback = rec['체험확장안내'];

  if (exps.length === 0) {
    $('exp-count').textContent = '';
    $('exp-cards').innerHTML =
      '<div class="exp-alt-msg">' +
        '<span class="exp-alt-icon">💡</span>' +
        '<p>이 분야의 지역 체험프로그램 정보가 아직 부족해요 😊<br>' +
        '아래 집에서 할 수 있는 활동과 커리어넷을 참고해보세요!</p>' +
      '</div>';
    sectionExp.classList.add('section-muted');
    sectionHome.classList.add('section-highlighted');
  } else {
    $('exp-count').textContent = exps.length + '개';
    let expHtml = exps.map(x => expCard(x, reasonText)).join('');
    if (expFallback) {
      expHtml = '<p class="exp-fallback-note">📡 지역 데이터 부족 — 전국 비대면 프로그램으로 대체</p>' + expHtml;
    }
    $('exp-cards').innerHTML = expHtml;
    sectionExp.classList.remove('section-muted');
    sectionHome.classList.remove('section-highlighted');
  }
}

function giftedCard(g, reason) {
  const typeClass = {
    '대학영재교육원':  'type-univ',
    '교육청영재교육원': 'type-edu',
    '영재학급':       'type-class',
  }[g['기관유형']] || 'type-class';

  const fields = (g['모집영역'] || '')
    .split(',')
    .map(f => f.trim())
    .filter(Boolean)
    .map(f => `<span class="tag">${escHtml(f)}</span>`)
    .join('');

  const hpUrl  = (g['홈페이지'] || '').trim();
  const hpLink = isValidUrl(hpUrl)
    ? `<a href="${hpUrl}" target="_blank" rel="noopener" class="link-hp">홈페이지 →</a>`
    : '';

  const addr = g['주소'] ? `<span>📍 ${escHtml(g['주소'])}</span>` : '';

  return `
    <div class="card">
      <div class="card-top">
        <span class="card-title">${escHtml(g['기관명'])}</span>
        <span class="type-badge ${typeClass}">${escHtml(g['기관유형'])}</span>
      </div>
      <div class="tags">${fields}</div>
      <div class="card-meta">${addr}</div>
      ${hpLink}
      <div class="reason">${escHtml(reason)}</div>
    </div>`;
}

function expCard(x, reason) {
  const attend = x['대면비대면구분'] || '';
  const attendBadge = {
    '대면':      '<span class="badge badge-face">대면</span>',
    '비대면':    '<span class="badge badge-online">비대면</span>',
    '대면+비대면':'<span class="badge badge-hybrid">대면+비대면</span>',
  }[attend] || `<span class="badge badge-etc">${escHtml(attend)}</span>`;

  const fee = x['유무료구분'] || '';
  const feeBadge = fee.includes('무료') && !fee.includes('유료')
    ? '<span class="badge badge-free">무료</span>'
    : fee
      ? '<span class="badge badge-paid">유료</span>'
      : '';

  const job = x['직업유형'] ? `<span class="tag">${escHtml(x['직업유형'])}</span>` : '';

  return `
    <div class="card">
      <div class="badges">${attendBadge}${feeBadge}</div>
      <span class="card-title">${escHtml(x['체험프로그램명'])}</span>
      <div class="tags">${job}</div>
      <div class="card-meta">
        <span>🏢 ${escHtml(x['체험처명'])}</span>
        <span>📍 ${escHtml(x['체험지역명'])}</span>
      </div>
      <div class="reason">${escHtml(reason)}</div>
    </div>`;
}

$('btn-rechat').addEventListener('click', () => showScreen('chat'));

/* ── 직업·학과·집에서 할 수 있는 활동 ──────────────────────── */
function renderCareerSection(interests) {
  const seen = new Set();
  const jobs = [];
  for (const interest of interests) {
    for (const job of (CAREER_MAP[interest] || [])) {
      if (!seen.has(job) && jobs.length < 6) {
        seen.add(job);
        jobs.push(job);
      }
    }
  }

  if (!jobs.length) {
    $('section-careers').style.display = 'none';
    return;
  }

  $('section-careers').style.display = '';
  $('career-count').textContent = jobs.length + '개';
  $('career-cards').innerHTML =
    jobs.map(job => `
      <div class="card">
        <span class="card-title">👔 ${escHtml(job)}</span>
      </div>`).join('') +
    `<a href="https://www.career.go.kr/cnet/front/base/job/jobList.do"
        target="_blank" rel="noopener"
        class="btn-outline career-more-link">
       커리어넷에서 더 알아보기 →
     </a>`;
}

function renderMajorSection(keyword) {
  $('section-majors').style.display = '';
  $('major-count').textContent = '';
  const url = keyword
    ? `https://www.career.go.kr/cnet/front/base/major/FunMajorList.do?searchKeyword=${encodeURIComponent(keyword)}`
    : 'https://www.career.go.kr/cnet/front/base/major/FunMajorList.do';
  $('major-cards').innerHTML = `
    <div class="card career-link-card">
      <span class="card-title">🔗 커리어넷에서 직접 학과 탐색하기</span>
      ${keyword ? `<p class="card-desc">관심분야 [${escHtml(keyword)}] 관련 학과를 커리어넷에서 찾아보세요</p>` : ''}
      <a href="${escHtml(url)}" target="_blank" rel="noopener"
         class="btn-outline" style="margin-top:8px;font-size:13px">
        커리어넷 학과 탐색 →
      </a>
    </div>`;
}

function renderHomeActivities(interests) {
  const DEFAULT = ["유튜브로 관심분야 강의 찾아보기", "관련 책 도서관에서 빌려 읽기", "관심분야 블로그/커뮤니티 찾아보기"];
  const seen = new Set();
  const activities = [];
  const perInterest = interests.length === 1 ? 3 : 2;

  for (const interest of interests) {
    let count = 0;
    for (const act of (HOME_ACTIVITIES[interest] || [])) {
      if (!seen.has(act) && count < perInterest && activities.length < 3) {
        seen.add(act);
        activities.push(act);
        count++;
      }
    }
    if (activities.length >= 3) break;
  }

  const display = activities.length ? activities : DEFAULT;
  $('home-activity-list').innerHTML = display.map(text =>
    `<div class="home-activity-item">
       <span class="home-activity-icon">✅</span>
       <span>${escHtml(text)}</span>
     </div>`
  ).join('');
}

/* ── 화면4: 지역 격차 ─────────────────────────────────────── */
async function loadGapChart() {
  try {
    const res  = await fetch('/stats/regional-gap');
    const data = await res.json();
    const stats = data.regional_stats || [];

    $('gap-insight').textContent = '📊 ' + (data.insight || '');

    // 데이터를 기관수 내림차순으로 (이미 정렬되어 있지만 확인)
    const labels = stats.map(s => s['시도']);
    const values = stats.map(s => s['기관수']);
    const colors = stats.map(s => s['시도'] === '서울' ? '#EF4444' : '#4F46E5');

    if (state.gapChart) state.gapChart.destroy();

    state.gapChart = new Chart($('gap-chart'), {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: '영재교육기관 수',
          data: values,
          backgroundColor: colors,
          borderRadius: 5,
          borderSkipped: false,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.parsed.x}개`,
            },
          },
        },
        scales: {
          x: {
            grid:  { color: '#F3F4F6' },
            ticks: { font: { family: "'Noto Sans KR', sans-serif", size: 12 }, color: '#6B7280' },
          },
          y: {
            grid:  { display: false },
            ticks: { font: { family: "'Noto Sans KR', sans-serif", size: 13 }, color: '#374151' },
          },
        },
      },
    });
    state.gapLoaded = true;
  } catch (err) {
    $('gap-insight').textContent = '데이터를 불러오는 데 실패했습니다.';
  }
}

$('btn-to-home').addEventListener('click', () => showScreen('home'));

/* ── 유틸 ──────────────────────────────────────────────── */
function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isValidUrl(url) {
  return Boolean(url) && url !== 'nan' && url.length > 4 && (
    url.startsWith('http') || url.startsWith('www')
  );
}

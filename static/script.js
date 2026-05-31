/* ── 상태 ────────────────────────────────────────────────── */
const state = {
  userInfo:          { school: '', grade: '', region: '' },
  messages:          [],   // { role, content }
  autoRecommend:     null,
  detectedInterests: [],
  gapLoaded:         false,
  gapChart:          null,
  homeGapLoaded:     false,
  homeChart:         null,
  sending:           false,
};

/* ── 관심분야별 집에서 할 수 있는 활동 ────────────────────── */
const HOME_ACTIVITIES = {
  수학:       ["칸아카데미(khanacademy.org)로 수학 무료 학습", "수학올림피아드 기출문제 풀어보기", "엑셀로 데이터 통계 분석해보기"],
  과학:       ["집에서 할 수 있는 과학실험 키트 구매", "유튜브 과학쿠키 채널로 개념 탐구", "국립과천과학관 온라인 콘텐츠 활용"],
  화학:       ["화학실험 키트로 산화환원 실험", "유튜브로 화학 반응 원리 탐구", "주기율표 암기 챌린지"],
  바이러스:   ["유튜브로 바이러스/면역 원리 공부", "생명과학 교과서 심화 탐구", "현미경 키트로 세포 관찰"],
  생명과학:   ["현미경 키트로 세포/미생물 관찰 실험", "유튜브 과학쿠키 생명과학 탐구", "바이오 관련 책 읽기"],
  생물:       ["현미경 키트로 생물 관찰 실험", "식물 키우면서 성장 일지 쓰기", "유튜브로 생물 개념 탐구"],
  물리:       ["아두이노로 전기/자기 실험", "유튜브로 물리 개념 시각화 탐구", "집에서 간단한 역학 실험"],
  컴퓨터:     ["파이썬 설치하고 코딩 시작(점프투파이썬 무료)", "scratch.mit.edu에서 게임 만들기", "앱인벤터로 간단한 앱 만들기"],
  AI:         ["구글 티처블머신으로 AI 모델 만들기(teachablemachine.withgoogle.com)", "ChatGPT API로 간단한 챗봇 만들기", "캐글(kaggle.com) 입문 튜토리얼"],
  코딩:       ["파이썬 설치하고 점프투파이썬 무료 학습", "백준 온라인 저지(boj.kr)에서 문제 풀기", "깃허브 계정 만들고 포트폴리오 시작"],
  게임:       ["유니티 무료 버전으로 게임 개발 입문", "RPG메이커 체험판으로 게임 기획", "게임기획서 직접 써보기"],
  발명:       ["아두이노 스타터 키트로 LED/센서 실험", "레고로 메커니즘 설계", "생활 속 불편한 점 찾아서 해결 아이디어 스케치"],
  문제해결:   ["주변 불편함 찾아서 해결책 노트 만들기", "디자인씽킹으로 문제 정의해보기", "아두이노로 생활 불편 해결 프로토타입"],
  사회문제:   ["사회문제 TED 강연 보고 느낀 점 기록", "사회적기업 사례 조사하기", "주변 사회문제 해결책 아이디어 정리"],
  미술:       ["클립스튜디오 체험판으로 디지털 드로잉", "유튜브로 수채화/펜화 따라 그리기", "캔바(canva.com)로 포스터 디자인"],
  영상:       ["다빈치 리졸브(무료)로 영상 편집 배우기", "스마트폰으로 단편영상 촬영/편집", "유튜브 채널 만들어서 관심분야 영상 올리기"],
  음악:       ["개러지밴드(무료)로 작곡 입문", "유튜브로 기타/피아노 독학 시작", "무료 악보 사이트에서 연주 연습"],
  영어:       ["듀오링고로 매일 10분 영어 학습", "영어 유튜브 자막 없이 듣기 도전", "영어로 일기 쓰고 ChatGPT에게 첨삭 받기"],
  환경:       ["집에서 탄소발자국 계산해보기", "텃밭 가꾸기 또는 식물 키우기 실험", "재활용 소재로 업사이클링 작품 만들기"],
  의학:       ["생명과학 유튜브 '의학채널 비온뒤' 시청", "응급처치 유튜브 보고 심폐소생술 배우기", "현미경 키트로 세포 관찰 실험"],
  천문:       ["스텔라리움(stellarium.org) 무료 별자리 앱으로 별 관찰", "NASA 홈페이지에서 우주 사진 탐구", "망원경 없이 맨눈으로 행성 관찰"],
  우주:       ["스텔라리움으로 별자리 관찰", "NASA 유튜브 채널 탐구", "종이로 태양계 모형 만들기"],
  반도체:     ["아두이노로 전자회로 실험", "유튜브로 반도체 원리 탐구", "전자 키트로 간단한 회로 만들기"],
  전자:       ["아두이노 스타터 키트로 전자회로 입문", "유튜브로 전자공학 기초 탐구", "브레드보드로 LED 회로 만들기"],
  로봇공학:   ["아두이노 스타터 키트로 로봇 제작 입문", "레고 마인드스톰으로 로봇 프로그래밍", "유튜브로 로봇공학 기초 탐구"],
  체육:       ["유튜브로 홈트레이닝 루틴 만들기", "스포츠 경기 분석 일지 쓰기", "줄넘기/요가 실내 스포츠 루틴 개발"],
  태권도:     ["공인 품새 영상 보고 혼자 연습", "체력 기초훈련 루틴 만들기", "국군 체력측정 기준표로 목표 세우기"],
  군인:       ["국군 체력측정 기준표로 체력 점검", "부사관 선발 기준 공식 사이트 조사", "리더십 관련 책 읽기"],
  특전부사관: ["특전사 공식 홈페이지에서 선발 기준 조사", "체력훈련 루틴 만들기", "국군 부사관학교 정보 찾아보기"],
  경제:       ["용돈 가계부 앱으로 재무관리 시작", "모의 주식투자 앱으로 경제 공부", "경제 유튜브 슈카월드 보고 경제 개념 정리"],
  심리:       ["MBTI/DISC 검사 무료로 해보기", "마음챙김 명상 앱(마보, 코끼리) 시도", "심리학 입문책 읽기"],
  스타트업:   ["린 캔버스로 창업 아이디어 정리", "네이버 블로그/인스타로 콘텐츠 만들기", "학교 창업동아리 참여"],
  패션:       ["캔바로 패션 무드보드 만들기", "유튜브로 옷 리폼/DIY 따라하기", "패션 트렌드 분석 일지 쓰기"],
  요리:       ["유튜브 따라 요리 만들어보기", "나만의 레시피 노트 만들기", "집에서 베이킹 도전"],
  건축:       ["스케치업(무료)으로 3D 건물 설계해보기", "레고로 건축물 모형 만들기", "유명 건축물 스케치 따라 그리기"],
  글쓰기:     ["매일 일기 또는 단편 소설 쓰기", "브런치 계정 만들어서 글 올리기", "독후감 쓰고 블로그에 올리기"],
  인문:       ["고전 소설/철학 입문서 읽기", "역사 유튜브 채널 보고 느낀 점 기록", "관심 주제로 에세이 써보기"],
  사진:       ["스마트폰으로 사진 구도 연습(3분할 법칙)", "무료 편집 앱(스냅시드)으로 보정 연습", "일상 사진 포트폴리오 만들기"],
  사회문제해결:["생활 속 불편함을 AI로 해결하는 아이디어 기획해보기", "구글 티처블머신으로 사회문제 해결 AI 모델 실험", "마이크로소프트 AI for Good 사례 조사"],
  인공지능사회:["AI 윤리 관련 책 읽기", "구글 티처블머신으로 이미지 분류 AI 만들기", "AI가 사회에 미치는 영향 에세이 써보기"],
  아이디어:    ["생활 속 불편한 점 찾아서 해결 아이디어 스케치", "아두이노로 생활 불편 해결 프로토타입 만들기", "린 캔버스로 아이디어 비즈니스 모델 정리"],
  일상개선:    ["주변 불편함 찾아서 해결책 노트 만들기", "디자인씽킹으로 문제 정의해보기", "캔바로 아이디어 시각화 포스터 만들기"],
  프로그래밍:  ["파이썬 설치하고 점프투파이썬 무료 학습", "백준 온라인 저지(boj.kr)에서 문제 풀기", "깃허브 계정 만들고 나만의 프로젝트 시작"],
  지구과학:    ["스텔라리움으로 별자리·행성 관찰하기", "기상청 날씨 데이터로 기후 변화 분석해보기", "집 주변 암석·토양 채집해서 분류 일지 쓰기"],
  나노:        ["유튜브로 나노기술 원리 탐구", "현미경 키트로 미세 구조 관찰 실험", "신소재·나노 관련 과학 도서 읽기"],
  생물:        ["현미경 키트로 생물 관찰 실험", "식물 키우면서 성장 일지 쓰기", "유튜브로 생물 개념 탐구"],
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

  if (name === 'gap'  && !state.gapLoaded)     loadGapChart();
  if (name === 'home' && !state.homeGapLoaded) loadHomeGap();
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
  $('major-cards').innerHTML = '<div class="empty-msg">상담 완료 후 자동으로 불러옵니다.</div>';
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
  renderMajorSection(state.detectedInterests[0] || '');
  renderHomeActivities(state.detectedInterests);
});

/* ── 화면3: 추천 결과 ─────────────────────────────────────── */
function renderResults() {
  const rec       = state.autoRecommend;
  const region    = state.userInfo.region;
  const interests = state.detectedInterests;

  console.log('[renderResults] autoRecommend:', !!rec, '| interests:', interests, '| HOME_ACTIVITIES keys sample:', Object.keys(HOME_ACTIVITIES).slice(0,5));

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

  // 특수 과학분야(화학/바이러스 등) → 과학계열로 안내하는 분야 감지
  const SPECIFIC_SCIENCE  = new Set(['화학', '바이러스', '생물', '물리', '지구과학', '나노', '우주', '반도체', '전자', '로봇공학']);
  const specificInterests = interests.filter(i => SPECIFIC_SCIENCE.has(i));
  const hasOnlySpecific   = specificInterests.length > 0;

  if (gifted.length === 0) {
    $('gifted-count').textContent = '';
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
    let giftedHtml = '';
    if (hasOnlySpecific) {
      const label = specificInterests.join(', ');
      giftedHtml =
        '<div class="gap-notice">' +
        '<span class="gap-notice-icon">⚠️</span>' +
        '<div><strong>' + escHtml(label) + ' 전용 영재원은 없지만, 과학·융합 계열 기관을 안내해드려요.</strong>' +
        '관련 역량을 키울 수 있는 가장 가까운 기회예요 😊</div>' +
        '</div>';
    } else if (gifted.length < 3) {
      const interestLabel = interests.join(', ') || '해당 분야';
      giftedHtml =
        '<div class="gap-notice">' +
        '<span class="gap-notice-icon">⚠️</span>' +
        '<div><strong>' + escHtml(interestLabel) + ' 관련 영재교육기관이 ' + escHtml(region) + ' 인근에 많지 않아요.</strong>' +
        '전국 대학영재교육원을 함께 안내해드립니다.</div>' +
        '</div>';
    }
    $('gifted-cards').innerHTML = giftedHtml + gifted.map(g => giftedCard(g)).join('');
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
    let expHtml = '';
    if (expFallback) {
      const interestLabel = interests.join(', ') || '해당 분야';
      expHtml =
        '<div class="gap-notice">' +
        '<span class="gap-notice-icon">⚠️</span>' +
        '<div><strong>' + escHtml(interestLabel) + ' 관련 ' + escHtml(region) + ' 체험프로그램이 현재 공공데이터에 없어요.</strong>' +
        '이것이 바로 저희가 해결하려는 지역·분야 격차입니다 😔<br>' +
        '대신 전국 비대면 프로그램을 안내해드릴게요.</div>' +
        '</div>';
    }
    $('exp-cards').innerHTML = expHtml + exps.map(x => expCard(x)).join('');
    sectionExp.classList.remove('section-muted');
    sectionHome.classList.remove('section-highlighted');
  }

  // 집에서 할 수 있는 활동 (renderResults에서도 직접 호출 — 이중 보장)
  renderHomeActivities(interests);
}

function giftedCard(g) {
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
    </div>`;
}

function expCard(x) {
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
    </div>`;
}

$('btn-rechat').addEventListener('click', () => showScreen('chat'));

/* ── 학과·집에서 할 수 있는 활동 ──────────────────────────── */
function renderMajorSection(keyword) {
  $('section-majors').style.display = '';
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
  const el = $('home-activity-list');
  el.innerHTML = '<div style="color:var(--text-muted);font-size:13px;padding:12px 0">✨ AI가 맞춤 활동을 추천하는 중...</div>';

  fetch('/home-activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      interests,
      messages: state.messages.slice(-10),
      grade:  state.userInfo.grade,
      region: state.userInfo.region,
    }),
  })
    .then(r => r.json())
    .then(data => {
      const acts = data.activities || [];
      if (!acts.length) throw new Error('empty');
      el.innerHTML = acts.map(text =>
        `<div class="home-activity-item">
           <span class="home-activity-icon">✅</span>
           <span>${escHtml(text)}</span>
         </div>`
      ).join('');
    })
    .catch(() => {
      // API 실패 시 HOME_ACTIVITIES 하드코딩 fallback
      const DEFAULT = ["유튜브로 관심분야 강의 찾아보기", "관련 책 도서관에서 빌려 읽기", "관심분야 블로그/커뮤니티 찾아보기"];
      const seen = new Set(); const acts = [];
      for (const i of interests) {
        for (const a of (HOME_ACTIVITIES[i] || [])) {
          if (!seen.has(a) && acts.length < 4) { seen.add(a); acts.push(a); }
        }
      }
      const display = acts.length ? acts : DEFAULT;
      el.innerHTML = display.map(text =>
        `<div class="home-activity-item">
           <span class="home-activity-icon">✅</span>
           <span>${escHtml(text)}</span>
         </div>`
      ).join('');
    });
}

/* ── 화면1: 홈 지역격차 요약 ──────────────────────────────────── */
async function loadHomeGap() {
  try {
    const res  = await fetch('/stats/regional-gap');
    const data = await res.json();
    const stats = data.regional_stats || [];
    if (!stats.length) return;

    const max   = stats[0];
    const min   = stats[stats.length - 1];
    const ratio = Math.round(max['기관수'] / Math.max(min['기관수'], 1) * 10) / 10;

    $('home-stat-total').textContent = data.total.toLocaleString() + '개';
    $('home-stat-gap').textContent   = `${max['시도']} ${max['기관수']}개 vs ${min['시도']} ${min['기관수']}개`;
    $('home-stat-ratio').textContent = ratio + '배';

    const labels = stats.map(s => s['시도']);
    const values = stats.map(s => s['기관수']);
    const colors = stats.map(s => s['시도'] === max['시도'] ? '#EF4444' : '#818CF8');

    if (state.homeChart) state.homeChart.destroy();
    state.homeChart = new Chart($('home-gap-chart'), {
      type: 'bar',
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: colors, borderRadius: 4, borderSkipped: false }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.x}개` } },
        },
        scales: {
          x: { grid: { color: '#F3F4F6' }, ticks: { font: { size: 10 }, color: '#9CA3AF' } },
          y: { grid: { display: false },   ticks: { font: { family: "'Noto Sans KR', sans-serif", size: 11 }, color: '#374151' } },
        },
      },
    });
    state.homeGapLoaded = true;
  } catch { /* silent */ }
}

$('btn-detail-gap').addEventListener('click', () => showScreen('gap'));

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

// 초기 로드 — 홈 화면 지역격차 데이터
loadHomeGap();

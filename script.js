// Three.js 깔끔한 배경 애니메이션
function initThreeBackground() {
  const canvas = document.getElementById('three-background');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  
  // 기하학적 도형들 생성
  const objects = [];
  const objectCount = 20;
  
  for (let i = 0; i < objectCount; i++) {
    const geometries = [
      new THREE.BoxGeometry(0.1, 0.1, 0.1),
      new THREE.SphereGeometry(0.05, 8, 6),
      new THREE.ConeGeometry(0.05, 0.15, 6)
    ];
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    const material = new THREE.MeshBasicMaterial({ 
      color: new THREE.Color().setHSL(0.6 + Math.random() * 0.3, 0.5, 0.7),
      transparent: true,
      opacity: 0.3
    });
    const object = new THREE.Mesh(geometry, material);
    
    object.position.x = (Math.random() - 0.5) * 15;
    object.position.y = (Math.random() - 0.5) * 15;
    object.position.z = (Math.random() - 0.5) * 15;
    
    object.userData = {
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.005
      )
    };
    
    objects.push(object);
    scene.add(object);
  }
  
  camera.position.z = 8;
  
  function animate() {
    requestAnimationFrame(animate);
    
    objects.forEach(object => {
      object.position.add(object.userData.velocity);
      object.rotation.x += 0.005;
      object.rotation.y += 0.005;
      
      // 경계에서 반사
      if (object.position.x > 7 || object.position.x < -7) {
        object.userData.velocity.x *= -1;
      }
      if (object.position.y > 7 || object.position.y < -7) {
        object.userData.velocity.y *= -1;
      }
      if (object.position.z > 7 || object.position.z < -7) {
        object.userData.velocity.z *= -1;
      }
    });
    
    renderer.render(scene, camera);
  }
  
  animate();
  
  // 창 크기 변경 시 렌더러 크기 조정
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// 언어 상태 관리
let currentLanguage = 'ko'; // 기본 언어는 한국어

// 언어별 텍스트 정의
const languageTexts = {
  ko: {
    subtitle: "매치미터 - 이름으로 알아보는 궁합 지수",
    label1: "👽 당신의 이름",
    label2: "🤖 상대방의 이름",
    placeholder1: "예: 김민수",
    placeholder2: "예: 박지민",
    calculateButton: "📊 Match 측정하기",
    scoreLabel: "📊 매치 점수",
    toggleText: "🌍 EN",
    inputBothNames: "두 이름을 모두 입력하세요!",
    strokeInfo: "한글은 전통적 획수 계산 방식을 사용합니다"
  },
  en: {
    subtitle: "Match Meter - Name Compatibility Calculator",
    label1: "👽 Your Name",
    label2: "🤖 Their Name", 
    placeholder1: "e.g: Elon Musk",
    placeholder2: "e.g: Donald Trump",
    calculateButton: "📊 Calculate Match",
    scoreLabel: "📊 Match Score",
    toggleText: "🌍 KR",
    inputBothNames: "Please enter both names!",
    strokeInfo: "English letters calculated by uppercase strokes"
  }
};

// 언어 토글 함수
function toggleLanguage() {
  currentLanguage = currentLanguage === 'ko' ? 'en' : 'ko';
  updateLanguageTexts();
}

// 언어별 텍스트 업데이트
function updateLanguageTexts() {
  const texts = languageTexts[currentLanguage];
  
  document.getElementById('subtitle').textContent = texts.subtitle;
  document.getElementById('label1').textContent = texts.label1;
  document.getElementById('label2').textContent = texts.label2;
  document.getElementById('name1').placeholder = texts.placeholder1;
  document.getElementById('name2').placeholder = texts.placeholder2;
  document.getElementById('calculateButton').textContent = texts.calculateButton;
  document.getElementById('scoreLabel').textContent = texts.scoreLabel;
  document.getElementById('toggleText').textContent = texts.toggleText;
  document.getElementById('strokeInfoText').textContent = texts.strokeInfo;
  
  // 양쪽 언어 모두에서 획수 정보 표시 (내용만 다름)
  const strokeInfo = document.getElementById('strokeInfo');
  strokeInfo.classList.remove('hidden');
}

// 페이지 로드 시 Three.js 초기화 및 언어 설정
document.addEventListener('DOMContentLoaded', () => {
  initThreeBackground();
  updateLanguageTexts();
});

// 한글 자모 획수 정의
const koreanStrokeMap = {
  // 자음
  'ㄱ': 2, 'ㄲ': 4, 'ㄴ': 1, 'ㄷ': 3, 'ㄸ': 6, 'ㄹ': 5, 'ㅁ': 3, 'ㅂ': 4, 'ㅃ': 8,
  'ㅅ': 2, 'ㅆ': 4, 'ㅇ': 1, 'ㅈ': 3, 'ㅉ': 6, 'ㅊ': 4, 'ㅋ': 3, 'ㅌ': 4, 'ㅍ': 4, 'ㅎ': 3,
  // 모음
  'ㅏ': 2, 'ㅐ': 3, 'ㅑ': 3, 'ㅒ': 4, 'ㅓ': 2, 'ㅔ': 3, 'ㅕ': 3, 'ㅖ': 4,
  'ㅗ': 2, 'ㅘ': 4, 'ㅙ': 5, 'ㅚ': 3, 'ㅛ': 3, 'ㅜ': 2, 'ㅝ': 4, 'ㅞ': 5, 'ㅟ': 3, 'ㅠ': 3,
  'ㅡ': 1, 'ㅢ': 2, 'ㅣ': 1
};

// 한글을 자모로 분해하여 획수 계산
function getKoreanStrokes(char) {
  const code = char.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return 0; // 한글이 아님
  
  const chosung = Math.floor(code / 588);
  const jungsung = Math.floor((code % 588) / 28);
  const jongsung = code % 28;
  
  const chosungList = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const jungsungList = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
  const jongsungList = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  
  let totalStrokes = 0;
  
  // 초성
  totalStrokes += koreanStrokeMap[chosungList[chosung]] || 0;
  
  // 중성
  totalStrokes += koreanStrokeMap[jungsungList[jungsung]] || 0;
  
  // 종성 (복합 자음 처리)
  if (jongsung > 0) {
    const jong = jongsungList[jongsung];
    if (jong === 'ㄳ') totalStrokes += 4; // ㄱ + ㅅ
    else if (jong === 'ㄵ') totalStrokes += 4; // ㄴ + ㅈ
    else if (jong === 'ㄶ') totalStrokes += 4; // ㄴ + ㅎ
    else if (jong === 'ㄺ') totalStrokes += 7; // ㄹ + ㄱ
    else if (jong === 'ㄻ') totalStrokes += 8; // ㄹ + ㅁ
    else if (jong === 'ㄼ') totalStrokes += 9; // ㄹ + ㅂ
    else if (jong === 'ㄽ') totalStrokes += 7; // ㄹ + ㅅ
    else if (jong === 'ㄾ') totalStrokes += 8; // ㄹ + ㅌ
    else if (jong === 'ㄿ') totalStrokes += 9; // ㄹ + ㅍ
    else if (jong === 'ㅀ') totalStrokes += 8; // ㄹ + ㅎ
    else if (jong === 'ㅄ') totalStrokes += 6; // ㅂ + ㅅ
    else totalStrokes += koreanStrokeMap[jong] || 0;
  }
  
  return totalStrokes;
}

// 빠른 참조용 상용 한글 획수 맵 (자모 획수 기준)
const strokeMap = {
  // 성씨
  "김": 6, "이": 2, "박": 8, "최": 7, "정": 6, "강": 6, "조": 5, "윤": 5, "장": 6, "임": 5,
  "한": 5, "오": 3, "서": 4, "신": 4, "권": 9, "황": 9, "안": 5, "송": 8, "전": 5, "홍": 8,
  "고": 4, "문": 7, "양": 6, "손": 8, "배": 6, "백": 7, "허": 5, "유": 3, "남": 8,
  "심": 6, "노": 4, "하": 3, "곽": 11, "성": 6, "차": 6, "주": 3, "우": 3, "구": 4,
  "원": 8, "천": 6, "방": 7, "공": 4, "현": 8, "함": 8, "변": 9, "염": 10,
  "마": 5, "길": 6, "연": 7, "위": 5, "표": 8, "명": 8, "기": 5, "반": 7,
  "왕": 6, "금": 5, "옥": 5, "육": 6, "인": 4, "맹": 8, "제": 9, "모": 5,
  
  // 이름
  "민": 5, "수": 4, "영": 8, "진": 6, "현": 8, "준": 5, "우": 3, "지": 4, "성": 6, "호": 5,
  "경": 6, "석": 5, "철": 10, "용": 8, "건": 5, "희": 7, "연": 7, "혜": 10, "은": 8, "선": 6,
  "미": 6, "주": 3, "예": 4, "서": 4, "소": 6, "하": 3, "나": 5,
  "다": 5, "라": 4, "혁": 13, "훈": 10, "범": 9, "빈": 10, "규": 8, "승": 10,
  "종": 6, "환": 12, "웅": 11, "찬": 15, "완": 7, "광": 11, "섭": 10, "협": 12, "국": 7, "익": 10,
  "동": 8, "열": 7, "태": 8, "형": 8, "춘": 8, "삼": 3, "학": 8, "복": 9,
  "애": 10, "순": 6, "숙": 8, "화": 8, "자": 6, "분": 7, "향": 9, "란": 7
};

// 영문자 대문자 기준 실제 쓰기 획수 맵
const englishStrokeMap = {
  "a": 3, "b": 3, "c": 1, "d": 2, "e": 4, "f": 3, "g": 3, "h": 3, "i": 3, "j": 2,
  "k": 3, "l": 2, "m": 4, "n": 3, "o": 1, "p": 2, "q": 2, "r": 3, "s": 1, "t": 2,
  "u": 1, "v": 1, "w": 4, "x": 2, "y": 2, "z": 3
};

function getStroke(char) {
  const lowerChar = char.toLowerCase();
  
  // 영문자인 경우 (대문자 기준 획수 적용)
  if (englishStrokeMap[lowerChar]) {
    return englishStrokeMap[lowerChar];
  }
  
  // 한글인 경우 - 먼저 빠른 참조 맵 확인
  if (strokeMap[char]) {
    return strokeMap[char];
  }
  
  // 빠른 참조 맵에 없는 한글은 자모 분해로 계산
  if (/[가-힣]/.test(char)) {
    return getKoreanStrokes(char);
  }
  
  // 기본값 (공백이나 특수문자 제외)
  if (char.trim() === '' || /[^a-zA-Z가-힣]/.test(char)) {
    return 0;
  }
  
  return 8; // 기본값
}

function reduceStrokes(arr, visualSteps) {
  if (arr.length <= 2) return arr;
  const next = [];
  for (let i = 0; i < arr.length - 1; i++) {
    const sum = arr[i] + arr[i + 1];
    next.push(sum % 10);
  }
  visualSteps.push(next);
  return reduceStrokes(next, visualSteps);
}

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function calculateMatch() {
  const name1 = document.getElementById("name1").value.trim();
  const name2 = document.getElementById("name2").value.trim();
  const resultDiv = document.getElementById("result");
  const bar = document.getElementById("bar");
  const explanation = document.getElementById("explanation");

  // 계산 시작 전에 이전 결과 초기화
  resultDiv.innerHTML = "";
  bar.style.width = "0";
  explanation.innerHTML = "";

  if (!name1 || !name2) {
    resultDiv.textContent = languageTexts[currentLanguage].inputBothNames;
    return;
  }

  // 공백 제거 후 처리
  const cleanName1 = name1.replace(/\s+/g, '');
  const cleanName2 = name2.replace(/\s+/g, '');
  
  const name1Strokes = [...cleanName1].map(getStroke).filter(stroke => stroke > 0);
  const name2Strokes = [...cleanName2].map(getStroke).filter(stroke => stroke > 0);
  const all = [...name1Strokes, ...name2Strokes];
  const visualSteps = [];
  visualSteps.push(all);
  const final = reduceStrokes(all, visualSteps);

  explanation.innerHTML = "";
  
  // 각 단계별로 순차적으로 표시
  for (let i = 0; i < visualSteps.length; i++) {
    await sleep(400);
    
    const line = document.createElement("div");
    line.className = "line";
    
    const totalSteps = visualSteps.length - 1;
    const isMobile = window.innerWidth < 768;
    const maxWidth = isMobile ? 300 : 600;
    const minWidth = isMobile ? 60 : 80;
    const currentWidth = i === 0 ? maxWidth : maxWidth - ((i - 1) / totalSteps) * (maxWidth - minWidth);
    
    line.style.width = currentWidth + "px";
    line.style.position = "relative";
    line.style.height = "40px";
    line.style.margin = "0.8rem auto";
    line.style.zIndex = "1";
    
    const numbersCount = visualSteps[i].length;
    const spacing = currentWidth / (numbersCount + 1);
    
    for (let j = 0; j < visualSteps[i].length; j++) {
      const span = document.createElement("span");
      span.textContent = visualSteps[i][j];
      span.style.position = "absolute";
      span.style.left = (spacing * (j + 1)) + "px";
      span.style.transform = "translateX(-50%)";
      line.appendChild(span);
    }
    
    explanation.appendChild(line);
  }

  const score = final[0] * 10 + final[1];
  const messages = getMessage(score);
  
  // Match Meter 결과 HTML 구조 생성
  resultDiv.innerHTML = `
    <div class="result-container">
      <div class="score-text">📊 ${name1} ⚡ ${name2}</div>
      <div class="score-percentage">${score}%</div>
      <div class="message-positive">✅ ${messages.positive}</div>
      <div class="message-negative">⚠️ ${messages.negative}</div>
    </div>
  `;
  
  // 애니메이션 효과 적용
  setTimeout(() => {
    resultDiv.querySelector('.result-container').classList.add('animate');
  }, 100);
  
  bar.style.width = score + "%";
}

function getMessage(score) {
  const positive = score;
  const negative = 100 - score;
  
  // 언어별 메시지 정의
  const messagesByLanguage = {
    ko: [
      {
        condition: score >= 95,
        positive: "우주가 인정한 운명의 상대! 🌟",
        negative: `${negative}% 확률로 외계인이 방해할 수도... 👽`
      },
      {
        condition: score >= 90,
        positive: "천생연분이에요! 💍",
        negative: `${negative}% 확률로 둘 다 짜장면을 좋아해서 싸울 수도... 🍜`
      },
      {
        condition: score >= 80,
        positive: "완벽한 궁합이에요! ✨",
        negative: `${negative}% 확률로 리모컨 쟁탈전이 벌어질 수도... 📺`
      },
      {
        condition: score >= 70,
        positive: "잘 어울리는 커플이에요! 💘",
        negative: `${negative}% 확률로 누가 설거지할지 가위바위보... ✂️`
      },
      {
        condition: score >= 60,
        positive: "좋은 인연이 될 수 있어요! 😊",
        negative: `${negative}% 확률로 취향차이로 넷플릭스 선택 장애... 🎬`
      },
      {
        condition: score >= 50,
        positive: "노력하면 좋은 관계가 될 거예요! 💪",
        negative: `${negative}% 확률로 화장실 변기시트 때문에 다툴 수도... 🚽`
      },
      {
        condition: score >= 40,
        positive: "친구부터 시작해보세요! 👫",
        negative: `${negative}% 확률로 서로 연락처를 까먹을 수도... 📱`
      },
      {
        condition: score >= 30,
        positive: "좋은 친구가 될 수 있어요! 👋",
        negative: `${negative}% 확률로 서로를 아는 척 안 할 수도... 😅`
      },
      {
        condition: score >= 20,
        positive: "인연이 있긴 있는 것 같아요... 🤔",
        negative: `${negative}% 확률로 평행우주에서나 만날 인연... 🌌`
      },
      {
        condition: score >= 10,
        positive: "아직 희망은 있어요! 🙃",
        negative: `${negative}% 확률로 둘이 만나면 지구가 멸망할 수도... 🌍💥`
      },
      {
        condition: score >= 0,
        positive: "...음... 긍정적으로 생각해봐요! 😰",
        negative: `${negative}% 확률로 서로 다른 차원에서 살고 있을 가능성... 🌀`
      }
    ],
    en: [
      {
        condition: score >= 95,
        positive: "Destined soulmates approved by the universe! 🌟",
        negative: `${negative}% chance aliens might interfere... 👽`
      },
      {
        condition: score >= 90,
        positive: "Perfect match made in heaven! 💍",
        negative: `${negative}% chance you'll fight over pizza toppings... 🍕`
      },
      {
        condition: score >= 80,
        positive: "Amazing compatibility! ✨",
        negative: `${negative}% chance of epic remote control battles... 📺`
      },
      {
        condition: score >= 70,
        positive: "Great couple potential! 💘",
        negative: `${negative}% chance of rock-paper-scissors for dishes... ✂️`
      },
      {
        condition: score >= 60,
        positive: "Good relationship potential! 😊",
        negative: `${negative}% chance of Netflix selection paralysis... 🎬`
      },
      {
        condition: score >= 50,
        positive: "Can work with some effort! 💪",
        negative: `${negative}% chance of toilet seat arguments... 🚽`
      },
      {
        condition: score >= 40,
        positive: "Start as friends! 👫",
        negative: `${negative}% chance you'll forget each other's numbers... 📱`
      },
      {
        condition: score >= 30,
        positive: "Good friendship potential! 👋",
        negative: `${negative}% chance you'll pretend not to know each other... 😅`
      },
      {
        condition: score >= 20,
        positive: "There might be some connection... 🤔",
        negative: `${negative}% chance you're meant for parallel universes... 🌌`
      },
      {
        condition: score >= 10,
        positive: "There's still hope! 🙃",
        negative: `${negative}% chance the world ends if you two meet... 🌍💥`
      },
      {
        condition: score >= 0,
        positive: "...Well... think positive! 😰",
        negative: `${negative}% chance you live in different dimensions... 🌀`
      }
    ]
  };
  
  const messages = messagesByLanguage[currentLanguage];
  const message = messages.find(m => m.condition);
  return {
    positive: message.positive,
    negative: message.negative
  };
}
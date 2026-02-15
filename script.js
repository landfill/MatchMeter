
// 언어 상태 관리
let currentLanguage = 'ko';

// 애니메이션 컨트롤러 초기화
let animationController;

// 계산 중복 실행 방지
let isCalculating = false;

document.addEventListener('DOMContentLoaded', () => {
  try {
    // 애니메이션 컨트롤러 초기화
    if (typeof AnimationController !== 'undefined') {
      animationController = new AnimationController();
      window.currentAnimationController = animationController;
    }

  } catch (error) {
    console.error('Initialization error:', error);
  }
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

// 언어별 텍스트 정의
const languageTexts = {
  ko: {
    subtitle: "매치미터 - 이름으로 알아보는 궁합 지수",
    label1: "첫 번째 이름",
    label2: "두 번째 이름",
    placeholder1: "예: 김하늘",
    placeholder2: "예: 박바다",
    calculateButton: "Match 측정하기",
    scoreLabel: "매치 점수",
    toggleText: "EN",
    inputBothNames: "두 이름을 모두 입력해주세요!",
    strokeInfo: "한글은 전통적 획수 계산 방식을 사용합니다",
    languageDescription: "현재 언어는 한국어입니다. 클릭하면 영어로 변경됩니다.",
    languageLabel: "언어 변경 (현재: 한국어)",
    calculateDescription: "입력한 두 이름의 궁합 점수를 계산합니다"
  },
  en: {
    subtitle: "Match Meter - Name Compatibility Calculator",
    label1: "Your Name",
    label2: "Their Name",
    placeholder1: "e.g: Donald Trump",
    placeholder2: "e.g: Elon Musk",
    calculateButton: "Calculate Match",
    scoreLabel: "Match Score",
    toggleText: "KR",
    inputBothNames: "Please enter both names!",
    strokeInfo: "English letters calculated by uppercase strokes",
    languageDescription: "Current language is English. Click to change to Korean.",
    languageLabel: "Change language (Current: English)",
    calculateDescription: "Calculate compatibility score for the entered names"
  }
};

// 언어 토글 함수 (접근성 개선)
function toggleLanguage() {
  currentLanguage = currentLanguage === 'ko' ? 'en' : 'ko';
  updateLanguageTexts();



  // 언어 변경 알림 (스크린 리더용)
  announceToScreenReader(
    currentLanguage === 'ko' ? '언어가 한국어로 변경되었습니다' : 'Language changed to English'
  );
}

// 스크린 리더 알림 함수
function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // 알림 후 제거
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// 언어별 텍스트 업데이트 (접근성 개선)
function updateLanguageTexts() {
  const texts = languageTexts[currentLanguage];

  document.getElementById('subtitle').textContent = texts.subtitle;
  document.getElementById('label1').textContent = texts.label1;
  document.getElementById('label2').textContent = texts.label2;
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  const name1Input = document.getElementById('name1');
  const name2Input = document.getElementById('name2');
  name1Input.placeholder = texts.placeholder1;
  name2Input.placeholder = texts.placeholder2;

  document.getElementById('calculateButton').innerHTML = `<i class="lucid-icon" data-lucide="bar-chart-3" aria-hidden="true"></i> ${texts.calculateButton}`;
  // document.getElementById('scoreLabel').innerHTML = `<i id="score-title" class="score-icon lucid-icon" data-lucide="bar-chart-3" aria-hidden="true"></i> ${texts.scoreLabel}`;

  // Re-initialize icons after DOM update
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  document.getElementById('toggleText').textContent = texts.toggleText;
  document.getElementById('strokeInfoText').textContent = texts.strokeInfo;

  // 접근성 라벨 업데이트
  const languageToggle = document.getElementById('languageToggle');
  languageToggle.setAttribute('aria-label', texts.languageLabel);
  document.getElementById('language-description').textContent = texts.languageDescription;
  document.getElementById('calculate-description').textContent = texts.calculateDescription;

  // 계산 버튼 aria-label 업데이트
  const calculateButton = document.getElementById('calculateButton');
  calculateButton.setAttribute('aria-label', texts.calculateDescription);

  // 양쪽 언어 모두에서 획수 정보 표시
  const strokeInfo = document.getElementById('strokeInfo');
  strokeInfo.classList.remove('hidden');
}

// 입력 유효성 검사 (접근성 개선)
function validateInput(inputElement, errorElementId) {
  const value = inputElement.value.trim();
  const errorElement = document.getElementById(errorElementId);
  const texts = languageTexts[currentLanguage];

  if (value === '') {
    inputElement.setAttribute('aria-invalid', 'true');
    inputElement.classList.add('error');
    errorElement.textContent = texts.inputBothNames;
    errorElement.classList.remove('sr-only');
    return false;
  } else {
    inputElement.setAttribute('aria-invalid', 'false');
    inputElement.classList.remove('error');
    inputElement.classList.add('success');
    errorElement.textContent = '';
    errorElement.classList.add('sr-only');
    return true;
  }
}

// 키보드 네비게이션 개선
function setupKeyboardNavigation() {
  const focusableElements = document.querySelectorAll(
    'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
  );

  focusableElements.forEach((element, index) => {
    element.addEventListener('keydown', (e) => {
      // Tab 키 순서 관리
      if (e.key === 'Tab') {
        // 기본 동작 유지하되, 순서 확인
        const currentIndex = Array.from(focusableElements).indexOf(element);

        if (e.shiftKey && currentIndex === 0) {
          // Shift+Tab으로 첫 번째 요소에서 마지막으로
          e.preventDefault();
          focusableElements[focusableElements.length - 1].focus();
        } else if (!e.shiftKey && currentIndex === focusableElements.length - 1) {
          // Tab으로 마지막 요소에서 첫 번째로
          e.preventDefault();
          focusableElements[0].focus();
        }
      }

      // Enter 키로 버튼 활성화
      if (e.key === 'Enter' && element.tagName === 'BUTTON') {
        element.click();
      }
    });
  });
}

// Enhanced progress bar with mobile-optimized animations
function updateProgressBar(percentage) {
  const progressBar = document.querySelector('.mobile-progress-bar');
  const progressFill = document.getElementById('bar');

  if (!progressBar || !progressFill) return;

  // Reset progress bar for animation
  progressFill.style.width = '0%';
  progressFill.style.transition = 'none';

  // Set accessibility attributes
  progressBar.setAttribute('aria-valuenow', percentage);
  progressBar.setAttribute('aria-valuetext', `${percentage}% 궁합도`);

  // Mobile-optimized animation timing
  const animationDuration = MobileUX.getAnimationDuration(800);
  const animationDelay = MobileUX.isMobile() ? 200 : 300;

  setTimeout(() => {
    // Apply mobile-appropriate transition
    progressFill.style.transition = `width ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease`;
    progressFill.style.width = percentage + '%';

    // Enhanced color setting with smooth transitions
    if (percentage >= 80) {
      progressFill.style.backgroundColor = '#10b981'; // 초록색
    } else if (percentage >= 60) {
      progressFill.style.backgroundColor = '#f59e0b'; // 주황색
    } else {
      progressFill.style.backgroundColor = '#ef4444'; // 빨간색
    }

    // Add visual feedback for mobile users
    if (MobileUX.isMobile()) {
      // Subtle pulse effect on completion
      setTimeout(() => {
        progressFill.style.transform = 'scaleY(1.1)';
        setTimeout(() => {
          progressFill.style.transform = 'scaleY(1)';
          progressFill.style.transition += ', transform 0.2s ease';
        }, 150);
      }, animationDuration);
    }
  }, animationDelay);
}

// Enhanced mobile UX initialization
function initMobileUX() {
  // Setup viewport height handling for mobile browsers
  const setViewportHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  setViewportHeight();
  window.addEventListener('resize', setViewportHeight);
  window.addEventListener('orientationchange', () => {
    setTimeout(setViewportHeight, 100);
  });

  // Enhanced touch feedback for buttons
  const buttons = document.querySelectorAll('.mobile-button');
  buttons.forEach(button => {
    button.addEventListener('touchstart', () => {
      button.classList.add('touch-active');
      MobileUX.provideFeedback('light');
    }, { passive: true });

    button.addEventListener('touchend', () => {
      setTimeout(() => {
        button.classList.remove('touch-active');
      }, 150);
    }, { passive: true });

    button.addEventListener('touchcancel', () => {
      button.classList.remove('touch-active');
    }, { passive: true });
  });

  // Enhanced input focus management for mobile
  const inputs = document.querySelectorAll('.mobile-input');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      // Scroll input into view on mobile to avoid keyboard overlap
      if (MobileUX.isMobile()) {
        setTimeout(() => {
          input.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }, 300); // Wait for keyboard animation
      }
    });

    // Enhanced Enter key handling
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();

        // Move to next input or calculate if on last input
        const currentIndex = Array.from(inputs).indexOf(input);
        if (currentIndex < inputs.length - 1) {
          inputs[currentIndex + 1].focus();
        } else {
          // Blur current input and calculate
          input.blur();
          setTimeout(() => {
            calculateMatch();
          }, 100);
        }
      }
    });
  });

  // Setup result area auto-scroll observer
  const resultSection = document.getElementById('result');
  if (resultSection) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // New result added, ensure it's visible
          setTimeout(() => {
            const resultContainer = resultSection.querySelector('.result-container');
            if (resultContainer && MobileUX.isMobile()) {
              MobileUX.scrollToElement(resultSection, {
                block: 'center',
                focusAfterScroll: false
              });
            }
          }, MobileUX.getAnimationDuration(100));
        }
      });
    });

    observer.observe(resultSection, {
      childList: true,
      subtree: true
    });
  }
}

// Mobile-specific initializations
document.addEventListener('DOMContentLoaded', () => {
  updateLanguageTexts();
  setupKeyboardNavigation();
  initMobileUX();

  // 입력 필드 이벤트 리스너 추가
  const name1Input = document.getElementById('name1');
  const name2Input = document.getElementById('name2');

  name1Input.addEventListener('blur', () => validateInput(name1Input, 'name1-error'));
  name2Input.addEventListener('blur', () => validateInput(name2Input, 'name2-error'));

  // 입력 시 실시간 유효성 검사
  name1Input.addEventListener('input', () => {
    if (name1Input.value.trim() !== '') {
      validateInput(name1Input, 'name1-error');
    }
  });

  name2Input.addEventListener('input', () => {
    if (name2Input.value.trim() !== '') {
      validateInput(name2Input, 'name2-error');
    }
  });

  // Enhanced mobile gesture support
  if (MobileUX.isMobile()) {
    // Add swipe-to-refresh hint for mobile users
    const container = document.querySelector('.mobile-container');
    let startY = 0;
    let isScrolling = false;

    container.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      isScrolling = false;
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (!isScrolling) {
        const currentY = e.touches[0].clientY;
        const diffY = currentY - startY;

        if (Math.abs(diffY) > 10) {
          isScrolling = true;
        }
      }
    }, { passive: true });

    // Double-tap to focus first input (mobile convenience)
    let lastTap = 0;
    container.addEventListener('touchend', (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;

      if (tapLength < 500 && tapLength > 0) {
        // Double tap detected
        const firstInput = document.getElementById('name1');
        if (firstInput && !firstInput.value.trim()) {
          firstInput.focus();
          MobileUX.provideFeedback('light');
        }
      }
      lastTap = currentTime;
    }, { passive: true });
  }
});

// Mobile UX utilities for enhanced user experience
const MobileUX = {
  // Check if device is mobile
  isMobile: () => window.innerWidth < 768 || 'ontouchstart' in window,

  // Check if device prefers reduced motion
  prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,

  // Get optimal animation duration based on device and user preferences
  getAnimationDuration: (baseMs = 300) => {
    if (MobileUX.prefersReducedMotion()) return 50;
    return MobileUX.isMobile() ? Math.min(baseMs * 0.8, 250) : baseMs;
  },

  // Enhanced scroll to element with mobile optimization
  scrollToElement: (element, options = {}) => {
    const defaultOptions = {
      behavior: MobileUX.prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'center',
      inline: 'nearest'
    };

    const finalOptions = { ...defaultOptions, ...options };

    // For mobile, add slight delay to ensure keyboard is hidden
    if (MobileUX.isMobile()) {
      // Hide any active input focus first
      document.activeElement?.blur();

      setTimeout(() => {
        element.scrollIntoView(finalOptions);

        // Additional focus management for mobile
        if (options.focusAfterScroll) {
          setTimeout(() => {
            element.focus({ preventScroll: true });
          }, MobileUX.getAnimationDuration(200));
        }
      }, 100);
    } else {
      element.scrollIntoView(finalOptions);
      if (options.focusAfterScroll) {
        setTimeout(() => {
          element.focus({ preventScroll: true });
        }, MobileUX.getAnimationDuration(100));
      }
    }
  },

  // Enhanced haptic feedback for mobile devices
  provideFeedback: (type = 'light') => {
    if ('vibrate' in navigator && MobileUX.isMobile()) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        success: [10, 50, 10],
        error: [50, 100, 50]
      };
      navigator.vibrate(patterns[type] || patterns.light);
    }
  }
};

// Calculate match function with enhanced mobile UX
async function calculateMatch() {
  // 중복 실행 방지
  if (isCalculating) {
    return;
  }

  isCalculating = true;

  try {
    const name1 = document.getElementById("name1").value.trim();
    const name2 = document.getElementById("name2").value.trim();
    const resultDiv = document.getElementById("result");
    const bar = document.getElementById("bar");
    const explanation = document.getElementById("explanation");
    const calculateButton = document.getElementById("calculateButton");

    // 계산 시작 전에 이전 결과 초기화
    resultDiv.innerHTML = "";
    resultDiv.style.display = 'none';  // 결과 영역 완전히 숨기기
    bar.style.width = "0";
    explanation.innerHTML = "";

    if (!name1 || !name2) {
      resultDiv.textContent = languageTexts[currentLanguage].inputBothNames;
      resultDiv.style.display = 'block';  // 에러 메시지는 표시

      // 에러 애니메이션
      if (window.currentAnimationController) {
        const emptyInput = !name1 ? document.getElementById("name1") : document.getElementById("name2");
        window.currentAnimationController.showErrorFeedback(emptyInput);
      }

      return;
    }

    // 계산 시작 피드백
    if (calculateButton && window.currentAnimationController) {
      window.currentAnimationController.showSuccessFeedback(calculateButton);
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

    // AnimationController가 활성화된 경우 단계 애니메이션 완전히 건너뛰기
    if (!window.currentAnimationController) {
      // 각 단계별로 순차적으로 표시 (fallback)
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
    }
    // AnimationController가 있으면 explanation 섹션을 완전히 비워둠 (AnimationController가 처리)

    const score = final[0] * 10 + final[1];
    const messages = getMessage(score);

    // 결과 데이터 준비 (HTML 생성 전에)
    const resultData = {
      score: score,
      names: {
        name1: name1,
        name2: name2
      },
      messages: messages,
      steps: visualSteps,
      language: currentLanguage,
      timestamp: new Date(),
      resultDiv: resultDiv  // 결과 div 참조 전달
    };

    // 커스텀 이벤트 발생 (애니메이션 컨트롤러에서 감지)
    // AnimationController가 획수 애니메이션 후 결과 HTML을 생성할 것임
    document.dispatchEvent(new CustomEvent('matchCalculated', {
      detail: resultData
    }));

    // 기존 애니메이션 효과는 AnimationController에서 처리됨
    // setTimeout(() => {
    //   resultDiv.querySelector('.result-container').classList.add('animate');
    // }, 100);

    // 진행바는 AnimationController에서 애니메이션 처리
    // bar.style.width = score + "%";



  } catch (error) {
    console.error('Calculation error:', error);
  } finally {
    isCalculating = false;
  }
}

function getMessage(score) {
  const positive = score;
  const negative = 100 - score;

  // 언어별 메시지 정의
  const messagesByLanguage = {
    ko: [
      {
        condition: score >= 95,
        positive: "우주가 인정한 운명의 상대! (별처럼 빛나는)",
        negative: `${negative}% 확률로 외계인이 방해할 수도... (아무도 예상 못함)`
      },
      {
        condition: score >= 90,
        positive: "천생연분이에요! (결혼반지가 보임)",
        negative: `${negative}% 확률로 둘 다 짜장면을 좋아해서 싸울 수도... (면요리 전쟁)`
      },
      {
        condition: score >= 80,
        positive: "완벽한 궁합이에요! (반짝반짝 빛남)",
        negative: `${negative}% 확률로 리모컨 쟁탈전이 벌어질 수도... (TV 앞 전쟁)`
      },
      {
        condition: score >= 70,
        positive: "잘 어울리는 커플이에요! (사랑의 화살 적중)",
        negative: `${negative}% 확률로 누가 설거지할지 가위바위보... (영원한 승부)`
      },
      {
        condition: score >= 60,
        positive: "좋은 인연이 될 수 있어요! (미소 지으며)",
        negative: `${negative}% 확률로 취향차이로 넷플릭스 선택 장애... (영화 포스터들이 울고 있음)`
      },
      {
        condition: score >= 50,
        positive: "노력하면 좋은 관계가 될 거예요! (팔뚝 힘 자랑)",
        negative: `${negative}% 확률로 화장실 변기시트 때문에 다툴 수도... (집안의 영원한 숙제)`
      },
      {
        condition: score >= 40,
        positive: "친구부터 시작해보세요! (손잡고 걷는 모습)",
        negative: `${negative}% 확률로 서로 연락처를 까먹을 수도... (핸드폰 속 연락처 미아)`
      },
      {
        condition: score >= 30,
        positive: "좋은 친구가 될 수 있어요! (손 흔들며 인사)",
        negative: `${negative}% 확률로 서로를 아는 척 안 할 수도... (어색한 웃음)`
      },
      {
        condition: score >= 20,
        positive: "인연이 있긴 있는 것 같아요... (고민하는 표정)",
        negative: `${negative}% 확률로 평행우주에서나 만날 인연... (은하수 건너편)`
      },
      {
        condition: score > 10,
        positive: "아직 희망은 있어요! (거꾸로 웃음)",
        negative: `${negative}% 확률로 둘이 만나면 지구가 멸망할 수도... (지구 폭발 위험)`
      },
      {
        condition: score >= 5,
        positive: "극한의 상황이지만... 기적은 일어난다고 해요! (기적의 별)",
        negative: `${negative}% 확률로 서로를 보면 시간이 멈출 수도... (시계 바늘 정지)`
      },
      {
        condition: score > 0,
        positive: "...음... 최소한 0%는 아니네요! (식은땀 흘림)",
        negative: `${negative}% 확률로 서로 다른 차원에서 살고 있을 가능성... (차원의 소용돌이)`
      },
      {
        condition: score === 0,
        positive: "놀라워요! 완벽한 0%! (축하 파티)",
        negative: "축하합니다! 여러분은 수학적으로 완벽한 반대 조합을 발견했습니다! 이건 정말 레어한 케이스예요! (우승 트로피와 반짝이는 불빛)"
      }
    ],
    en: [
      {
        condition: score >= 95,
        positive: "Destined soulmates approved by the universe! (shining like stars)",
        negative: `${negative}% chance aliens might interfere... (totally unexpected)`
      },
      {
        condition: score >= 90,
        positive: "Perfect match made in heaven! (wedding rings visible)",
        negative: `${negative}% chance you'll fight over pizza toppings... (pizza wars ahead)`
      },
      {
        condition: score >= 80,
        positive: "Amazing compatibility! (sparkling bright)",
        negative: `${negative}% chance of epic remote control battles... (TV warfare)`
      },
      {
        condition: score >= 70,
        positive: "Great couple potential! (cupid's arrow hits)",
        negative: `${negative}% chance of rock-paper-scissors for dishes... (eternal showdown)`
      },
      {
        condition: score >= 60,
        positive: "Good relationship potential! (smiling warmly)",
        negative: `${negative}% chance of Netflix selection paralysis... (movie posters crying)`
      },
      {
        condition: score >= 50,
        positive: "Can work with some effort! (flexing muscles)",
        negative: `${negative}% chance of toilet seat arguments... (household eternal mystery)`
      },
      {
        condition: score >= 40,
        positive: "Start as friends! (walking hand in hand)",
        negative: `${negative}% chance you'll forget each other's numbers... (lost contacts in phone)`
      },
      {
        condition: score >= 30,
        positive: "Good friendship potential! (waving hello)",
        negative: `${negative}% chance you'll pretend not to know each other... (awkward laugh)`
      },
      {
        condition: score >= 20,
        positive: "There might be some connection... (thinking hard)",
        negative: `${negative}% chance you're meant for parallel universes... (across the galaxy)`
      },
      {
        condition: score > 10,
        positive: "There's still hope! (upside down smile)",
        negative: `${negative}% chance the world ends if you two meet... (Earth explosion risk)`
      },
      {
        condition: score >= 5,
        positive: "Extreme situation but... miracles do happen! (miracle star)",
        negative: `${negative}% chance time stops when you look at each other... (clock hands frozen)`
      },
      {
        condition: score > 0,
        positive: "...Well... at least it's not 0%! (nervous sweating)",
        negative: `${negative}% chance you live in different dimensions... (dimensional whirlpool)`
      },
      {
        condition: score === 0,
        positive: "Amazing! Perfect 0%! (celebration party)",
        negative: "Congratulations! You've discovered the mathematically perfect opposite combination! This is truly a rare case! (victory trophy with sparkling lights)"
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
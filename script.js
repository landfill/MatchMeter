// Mobile-optimized Three.js background animation
function initThreeBackground() {
  const canvas = document.getElementById('three-background');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas, 
    alpha: true,
    antialias: false, // Disable for mobile performance
    powerPreference: "low-power" // Optimize for battery life
  });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  
  // Mobile-optimized object count and complexity
  const isMobile = window.innerWidth < 768;
  const isLowEnd = navigator.hardwareConcurrency <= 4 || window.innerWidth < 480;
  const isLandscape = window.innerWidth > window.innerHeight;
  
  const objects = [];
  // Adjust object count based on orientation and device capability
  const objectCount = isLowEnd ? 8 : (isMobile ? (isLandscape ? 10 : 12) : 20);
  
  // Optimize pixel ratio based on orientation and device capability
  const optimalPixelRatio = isLowEnd ? 1 : (isMobile ? (isLandscape ? 1.25 : 1.5) : 2);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, optimalPixelRatio));
  
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
  
  // Enhanced resize and orientation handling with debouncing
  let resizeTimeout;
  let orientationTimeout;
  
  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    }, 150);
  }
  
  function handleOrientationChange() {
    clearTimeout(orientationTimeout);
    orientationTimeout = setTimeout(() => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight, false);
      canvas.style.width = newWidth + 'px';
      canvas.style.height = newHeight + 'px';
      
      const aspectRatio = newWidth / newHeight;
      if (newHeight > newWidth) {
        camera.position.z = 8.5 + (1 / aspectRatio) * 0.5;
        camera.fov = 75 + (1 / aspectRatio) * 5;
      } else {
        camera.position.z = 8 - (aspectRatio - 1) * 0.3;
        camera.fov = 75 - (aspectRatio - 1) * 3;
      }
      camera.updateProjectionMatrix();
      
      renderer.render(scene, camera);
    }, 300);
  }
  
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleOrientationChange);
  
  // Store references for cleanup if needed
  window.threeJsCleanup = () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleOrientationChange);
  };
}

// 언어 상태 관리
let currentLanguage = 'ko';

// 언어별 텍스트 정의
const languageTexts = {
  ko: {
    subtitle: "매치미터 - 이름으로 알아보는 궁합 지수",
    label1: "📝 첫 번째 이름",
    label2: "📝 두 번째 이름",
    placeholder1: "예: 김민수",
    placeholder2: "예: 박지민",
    calculateButton: "📊 Match 측정하기",
    scoreLabel: "📊 매치 점수",
    toggleText: "🌍 EN",
    inputBothNames: "두 이름을 모두 입력해주세요!",
    strokeInfo: "한글은 전통적 획수 계산 방식을 사용합니다",
    languageDescription: "현재 언어는 한국어입니다. 클릭하면 영어로 변경됩니다.",
    languageLabel: "언어 변경 (현재: 한국어)",
    calculateDescription: "입력한 두 이름의 궁합 점수를 계산합니다"
  },
  en: {
    subtitle: "Match Meter - Name Compatibility Calculator",
    label1: "👽 Your Name",
    label2: "🤖 Their Name", 
    placeholder1: "e.g: John Smith",
    placeholder2: "e.g: Jane Doe",
    calculateButton: "📊 Calculate Match",
    scoreLabel: "📊 Match Score",
    toggleText: "🌍 KR",
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
  
  const name1Input = document.getElementById('name1');
  const name2Input = document.getElementById('name2');
  name1Input.placeholder = texts.placeholder1;
  name2Input.placeholder = texts.placeholder2;
  
  document.getElementById('calculateButton').innerHTML = `<span aria-hidden="true">📊</span> ${texts.calculateButton.replace('📊 ', '')}`;
  document.getElementById('scoreLabel').innerHTML = `<span aria-hidden="true">📊</span> ${texts.scoreLabel.replace('📊 ', '')}`;
  document.getElementById('toggleText').textContent = texts.toggleText;
  document.getElementById('strokeInfoText').textContent = texts.strokeInfo;
  
  // 접근성 라벨 업데이트
  const languageToggle = document.getElementById('languageToggle');
  languageToggle.setAttribute('aria-label', texts.languageLabel);
  document.getElementById('language-description').textContent = texts.languageDescription;
  document.getElementById('calculate-description').textContent = texts.calculateDescription;
  
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
  initThreeBackground();
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
function calculateMatch() {
  const name1 = document.getElementById('name1').value.trim();
  const name2 = document.getElementById('name2').value.trim();
  const texts = languageTexts[currentLanguage];
  
  // 입력 유효성 검사
  const name1Valid = validateInput(document.getElementById('name1'), 'name1-error');
  const name2Valid = validateInput(document.getElementById('name2'), 'name2-error');
  
  if (!name1Valid || !name2Valid) {
    announceToScreenReader(texts.inputBothNames);
    MobileUX.provideFeedback('error');
    
    // 첫 번째 빈 입력 필드에 포커스
    if (!name1Valid) {
      document.getElementById('name1').focus();
    } else if (!name2Valid) {
      document.getElementById('name2').focus();
    }
    return;
  }
  
  // 계산 시작 알림 및 피드백
  announceToScreenReader(currentLanguage === 'ko' ? '궁합 계산 중...' : 'Calculating compatibility...');
  MobileUX.provideFeedback('light');
  
  // 계산 버튼 비활성화 (중복 클릭 방지)
  const calculateButton = document.getElementById('calculateButton');
  calculateButton.disabled = true;
  calculateButton.style.opacity = '0.7';
  
  // 모바일에 적합한 지연 시간으로 계산 시뮬레이션
  const calculationDelay = MobileUX.isMobile() ? 800 : 1200;
  
  setTimeout(() => {
    // 간단한 궁합 계산 로직 (예시)
    const score = Math.floor(Math.random() * 100) + 1;
    
    // 결과 표시
    updateProgressBar(score);
    
    const resultDiv = document.getElementById('result');
    let message = '';
    
    if (score >= 80) {
      message = currentLanguage === 'ko' ? 
        `🎉 ${name1}님과 ${name2}님은 ${score}%의 환상적인 궁합입니다!` :
        `🎉 ${name1} and ${name2} have a fantastic ${score}% compatibility!`;
      MobileUX.provideFeedback('success');
    } else if (score >= 60) {
      message = currentLanguage === 'ko' ? 
        `😊 ${name1}님과 ${name2}님은 ${score}%의 좋은 궁합입니다!` :
        `😊 ${name1} and ${name2} have a good ${score}% compatibility!`;
      MobileUX.provideFeedback('medium');
    } else {
      message = currentLanguage === 'ko' ? 
        `🤔 ${name1}님과 ${name2}님은 ${score}%의 궁합입니다. 노력이 필요해요!` :
        `🤔 ${name1} and ${name2} have ${score}% compatibility. Some work needed!`;
      MobileUX.provideFeedback('light');
    }
    
    // 결과 컨테이너에 모바일 최적화 클래스 추가
    const resultContainer = document.createElement('div');
    resultContainer.className = 'result-container mobile-result-animation';
    resultContainer.innerHTML = message;
    resultContainer.setAttribute('tabindex', '-1');
    resultContainer.setAttribute('role', 'status');
    resultContainer.setAttribute('aria-live', 'polite');
    
    resultDiv.innerHTML = '';
    resultDiv.appendChild(resultContainer);
    
    // 모바일 최적화된 애니메이션 적용
    setTimeout(() => {
      resultContainer.classList.add('animate');
    }, 50);
    
    // 결과 발표 (스크린 리더용) - 모바일에서 더 빠른 피드백
    const announceDelay = MobileUX.isMobile() ? 300 : 500;
    setTimeout(() => {
      announceToScreenReader(message.replace(/🎉|😊|🤔/g, ''));
    }, announceDelay);
    
    // 향상된 자동 스크롤 및 포커스 관리
    setTimeout(() => {
      MobileUX.scrollToElement(resultDiv, {
        block: MobileUX.isMobile() ? 'center' : 'nearest',
        focusAfterScroll: true
      });
      
      // 결과 컨테이너에 포커스 (키보드 사용자를 위해)
      resultContainer.focus({ preventScroll: true });
    }, MobileUX.getAnimationDuration(200));
    
    // 계산 버튼 재활성화
    setTimeout(() => {
      calculateButton.disabled = false;
      calculateButton.style.opacity = '1';
    }, MobileUX.getAnimationDuration(400));
    
  }, calculationDelay);
}
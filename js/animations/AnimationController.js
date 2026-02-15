/**
 * @fileoverview 애니메이션 컨트롤러 - 결과 표시 및 인터랙션 애니메이션 관리
 */

/**
 * 애니메이션 컨트롤러 클래스
 * 점수 카운트업, 진행바 애니메이션, 마이크로 인터랙션 관리
 */
class AnimationController {
  /**
   * AnimationController 생성자
   */
  constructor() {
    this.isAnimating = false;
    this.counters = new Map();
    this.observers = new Map();

    this.init();
  }

  /**
   * 초기화
   */
  init() {
    this.setupIntersectionObserver();
    this.bindEvents();
    this.detectAnimationSupport();
  }

  /**
   * 교차 관찰자 설정 (뷰포트 진입 시 애니메이션 트리거)
   */
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      return; // 구형 브라우저 지원 안함
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.triggerEntryAnimation(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '20px'
    });

    this.observers.set('intersection', observer);
  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // 결과 계산 완료 시 애니메이션 트리거
    document.addEventListener('matchCalculated', (e) => {
      this.animateResults(e.detail);
    });

    // 테마 변경 시 애니메이션 조정
    document.addEventListener('themeChanged', (e) => {
      this.adjustAnimationsForTheme(e.detail.theme);
    });

    // 모션 감소 설정 변경 감지
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.handleReducedMotion(e.matches);
    });
  }

  /**
   * 애니메이션 지원 감지
   */
  detectAnimationSupport() {
    this.supportsAnimations = CSS.supports('animation', 'none');
    this.supportsTransforms = CSS.supports('transform', 'translateX(0)');
    this.supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(1px)');

    // 성능 기반 애니메이션 레벨 설정
    this.animationLevel = this.getAnimationLevel();
  }

  /**
   * 성능 기반 애니메이션 레벨 결정
   * @returns {string} 애니메이션 레벨 ('full', 'reduced', 'minimal')
   */
  getAnimationLevel() {
    // 모션 감소 설정 확인
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return 'minimal';
    }

    // 연결 속도 확인
    if ('connection' in navigator) {
      const connection = navigator.connection;
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        return 'minimal';
      }
      if (connection.effectiveType === '3g') {
        return 'reduced';
      }
    }

    // 하드웨어 가속 지원 확인
    if (!this.supportsTransforms) {
      return 'minimal';
    }

    return 'full';
  }

  /**
   * 결과 애니메이션 실행
   * @param {Object} resultData - 결과 데이터
   */
  async animateResults(resultData) {
    if (this.isAnimating) {
      return;
    }

    this.isAnimating = true;

    try {
      // 순차적 애니메이션 실행 (결과 섹션 표시는 결과 생성 후에)
      await this.animateResultsSequence(resultData);

      // 공유 버튼 애니메이션
      await this.animateShareButtons();
    } catch (error) {
      console.error('Animation error:', error);
    } finally {
      this.isAnimating = false;
    }
  }

  /**
   * 결과 섹션 표시 애니메이션
   */
  async showResultsSection() {
    const resultsSection = document.querySelector('.mobile-results-section');
    if (!resultsSection) {
      return;
    }

    // 강제로 표시하기
    resultsSection.style.display = 'block';
    resultsSection.style.visibility = 'visible';
    resultsSection.style.opacity = '1';
    resultsSection.classList.add('show');

    // 애니메이션 완료 대기
    return new Promise(resolve => {
      setTimeout(resolve, 300);
    });
  }

  /**
   * 결과 순차 애니메이션
   * @param {Object} resultData - 결과 데이터
   */
  async animateResultsSequence(resultData) {
    if (this.animationLevel === 'minimal') {
      this.showResultsImmediately(resultData);
      return;
    }

    // 1. 결과 섹션 표시 (한 번만)
    await this.showResultsSection();

    // 2. 획수 계산 단계 애니메이션
    if (resultData.steps && resultData.steps.length > 0) {
      await this.animateCalculationSteps(resultData.steps);
    }

    // 3. 진행바 애니메이션 (마지막 숫자 줌인과 동기화)
    // animateCalculationSteps 내에서 마지막 단계에 트리거하거나, 여기서 타이밍 조절

    // 4. 결과 HTML 생성 후 바로 점수 카운트업 애니메이션
    await this.generateResultHTML(resultData);

    // 마지막 숫자가 그려진 후 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 800));

    // 줌인 효과와 동시에 게이지 상승
    const finalDigits = document.querySelectorAll('.final-score-digit');
    finalDigits.forEach(digit => {
      digit.style.transition = 'all 0.8s var(--ease-spring)';
      digit.style.transform = 'scale(2.5)';
      digit.style.color = 'var(--primary)';
      digit.style.fontWeight = '800';
    });

    // 게이지 상승 애니메이션 시작 (줌인과 동시에)
    await this.animateProgressBar(resultData.score);

    // 5. 결과 컨테이너 표시 (점수 카운터 기능은 제거되었으나 컨테이너 노출을 위해 호출)
    await this.animateScoreCounter(resultData.score);

    // 5. 설명 텍스트 애니메이션
    await this.animateExplanation();

    // 6. 결과 텍스트 애니메이션
    await this.animateResultText();
  }

  /**
   * 결과 HTML 생성
   * @param {Object} resultData - 결과 데이터
   */
  async generateResultHTML(resultData) {
    const { score, names, messages, resultDiv } = resultData;

    if (!resultDiv) {
      return;
    }

    // 결과 영역 자체를 먼저 표시 (빈 상태)
    resultDiv.style.display = 'block';
    resultDiv.style.visibility = 'visible';
    resultDiv.style.opacity = '1';

    // 결과 HTML 생성 (점수는 0%로 시작하여 애니메이션 준비, 처음에는 숨김)
    resultDiv.innerHTML = `
      <div class="result-container" style="display: block; visibility: hidden; opacity: 0;">
        <div class="message-positive"><i class="lucid-icon" data-lucide="check-circle"></i> ${messages.positive}</div>
        <div class="message-negative"><i class="lucid-icon" data-lucide="alert-triangle"></i> ${messages.negative}</div>
      </div>
    `;

    // Initialize Lucid icons after DOM update
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  /**
   * 획수 계산 단계 애니메이션
   * @param {Array} steps - 계산 단계 배열
   */
  async animateCalculationSteps(steps) {
    const explanation = document.querySelector('#explanation');
    if (!explanation) return;

    explanation.innerHTML = "";

    // 단계별로 순차 애니메이션 (빠른 속도)
    for (let i = 0; i < steps.length; i++) {
      // 첫 번째 단계는 바로 시작, 나머지는 짧은 대기
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      const line = document.createElement("div");
      line.className = "line";

      // Inverted triangle alignment logic is handled by CSS flex/grid and fixed margins
      // We don't need complex width calculations anymore as we use flow layout with center alignment

      line.style.cssText = `
        display: flex;
        justify-content: center;
        gap: 0.3rem; /* 간격 고정 */
        margin: 0.5rem auto;
        opacity: 0;
        transform: translateY(20px);
      `;

      // Spacing is handled by flex gap property in previous cssText block

      for (let j = 0; j < steps[i].length; j++) {
        const span = document.createElement("span");
        span.textContent = steps[i][j];
        // 마지막 숫자에 대한 특별 처리 (줌인 효과 준비)
        if (i === steps.length - 1) {
          span.classList.add('final-score-digit');
        }
        line.appendChild(span);
      }

      explanation.appendChild(line);

      // 애니메이션으로 나타내기 (빠른 속도)
      await this.animateElement(line, {
        opacity: '1',
        transform: 'translateY(0)'
      }, 150);
    }
  }

  /**
   * 설명 텍스트 애니메이션
   */
  async animateExplanation() {
    const explanation = document.querySelector('.mobile-explanation');
    if (!explanation) return;

    explanation.style.opacity = '0';
    explanation.style.transform = 'translateX(-20px)';

    // 점진적 표시
    await this.animateElement(explanation, {
      opacity: '1',
      transform: 'translateX(0)'
    }, 300);
  }

  /**
   * 진행바 애니메이션
   * @param {number} score - 점수
   */
  async animateProgressBar(score) {
    const progressBar = document.querySelector('.mobile-progress-fill');
    const progressContainer = document.querySelector('.mobile-progress-bar');

    if (!progressBar || !progressContainer) return;

    // 초기 상태
    progressBar.style.width = '0%';
    progressContainer.style.opacity = '1';

    // 점진적 채우기
    await this.animateElement(progressBar, {
      width: `${score}%`
    }, 1200, 'cubic-bezier(0.25, 0.46, 0.45, 0.94)');

    // 심머 효과 추가
    if (this.animationLevel === 'full') {
      progressBar.classList.add('shimmer-effect');
    }
  }

  /**
   * 점수 카운트업 애니메이션
   * @param {number} targetScore - 목표 점수
   */
  async animateScoreCounter(targetScore) {
    const resultElement = document.querySelector('.mobile-result');
    if (!resultElement) {
      return;
    }

    // DOM 업데이트 대기
    await new Promise(resolve => setTimeout(resolve, 200));

    // 결과 컨테이너를 먼저 검사
    const resultContainer = resultElement.querySelector('.result-container');

    if (resultContainer) {
      // 결과 컨테이너 가시화
      resultContainer.style.visibility = 'visible';
      resultContainer.style.opacity = '1';
      resultElement.classList.add('counting');

      // 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 500));

      // 완료 효과
      resultElement.classList.add('success-feedback');
      setTimeout(() => {
        resultElement.classList.remove('success-feedback', 'counting');
      }, 300);
    }
  }

  /**
   * 숫자 카운트업 애니메이션
   * @param {HTMLElement} element - 대상 요소
   * @param {number} start - 시작 값
   * @param {number} end - 종료 값
   * @param {number} duration - 지속 시간
   */
  async countUp(element, start, end, duration) {
    return new Promise(resolve => {
      const startTime = performance.now();
      const originalText = element.textContent;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // 이징 함수 적용 (ease-out)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(start + (end - start) * easeProgress);

        // 텍스트 업데이트 (기존 형식 유지)
        const scoreText = originalText.replace(/\d+/, currentValue);
        element.textContent = scoreText;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // 최종 값으로 확실히 설정
          const finalText = originalText.replace(/\d+/, end);
          element.textContent = finalText;
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  /**
   * 특정 요소 숫자 카운트업 애니메이션
   * @param {HTMLElement} element - 대상 요소
   * @param {number} start - 시작 값
   * @param {number} end - 종료 값
   * @param {number} duration - 지속 시간
   */
  async countUpElement(element, start, end, duration) {
    return new Promise(resolve => {
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // 이징 함수 적용 (ease-out)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(start + (end - start) * easeProgress);

        // 점수만 업데이트
        element.textContent = `${currentValue}%`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // 최종 값으로 확실히 설정
          element.textContent = `${end}%`;
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  /**
   * 결과 텍스트 애니메이션
   */
  async animateResultText() {
    const resultText = document.querySelector('.mobile-result');
    if (!resultText) return;

    // 반짝임 효과
    if (this.animationLevel === 'full') {
      resultText.classList.add('sparkle');
      setTimeout(() => {
        resultText.classList.remove('sparkle');
      }, 2000);
    }
  }

  /**
   * 공유 버튼 애니메이션
   */
  async animateShareButtons() {
    const shareButtons = document.querySelectorAll('.quick-share-btn');
    if (!shareButtons.length) return;

    // 모든 버튼을 한번에 즉시 표시 (애니메이션 없이)
    shareButtons.forEach(button => {
      button.style.opacity = '1';
      button.style.visibility = 'visible';
      button.style.transform = 'none';
    });
  }

  /**
   * 즉시 결과 표시 (모션 감소 모드)
   * @param {Object} resultData - 결과 데이터
   */
  showResultsImmediately(resultData) {
    const resultsSection = document.querySelector('.mobile-results-section');
    const progressBar = document.querySelector('.mobile-progress-fill');

    if (resultsSection) {
      resultsSection.style.opacity = '1';
      resultsSection.style.transform = 'none';
    }

    if (progressBar) {
      progressBar.style.width = `${resultData.score}%`;
    }
  }

  /**
   * 요소 애니메이션 (Promise 기반)
   * @param {HTMLElement} element - 대상 요소
   * @param {Object} properties - 애니메이션할 CSS 속성
   * @param {number} duration - 지속 시간
   * @param {string} easing - 이징 함수
   */
  async animateElement(element, properties, duration, easing = 'ease') {
    return new Promise(resolve => {
      if (!element) {
        resolve();
        return;
      }

      // 트랜지션 설정
      element.style.transition = `all ${duration}ms ${easing}`;

      // 속성 적용
      Object.assign(element.style, properties);

      // 완료 대기
      setTimeout(resolve, duration);
    });
  }

  /**
   * 뷰포트 진입 애니메이션 트리거
   * @param {HTMLElement} element - 대상 요소
   */
  triggerEntryAnimation(element) {
    if (element.classList.contains('animated')) return;

    element.classList.add('fade-in', 'animated');

    // 관찰 중단
    const observer = this.observers.get('intersection');
    if (observer) {
      observer.unobserve(element);
    }
  }

  /**
   * 테마별 애니메이션 조정
   * @param {string} theme - 테마 ('light' | 'dark')
   */
  adjustAnimationsForTheme(theme) {
    const root = document.documentElement;

    if (theme === 'dark') {
      // 다크 모드에서는 더 부드러운 애니메이션
      root.style.setProperty('--anim-base', '0.4s');
      root.style.setProperty('--ease-spring', 'cubic-bezier(0.25, 0.46, 0.45, 0.94)');
    } else {
      // 라이트 모드에서는 더 활발한 애니메이션
      root.style.setProperty('--anim-base', '0.3s');
      root.style.setProperty('--ease-spring', 'cubic-bezier(0.68, -0.55, 0.265, 1.55)');
    }
  }

  /**
   * 모션 감소 모드 처리
   * @param {boolean} reduced - 모션 감소 여부
   */
  handleReducedMotion(reduced) {
    if (reduced) {
      this.animationLevel = 'minimal';
      document.body.classList.add('reduced-motion');
    } else {
      this.animationLevel = this.getAnimationLevel();
      document.body.classList.remove('reduced-motion');
    }
  }

  /**
   * 성공 피드백 애니메이션
   * @param {HTMLElement} element - 대상 요소
   */
  showSuccessFeedback(element) {
    if (!element || this.animationLevel === 'minimal') return;

    element.classList.add('success-feedback');
    setTimeout(() => {
      element.classList.remove('success-feedback');
    }, 300);
  }

  /**
   * 에러 피드백 애니메이션
   * @param {HTMLElement} element - 대상 요소
   */
  showErrorFeedback(element) {
    if (!element || this.animationLevel === 'minimal') return;

    element.classList.add('error-shake');
    setTimeout(() => {
      element.classList.remove('error-shake');
    }, 300);
  }

  /**
   * 주목 애니메이션
   * @param {HTMLElement} element - 대상 요소
   * @param {number} duration - 지속 시간
   */
  pulseAttention(element, duration = 2000) {
    if (!element || this.animationLevel === 'minimal') return;

    element.classList.add('attention-pulse');
    setTimeout(() => {
      element.classList.remove('attention-pulse');
    }, duration);
  }

  /**
   * 모든 애니메이션 일시정지
   */
  pauseAllAnimations() {
    document.body.classList.add('anim-paused');
  }

  /**
   * 모든 애니메이션 재개
   */
  resumeAllAnimations() {
    document.body.classList.remove('anim-paused');
  }

  /**
   * 애니메이션 컨트롤러 정리
   */
  destroy() {
    // 관찰자 정리
    this.observers.forEach(observer => {
      if (observer.disconnect) {
        observer.disconnect();
      }
    });
    this.observers.clear();

    // 카운터 정리
    this.counters.clear();

    // 이벤트 리스너 제거는 passive하게 유지
  }
}

// 전역 스코프에서 사용 가능하도록 export
window.AnimationController = AnimationController;
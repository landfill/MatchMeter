/**
 * @fileoverview 테마 관리 시스템 - 다크/라이트 모드 및 시스템 테마 지원
 */

/**
 * 테마 관리 클래스
 * 다크/라이트 모드 전환, 시스템 설정 감지, 사용자 설정 저장
 */
class ThemeManager {
  /**
   * ThemeManager 생성자
   */
  constructor() {
    this.currentTheme = 'light'; // 'light', 'dark'
    this.systemTheme = 'light';
    this.storageKey = 'matchmeter-theme';
    
    this.init();
  }

  /**
   * 초기화
   */
  init() {
    this.detectSystemTheme();
    this.loadUserPreference();
    this.applyTheme();
    this.bindEvents();
    this.createThemeToggle();
  }

  /**
   * 시스템 테마 감지 (참고용)
   */
  detectSystemTheme() {
    // 시스템 다크 모드 감지 (참고용으로만 사용)
    this.systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * 사용자 설정 로드
   */
  loadUserPreference() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved && ['light', 'dark'].includes(saved)) {
        this.currentTheme = saved;
      } else {
        // 기본값을 light로 설정
        this.currentTheme = 'light';
      }
    } catch (error) {
      console.warn('테마 설정을 로드할 수 없습니다:', error);
      this.currentTheme = 'light';
    }
  }

  /**
   * 사용자 설정 저장
   */
  saveUserPreference() {
    try {
      localStorage.setItem(this.storageKey, this.currentTheme);
    } catch (error) {
      console.warn('테마 설정을 저장할 수 없습니다:', error);
    }
  }

  /**
   * 테마 적용
   */
  applyTheme() {
    // 전환 중 깜빡임 방지
    document.documentElement.classList.add('theme-switching');
    
    const effectiveTheme = this.getEffectiveTheme();
    
    // 데이터 속성 설정
    if (effectiveTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    
    // 메타 테마 컬러 업데이트 (모바일 브라우저용)
    this.updateMetaThemeColor(effectiveTheme);
    
    // 테마 전환 완료 후 전환 클래스 제거
    setTimeout(() => {
      document.documentElement.classList.remove('theme-switching');
    }, 100);
    
    // 커스텀 이벤트 발생
    this.dispatchThemeChangeEvent(effectiveTheme);
  }

  /**
   * 실제 적용될 테마 반환
   * @returns {string} 'light' 또는 'dark'
   */
  getEffectiveTheme() {
    return this.currentTheme;
  }

  /**
   * 메타 테마 컬러 업데이트
   * @param {string} theme - 테마 ('light' | 'dark')
   */
  updateMetaThemeColor(theme) {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    
    // 테마별 색상 설정
    const themeColors = {
      light: '#ffffff',
      dark: '#0f0f23'
    };
    
    metaThemeColor.content = themeColors[theme];
  }

  /**
   * 테마 변경 이벤트 발생
   * @param {string} theme - 현재 테마
   */
  dispatchThemeChangeEvent(theme) {
    const event = new CustomEvent('themeChanged', {
      detail: {
        theme: theme,
        userPreference: this.currentTheme,
        systemTheme: this.systemTheme
      }
    });
    document.dispatchEvent(event);
  }

  /**
   * 테마 토글
   */
  toggleTheme() {
    const themes = ['light', 'dark'];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    
    this.setTheme(themes[nextIndex]);
  }

  /**
   * 특정 테마 설정
   * @param {string} theme - 설정할 테마 ('light' | 'dark')
   */
  setTheme(theme) {
    if (!['light', 'dark'].includes(theme)) {
      console.warn('유효하지 않은 테마:', theme);
      return;
    }
    
    this.currentTheme = theme;
    this.applyTheme();
    
    // 빠른 반응을 위해 비동기 처리
    setTimeout(() => {
      this.saveUserPreference();
      this.updateToggleButton();
      this.provideFeedback();
    }, 10);
  }

  /**
   * 테마 토글 버튼 생성
   */
  createThemeToggle() {
    // HTML에 이미 존재하는 테마 버튼 찾기
    const existingToggle = document.getElementById('themeToggle');
    if (existingToggle) {
      // 클릭 이벤트 바인딩
      existingToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
      
      // 키보드 이벤트
      existingToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleTheme();
        }
      });
      
      // 접근성 라벨 설정
      existingToggle.setAttribute('aria-label', this.getToggleAriaLabel());
      
      this.toggleButton = existingToggle;
      this.updateToggleButton();
      return;
    }
    
    // HTML에 없다면 동적 생성
    const toggle = document.createElement('button');
    toggle.id = 'themeToggle';
    toggle.className = 'theme-toggle';
    toggle.setAttribute('aria-label', this.getToggleAriaLabel());
    toggle.innerHTML = `
      <span class="theme-icon" aria-hidden="true">🌙</span>
    `;
    
    // 헤더 컨트롤에 추가
    const headerControls = document.querySelector('.header-controls');
    if (headerControls) {
      const langToggle = headerControls.querySelector('.lang-toggle');
      if (langToggle) {
        headerControls.insertBefore(toggle, langToggle);
      } else {
        headerControls.appendChild(toggle);
      }
    } else {
      // 대체: 헤더에 직접 추가
      const header = document.querySelector('.header-content');
      if (header) {
        header.appendChild(toggle);
      }
    }
    
    // 클릭 이벤트
    toggle.addEventListener('click', () => {
      this.toggleTheme();
    });
    
    // 키보드 이벤트
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleTheme();
      }
    });
    
    this.toggleButton = toggle;
  }

  /**
   * 토글 버튼 업데이트
   */
  updateToggleButton() {
    if (!this.toggleButton) return;
    
    const iconElement = this.toggleButton.querySelector('.theme-icon');
    if (iconElement) {
      // 테마에 따른 아이콘 변경
      const icons = {
        light: '☀️',
        dark: '🌙'
      };
      iconElement.textContent = icons[this.currentTheme] || icons.light;
    }
    
    this.toggleButton.setAttribute('aria-label', this.getToggleAriaLabel());
  }

  /**
   * 토글 버튼 텍스트 반환
   * @returns {string} 버튼 텍스트
   */
  getToggleText() {
    const language = window.currentLanguage || 'ko';
    const texts = {
      ko: {
        light: '라이트',
        dark: '다크'
      },
      en: {
        light: 'Light',
        dark: 'Dark'
      }
    };
    
    return texts[language][this.currentTheme] || texts.ko[this.currentTheme];
  }

  /**
   * 토글 버튼 접근성 라벨 반환
   * @returns {string} 접근성 라벨
   */
  getToggleAriaLabel() {
    const language = window.currentLanguage || 'ko';
    const effectiveTheme = this.getEffectiveTheme();
    
    if (language === 'ko') {
      return `테마 변경 (현재: ${this.getToggleText()}, 실제: ${effectiveTheme === 'dark' ? '다크' : '라이트'})`;
    }
    return `Change theme (current: ${this.getToggleText()}, effective: ${effectiveTheme})`;
  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // 언어 변경 시 토글 버튼 텍스트 업데이트
    document.addEventListener('languageChanged', () => {
      this.updateToggleButton();
    });
    
    // 페이지 가시성 변경 시 테마 재확인 (제거됨 - auto 모드 없음)
  }

  /**
   * 햅틱 피드백 제공
   */
  provideFeedback() {
    if ('vibrate' in navigator && this.isMobile()) {
      navigator.vibrate([10]);
    }
  }

  /**
   * 모바일 디바이스 감지
   * @returns {boolean} 모바일 여부
   */
  isMobile() {
    return window.innerWidth < 768 || 'ontouchstart' in window;
  }

  /**
   * 현재 테마 정보 반환
   * @returns {Object} 테마 정보
   */
  getThemeInfo() {
    return {
      current: this.currentTheme,
      effective: this.getEffectiveTheme(),
      system: this.systemTheme,
      isDark: this.getEffectiveTheme() === 'dark'
    };
  }

  /**
   * 테마별 색상 값 반환
   * @param {string} colorName - 색상 이름
   * @returns {string} CSS 색상 값
   */
  getThemeColor(colorName) {
    const style = getComputedStyle(document.documentElement);
    return style.getPropertyValue(`--theme-${colorName}`).trim();
  }

  /**
   * 특정 요소에 테마 클래스 적용
   * @param {HTMLElement} element - 대상 요소
   * @param {string} baseClass - 기본 클래스명
   */
  applyThemeClass(element, baseClass) {
    if (!element) return;
    
    const theme = this.getEffectiveTheme();
    const themeClass = `${baseClass}--${theme}`;
    
    // 기존 테마 클래스 제거
    element.classList.remove(`${baseClass}--light`, `${baseClass}--dark`);
    
    // 새 테마 클래스 추가
    element.classList.add(themeClass);
  }

  /**
   * 테마 매니저 해제
   */
  destroy() {
    if (this.toggleButton) {
      this.toggleButton.remove();
    }
  }
}

// 전역 스코프에서 사용 가능하도록 export
window.ThemeManager = ThemeManager;
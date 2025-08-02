/**
 * @fileoverview 계절별/이벤트 테마 관리자
 * 시즌별 테마, 특별 이벤트 테마, 자동 테마 적용 관리
 */

/**
 * 계절별/이벤트 테마 관리 클래스
 * 현재 날짜에 따른 자동 테마 적용 및 특별 이벤트 테마 지원
 */
class SeasonalThemeManager {
  /**
   * SeasonalThemeManager 생성자
   * @param {ThemeManager} themeManager - 기본 테마 관리자
   */
  constructor(themeManager) {
    this.themeManager = themeManager;
    this.currentSeasonalTheme = null;
    this.seasonalThemes = this.initializeSeasonalThemes();
    this.specialEvents = this.initializeSpecialEvents();
    
    this.init();
  }

  /**
   * 초기화
   */
  init() {
    this.detectCurrentSeason();
    this.bindEvents();
    this.startSeasonalMonitoring();
  }

  /**
   * 계절별 테마 정의 초기화
   * @returns {Object} 계절별 테마 설정
   */
  initializeSeasonalThemes() {
    return {
      spring: {
        name: 'spring',
        displayName: { ko: '봄', en: 'Spring' },
        months: [3, 4, 5],
        colors: {
          primary: '#ff6b9d',
          secondary: '#c44569',
          accent: '#f8b500',
          background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 50%, #fd79a8 100%)',
          cardBackground: 'rgba(255, 255, 255, 0.9)',
          textPrimary: '#2d3436',
          textSecondary: '#636e72'
        },
        animations: {
          particles: '🌸 🌺 🌼 🦋 🌱',
          duration: 3000,
          count: 15
        },
        effects: {
          blur: '8px',
          opacity: 0.1
        }
      },
      summer: {
        name: 'summer',
        displayName: { ko: '여름', en: 'Summer' },
        months: [6, 7, 8],
        colors: {
          primary: '#00cec9',
          secondary: '#0984e3',
          accent: '#fdcb6e',
          background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 50%, #00cec9 100%)',
          cardBackground: 'rgba(255, 255, 255, 0.9)',
          textPrimary: '#2d3436',
          textSecondary: '#636e72'
        },
        animations: {
          particles: '☀️ 🌊 🏖️ 🐚 🌴',
          duration: 2500,
          count: 12
        },
        effects: {
          blur: '6px',
          opacity: 0.15
        }
      },
      autumn: {
        name: 'autumn',
        displayName: { ko: '가을', en: 'Autumn' },
        months: [9, 10, 11],
        colors: {
          primary: '#d63031',
          secondary: '#e17055',
          accent: '#fdcb6e',
          background: 'linear-gradient(135deg, #fab1a0 0%, #fd79a8 50%, #e84393 100%)',
          cardBackground: 'rgba(255, 255, 255, 0.9)',
          textPrimary: '#2d3436',
          textSecondary: '#636e72'
        },
        animations: {
          particles: '🍂 🍁 🌰 🦔 🍄',
          duration: 4000,
          count: 18
        },
        effects: {
          blur: '10px',
          opacity: 0.08
        }
      },
      winter: {
        name: 'winter',
        displayName: { ko: '겨울', en: 'Winter' },
        months: [12, 1, 2],
        colors: {
          primary: '#74b9ff',
          secondary: '#0984e3',
          accent: '#a29bfe',
          background: 'linear-gradient(135deg, #ddd6fe 0%, #a5b4fc 50%, #c7d2fe 100%)',
          cardBackground: 'rgba(255, 255, 255, 0.95)',
          textPrimary: '#2d3436',
          textSecondary: '#636e72'
        },
        animations: {
          particles: '❄️ ⛄ 🎿 ❄️ 🏔️',
          duration: 5000,
          count: 20
        },
        effects: {
          blur: '12px',
          opacity: 0.06
        }
      }
    };
  }

  /**
   * 특별 이벤트 테마 정의 초기화
   * @returns {Array} 특별 이벤트 배열
   */
  initializeSpecialEvents() {
    return [
      {
        name: 'valentine',
        displayName: { ko: '발렌타인', en: 'Valentine' },
        startDate: { month: 2, day: 10 },
        endDate: { month: 2, day: 20 },
        priority: 10,
        colors: {
          primary: '#fd79a8',
          secondary: '#e84393',
          accent: '#ff7675',
          background: 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 50%, #e17055 100%)',
          cardBackground: 'rgba(255, 255, 255, 0.95)',
          textPrimary: '#2d3436',
          textSecondary: '#636e72'
        },
        animations: {
          particles: '💖 💕 💘 💝 🌹',
          duration: 2000,
          count: 25
        },
        effects: {
          blur: '6px',
          opacity: 0.2
        }
      },
      {
        name: 'christmas',
        displayName: { ko: '크리스마스', en: 'Christmas' },
        startDate: { month: 12, day: 20 },
        endDate: { month: 12, day: 31 },
        priority: 10,
        colors: {
          primary: '#00b894',
          secondary: '#d63031',
          accent: '#fdcb6e',
          background: 'linear-gradient(135deg, #00b894 0%, #d63031 50%, #fdcb6e 100%)',
          cardBackground: 'rgba(255, 255, 255, 0.95)',
          textPrimary: '#2d3436',
          textSecondary: '#636e72'
        },
        animations: {
          particles: '🎄 🎅 ⭐ 🎁 ❄️',
          duration: 3500,
          count: 20
        },
        effects: {
          blur: '8px',
          opacity: 0.15
        }
      },
      {
        name: 'newyear',
        displayName: { ko: '새해', en: 'New Year' },
        startDate: { month: 1, day: 1 },
        endDate: { month: 1, day: 7 },
        priority: 10,
        colors: {
          primary: '#fdcb6e',
          secondary: '#e17055',
          accent: '#a29bfe',
          background: 'linear-gradient(135deg, #fdcb6e 0%, #fd79a8 50%, #a29bfe 100%)',
          cardBackground: 'rgba(255, 255, 255, 0.95)',
          textPrimary: '#2d3436',
          textSecondary: '#636e72'
        },
        animations: {
          particles: '🎊 🎉 ✨ 🎈 🌟',
          duration: 2500,
          count: 30
        },
        effects: {
          blur: '10px',
          opacity: 0.25
        }
      },
      {
        name: 'halloween',
        displayName: { ko: '할로윈', en: 'Halloween' },
        startDate: { month: 10, day: 25 },
        endDate: { month: 11, day: 2 },
        priority: 8,
        colors: {
          primary: '#e17055',
          secondary: '#2d3436',
          accent: '#fdcb6e',
          background: 'linear-gradient(135deg, #2d3436 0%, #e17055 50%, #fdcb6e 100%)',
          cardBackground: 'rgba(0, 0, 0, 0.8)',
          textPrimary: '#ffffff',
          textSecondary: '#ddd6fe'
        },
        animations: {
          particles: '🎃 👻 🦇 🕷️ 🌙',
          duration: 4000,
          count: 15
        },
        effects: {
          blur: '12px',
          opacity: 0.1
        },
        darkMode: true
      }
    ];
  }

  /**
   * 현재 계절 감지 및 테마 적용
   */
  detectCurrentSeason() {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();
    
    // 특별 이벤트 확인 (우선순위 높음)
    const activeEvent = this.getActiveSpecialEvent(currentMonth, currentDay);
    if (activeEvent) {
      this.applySeasonalTheme(activeEvent);
      return;
    }
    
    // 계절별 테마 적용
    const currentSeason = this.getCurrentSeason(currentMonth);
    if (currentSeason) {
      this.applySeasonalTheme(currentSeason);
    }
  }

  /**
   * 활성 특별 이벤트 확인
   * @param {number} month - 현재 월
   * @param {number} day - 현재 일
   * @returns {Object|null} 활성 이벤트 또는 null
   */
  getActiveSpecialEvent(month, day) {
    return this.specialEvents.find(event => {
      const start = event.startDate;
      const end = event.endDate;
      
      // 같은 달 내 이벤트
      if (start.month === end.month) {
        return month === start.month && day >= start.day && day <= end.day;
      }
      
      // 월을 넘나드는 이벤트 (예: 12월 말 ~ 1월 초)
      if (start.month > end.month) {
        return (month === start.month && day >= start.day) ||
               (month === end.month && day <= end.day);
      }
      
      return false;
    });
  }

  /**
   * 현재 계절 반환
   * @param {number} month - 현재 월
   * @returns {Object|null} 계절 테마 또는 null
   */
  getCurrentSeason(month) {
    return Object.values(this.seasonalThemes).find(season => 
      season.months.includes(month)
    );
  }

  /**
   * 계절별 테마 적용
   * @param {Object} theme - 테마 설정
   */
  applySeasonalTheme(theme) {
    if (this.currentSeasonalTheme?.name === theme.name) return;
    
    this.currentSeasonalTheme = theme;
    
    // 이전 테마 클래스 제거
    document.body.classList.remove('seasonal-theme-active');
    document.body.className = document.body.className.replace(/seasonal-\w+/g, '');
    
    // CSS 변수 업데이트
    this.updateCSSVariables(theme);
    
    // 테마 클래스 추가
    document.body.classList.add('seasonal-theme-active', `seasonal-${theme.name}`);
    
    // 파티클 애니메이션 추가
    this.createSeasonalParticles(theme);
    
    // 테마별 특별 효과
    this.applySpecialEffects(theme);
    
    // 전환 애니메이션
    document.body.classList.add('seasonal-theme-transition');
    setTimeout(() => {
      document.body.classList.remove('seasonal-theme-transition');
    }, 1000);
    
    // 이벤트 발생
    document.dispatchEvent(new CustomEvent('seasonalThemeChanged', {
      detail: { theme: theme.name, displayName: theme.displayName }
    }));
  }

  /**
   * CSS 변수 업데이트
   * @param {Object} theme - 테마 설정
   */
  updateCSSVariables(theme) {
    const root = document.documentElement;
    const colors = theme.colors;
    
    // 계절별 색상 적용
    root.style.setProperty('--seasonal-primary', colors.primary);
    root.style.setProperty('--seasonal-secondary', colors.secondary);
    root.style.setProperty('--seasonal-accent', colors.accent);
    root.style.setProperty('--seasonal-background', colors.background);
    root.style.setProperty('--seasonal-card-bg', colors.cardBackground);
    root.style.setProperty('--seasonal-text-primary', colors.textPrimary);
    root.style.setProperty('--seasonal-text-secondary', colors.textSecondary);
    
    // 배경 그라데이션 적용
    document.body.style.background = colors.background;
    
    // 다크 모드 이벤트 테마인 경우
    if (theme.darkMode && this.themeManager) {
      this.themeManager.setTheme('dark');
    }
  }

  /**
   * 계절별 파티클 애니메이션 생성
   * @param {Object} theme - 테마 설정
   */
  createSeasonalParticles(theme) {
    // 기존 파티클 제거
    this.clearSeasonalParticles();
    
    if (!theme.animations || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    const particles = theme.animations.particles.split(' ');
    const container = this.getOrCreateParticleContainer();
    
    for (let i = 0; i < theme.animations.count; i++) {
      setTimeout(() => {
        this.createSingleParticle(container, particles, theme);
      }, i * 100);
    }
  }

  /**
   * 파티클 컨테이너 생성 또는 반환
   * @returns {HTMLElement} 파티클 컨테이너
   */
  getOrCreateParticleContainer() {
    let container = document.getElementById('seasonal-particles');
    if (!container) {
      container = document.createElement('div');
      container.id = 'seasonal-particles';
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
      `;
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * 개별 파티클 생성
   * @param {HTMLElement} container - 파티클 컨테이너
   * @param {Array} particles - 파티클 이모지 배열
   * @param {Object} theme - 테마 설정
   */
  createSingleParticle(container, particles, theme) {
    const particle = document.createElement('div');
    const emoji = particles[Math.floor(Math.random() * particles.length)];
    
    particle.textContent = emoji;
    particle.style.cssText = `
      position: absolute;
      font-size: ${20 + Math.random() * 20}px;
      opacity: ${0.3 + Math.random() * 0.4};
      left: ${Math.random() * 100}%;
      top: -50px;
      pointer-events: none;
      animation: seasonalFloat ${theme.animations.duration + Math.random() * 2000}ms linear infinite;
    `;
    
    container.appendChild(particle);
    
    // 애니메이션 완료 후 제거
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, theme.animations.duration + 2000);
  }

  /**
   * 특별 효과 적용
   * @param {Object} theme - 테마 설정
   */
  applySpecialEffects(theme) {
    if (!theme.effects) return;
    
    // 블러 효과
    if (theme.effects.blur) {
      document.body.style.backdropFilter = `blur(${theme.effects.blur})`;
    }
    
    // 추가 시각 효과는 여기에 구현
  }

  /**
   * 기존 파티클 정리
   */
  clearSeasonalParticles() {
    const container = document.getElementById('seasonal-particles');
    if (container) {
      container.innerHTML = '';
    }
  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // 테마 변경 시 계절 테마도 조정
    document.addEventListener('themeChanged', (e) => {
      if (this.currentSeasonalTheme) {
        this.adjustForBaseTheme(e.detail.theme);
      }
    });
    
    // 날짜 변경 감지 (자정 확인)
    setInterval(() => {
      this.checkDateChange();
    }, 60000); // 1분마다 확인
  }

  /**
   * 기본 테마에 따른 계절 테마 조정
   * @param {string} baseTheme - 기본 테마 ('light' | 'dark')
   */
  adjustForBaseTheme(baseTheme) {
    if (!this.currentSeasonalTheme) return;
    
    const root = document.documentElement;
    
    if (baseTheme === 'dark') {
      // 다크 모드에서는 배경을 더 어둡게 조정
      const darkBackground = this.currentSeasonalTheme.colors.background
        .replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([^)]+)\)/g, 'rgba($1, $2, $3, 0.3)');
      root.style.setProperty('--seasonal-background', darkBackground);
    }
  }

  /**
   * 계절별 모니터링 시작
   */
  startSeasonalMonitoring() {
    // 매일 자정에 계절 확인
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      this.detectCurrentSeason();
      // 이후 24시간마다 확인
      setInterval(() => {
        this.detectCurrentSeason();
      }, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
  }

  /**
   * 날짜 변경 확인
   */
  checkDateChange() {
    const now = new Date();
    const currentDate = `${now.getMonth()}-${now.getDate()}`;
    
    if (this.lastCheckedDate !== currentDate) {
      this.lastCheckedDate = currentDate;
      this.detectCurrentSeason();
    }
  }

  /**
   * 수동 테마 설정
   * @param {string} themeName - 테마 이름
   */
  setSeasonalTheme(themeName) {
    const theme = this.seasonalThemes[themeName] || 
                  this.specialEvents.find(e => e.name === themeName);
    
    if (theme) {
      this.applySeasonalTheme(theme);
    }
  }

  /**
   * 계절 테마 제거
   */
  clearSeasonalTheme() {
    this.currentSeasonalTheme = null;
    this.clearSeasonalParticles();
    
    const root = document.documentElement;
    
    // 테마 클래스 제거
    document.body.classList.remove('seasonal-theme-active');
    document.body.className = document.body.className.replace(/seasonal-\w+/g, '');
    
    // CSS 변수 초기화
    root.style.removeProperty('--seasonal-primary');
    root.style.removeProperty('--seasonal-secondary');
    root.style.removeProperty('--seasonal-accent');
    root.style.removeProperty('--seasonal-background');
    root.style.removeProperty('--seasonal-card-bg');
    root.style.removeProperty('--seasonal-text-primary');
    root.style.removeProperty('--seasonal-text-secondary');
    
    // 배경 초기화
    document.body.style.background = '';
  }

  /**
   * 현재 계절 테마 정보 반환
   * @returns {Object|null} 현재 테마 정보
   */
  getCurrentThemeInfo() {
    return this.currentSeasonalTheme ? {
      name: this.currentSeasonalTheme.name,
      displayName: this.currentSeasonalTheme.displayName,
      isSpecialEvent: this.specialEvents.some(e => e.name === this.currentSeasonalTheme.name)
    } : null;
  }

  /**
   * 사용 가능한 테마 목록 반환
   * @returns {Array} 테마 목록
   */
  getAvailableThemes() {
    const seasonal = Object.values(this.seasonalThemes).map(theme => ({
      name: theme.name,
      displayName: theme.displayName,
      type: 'seasonal'
    }));
    
    const special = this.specialEvents.map(event => ({
      name: event.name,
      displayName: event.displayName,
      type: 'special'
    }));
    
    return [...seasonal, ...special];
  }

  /**
   * 정리
   */
  destroy() {
    this.clearSeasonalParticles();
    this.clearSeasonalTheme();
    
    // 파티클 컨테이너 제거
    const container = document.getElementById('seasonal-particles');
    if (container) {
      container.remove();
    }
  }
}

// CSS 애니메이션 동적 추가
if (!document.getElementById('seasonal-animations')) {
  const style = document.createElement('style');
  style.id = 'seasonal-animations';
  style.textContent = `
    @keyframes seasonalFloat {
      0% {
        transform: translateY(-50px) rotate(0deg);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% {
        transform: translateY(calc(100vh + 50px)) rotate(360deg);
        opacity: 0;
      }
    }
    
    .seasonal-theme-active {
      transition: all 0.5s ease;
    }
    
    .seasonal-particles {
      pointer-events: none;
      user-select: none;
    }
  `;
  document.head.appendChild(style);
}

// 전역 스코프에서 사용 가능하도록 export
window.SeasonalThemeManager = SeasonalThemeManager;
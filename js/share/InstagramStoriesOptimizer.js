/**
 * @fileoverview Instagram Stories 최적화 공유 컴포넌트
 * 9:16 비율, 스토리 친화적 디자인, 인터랙티브 요소 지원
 */

/**
 * Instagram Stories 최적화 공유 클래스
 * 스토리 포맷에 최적화된 이미지 생성 및 공유 기능
 */
class InstagramStoriesOptimizer {
  /**
   * InstagramStoriesOptimizer 생성자
   * @param {ShareManager} shareManager - 공유 관리자 인스턴스
   */
  constructor(shareManager) {
    this.shareManager = shareManager;
    this.canvas = null;
    this.storyTemplates = [];
    
    this.init();
  }

  /**
   * 초기화
   */
  init() {
    this.createCanvas();
    this.loadStoryTemplates();
    this.bindEvents();
  }

  /**
   * 스토리용 캔버스 생성 (9:16 비율)
   */
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1080;  // Instagram Stories 권장 해상도
    this.canvas.height = 1920; // 9:16 비율
    this.canvas.style.display = 'none';
    document.body.appendChild(this.canvas);
  }

  /**
   * 스토리 템플릿 로드
   */
  loadStoryTemplates() {
    this.storyTemplates = [
      {
        id: 'gradient-hearts',
        name: '하트 그라데이션',
        backgroundColor: ['#ff6b6b', '#ff8e53', '#ff6b9d'],
        decorativeElements: ['💕', '💖', '✨', '💝'],
        textStyle: 'bold'
      },
      {
        id: 'cosmic-love',
        name: '우주 테마',
        backgroundColor: ['#667eea', '#764ba2', '#667eea'],
        decorativeElements: ['⭐', '✨', '🌟', '💫'],
        textStyle: 'cosmic'
      },
      {
        id: 'vintage-romance',
        name: '빈티지 로맨스',
        backgroundColor: ['#f093fb', '#f5576c', '#4facfe'],
        decorativeElements: ['🌹', '💐', '🦋', '✨'],
        textStyle: 'vintage'
      },
      {
        id: 'modern-minimal',
        name: '모던 미니멀',
        backgroundColor: ['#ffffff', '#f8f8f8', '#ffffff'],
        decorativeElements: ['◯', '△', '◇', '⬡'],
        textStyle: 'minimal'
      },
      {
        id: 'dark-elegance',
        name: '다크 엘레간스',
        backgroundColor: ['#000000', '#1a1a1a', '#2d2d2d'],
        decorativeElements: ['✦', '✧', '⟡', '◈'],
        textStyle: 'elegant'
      }
    ];
  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // Instagram Stories 공유 요청 처리
    document.addEventListener('instagramStoriesRequested', (e) => {
      this.generateStoryImage(e.detail.template || 'gradient-hearts');
    });

    // 테마 변경 시 템플릿 업데이트
    document.addEventListener('themeChanged', (e) => {
      this.updateTemplatesForTheme(e.detail.theme);
    });
  }

  /**
   * 스토리 이미지 생성
   * @param {string} templateId - 사용할 템플릿 ID
   * @returns {Promise<string>} 생성된 이미지 데이터 URL
   */
  async generateStoryImage(templateId = 'gradient-hearts') {
    const ctx = this.canvas.getContext('2d');
    const template = this.storyTemplates.find(t => t.id === templateId) || this.storyTemplates[0];
    const { resultData } = this.shareManager;
    const language = this.shareManager.language;
    const isDark = this.isDarkTheme();
    
    // 캔버스 초기화
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 배경 그리기
    await this.drawStoryBackground(ctx, template, isDark);
    
    // 상단 브랜딩
    await this.drawStoryHeader(ctx, language, template);
    
    // 메인 콘텐츠 영역 (중앙)
    await this.drawStoryMainContent(ctx, resultData, language, template);
    
    // 하단 CTA 영역
    await this.drawStoryCTA(ctx, language, template);
    
    // 인터랙티브 요소 힌트
    await this.drawInteractiveHints(ctx, template);
    
    return this.canvas.toDataURL('image/png', 0.95);
  }

  /**
   * 스토리 배경 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} template - 템플릿 정보
   * @param {boolean} isDark - 다크 모드 여부
   */
  async drawStoryBackground(ctx, template, isDark) {
    ctx.save();
    
    // 그라데이션 배경
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    
    if (template.id === 'dark-elegance' || isDark) {
      gradient.addColorStop(0, '#0f0f23');
      gradient.addColorStop(0.5, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
    } else {
      template.backgroundColor.forEach((color, index) => {
        gradient.addColorStop(index / (template.backgroundColor.length - 1), color);
      });
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 장식적 요소들
    await this.drawStoryDecorations(ctx, template, isDark);
    
    // 오버레이 효과
    if (template.id !== 'modern-minimal') {
      ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    ctx.restore();
  }

  /**
   * 스토리 장식 요소 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} template - 템플릿 정보
   * @param {boolean} isDark - 다크 모드 여부
   */
  async drawStoryDecorations(ctx, template, isDark) {
    ctx.save();
    
    const elements = template.decorativeElements;
    const elementCount = template.id === 'modern-minimal' ? 8 : 15;
    
    for (let i = 0; i < elementCount; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const element = elements[Math.floor(Math.random() * elements.length)];
      const size = 20 + Math.random() * 40;
      const opacity = 0.1 + Math.random() * 0.3;
      
      ctx.globalAlpha = opacity;
      ctx.font = `${size}px Arial`;
      ctx.fillStyle = isDark ? '#ffffff' : '#000000';
      
      if (template.id === 'modern-minimal') {
        // 기하학적 도형
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(x, y, size / 2, size / 2);
      } else {
        ctx.fillText(element, x, y);
      }
    }
    
    ctx.restore();
  }

  /**
   * 스토리 헤더 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {string} language - 언어 코드
   * @param {Object} template - 템플릿 정보
   */
  async drawStoryHeader(ctx, language, template) {
    ctx.save();
    
    const isDark = this.isDarkTheme() || template.id === 'dark-elegance';
    const textColor = isDark ? '#ffffff' : '#000000';
    
    // 브랜드 로고/제목
    ctx.fillStyle = textColor;
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const title = '📊 Match Meter';
    this.drawTextWithShadow(ctx, title, this.canvas.width / 2, 150, isDark);
    
    // 부제목
    ctx.font = '24px Arial, sans-serif';
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)';
    const subtitle = language === 'ko' ? '이름 궁합 테스트' : 'Name Compatibility Test';
    ctx.fillText(subtitle, this.canvas.width / 2, 200);
    
    ctx.restore();
  }

  /**
   * 스토리 메인 콘텐츠 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} resultData - 결과 데이터
   * @param {string} language - 언어 코드
   * @param {Object} template - 템플릿 정보
   */
  async drawStoryMainContent(ctx, resultData, language, template) {
    ctx.save();
    
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const isDark = this.isDarkTheme() || template.id === 'dark-elegance';
    
    // 이름 표시 영역
    await this.drawNamesSection(ctx, resultData.names, centerX, centerY - 200, template, isDark);
    
    // 점수 표시 (가장 중요한 부분)
    await this.drawScoreSection(ctx, resultData.score, centerX, centerY, template, isDark);
    
    // 궁합 설명
    await this.drawCompatibilityText(ctx, resultData.score, language, centerX, centerY + 150, template, isDark);
    
    ctx.restore();
  }

  /**
   * 이름 섹션 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} names - 이름 데이터
   * @param {number} centerX - 중심 X 좌표
   * @param {number} centerY - 중심 Y 좌표
   * @param {Object} template - 템플릿 정보
   * @param {boolean} isDark - 다크 모드 여부
   */
  async drawNamesSection(ctx, names, centerX, centerY, template, isDark) {
    ctx.save();
    
    const textColor = isDark ? '#ffffff' : '#000000';
    
    // 이름 컨테이너 배경
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    ctx.roundRect(centerX - 200, centerY - 50, 400, 100, 20);
    ctx.fill();
    
    // 이름들
    ctx.fillStyle = textColor;
    ctx.font = 'bold 42px Arial, sans-serif';
    ctx.textAlign = 'center';
    
    const name1 = names.name1;
    const name2 = names.name2;
    
    // 첫 번째 이름
    this.drawTextWithShadow(ctx, name1, centerX - 70, centerY - 10, isDark);
    
    // 하트 아이콘
    ctx.font = '48px Arial';
    ctx.fillStyle = '#ff6b6b';
    this.drawTextWithShadow(ctx, '💖', centerX, centerY - 10, false);
    
    // 두 번째 이름
    ctx.fillStyle = textColor;
    ctx.font = 'bold 42px Arial, sans-serif';
    this.drawTextWithShadow(ctx, name2, centerX + 70, centerY - 10, isDark);
    
    ctx.restore();
  }

  /**
   * 점수 섹션 그리기 (Instagram Stories의 핵심)
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {number} score - 점수
   * @param {number} centerX - 중심 X 좌표
   * @param {number} centerY - 중심 Y 좌표
   * @param {Object} template - 템플릿 정보
   * @param {boolean} isDark - 다크 모드 여부
   */
  async drawScoreSection(ctx, score, centerX, centerY, template, isDark) {
    ctx.save();
    
    // 점수 원형 배경
    const radius = 120;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    
    // 그라데이션 배경
    const scoreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    
    if (score >= 80) {
      scoreGradient.addColorStop(0, '#ff6b6b');
      scoreGradient.addColorStop(1, '#ff8e8e');
    } else if (score >= 60) {
      scoreGradient.addColorStop(0, '#ffa726');
      scoreGradient.addColorStop(1, '#ffcc02');
    } else {
      scoreGradient.addColorStop(0, '#42a5f5');
      scoreGradient.addColorStop(1, '#66bb6a');
    }
    
    ctx.fillStyle = scoreGradient;
    ctx.fill();
    
    // 점수 테두리 (펄스 효과)
    ctx.strokeStyle = isDark ? '#ffffff' : '#000000';
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    
    // 점수 텍스트
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    
    const scoreText = `${score}%`;
    ctx.strokeText(scoreText, centerX, centerY);
    ctx.fillText(scoreText, centerX, centerY);
    
    // 진행률 원형 바
    await this.drawCircularProgress(ctx, score, centerX, centerY, radius + 20, isDark);
    
    ctx.restore();
  }

  /**
   * 원형 진행률 바 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {number} score - 점수
   * @param {number} centerX - 중심 X 좌표
   * @param {number} centerY - 중심 Y 좌표
   * @param {number} radius - 반지름
   * @param {boolean} isDark - 다크 모드 여부
   */
  async drawCircularProgress(ctx, score, centerX, centerY, radius, isDark) {
    ctx.save();
    
    const startAngle = -Math.PI / 2; // 12시 방향부터 시작
    const endAngle = startAngle + (2 * Math.PI * score / 100);
    
    // 배경 원
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 8;
    ctx.stroke();
    
    // 진행률 원
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = score >= 70 ? '#ff6b6b' : score >= 50 ? '#ffa726' : '#42a5f5';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    ctx.restore();
  }

  /**
   * 궁합 텍스트 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {number} score - 점수
   * @param {string} language - 언어 코드
   * @param {number} centerX - 중심 X 좌표
   * @param {number} centerY - 중심 Y 좌표
   * @param {Object} template - 템플릿 정보
   * @param {boolean} isDark - 다크 모드 여부
   */
  async drawCompatibilityText(ctx, score, language, centerX, centerY, template, isDark) {
    ctx.save();
    
    const textColor = isDark ? '#ffffff' : '#000000';
    const compatibility = this.getCompatibilityText(score, language);
    
    // 배경 박스
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    ctx.roundRect(centerX - 180, centerY - 25, 360, 50, 25);
    ctx.fill();
    
    // 텍스트
    ctx.fillStyle = textColor;
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    this.drawTextWithShadow(ctx, compatibility, centerX, centerY, isDark);
    
    ctx.restore();
  }

  /**
   * 스토리 CTA 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {string} language - 언어 코드
   * @param {Object} template - 템플릿 정보
   */
  async drawStoryCTA(ctx, language, template) {
    ctx.save();
    
    const isDark = this.isDarkTheme() || template.id === 'dark-elegance';
    const bottomY = this.canvas.height - 200;
    
    // CTA 배경
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    ctx.roundRect(this.canvas.width / 2 - 200, bottomY - 40, 400, 80, 40);
    ctx.fill();
    
    // CTA 텍스트
    ctx.fillStyle = isDark ? '#ffffff' : '#000000';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const ctaText = language === 'ko' ? 
      '당신의 궁합도 확인해보세요! 👆' : 
      'Check your compatibility too! 👆';
    
    this.drawTextWithShadow(ctx, ctaText, this.canvas.width / 2, bottomY, isDark);
    
    ctx.restore();
  }

  /**
   * 인터랙티브 힌트 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} template - 템플릿 정보
   */
  async drawInteractiveHints(ctx, template) {
    ctx.save();
    
    const isDark = this.isDarkTheme() || template.id === 'dark-elegance';
    
    // "Tap" 애니메이션 힌트
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
    ctx.font = '20px Arial, sans-serif';
    ctx.textAlign = 'center';
    
    // 여러 위치에 탭 힌트
    const hints = [
      { x: this.canvas.width / 2, y: this.canvas.height - 100, text: '👆' },
      { x: 100, y: this.canvas.height / 2, text: '✨' },
      { x: this.canvas.width - 100, y: this.canvas.height / 2, text: '💫' }
    ];
    
    hints.forEach(hint => {
      ctx.globalAlpha = 0.4;
      ctx.fillText(hint.text, hint.x, hint.y);
    });
    
    ctx.restore();
  }

  /**
   * 그림자 효과가 있는 텍스트 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {string} text - 텍스트
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   * @param {boolean} isDark - 다크 모드 여부
   */
  drawTextWithShadow(ctx, text, x, y, isDark) {
    // 그림자
    ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(text, x + 2, y + 2);
    
    // 메인 텍스트
    ctx.fillStyle = isDark ? '#ffffff' : '#000000';
    ctx.fillText(text, x, y);
  }

  /**
   * 궁합 텍스트 반환
   * @param {number} score - 점수
   * @param {string} language - 언어
   * @returns {string} 궁합 텍스트
   */
  getCompatibilityText(score, language) {
    if (language === 'ko') {
      if (score >= 90) return '천생연분! ✨';
      if (score >= 80) return '완벽한 궁합! 💕';
      if (score >= 70) return '좋은 궁합! 💖';
      if (score >= 60) return '나쁘지 않은 궁합 😊';
      if (score >= 50) return '보통 궁합 😐';
      return '노력이 필요해요 💪';
    } else {
      if (score >= 90) return 'Perfect Match! ✨';
      if (score >= 80) return 'Great Match! 💕';
      if (score >= 70) return 'Good Match! 💖';
      if (score >= 60) return 'Not Bad! 😊';
      if (score >= 50) return 'Average 😐';
      return 'Needs Work 💪';
    }
  }

  /**
   * 다크 테마 여부 확인
   * @returns {boolean} 다크 테마 여부
   */
  isDarkTheme() {
    if (window.currentThemeManager) {
      return window.currentThemeManager.getThemeInfo().isDark;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * 테마에 따른 템플릿 업데이트
   * @param {string} theme - 현재 테마 ('light' | 'dark')
   */
  updateTemplatesForTheme(theme) {
    // 다크 모드일 때 모든 템플릿을 다크 친화적으로 조정
    if (theme === 'dark') {
      this.storyTemplates.forEach(template => {
        if (template.id !== 'dark-elegance') {
          // 다크 모드 오버라이드
          template._originalBg = template._originalBg || [...template.backgroundColor];
          template.backgroundColor = ['#1a1a2e', '#16213e', '#0f1419'];
        }
      });
    } else {
      // 라이트 모드로 복원
      this.storyTemplates.forEach(template => {
        if (template._originalBg) {
          template.backgroundColor = [...template._originalBg];
          delete template._originalBg;
        }
      });
    }
  }

  /**
   * 스토리 템플릿 선택 모달 표시
   * @returns {Promise<string>} 선택된 템플릿 ID
   */
  async showTemplateSelector() {
    return new Promise((resolve) => {
      const language = this.shareManager.language;
      
      // 기존 모달 제거
      const existing = document.querySelector('.story-template-modal');
      if (existing) existing.remove();
      
      const modal = document.createElement('div');
      modal.className = 'story-template-modal';
      modal.innerHTML = `
        <div class="template-modal-content">
          <div class="template-header">
            <h3>${language === 'ko' ? 'Instagram Stories 템플릿' : 'Instagram Stories Template'}</h3>
            <button class="template-close-btn" aria-label="닫기">×</button>
          </div>
          <div class="template-grid">
            ${this.storyTemplates.map(template => `
              <button class="template-option" data-template="${template.id}">
                <div class="template-preview" style="background: linear-gradient(135deg, ${template.backgroundColor.join(', ')})">
                  <span class="template-elements">${template.decorativeElements.slice(0, 3).join(' ')}</span>
                </div>
                <span class="template-name">${template.name}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;
      
      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.matches('.template-close-btn')) {
          modal.remove();
          resolve(null);
        } else if (e.target.closest('.template-option')) {
          const templateId = e.target.closest('.template-option').getAttribute('data-template');
          modal.remove();
          resolve(templateId);
        }
      });
      
      document.body.appendChild(modal);
      setTimeout(() => modal.classList.add('show'), 10);
    });
  }

  /**
   * roundRect 폴리필 적용
   */
  static addRoundRectPolyfill() {
    if (!CanvasRenderingContext2D.prototype.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
      };
    }
  }
}

// 폴리필 적용
InstagramStoriesOptimizer.addRoundRectPolyfill();

// 전역 스코프에서 사용 가능하도록 export
window.InstagramStoriesOptimizer = InstagramStoriesOptimizer;
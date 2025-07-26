/**
 * @fileoverview 소셜 공유용 콘텐츠 렌더링 관리자
 * @author Match Meter Team
 */

/**
 * 소셜 공유용 콘텐츠 렌더링 클래스
 */
class ShareRenderer {
  /**
   * ShareRenderer 생성자
   * @param {ResultData} resultData - 궁합 결과 데이터
   * @param {string} language - 언어 설정
   */
  constructor(resultData, language) {
    this.resultData = resultData;
    this.language = language;
  }

  /**
   * 공유용 HTML 콘텐츠 생성
   * @param {Object} options - 생성 옵션
   * @returns {string} 공유용 HTML 문자열
   */
  generateShareHTML(options = {}) {
    const { score, names, messages } = this.resultData;
    const {
      includeHeader = true,
      includeFooter = true,
      includeMessage = true,
      theme = 'default',
      size = 'medium'
    } = options;

    const themeClass = `share-theme-${theme}`;
    const sizeClass = `share-size-${size}`;
    const scoreCategory = ShareTemplates.getScoreCategory(score);
    const scoreEmoji = this.getScoreEmoji(score);

    let html = `<div class="share-result-container ${themeClass} ${sizeClass}">`;

    // 헤더 (브랜딩)
    if (includeHeader) {
      html += this.generateShareHeader();
    }

    // 메인 콘텐츠
    html += `
      <div class="share-content">
        ${this.generateShareNames(names, scoreEmoji)}
        ${this.generateShareScore(score, scoreCategory)}
        ${includeMessage ? this.generateShareMessage(messages) : ''}
      </div>
    `;

    // 푸터
    if (includeFooter) {
      html += this.generateShareFooter();
    }

    html += '</div>';

    return html;
  }

  /**
   * 공유용 헤더 생성
   * @returns {string} 헤더 HTML
   */
  generateShareHeader() {
    return `
      <div class="share-header">
        <div class="app-branding">
          <span class="app-logo" aria-hidden="true">📊</span>
          <span class="app-name">Match Meter</span>
          <span class="app-subtitle">${this.language === 'ko' ? '매치미터' : 'Compatibility Test'}</span>
        </div>
      </div>
    `;
  }

  /**
   * 공유용 이름 섹션 생성
   * @param {Object} names - 이름 정보
   * @param {string} scoreEmoji - 점수 이모지
   * @returns {string} 이름 섹션 HTML
   */
  generateShareNames(names, scoreEmoji) {
    return `
      <div class="share-names">
        <div class="name-container">
          <span class="name1">${this.escapeHtml(names.name1)}</span>
        </div>
        <div class="heart-container">
          <span class="heart" aria-hidden="true">💕</span>
          <span class="score-emoji" aria-hidden="true">${scoreEmoji}</span>
        </div>
        <div class="name-container">
          <span class="name2">${this.escapeHtml(names.name2)}</span>
        </div>
      </div>
    `;
  }

  /**
   * 공유용 점수 섹션 생성
   * @param {number} score - 궁합 점수
   * @param {string} scoreCategory - 점수 카테고리
   * @returns {string} 점수 섹션 HTML
   */
  generateShareScore(score, scoreCategory) {
    const progressWidth = Math.max(score, 5); // 최소 5% 표시
    
    return `
      <div class="share-score">
        <div class="score-display">
          <div class="score-circle score-${scoreCategory}">
            <span class="score-number">${score}%</span>
          </div>
          <div class="score-bar">
            <div class="score-progress" style="width: ${progressWidth}%"></div>
          </div>
        </div>
        <div class="score-label">
          ${this.language === 'ko' ? '궁합 점수' : 'Compatibility Score'}
        </div>
      </div>
    `;
  }

  /**
   * 공유용 메시지 섹션 생성
   * @param {Object} messages - 메시지 정보
   * @returns {string} 메시지 섹션 HTML
   */
  generateShareMessage(messages) {
    return `
      <div class="share-message">
        <p class="positive-message">${this.escapeHtml(messages.positive)}</p>
      </div>
    `;
  }

  /**
   * 공유용 푸터 생성
   * @returns {string} 푸터 HTML
   */
  generateShareFooter() {
    const currentDate = new Date().toLocaleDateString(this.language === 'ko' ? 'ko-KR' : 'en-US');
    
    return `
      <div class="share-footer">
        <div class="app-info">
          <span class="app-url">matchmeter.app</span>
          <span class="test-date">${currentDate}</span>
        </div>
        <div class="call-to-action">
          ${this.language === 'ko' ? '당신도 테스트해보세요!' : 'Try your own test!'}
        </div>
      </div>
    `;
  }

  /**
   * 컴팩트 공유 HTML 생성 (소셜 미디어 최적화)
   * @returns {string} 컴팩트 HTML
   */
  generateCompactShareHTML() {
    const { score, names } = this.resultData;
    const scoreEmoji = this.getScoreEmoji(score);
    
    return `
      <div class="share-result-compact">
        <div class="compact-header">
          <span class="app-logo">📊</span>
          <span class="app-name">Match Meter</span>
        </div>
        <div class="compact-content">
          <div class="compact-names">
            ${this.escapeHtml(names.name1)} ${scoreEmoji} ${this.escapeHtml(names.name2)}
          </div>
          <div class="compact-score">${score}%</div>
        </div>
      </div>
    `;
  }

  /**
   * 인스타그램 스토리용 HTML 생성
   * @returns {string} 인스타그램 스토리 HTML
   */
  generateInstagramStoryHTML() {
    const { score, names } = this.resultData;
    const scoreEmoji = this.getScoreEmoji(score);
    const scoreCategory = ShareTemplates.getScoreCategory(score);
    
    return `
      <div class="share-instagram-story">
        <div class="story-background story-${scoreCategory}">
          <div class="story-content">
            <div class="story-header">
              <span class="story-logo">📊</span>
              <span class="story-title">Match Meter</span>
            </div>
            
            <div class="story-main">
              <div class="story-names">
                <span class="story-name">${this.escapeHtml(names.name1)}</span>
                <span class="story-heart">💕</span>
                <span class="story-name">${this.escapeHtml(names.name2)}</span>
              </div>
              
              <div class="story-score-big">
                <span class="story-percentage">${score}%</span>
                <span class="story-emoji">${scoreEmoji}</span>
              </div>
              
              <div class="story-label">
                ${this.language === 'ko' ? '궁합 지수' : 'Compatibility'}
              </div>
            </div>
            
            <div class="story-footer">
              <span class="story-cta">
                ${this.language === 'ko' ? '나도 테스트하기' : 'Try yours'}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 다크 테마 HTML 생성
   * @returns {string} 다크 테마 HTML
   */
  generateDarkThemeHTML() {
    return this.generateShareHTML({
      theme: 'dark',
      includeHeader: true,
      includeFooter: true,
      includeMessage: true
    });
  }

  /**
   * 미니멀 테마 HTML 생성
   * @returns {string} 미니멀 테마 HTML
   */
  generateMinimalHTML() {
    return this.generateShareHTML({
      theme: 'minimal',
      includeHeader: false,
      includeFooter: false,
      includeMessage: false,
      size: 'small'
    });
  }

  /**
   * 공유용 HTML을 DOM 요소로 변환
   * @param {string} html - HTML 문자열
   * @returns {HTMLElement} DOM 요소
   */
  htmlToElement(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
  }

  /**
   * 공유용 HTML 미리보기 생성
   * @param {HTMLElement} container - 미리보기를 표시할 컨테이너
   * @param {Object} options - 미리보기 옵션
   */
  renderSharePreview(container, options = {}) {
    const html = this.generateShareHTML(options);
    const element = this.htmlToElement(html);
    
    // 기존 미리보기 제거
    const existing = container.querySelector('.share-result-container');
    if (existing) {
      existing.remove();
    }
    
    // 새 미리보기 추가
    container.appendChild(element);
    
    // 애니메이션 효과
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    
    requestAnimationFrame(() => {
      element.style.transition = 'all 0.3s ease';
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    });
  }

  /**
   * Canvas를 이용한 이미지 생성
   * @param {Object} options - 이미지 생성 옵션
   * @returns {Promise<Blob>} 생성된 이미지 Blob
   */
  async generateShareImage(options = {}) {
    const {
      width = 1200,
      height = 630,
      format = 'png',
      quality = 0.9,
      theme = 'default'
    } = options;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 고해상도 지원
      const devicePixelRatio = window.devicePixelRatio || 1;
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      
      ctx.scale(devicePixelRatio, devicePixelRatio);

      // 이미지 렌더링
      await this.renderImageContent(ctx, width, height, theme);

      // Blob 생성
      return new Promise((resolve) => {
        canvas.toBlob(resolve, `image/${format}`, quality);
      });

    } catch (error) {
      console.error('Failed to generate share image:', error);
      throw error;
    }
  }

  /**
   * Canvas에 이미지 콘텐츠 렌더링
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {number} width - 캔버스 너비
   * @param {number} height - 캔버스 높이
   * @param {string} theme - 테마
   */
  async renderImageContent(ctx, width, height, theme) {
    const { score, names, messages } = this.resultData;
    
    // 배경 렌더링
    this.renderBackground(ctx, width, height, theme, score);
    
    // 헤더 렌더링
    await this.renderHeader(ctx, width, 60);
    
    // 메인 콘텐츠 렌더링
    await this.renderMainContent(ctx, width, height, names, score, messages);
    
    // 푸터 렌더링
    this.renderFooter(ctx, width, height);
  }

  /**
   * 배경 렌더링
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {number} width - 너비
   * @param {number} height - 높이
   * @param {string} theme - 테마
   * @param {number} score - 점수
   */
  renderBackground(ctx, width, height, theme, score) {
    // 점수에 따른 그라디언트 색상
    const gradientColors = this.getGradientColors(score, theme);
    
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, gradientColors.start);
    gradient.addColorStop(0.5, gradientColors.middle);
    gradient.addColorStop(1, gradientColors.end);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // 장식적 요소 추가
    this.renderBackgroundDecorations(ctx, width, height, score);
  }

  /**
   * 점수에 따른 그라디언트 색상 반환
   * @param {number} score - 점수
   * @param {string} theme - 테마
   * @returns {Object} 그라디언트 색상
   */
  getGradientColors(score, theme) {
    if (theme === 'dark') {
      return {
        start: '#1f2937',
        middle: '#374151',
        end: '#4b5563'
      };
    }

    // 점수에 따른 색상
    if (score >= 80) {
      return {
        start: '#10b981',
        middle: '#059669',
        end: '#047857'
      };
    } else if (score >= 60) {
      return {
        start: '#3b82f6',
        middle: '#2563eb',
        end: '#1d4ed8'
      };
    } else if (score >= 40) {
      return {
        start: '#f59e0b',
        middle: '#d97706',
        end: '#b45309'
      };
    } else {
      return {
        start: '#ef4444',
        middle: '#dc2626',
        end: '#b91c1c'
      };
    }
  }

  /**
   * 배경 장식 요소 렌더링
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {number} width - 너비
   * @param {number} height - 높이
   * @param {number} score - 점수
   */
  renderBackgroundDecorations(ctx, width, height, score) {
    ctx.save();
    
    // 반투명 원형 장식
    const circles = [
      { x: width * 0.1, y: height * 0.2, radius: 80, opacity: 0.1 },
      { x: width * 0.9, y: height * 0.8, radius: 120, opacity: 0.08 },
      { x: width * 0.8, y: height * 0.3, radius: 60, opacity: 0.12 }
    ];

    circles.forEach(circle => {
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${circle.opacity})`;
      ctx.fill();
    });

    ctx.restore();
  }

  /**
   * 헤더 렌더링
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {number} width - 너비
   * @param {number} y - Y 위치
   */
  async renderHeader(ctx, width, y) {
    ctx.save();
    
    // 앱 로고 (이모지)
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.fillText('📊', width / 2 - 60, y);
    
    // 앱 이름
    ctx.font = 'bold 28px Arial';
    ctx.fillText('Match Meter', width / 2 + 20, y);
    
    // 부제목
    ctx.font = '16px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const subtitle = this.language === 'ko' ? '매치미터 - 이름 궁합 테스트' : 'Name Compatibility Test';
    ctx.fillText(subtitle, width / 2, y + 25);
    
    ctx.restore();
  }

  /**
   * 메인 콘텐츠 렌더링
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {number} width - 너비
   * @param {number} height - 높이
   * @param {Object} names - 이름 정보
   * @param {number} score - 점수
   * @param {Object} messages - 메시지 정보
   */
  async renderMainContent(ctx, width, height, names, score, messages) {
    const centerY = height / 2;
    
    // 이름들 렌더링
    await this.renderNames(ctx, width, centerY - 80, names, score);
    
    // 점수 렌더링
    this.renderScore(ctx, width, centerY, score);
    
    // 메시지 렌더링
    this.renderMessage(ctx, width, centerY + 80, messages.positive);
  }

  /**
   * 이름들 렌더링
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {number} width - 너비
   * @param {number} y - Y 위치
   * @param {Object} names - 이름 정보
   * @param {number} score - 점수
   */
  async renderNames(ctx, width, y, names, score) {
    ctx.save();
    
    const nameY = y;
    const fontSize = 36;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    
    // 첫 번째 이름
    ctx.fillText(names.name1, width / 2 - 120, nameY);
    
    // 하트 이모지
    ctx.font = `${fontSize + 8}px Arial`;
    ctx.fillText('💕', width / 2, nameY);
    
    // 두 번째 이름
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillText(names.name2, width / 2 + 120, nameY);
    
    // 점수 이모지
    const scoreEmoji = this.getScoreEmoji(score);
    ctx.font = `${fontSize - 4}px Arial`;
    ctx.fillText(scoreEmoji, width / 2, nameY + 40);
    
    ctx.restore();
  }

  /**
   * 점수 렌더링
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {number} width - 너비
   * @param {number} y - Y 위치
   * @param {number} score - 점수
   */
  renderScore(ctx, width, y, score) {
    ctx.save();
    
    const centerX = width / 2;
    const circleRadius = 80;
    
    // 점수 원 배경
    ctx.beginPath();
    ctx.arc(centerX, y, circleRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();
    
    // 점수 원 테두리
    ctx.beginPath();
    ctx.arc(centerX, y, circleRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 점수 텍스트
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${score}%`, centerX, y);
    
    // 점수 라벨
    ctx.font = '18px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    const label = this.language === 'ko' ? '궁합 점수' : 'Compatibility Score';
    ctx.fillText(label, centerX, y + circleRadius + 25);
    
    ctx.restore();
  }

  /**
   * 메시지 렌더링
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {number} width - 너비
   * @param {number} y - Y 위치
   * @param {string} message - 메시지
   */
  renderMessage(ctx, width, y, message) {
    ctx.save();
    
    ctx.font = '20px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textAlign = 'center';
    
    // 긴 메시지 줄바꿈 처리
    const maxWidth = width - 100;
    const lines = this.wrapText(ctx, message, maxWidth);
    
    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, y + (index * 30));
    });
    
    ctx.restore();
  }

  /**
   * 푸터 렌더링
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {number} width - 너비
   * @param {number} height - 높이
   */
  renderFooter(ctx, width, height) {
    ctx.save();
    
    const footerY = height - 40;
    
    ctx.font = '16px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.textAlign = 'center';
    
    // URL
    ctx.fillText('matchmeter.app', width / 2, footerY);
    
    // 날짜
    const date = new Date().toLocaleDateString(this.language === 'ko' ? 'ko-KR' : 'en-US');
    ctx.font = '14px Arial';
    ctx.fillText(date, width / 2, footerY + 20);
    
    ctx.restore();
  }

  /**
   * 텍스트 줄바꿈 처리
   * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
   * @param {string} text - 텍스트
   * @param {number} maxWidth - 최대 너비
   * @returns {string[]} 줄바꿈된 텍스트 배열
   */
  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    
    lines.push(currentLine);
    return lines;
  }

  /**
   * 인스타그램 스토리용 이미지 생성
   * @returns {Promise<Blob>} 생성된 이미지 Blob
   */
  async generateInstagramStoryImage() {
    return this.generateShareImage({
      width: 1080,
      height: 1920,
      theme: 'story'
    });
  }

  /**
   * 트위터 카드용 이미지 생성
   * @returns {Promise<Blob>} 생성된 이미지 Blob
   */
  async generateTwitterCardImage() {
    return this.generateShareImage({
      width: 1200,
      height: 600,
      theme: 'twitter'
    });
  }

  /**
   * 페이스북 공유용 이미지 생성
   * @returns {Promise<Blob>} 생성된 이미지 Blob
   */
  async generateFacebookShareImage() {
    return this.generateShareImage({
      width: 1200,
      height: 630,
      theme: 'facebook'
    });
  }

  /**
   * 플랫폼별 텍스트 포맷팅
   * @param {string} platform - 플랫폼 이름
   * @param {string} [customMessage] - 사용자 커스텀 메시지
   * @returns {string} 포맷된 텍스트
   */
  formatShareText(platform, customMessage) {
    // ShareTemplates 클래스를 사용하여 메시지 생성
    const message = ShareTemplates.generateShareMessage(
      platform, 
      this.resultData, 
      this.language, 
      customMessage
    );
    
    return this.validateAndTruncateText(message, platform);
  }

  /**
   * 점수에 따른 이모지 반환
   * @param {number} score - 궁합 점수
   * @returns {string} 이모지
   */
  getScoreEmoji(score) {
    if (score >= 90) return '🔥💕';
    if (score >= 80) return '✨💖';
    if (score >= 70) return '😊💝';
    if (score >= 60) return '👍💛';
    if (score >= 50) return '🤔💙';
    if (score >= 40) return '😅💚';
    if (score >= 30) return '🙃💜';
    return '😰💔';
  }

  /**
   * 해시태그 생성
   * @param {string} platform - 플랫폼 이름
   * @returns {string[]} 해시태그 배열
   */
  generateHashtags(platform) {
    return ShareTemplates.generateHashtags(platform, this.resultData, this.language);
  }

  /**
   * 텍스트 유효성 검사 및 자르기
   * @param {string} text - 검사할 텍스트
   * @param {string} platform - 플랫폼 이름
   * @returns {string} 유효한 텍스트
   */
  validateAndTruncateText(text, platform) {
    const limits = {
      twitter: 280,
      facebook: 63206,
      kakao: 200,
      instagram: 2200,
      default: 500
    };

    const limit = limits[platform] || limits.default;
    
    if (text.length <= limit) {
      return text;
    }

    // 텍스트가 너무 긴 경우 자르기
    const truncated = text.substring(0, limit - 3) + '...';
    console.warn(`Text truncated for ${platform}: ${text.length} -> ${truncated.length}`);
    
    return truncated;
  }

  /**
   * HTML 이스케이프 처리
   * @param {string} text - 이스케이프할 텍스트
   * @returns {string} 이스케이프된 텍스트
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 텍스트 길이 제한 확인
   * @param {string} text - 확인할 텍스트
   * @param {string} platform - 플랫폼 이름
   * @returns {boolean} 제한 내 여부
   */
  isTextWithinLimit(text, platform) {
    const limits = {
      twitter: 280,
      facebook: 63206,
      kakao: 200,
      default: 500
    };

    const limit = limits[platform] || limits.default;
    return text.length <= limit;
  }
}

// 전역 스코프에서 사용 가능하도록 export
window.ShareRenderer = ShareRenderer;
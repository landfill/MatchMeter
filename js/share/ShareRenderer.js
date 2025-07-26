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
   * @returns {Promise<Blob>} 생성된 이미지 Blob
   */
  async generateShareImage() {
    // 구현 예정
    console.log('Generating share image for:', this.resultData);
    return null;
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
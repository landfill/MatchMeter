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
   * @returns {string} 공유용 HTML 문자열
   */
  generateShareHTML() {
    const { score, names } = this.resultData;
    
    return `
      <div class="share-result-container">
        <div class="share-header">
          <div class="app-branding">
            <span class="app-logo" aria-hidden="true">📊</span>
            <span class="app-name">Match Meter</span>
          </div>
        </div>
        
        <div class="share-content">
          <div class="share-names">
            <span class="name1">${this.escapeHtml(names.name1)}</span>
            <span class="heart" aria-hidden="true">💕</span>
            <span class="name2">${this.escapeHtml(names.name2)}</span>
          </div>
          
          <div class="share-score">
            <div class="score-circle">
              <span class="score-number">${score}%</span>
            </div>
          </div>
          
          <div class="share-message">
            <p class="positive-message">${this.escapeHtml(this.resultData.messages.positive)}</p>
          </div>
        </div>
        
        <div class="share-footer">
          <span class="app-url">matchmeter.app</span>
        </div>
      </div>
    `;
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
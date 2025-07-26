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
    const { score, names } = this.resultData;
    
    const templates = {
      ko: {
        facebook: customMessage || `${names.name1}과 ${names.name2}의 궁합은 ${score}%! Match Meter에서 당신도 테스트해보세요!`,
        twitter: customMessage || `${names.name1}과 ${names.name2}의 궁합은 ${score}%! #매치미터 #궁합 #이름궁합`,
        kakao: customMessage || `${names.name1}과 ${names.name2}의 궁합 점수는 ${score}%입니다!`,
        default: customMessage || `${names.name1}과 ${names.name2}의 궁합은 ${score}%!`
      },
      en: {
        facebook: customMessage || `${names.name1} & ${names.name2} compatibility: ${score}%! Try your test on Match Meter!`,
        twitter: customMessage || `${names.name1} & ${names.name2}: ${score}% compatibility! #MatchMeter #Compatibility #Test`,
        kakao: customMessage || `${names.name1} and ${names.name2} scored ${score}% compatibility!`,
        default: customMessage || `${names.name1} & ${names.name2}: ${score}% compatibility!`
      }
    };

    const langTemplates = templates[this.language] || templates.ko;
    return langTemplates[platform] || langTemplates.default;
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
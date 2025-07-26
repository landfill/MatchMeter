/**
 * @fileoverview 소셜 공유 기능의 중앙 관리자
 * @author Match Meter Team
 */

/**
 * @typedef {Object} ShareData
 * @property {string} title - 공유 제목
 * @property {string} description - 공유 설명
 * @property {string} url - 공유 URL
 * @property {string} [imageUrl] - 공유 이미지 URL
 * @property {string[]} hashtags - 해시태그 배열
 * @property {number} score - 궁합 점수
 * @property {Object} names - 이름 정보
 * @property {string} names.name1 - 첫 번째 이름
 * @property {string} names.name2 - 두 번째 이름
 * @property {string} language - 언어 설정
 */

/**
 * @typedef {Object} ResultData
 * @property {number} score - 궁합 점수
 * @property {Object} names - 이름 정보
 * @property {string} names.name1 - 첫 번째 이름
 * @property {string} names.name2 - 두 번째 이름
 * @property {Object} messages - 메시지 정보
 * @property {string} messages.positive - 긍정적 메시지
 * @property {string} messages.negative - 부정적 메시지
 * @property {string} language - 언어 설정
 * @property {Date} timestamp - 생성 시간
 */

/**
 * 소셜 공유 기능의 중앙 관리자 클래스
 */
class ShareManager {
  /**
   * ShareManager 생성자
   * @param {ResultData} resultData - 궁합 결과 데이터
   * @param {string} [language='ko'] - 언어 설정
   */
  constructor(resultData, language = 'ko') {
    this.resultData = resultData;
    this.language = language;
    this.baseUrl = window.location.origin + window.location.pathname;
  }

  /**
   * 공유 기능 지원 여부 확인
   * @returns {boolean} 공유 지원 여부
   */
  isShareSupported() {
    return this.checkBrowserCompatibility();
  }

  /**
   * 브라우저 호환성 검사
   * @returns {boolean} 호환성 여부
   */
  checkBrowserCompatibility() {
    const features = {
      clipboard: !!navigator.clipboard,
      share: !!navigator.share,
      canvas: !!document.createElement('canvas').getContext,
      download: (() => {
        const a = document.createElement('a');
        return typeof a.download !== 'undefined';
      })(),
      localStorage: (() => {
        try {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
          return true;
        } catch (e) {
          return false;
        }
      })()
    };

    this.supportedFeatures = features;
    
    // 기본 공유 기능은 모든 브라우저에서 지원 (URL 공유)
    return true;
  }

  /**
   * 공유 데이터 준비
   * @returns {ShareData} 공유용 데이터
   */
  prepareShareData() {
    const { score, names, language } = this.resultData;
    
    const shareTexts = {
      ko: {
        title: `${names.name1}과 ${names.name2}의 궁합은 ${score}%!`,
        description: `Match Meter에서 측정한 ${names.name1}과 ${names.name2}의 궁합 점수는 ${score}%입니다! 당신도 궁합을 측정해보세요!`,
        hashtags: ['매치미터', '궁합', '이름궁합', '재미', '테스트']
      },
      en: {
        title: `${names.name1} & ${names.name2} compatibility: ${score}%!`,
        description: `${names.name1} and ${names.name2} scored ${score}% compatibility on Match Meter! Try your own compatibility test!`,
        hashtags: ['MatchMeter', 'Compatibility', 'NameTest', 'Fun', 'Test']
      }
    };

    const texts = shareTexts[language] || shareTexts.ko;

    // URL에 결과 정보를 쿼리 파라미터로 추가 (선택적)
    const shareUrl = this.generateShareUrl();

    return {
      title: texts.title,
      description: texts.description,
      url: shareUrl,
      hashtags: texts.hashtags,
      score,
      names,
      language,
      timestamp: this.resultData.timestamp || new Date()
    };
  }

  /**
   * 공유용 URL 생성
   * @returns {string} 공유용 URL
   */
  generateShareUrl() {
    // 기본 URL 반환 (나중에 결과 재현을 위한 파라미터 추가 가능)
    return this.baseUrl;
  }

  /**
   * 공유 데이터 유효성 검사
   * @param {ShareData} shareData - 검사할 공유 데이터
   * @returns {boolean} 유효성 여부
   */
  validateShareData(shareData) {
    const required = ['title', 'description', 'url', 'score', 'names'];
    
    for (const field of required) {
      if (!shareData[field]) {
        console.warn(`Missing required field: ${field}`);
        return false;
      }
    }

    // 점수 범위 확인
    if (shareData.score < 0 || shareData.score > 100) {
      console.warn('Score must be between 0 and 100');
      return false;
    }

    // 이름 확인
    if (!shareData.names.name1 || !shareData.names.name2) {
      console.warn('Both names are required');
      return false;
    }

    return true;
  }

  /**
   * 플랫폼별 공유 실행
   * @param {string} platform - 공유 플랫폼 ('facebook', 'twitter', 'kakao', 'copy', 'image')
   * @param {string} [customMessage] - 사용자 커스텀 메시지
   * @returns {Promise<void>}
   */
  async shareToplatform(platform, customMessage) {
    try {
      const shareData = this.prepareShareData();
      
      if (!this.validateShareData(shareData)) {
        throw new Error('Invalid share data');
      }

      // 플랫폼별 어댑터 호출 (구현 예정)
      switch (platform) {
        case 'facebook':
          await this.shareToFacebook(shareData, customMessage);
          break;
        case 'twitter':
          await this.shareToTwitter(shareData, customMessage);
          break;
        case 'kakao':
          await this.shareToKakao(shareData, customMessage);
          break;
        case 'copy':
          await this.copyToClipboard(shareData, customMessage);
          break;
        case 'image':
          await this.saveAsImage();
          break;
        case 'native':
          await this.shareNatively(shareData, customMessage);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      this.trackShareEvent(platform, shareData);
    } catch (error) {
      console.error(`Failed to share to ${platform}:`, error);
      throw error;
    }
  }

  /**
   * 공유 이벤트 추적 (분석용)
   * @param {string} platform - 공유 플랫폼
   * @param {ShareData} shareData - 공유 데이터
   */
  trackShareEvent(platform, shareData) {
    // 간단한 로컬 스토리지 기반 추적
    if (this.supportedFeatures?.localStorage) {
      try {
        const stats = JSON.parse(localStorage.getItem('matchmeter_share_stats') || '{}');
        stats[platform] = (stats[platform] || 0) + 1;
        stats.lastShared = new Date().toISOString();
        localStorage.setItem('matchmeter_share_stats', JSON.stringify(stats));
      } catch (e) {
        // 로컬 스토리지 실패 시 무시
      }
    }
  }

  /**
   * 이미지로 저장
   * @returns {Promise<void>}
   */
  async saveAsImage() {
    if (!this.supportedFeatures?.canvas || !this.supportedFeatures?.download) {
      throw new Error('Image generation not supported in this browser');
    }

    try {
      const renderer = new ShareRenderer(this.resultData, this.language);
      const imageBlob = await renderer.generateShareImage();
      
      if (imageBlob) {
        this.downloadImage(imageBlob);
      } else {
        throw new Error('Failed to generate image');
      }
    } catch (error) {
      console.error('Failed to save image:', error);
      throw error;
    }
  }

  /**
   * 이미지 다운로드 처리
   * @param {Blob} imageBlob - 이미지 Blob
   */
  downloadImage(imageBlob) {
    const url = URL.createObjectURL(imageBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matchmeter-${this.resultData.names.name1}-${this.resultData.names.name2}-${this.resultData.score}%.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 플랫폼별 공유 메서드들 (구현 예정)
  async shareToFacebook(shareData, customMessage) {
    console.log('Sharing to Facebook:', shareData);
  }

  async shareToTwitter(shareData, customMessage) {
    console.log('Sharing to Twitter:', shareData);
  }

  async shareToKakao(shareData, customMessage) {
    console.log('Sharing to Kakao:', shareData);
  }

  async copyToClipboard(shareData, customMessage) {
    console.log('Copying to clipboard:', shareData);
  }

  async shareNatively(shareData, customMessage) {
    console.log('Sharing natively:', shareData);
  }
}

// 전역 스코프에서 사용 가능하도록 export
window.ShareManager = ShareManager;
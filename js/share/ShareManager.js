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
  async shareToPlatform(platform, customMessage) {
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

  // 플랫폼별 공유 메서드들
  async shareToFacebook(shareData, customMessage) {
    const renderer = new ShareRenderer(this.resultData, this.language);
    const shareText = customMessage || renderer.formatShareText('facebook', customMessage);
    
    const facebookUrl = this.generateFacebookShareUrl(shareData, shareText);
    this.openShareWindow(facebookUrl, 'facebook');
  }

  async shareToTwitter(shareData, customMessage) {
    const renderer = new ShareRenderer(this.resultData, this.language);
    const shareText = customMessage || renderer.formatShareText('twitter', customMessage);
    
    const twitterUrl = this.generateTwitterShareUrl(shareData, shareText);
    this.openShareWindow(twitterUrl, 'twitter');
  }

  async shareToKakao(shareData, customMessage) {
    // 카카오 SDK가 로드되어 있는지 확인
    if (typeof Kakao === 'undefined') {
      throw new Error('Kakao SDK not loaded');
    }

    const renderer = new ShareRenderer(this.resultData, this.language);
    const shareText = customMessage || renderer.formatShareText('kakao', customMessage);
    
    await this.shareToKakaoTalk(shareData, shareText);
  }

  async copyToClipboard(shareData, customMessage) {
    const renderer = new ShareRenderer(this.resultData, this.language);
    const shareText = customMessage || renderer.formatShareText('copy', customMessage);
    
    const textToCopy = `${shareText}\n${shareData.url}`;
    
    if (this.supportedFeatures?.clipboard) {
      await navigator.clipboard.writeText(textToCopy);
    } else {
      // 폴백: 임시 텍스트 영역 사용
      this.fallbackCopyToClipboard(textToCopy);
    }
  }

  async shareNatively(shareData, customMessage) {
    if (!this.supportedFeatures?.share) {
      throw new Error('Native sharing not supported');
    }

    const renderer = new ShareRenderer(this.resultData, this.language);
    const shareText = customMessage || renderer.formatShareText('native', customMessage);

    const nativeShareData = {
      title: shareData.title,
      text: shareText,
      url: shareData.url
    };

    // 플랫폼별 최적화
    if (this.isIOSDevice()) {
      // iOS에서는 텍스트와 URL을 합치는 것이 더 효과적
      nativeShareData.text = `${shareText}\n\n${shareData.url}`;
      delete nativeShareData.url;
    }

    try {
      await navigator.share(nativeShareData);
    } catch (error) {
      if (error.name === 'AbortError') {
        // 사용자가 공유를 취소함 - 정상적인 동작
        return;
      }
      throw error;
    }
  }

  /**
   * iOS 기기 감지
   * @returns {boolean} iOS 기기 여부
   */
  isIOSDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  /**
   * Android 기기 감지
   * @returns {boolean} Android 기기 여부
   */
  isAndroidDevice() {
    return /Android/.test(navigator.userAgent);
  }

  /**
   * 페이스북 공유 URL 생성
   * @param {ShareData} shareData - 공유 데이터
   * @param {string} shareText - 공유 텍스트
   * @returns {string} 페이스북 공유 URL
   */
  generateFacebookShareUrl(shareData, shareText) {
    const params = new URLSearchParams({
      u: shareData.url,
      quote: shareText
    });
    
    return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
  }

  /**
   * 트위터 공유 URL 생성
   * @param {ShareData} shareData - 공유 데이터
   * @param {string} shareText - 공유 텍스트
   * @returns {string} 트위터 공유 URL
   */
  generateTwitterShareUrl(shareData, shareText) {
    const params = new URLSearchParams({
      text: shareText,
      url: shareData.url,
      hashtags: shareData.hashtags.join(',')
    });
    
    return `https://twitter.com/intent/tweet?${params.toString()}`;
  }

  /**
   * 카카오톡 공유 실행
   * @param {ShareData} shareData - 공유 데이터
   * @param {string} shareText - 공유 텍스트
   */
  async shareToKakaoTalk(shareData, shareText) {
    const templateObject = {
      objectType: 'feed',
      content: {
        title: shareData.title,
        description: shareText,
        imageUrl: shareData.imageUrl || `${this.baseUrl}/images/default-share.png`,
        link: {
          mobileWebUrl: shareData.url,
          webUrl: shareData.url
        }
      },
      buttons: [
        {
          title: this.language === 'ko' ? '궁합 측정하기' : 'Try Match Test',
          link: {
            mobileWebUrl: shareData.url,
            webUrl: shareData.url
          }
        }
      ]
    };

    Kakao.Share.sendDefault(templateObject);
  }

  /**
   * 공유 창 열기
   * @param {string} url - 공유 URL
   * @param {string} platform - 플랫폼 이름
   */
  openShareWindow(url, platform) {
    const windowFeatures = {
      width: 600,
      height: 400,
      scrollbars: 'yes',
      resizable: 'yes',
      toolbar: 'no',
      menubar: 'no',
      status: 'no',
      directories: 'no',
      location: 'no'
    };

    const featuresString = Object.entries(windowFeatures)
      .map(([key, value]) => `${key}=${value}`)
      .join(',');

    const shareWindow = window.open(url, `share_${platform}`, featuresString);
    
    // 창이 차단되었는지 확인
    if (!shareWindow || shareWindow.closed || typeof shareWindow.closed === 'undefined') {
      // 팝업이 차단된 경우 새 탭에서 열기
      window.open(url, '_blank');
    }
  }

  /**
   * 클립보드 복사 폴백 (구형 브라우저용)
   * @param {string} text - 복사할 텍스트
   */
  fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback copy failed:', err);
      throw new Error('Copy to clipboard failed');
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

// 전역 스코프에서 사용 가능하도록 export
window.ShareManager = ShareManager;
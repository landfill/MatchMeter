/**
 * @fileoverview Facebook 링크 프리뷰 최적화 컴포넌트
 * Open Graph 메타태그 최적화 및 Facebook 공유 프리뷰 향상
 */

/**
 * Facebook 링크 프리뷰 최적화 클래스
 * Facebook의 Open Graph 표준에 맞춘 메타태그 생성 및 최적화
 */
class FacebookPreviewOptimizer {
  /**
   * FacebookPreviewOptimizer 생성자
   * @param {ShareManager} shareManager - 공유 관리자 인스턴스
   */
  constructor(shareManager) {
    this.shareManager = shareManager;
    this.fbAppId = null; // Facebook 앱 ID (향후 설정 가능)
    this.previewImageCache = new Map();
    
    this.init();
  }

  /**
   * 초기화
   */
  init() {
    this.setupFacebookMetaTags();
    this.bindEvents();
    this.detectSharedResult();
  }

  /**
   * Facebook Open Graph 메타태그 설정
   */
  setupFacebookMetaTags() {
    const language = this.shareManager?.language || 'ko';
    
    const defaultTags = {
      // 필수 Open Graph 태그
      'og:site_name': 'Match Meter',
      'og:type': 'website',
      'og:url': window.location.origin,
      'og:locale': language === 'ko' ? 'ko_KR' : 'en_US',
      
      // Facebook 최적화 태그
      'og:title': this.getDefaultTitle(language),
      'og:description': this.getDefaultDescription(language),
      'og:image': this.getDefaultImageUrl(),
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:type': 'image/png',
      'og:image:alt': this.getDefaultImageAlt(language),
      
      // Facebook 앱 연동 (선택사항)
      ...(this.fbAppId && { 'fb:app_id': this.fbAppId }),
      
      // 추가 메타데이터
      'og:updated_time': new Date().toISOString(),
      'article:author': 'Match Meter Team',
      'article:section': language === 'ko' ? '궁합 테스트' : 'Compatibility Test'
    };

    this.setMetaTags(defaultTags);
  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // 결과 계산 완료 시 Facebook 메타태그 업데이트
    document.addEventListener('matchCalculated', (e) => {
      this.updateFacebookPreview(e.detail);
    });

    // Facebook 공유 요청 처리
    document.addEventListener('facebookShareRequested', (e) => {
      this.shareToFacebook(e.detail);
    });
  }

  /**
   * 공유된 결과 감지
   */
  detectSharedResult() {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedSource = urlParams.get('shared');
    
    if (sharedSource === 'facebook') {
      // Facebook에서 공유된 링크로 접근한 경우 특별 처리
      this.handleFacebookReferral();
    }
  }

  /**
   * Facebook 프리뷰 업데이트
   * @param {Object} resultData - 결과 데이터
   */
  async updateFacebookPreview(resultData) {
    const { score, names, language } = resultData;
    
    // Facebook 최적화된 결과 URL 생성
    const resultUrl = this.generateFacebookUrl(resultData);
    
    // Facebook 프리뷰 이미지 생성
    const previewImageUrl = await this.generatePreviewImage(resultData);
    
    // Open Graph 메타태그 업데이트
    const metaTags = {
      'og:url': resultUrl,
      'og:title': this.getResultTitle(score, names, language),
      'og:description': this.getResultDescription(score, names, language),
      'og:image': previewImageUrl,
      'og:image:alt': this.getResultImageAlt(score, names, language),
      'og:updated_time': new Date().toISOString(),
      
      // Facebook 특화 태그
      'article:published_time': new Date().toISOString(),
      'article:tag': this.generateTags(score, language).join(',')
    };

    this.setMetaTags(metaTags);
    
    // URL 히스토리 업데이트 비활성화 (URL 노출 방지)
    // if (history.pushState) {
    //   history.pushState(resultData, '', resultUrl);
    // }
  }

  /**
   * Facebook 최적화 URL 생성
   * @param {Object} resultData - 결과 데이터
   * @returns {string} Facebook 최적화 URL
   */
  generateFacebookUrl(resultData) {
    const { score, names } = resultData;
    const baseUrl = window.location.origin + window.location.pathname;
    
    const params = new URLSearchParams({
      score: score,
      name1: encodeURIComponent(names.name1),
      name2: encodeURIComponent(names.name2),
      shared: 'facebook',
      t: Date.now() // 캐시 방지
    });
    
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Facebook 프리뷰 이미지 생성
   * @param {Object} resultData - 결과 데이터
   * @returns {Promise<string>} 이미지 데이터 URL
   */
  async generatePreviewImage(resultData) {
    const cacheKey = `fb_${resultData.score}_${resultData.names.name1}_${resultData.names.name2}`;
    
    // 캐시 확인
    if (this.previewImageCache.has(cacheKey)) {
      return this.previewImageCache.get(cacheKey);
    }

    // Facebook 권장 이미지 크기: 1200x630
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    
    const ctx = canvas.getContext('2d');
    const { score, names, language } = resultData;
    const isDark = this.isDarkTheme();
    
    // 배경 그리기
    await this.drawFacebookBackground(ctx, canvas, isDark);
    
    // 브랜딩 및 로고
    await this.drawFacebookBranding(ctx, canvas, language, isDark);
    
    // 메인 콘텐츠
    await this.drawFacebookContent(ctx, canvas, score, names, language, isDark);
    
    // Facebook 최적화 요소
    await this.drawFacebookOptimizedElements(ctx, canvas, score, language, isDark);
    
    const imageUrl = canvas.toDataURL('image/png', 0.95);
    
    // 캐시 저장
    this.previewImageCache.set(cacheKey, imageUrl);
    
    return imageUrl;
  }

  /**
   * Facebook 배경 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {HTMLCanvasElement} canvas - 캔버스
   * @param {boolean} isDark - 다크 모드 여부
   */
  async drawFacebookBackground(ctx, canvas, isDark) {
    ctx.save();
    
    // Facebook 브랜드 컬러를 활용한 그라데이션
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    
    if (isDark) {
      gradient.addColorStop(0, '#1877f2');
      gradient.addColorStop(0.5, '#42a5f5');
      gradient.addColorStop(1, '#1565c0');
    } else {
      gradient.addColorStop(0, '#4285f4');
      gradient.addColorStop(0.5, '#1877f2');
      gradient.addColorStop(1, '#1565c0');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 오버레이 효과
    const overlayGradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    overlayGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
    
    ctx.fillStyle = overlayGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 장식적 패턴
    this.drawFacebookPattern(ctx, canvas);
    
    ctx.restore();
  }

  /**
   * Facebook 장식 패턴 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {HTMLCanvasElement} canvas - 캔버스
   */
  drawFacebookPattern(ctx, canvas) {
    ctx.save();
    
    const hearts = ['💕', '💖', '💘', '💝', '❤️'];
    
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const heart = hearts[Math.floor(Math.random() * hearts.length)];
      const size = 15 + Math.random() * 25;
      
      ctx.globalAlpha = 0.1 + Math.random() * 0.1;
      ctx.font = `${size}px Arial`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(heart, x, y);
    }
    
    ctx.restore();
  }

  /**
   * Facebook 브랜딩 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {HTMLCanvasElement} canvas - 캔버스
   * @param {string} language - 언어
   * @param {boolean} isDark - 다크 모드 여부
   */
  async drawFacebookBranding(ctx, canvas, language, isDark) {
    ctx.save();
    
    const textColor = '#ffffff';
    const accentColor = '#ffeb3b';
    
    // 메인 로고/제목
    ctx.fillStyle = textColor;
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const title = '📊 Match Meter';
    ctx.fillText(title, 50, 50);
    
    // 부제목
    ctx.font = '22px Arial, sans-serif';
    ctx.fillStyle = accentColor;
    const subtitle = language === 'ko' ? '이름 궁합 테스트 결과' : 'Name Compatibility Result';
    ctx.fillText(subtitle, 50, 110);
    
    // Facebook 공유 표시
    ctx.font = '16px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const shareText = language === 'ko' ? 'Facebook에서 공유됨' : 'Shared on Facebook';
    ctx.textAlign = 'right';
    ctx.fillText(shareText, canvas.width - 50, 50);
    
    ctx.restore();
  }

  /**
   * Facebook 콘텐츠 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {HTMLCanvasElement} canvas - 캔버스
   * @param {number} score - 점수
   * @param {Object} names - 이름들
   * @param {string} language - 언어
   * @param {boolean} isDark - 다크 모드 여부
   */
  async drawFacebookContent(ctx, canvas, score, names, language, isDark) {
    ctx.save();
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 + 30;
    const textColor = '#ffffff';
    
    // 이름들 (메인 콘텐츠)
    ctx.fillStyle = textColor;
    ctx.font = 'bold 42px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const namesText = `${names.name1} 💕 ${names.name2}`;
    ctx.fillText(namesText, centerX, centerY - 60);
    
    // 점수 (하이라이트 요소)
    ctx.font = 'bold 72px Arial, sans-serif';
    ctx.fillStyle = '#ffeb3b';
    ctx.strokeStyle = '#ff5722';
    ctx.lineWidth = 3;
    
    const scoreText = `${score}%`;
    ctx.strokeText(scoreText, centerX, centerY + 20);
    ctx.fillText(scoreText, centerX, centerY + 20);
    
    // 궁합 평가
    ctx.font = 'bold 26px Arial, sans-serif';
    ctx.fillStyle = textColor;
    const compatibility = this.getCompatibilityText(score, language);
    ctx.fillText(compatibility, centerX, centerY + 80);
    
    ctx.restore();
  }

  /**
   * Facebook 최적화 요소 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {HTMLCanvasElement} canvas - 캔버스
   * @param {number} score - 점수
   * @param {string} language - 언어
   * @param {boolean} isDark - 다크 모드 여부
   */
  async drawFacebookOptimizedElements(ctx, canvas, score, language, isDark) {
    ctx.save();
    
    const textColor = 'rgba(255, 255, 255, 0.9)';
    
    // CTA 텍스트
    ctx.fillStyle = textColor;
    ctx.font = '20px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    
    const ctaText = language === 'ko' ? 
      '당신의 궁합도 확인해보세요! 👆' : 
      'Check your compatibility too! 👆';
    
    ctx.fillText(ctaText, canvas.width / 2, canvas.height - 30);
    
    // 점수별 이모지 추가
    const emoji = this.getScoreEmoji(score);
    ctx.font = '40px Arial';
    ctx.fillText(emoji, canvas.width - 80, canvas.height - 50);
    
    ctx.restore();
  }

  /**
   * Facebook에 공유
   * @param {Object} options - 공유 옵션
   */
  async shareToFacebook(options = {}) {
    const resultData = this.shareManager.resultData;
    if (!resultData) return;
    
    const { score, names, language } = resultData;
    
    // Facebook 공유 URL 생성
    const shareUrl = this.generateFacebookUrl(resultData);
    const quote = this.generateFacebookQuote(score, names, language);
    
    // Facebook 공유 다이얼로그 URL
    const facebookParams = new URLSearchParams({
      u: shareUrl,
      quote: quote,
      hashtag: language === 'ko' ? '#궁합테스트' : '#CompatibilityTest'
    });
    
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?${facebookParams.toString()}`;
    
    // 새 창에서 Facebook 공유 다이얼로그 열기
    const popup = window.open(
      facebookUrl, 
      'facebook-share', 
      'width=580,height=296,scrollbars=yes,resizable=yes'
    );
    
    // 팝업 중앙 정렬
    if (popup) {
      const left = (screen.width - 580) / 2;
      const top = (screen.height - 296) / 2;
      popup.moveTo(left, top);
    }
  }

  /**
   * Facebook 공유 텍스트 생성
   * @param {number} score - 점수
   * @param {Object} names - 이름들
   * @param {string} language - 언어
   * @returns {string} 공유 텍스트
   */
  generateFacebookQuote(score, names, language) {
    if (language === 'ko') {
      return `${names.name1}님과 ${names.name2}님의 이름 궁합은 ${score}%입니다! ${this.getScoreEmoji(score)} 여러분도 궁합을 확인해보세요!`;
    } else {
      return `${names.name1} and ${names.name2}'s name compatibility is ${score}%! ${this.getScoreEmoji(score)} Check your compatibility too!`;
    }
  }

  /**
   * 메타태그 설정
   * @param {Object} tags - 태그 객체
   */
  setMetaTags(tags) {
    Object.entries(tags).forEach(([property, content]) => {
      this.setMetaTag(property, content);
    });
  }

  /**
   * 개별 메타태그 설정
   * @param {string} property - 속성명
   * @param {string} content - 내용
   */
  setMetaTag(property, content) {
    if (!content) return;
    
    let metaTag = document.querySelector(`meta[property="${property}"]`);
    
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.property = property;
      document.head.appendChild(metaTag);
    }
    
    metaTag.content = content;
  }

  /**
   * Facebook 추천 기능 처리
   */
  handleFacebookReferral() {
    // Facebook에서 공유된 링크로 접근한 경우의 특별 처리
    
    // 특별 환영 메시지나 추가 기능 제공 가능
    const welcomeMessage = this.shareManager?.language === 'ko' ? 
      'Facebook에서 오셨네요! 환영합니다! 🎉' : 
      'Welcome from Facebook! 🎉';
    
    // 사용자에게 알림 (선택사항)
    setTimeout(() => {
      if (window.currentAnimationController) {
        // 특별 환영 애니메이션 실행 가능
      }
    }, 1000);
  }

  /**
   * Facebook 디버거용 메타데이터 검증
   * @returns {Object} 검증 결과
   */
  validateFacebookMetadata() {
    const requiredTags = [
      'og:title', 'og:description', 'og:image', 'og:url', 'og:type'
    ];
    
    const validation = {
      valid: true,
      errors: [],
      warnings: []
    };
    
    requiredTags.forEach(tag => {
      const element = document.querySelector(`meta[property="${tag}"]`);
      if (!element || !element.content) {
        validation.valid = false;
        validation.errors.push(`Missing required tag: ${tag}`);
      }
    });
    
    // 이미지 크기 검증
    const imageTag = document.querySelector('meta[property="og:image"]');
    if (imageTag) {
      const width = document.querySelector('meta[property="og:image:width"]')?.content;
      const height = document.querySelector('meta[property="og:image:height"]')?.content;
      
      if (!width || !height) {
        validation.warnings.push('Missing image dimensions');
      } else if (parseInt(width) < 1200 || parseInt(height) < 630) {
        validation.warnings.push('Image size below Facebook recommendations (1200x630)');
      }
    }
    
    return validation;
  }

  /**
   * 유틸리티 메서드들
   */
  getDefaultTitle(language) {
    return language === 'ko' ? 
      'Match Meter - 이름으로 알아보는 궁합 지수' : 
      'Match Meter - Name Compatibility Calculator';
  }

  getDefaultDescription(language) {
    return language === 'ko' ? 
      '두 이름의 궁합을 간단하게 확인해보세요. 친구들과 함께 재미있는 이름 궁합 테스트를 즐겨보세요!' : 
      'Check the compatibility between two names easily. Have fun with friends using this entertaining name compatibility test!';
  }

  getDefaultImageUrl() {
    return `${window.location.origin}/images/match-meter-facebook.png`;
  }

  getDefaultImageAlt(language) {
    return language === 'ko' ? 
      'Match Meter 이름 궁합 테스트' : 
      'Match Meter Name Compatibility Test';
  }

  getResultTitle(score, names, language) {
    if (language === 'ko') {
      return `${names.name1} ❤️ ${names.name2} 궁합 ${score}% - Match Meter`;
    } else {
      return `${names.name1} ❤️ ${names.name2} Compatibility ${score}% - Match Meter`;
    }
  }

  getResultDescription(score, names, language) {
    const compatibility = this.getCompatibilityText(score, language);
    
    if (language === 'ko') {
      return `${names.name1}님과 ${names.name2}님의 이름 궁합은 ${score}%입니다! ${compatibility} 당신의 궁합도 확인해보세요!`;
    } else {
      return `${names.name1} and ${names.name2}'s name compatibility is ${score}%! ${compatibility} Check your compatibility too!`;
    }
  }

  getResultImageAlt(score, names, language) {
    if (language === 'ko') {
      return `${names.name1}와 ${names.name2}의 궁합 ${score}% 결과`;
    } else {
      return `${names.name1} and ${names.name2} compatibility ${score}% result`;
    }
  }

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

  getScoreEmoji(score) {
    if (score >= 90) return '🔥';
    if (score >= 80) return '💖';
    if (score >= 70) return '💝';
    if (score >= 60) return '👍';
    if (score >= 50) return '🤔';
    return '💪';
  }

  generateTags(score, language) {
    const commonTags = language === 'ko' ? 
      ['궁합테스트', '이름궁합', '매치미터'] : 
      ['compatibility', 'nametest', 'matchmeter'];
    
    if (score >= 80) {
      return [...commonTags, ...(language === 'ko' ? ['천생연분', '완벽한궁합'] : ['perfectmatch', 'soulmate'])];
    } else if (score >= 60) {
      return [...commonTags, ...(language === 'ko' ? ['좋은궁합', '잘어울림'] : ['goodmatch', 'compatible'])];
    } else {
      return [...commonTags, ...(language === 'ko' ? ['재미있는결과'] : ['funresult'])];
    }
  }

  isDarkTheme() {
    if (window.currentThemeManager) {
      return window.currentThemeManager.getThemeInfo().isDark;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * Facebook App ID 설정
   * @param {string} appId - Facebook 앱 ID
   */
  setFacebookAppId(appId) {
    this.fbAppId = appId;
    this.setMetaTag('fb:app_id', appId);
  }

  /**
   * 캐시 정리
   */
  clearCache() {
    this.previewImageCache.clear();
  }

  /**
   * 정리
   */
  destroy() {
    this.clearCache();
  }
}

// 전역 스코프에서 사용 가능하도록 export
window.FacebookPreviewOptimizer = FacebookPreviewOptimizer;
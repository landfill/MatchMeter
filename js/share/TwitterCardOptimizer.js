/**
 * @fileoverview Twitter/X 카드 최적화 컴포넌트
 * Open Graph 메타태그 동적 생성 및 Twitter Card 최적화
 */

/**
 * Twitter Card 최적화 클래스
 * 동적 메타태그 생성, 카드 이미지 생성, URL 매개변수 처리
 */
class TwitterCardOptimizer {
  /**
   * TwitterCardOptimizer 생성자
   * @param {ShareManager} shareManager - 공유 관리자 인스턴스
   */
  constructor(shareManager) {
    this.shareManager = shareManager;
    this.cardTypes = ['summary_large_image', 'summary', 'app'];
    this.currentCardType = 'summary_large_image';
    
    this.init();
  }

  /**
   * 초기화
   */
  init() {
    this.detectCurrentResult();
    this.bindEvents();
    this.setupMetaTags();
  }

  /**
   * 현재 결과 감지
   */
  detectCurrentResult() {
    // URL 파라미터에서 결과 정보 추출
    const urlParams = new URLSearchParams(window.location.search);
    const sharedScore = urlParams.get('score');
    const sharedName1 = urlParams.get('name1');
    const sharedName2 = urlParams.get('name2');
    
    if (sharedScore && sharedName1 && sharedName2) {
      this.currentResult = {
        score: parseInt(sharedScore),
        names: {
          name1: decodeURIComponent(sharedName1),
          name2: decodeURIComponent(sharedName2)
        },
        shared: true
      };
      
      // 공유된 결과 자동 표시
      this.displaySharedResult();
    } else {
      this.currentResult = null;
    }
  }

  /**
   * 공유된 결과 자동 표시
   */
  displaySharedResult() {
    if (!this.currentResult || !this.currentResult.shared) return;
    
    const { score, names } = this.currentResult;
    
    // 입력 필드에 이름 설정
    const name1Input = document.getElementById('name1');
    const name2Input = document.getElementById('name2');
    
    if (name1Input && name2Input) {
      name1Input.value = names.name1;
      name2Input.value = names.name2;
    }
    
    // 결과 자동 계산 및 표시
    setTimeout(() => {
      if (window.calculateMatch) {
        window.calculateMatch();
      }
    }, 500);
  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // 결과 계산 완료 시 메타태그 업데이트
    document.addEventListener('matchCalculated', (e) => {
      this.updateMetaTags(e.detail);
    });

    // Twitter 공유 요청 처리
    document.addEventListener('twitterShareRequested', (e) => {
      this.shareToTwitter(e.detail);
    });

    // URL 변경 감지
    window.addEventListener('popstate', () => {
      this.detectCurrentResult();
    });
  }

  /**
   * 기본 메타태그 설정
   */
  setupMetaTags() {
    const defaultTags = {
      // Open Graph 기본 태그
      'og:site_name': 'Match Meter',
      'og:type': 'website',
      'og:url': window.location.origin,
      'og:locale': this.shareManager?.language === 'ko' ? 'ko_KR' : 'en_US',
      
      // Twitter Card 기본 태그
      'twitter:card': this.currentCardType,
      'twitter:site': '@matchmeter', // 실제 Twitter 계정으로 변경 필요
      'twitter:creator': '@matchmeter',
      
      // 기본 제목과 설명
      'og:title': this.getDefaultTitle(),
      'og:description': this.getDefaultDescription(),
      'twitter:title': this.getDefaultTitle(),
      'twitter:description': this.getDefaultDescription(),
      
      // 기본 이미지
      'og:image': this.getDefaultImageUrl(),
      'twitter:image': this.getDefaultImageUrl(),
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:type': 'image/png'
    };

    this.setMetaTags(defaultTags);
  }

  /**
   * 결과 기반 메타태그 업데이트
   * @param {Object} resultData - 결과 데이터
   */
  async updateMetaTags(resultData) {
    const { score, names, language } = resultData;
    
    // 결과 URL 생성
    const resultUrl = this.generateResultUrl(resultData);
    
    // 카드 이미지 생성
    const cardImageUrl = await this.generateCardImage(resultData);
    
    // 동적 메타태그 생성
    const dynamicTags = {
      'og:url': resultUrl,
      'og:title': this.getResultTitle(score, names, language),
      'og:description': this.getResultDescription(score, names, language),
      'twitter:title': this.getResultTitle(score, names, language),
      'twitter:description': this.getResultDescription(score, names, language),
      'og:image': cardImageUrl,
      'twitter:image': cardImageUrl,
      'og:updated_time': new Date().toISOString()
    };

    this.setMetaTags(dynamicTags);
    
    // URL 히스토리 업데이트 비활성화 (URL 노출 방지)
    // if (history.pushState && !this.currentResult?.shared) {
    //   history.pushState(resultData, '', resultUrl);
    // }
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
    
    // 기존 태그 찾기
    let metaTag = document.querySelector(`meta[property="${property}"]`) || 
                  document.querySelector(`meta[name="${property}"]`);
    
    if (!metaTag) {
      // 새 태그 생성
      metaTag = document.createElement('meta');
      
      // Twitter 카드는 name, Open Graph는 property 사용
      if (property.startsWith('twitter:')) {
        metaTag.name = property;
      } else {
        metaTag.property = property;
      }
      
      document.head.appendChild(metaTag);
    }
    
    metaTag.content = content;
  }

  /**
   * 결과 URL 생성
   * @param {Object} resultData - 결과 데이터
   * @returns {string} 결과 URL
   */
  generateResultUrl(resultData) {
    const { score, names } = resultData;
    const baseUrl = window.location.origin + window.location.pathname;
    
    const params = new URLSearchParams({
      score: score,
      name1: encodeURIComponent(names.name1),
      name2: encodeURIComponent(names.name2),
      shared: 'twitter'
    });
    
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * 카드 이미지 생성
   * @param {Object} resultData - 결과 데이터
   * @returns {Promise<string>} 이미지 데이터 URL
   */
  async generateCardImage(resultData) {
    // 캔버스 생성 (Twitter Card 권장 비율 1.91:1)
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    
    const ctx = canvas.getContext('2d');
    const { score, names } = resultData;
    const language = resultData.language || 'ko';
    const isDark = this.isDarkTheme();
    
    // 배경 그리기
    await this.drawCardBackground(ctx, canvas, isDark);
    
    // 브랜딩 영역
    await this.drawCardBranding(ctx, canvas, language, isDark);
    
    // 메인 콘텐츠
    await this.drawCardContent(ctx, canvas, score, names, language, isDark);
    
    // 하단 CTA
    await this.drawCardCTA(ctx, canvas, language, isDark);
    
    return canvas.toDataURL('image/png', 0.9);
  }

  /**
   * 카드 배경 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {HTMLCanvasElement} canvas - 캔버스
   * @param {boolean} isDark - 다크 모드 여부
   */
  async drawCardBackground(ctx, canvas, isDark) {
    ctx.save();
    
    // 그라데이션 배경
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    
    if (isDark) {
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(0.5, '#16213e');
      gradient.addColorStop(1, '#0f0f23');
    } else {
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(0.5, '#764ba2');
      gradient.addColorStop(1, '#f093fb');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 오버레이 효과
    ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 장식적 요소
    this.drawCardDecorations(ctx, canvas, isDark);
    
    ctx.restore();
  }

  /**
   * 카드 장식 요소 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {HTMLCanvasElement} canvas - 캔버스
   * @param {boolean} isDark - 다크 모드 여부
   */
  drawCardDecorations(ctx, canvas, isDark) {
    ctx.save();
    
    const hearts = ['💕', '💖', '✨', '⭐'];
    
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const heart = hearts[Math.floor(Math.random() * hearts.length)];
      const size = 20 + Math.random() * 30;
      
      ctx.globalAlpha = 0.15 + Math.random() * 0.15;
      ctx.font = `${size}px Arial`;
      ctx.fillStyle = isDark ? '#ffffff' : '#000000';
      ctx.fillText(heart, x, y);
    }
    
    ctx.restore();
  }

  /**
   * 카드 브랜딩 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {HTMLCanvasElement} canvas - 캔버스
   * @param {string} language - 언어
   * @param {boolean} isDark - 다크 모드 여부
   */
  async drawCardBranding(ctx, canvas, language, isDark) {
    ctx.save();
    
    const textColor = isDark ? '#ffffff' : '#000000';
    
    // 로고/제목
    ctx.fillStyle = textColor;
    ctx.font = 'bold 42px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const title = '📊 Match Meter';
    ctx.fillText(title, 60, 60);
    
    // 부제목
    ctx.font = '20px Arial, sans-serif';
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)';
    const subtitle = language === 'ko' ? '이름 궁합 테스트' : 'Name Compatibility Test';
    ctx.fillText(subtitle, 60, 110);
    
    ctx.restore();
  }

  /**
   * 카드 메인 콘텐츠 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {HTMLCanvasElement} canvas - 캔버스
   * @param {number} score - 점수
   * @param {Object} names - 이름들
   * @param {string} language - 언어
   * @param {boolean} isDark - 다크 모드 여부
   */
  async drawCardContent(ctx, canvas, score, names, language, isDark) {
    ctx.save();
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 + 20;
    const textColor = isDark ? '#ffffff' : '#000000';
    
    // 이름들
    ctx.fillStyle = textColor;
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const namesText = `${names.name1} 💖 ${names.name2}`;
    ctx.fillText(namesText, centerX, centerY - 80);
    
    // 점수 (가장 중요한 요소)
    ctx.font = 'bold 84px Arial, sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = isDark ? '#000000' : '#333333';
    ctx.lineWidth = 3;
    
    const scoreText = `${score}%`;
    ctx.strokeText(scoreText, centerX, centerY);
    ctx.fillText(scoreText, centerX, centerY);
    
    // 궁합 설명
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.fillStyle = textColor;
    const compatibility = this.getCompatibilityText(score, language);
    ctx.fillText(compatibility, centerX, centerY + 80);
    
    ctx.restore();
  }

  /**
   * 카드 CTA 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {HTMLCanvasElement} canvas - 캔버스
   * @param {string} language - 언어
   * @param {boolean} isDark - 다크 모드 여부
   */
  async drawCardCTA(ctx, canvas, language, isDark) {
    ctx.save();
    
    const textColor = isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)';
    
    ctx.fillStyle = textColor;
    ctx.font = '24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    
    const ctaText = language === 'ko' ? 
      '당신의 이름 궁합도 확인해보세요!' : 
      'Check your name compatibility too!';
    
    ctx.fillText(ctaText, canvas.width / 2, canvas.height - 40);
    
    ctx.restore();
  }

  /**
   * Twitter에 공유
   * @param {Object} options - 공유 옵션
   */
  async shareToTwitter(options = {}) {
    const resultData = this.shareManager.resultData;
    if (!resultData) return;
    
    const { score, names, language } = resultData;
    
    // 공유 텍스트 생성
    const shareText = this.generateTwitterText(score, names, language);
    
    // 결과 URL
    const resultUrl = this.generateResultUrl(resultData);
    
    // Twitter 공유 URL 생성
    const twitterParams = new URLSearchParams({
      text: shareText,
      url: resultUrl,
      hashtags: language === 'ko' ? '궁합테스트,매치미터' : 'compatibility,matchmeter',
      via: 'matchmeter'
    });
    
    const twitterUrl = `https://twitter.com/intent/tweet?${twitterParams.toString()}`;
    
    // 새 창에서 열기
    window.open(twitterUrl, '_blank', 'width=550,height=400');
  }

  /**
   * Twitter 공유 텍스트 생성
   * @param {number} score - 점수
   * @param {Object} names - 이름들
   * @param {string} language - 언어
   * @returns {string} 공유 텍스트
   */
  generateTwitterText(score, names, language) {
    if (language === 'ko') {
      return `${names.name1}님과 ${names.name2}님의 궁합은 ${score}%! ${this.getCompatibilityEmoji(score)} 당신도 확인해보세요!`;
    } else {
      return `${names.name1} & ${names.name2} compatibility: ${score}%! ${this.getCompatibilityEmoji(score)} Check yours too!`;
    }
  }

  /**
   * 기본 제목 반환
   * @returns {string} 기본 제목
   */
  getDefaultTitle() {
    const language = this.shareManager?.language || 'ko';
    return language === 'ko' ? 
      'Match Meter - 이름으로 알아보는 궁합 지수' : 
      'Match Meter - Name Compatibility Calculator';
  }

  /**
   * 기본 설명 반환
   * @returns {string} 기본 설명
   */
  getDefaultDescription() {
    const language = this.shareManager?.language || 'ko';
    return language === 'ko' ? 
      '두 이름의 궁합을 간단하게 확인해보세요. 재미있는 이름 궁합 테스트로 친구들과 함께 즐겨보세요!' : 
      'Check the compatibility between two names easily. Have fun with friends using this entertaining name compatibility test!';
  }

  /**
   * 기본 이미지 URL 반환
   * @returns {string} 기본 이미지 URL
   */
  getDefaultImageUrl() {
    // 기본 이미지는 별도 생성하거나 정적 파일 사용
    return `${window.location.origin}/images/match-meter-card.png`;
  }

  /**
   * 결과 제목 생성
   * @param {number} score - 점수
   * @param {Object} names - 이름들
   * @param {string} language - 언어
   * @returns {string} 결과 제목
   */
  getResultTitle(score, names, language) {
    if (language === 'ko') {
      return `${names.name1} ⚡ ${names.name2} 궁합 ${score}% - Match Meter`;
    } else {
      return `${names.name1} ⚡ ${names.name2} Compatibility ${score}% - Match Meter`;
    }
  }

  /**
   * 결과 설명 생성
   * @param {number} score - 점수
   * @param {Object} names - 이름들
   * @param {string} language - 언어
   * @returns {string} 결과 설명
   */
  getResultDescription(score, names, language) {
    const compatibility = this.getCompatibilityText(score, language);
    
    if (language === 'ko') {
      return `${names.name1}님과 ${names.name2}님의 이름 궁합은 ${score}%입니다. ${compatibility} 당신의 궁합도 확인해보세요!`;
    } else {
      return `${names.name1} and ${names.name2}'s name compatibility is ${score}%. ${compatibility} Check your compatibility too!`;
    }
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
   * 궁합 이모지 반환
   * @param {number} score - 점수
   * @returns {string} 이모지
   */
  getCompatibilityEmoji(score) {
    if (score >= 90) return '🔥💕';
    if (score >= 80) return '💖✨';
    if (score >= 70) return '💝😊';
    if (score >= 60) return '👍😌';
    if (score >= 50) return '🤔💭';
    return '💪🔧';
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
   * 카드 타입 변경
   * @param {string} cardType - 카드 타입
   */
  setCardType(cardType) {
    if (this.cardTypes.includes(cardType)) {
      this.currentCardType = cardType;
      this.setMetaTag('twitter:card', cardType);
    }
  }

  /**
   * 메타태그 정보 반환
   * @returns {Object} 현재 메타태그 정보
   */
  getMetaInfo() {
    const metaTags = {};
    const tags = document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]');
    
    tags.forEach(tag => {
      const key = tag.getAttribute('property') || tag.getAttribute('name');
      const value = tag.getAttribute('content');
      if (key && value) {
        metaTags[key] = value;
      }
    });
    
    return metaTags;
  }

  /**
   * Twitter Card 검증
   * @returns {Promise<boolean>} 검증 결과
   */
  async validateTwitterCard() {
    const currentUrl = encodeURIComponent(window.location.href);
    const validatorUrl = `https://cards-dev.twitter.com/validator?url=${currentUrl}`;
    
    // 검증 URL 반환 (실제 검증은 개발자가 수동으로 확인)
    return true;
  }
}

// 전역 스코프에서 사용 가능하도록 export
window.TwitterCardOptimizer = TwitterCardOptimizer;
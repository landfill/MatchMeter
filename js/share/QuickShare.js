/**
 * @fileoverview 빠른 공유 컴포넌트 - 결과 영역 내 1-2탭 공유
 * @author Match Meter Team
 */

/**
 * 빠른 공유 UI 관리 클래스
 * 결과 화면에서 즉시 공유할 수 있는 버튼들을 제공
 */
class QuickShare {
  /**
   * QuickShare 생성자
   * @param {HTMLElement} container - 공유 버튼이 렌더링될 컨테이너
   * @param {ShareManager} shareManager - 공유 관리자 인스턴스
   */
  constructor(container, shareManager) {
    this.container = container;
    this.shareManager = shareManager;
    this.quickShareContainer = null;
    
    this.init();
  }

  /**
   * 초기화
   */
  init() {
    this.createQuickShareContainer();
    this.bindEvents();
  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // 터치 피드백 처리
    document.addEventListener('touchstart', (e) => {
      if (e.target.closest('.quick-share-btn')) {
        this.handleTouchStart(e.target.closest('.quick-share-btn'));
      }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      if (e.target.closest('.quick-share-btn')) {
        this.handleTouchEnd(e.target.closest('.quick-share-btn'));
      }
    }, { passive: true });
  }

  /**
   * 빠른 공유 컨테이너 생성
   */
  createQuickShareContainer() {
    this.quickShareContainer = document.createElement('div');
    this.quickShareContainer.className = 'quick-share-container';
    this.quickShareContainer.innerHTML = `
      <div class="quick-share-buttons" role="group" aria-label="${this.getLocalizedText('quickShareTitle')}">
        <!-- 버튼들이 여기에 동적으로 추가됩니다 -->
      </div>
    `;
  }

  /**
   * 빠른 공유 버튼들 렌더링
   */
  renderQuickShareButtons() {
    // 기존 빠른 공유 컨테이너 제거
    const existingContainer = this.container.querySelector('.quick-share-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    // 새 컨테이너 생성
    this.createQuickShareContainer();
    
    const buttonsContainer = this.quickShareContainer.querySelector('.quick-share-buttons');
    
    // 빠른 공유 옵션들 가져오기
    const quickOptions = this.getQuickShareOptions();
    
    quickOptions.forEach(option => {
      const button = this.createQuickShareButton(option);
      buttonsContainer.appendChild(button);
    });

    // 더보기 버튼 추가
    const moreButton = this.createMoreOptionsButton();
    buttonsContainer.appendChild(moreButton);

    // 컨테이너를 결과 영역에 추가
    this.container.appendChild(this.quickShareContainer);

    // 애니메이션 적용
    setTimeout(() => {
      this.quickShareContainer.classList.add('animate');
    }, 100);
  }

  /**
   * 빠른 공유 옵션 목록 반환
   * @returns {Array} 빠른 공유 옵션 배열
   */
  getQuickShareOptions() {
    const language = this.shareManager.language;
    const isMobile = this.isMobile();
    
    const options = [];

    // Instagram Stories (우선순위 최상위)
    options.push({
      platform: 'instagram-stories',
      icon: '📷',
      label: language === 'ko' ? '스토리' : 'Stories',
      description: language === 'ko' ? 'Instagram Stories로 공유' : 'Share to Instagram Stories',
      primary: true
    });

    // 네이티브 공유 (모바일에서 우선)
    if (isMobile && navigator.share) {
      options.push({
        platform: 'native',
        icon: '📱',
        label: language === 'ko' ? '공유' : 'Share',
        description: language === 'ko' ? '휴대폰 공유 메뉴' : 'Native share menu',
        primary: true
      });
    }

    // 카카오톡 (한국 사용자용)
    if (language === 'ko' || this.isKoreanUser()) {
      options.push({
        platform: 'kakao',
        icon: '💬',
        label: language === 'ko' ? '카톡' : 'KakaoTalk',
        description: language === 'ko' ? '카카오톡으로 공유' : 'Share via KakaoTalk',
        primary: true
      });
    }

    // Twitter/X 공유
    options.push({
      platform: 'twitter',
      icon: '🐦',
      label: language === 'ko' ? 'X' : 'X',
      description: language === 'ko' ? 'X(구 트위터)로 공유' : 'Share to X (Twitter)',
      primary: true
    });

    // Facebook 공유
    options.push({
      platform: 'facebook',
      icon: '📘',
      label: 'Facebook',
      description: language === 'ko' ? 'Facebook으로 공유' : 'Share to Facebook',
      primary: true
    });

    // 링크 복사 (항상 포함)
    options.push({
      platform: 'copy',
      icon: '🔗',
      label: language === 'ko' ? '링크' : 'Copy',
      description: language === 'ko' ? '링크 복사' : 'Copy link',
      primary: false
    });

    return options.slice(0, 4); // 최대 4개 버튼만 표시
  }

  /**
   * 빠른 공유 버튼 생성
   * @param {Object} option - 옵션 정보
   * @returns {HTMLElement} 버튼 요소
   */
  createQuickShareButton(option) {
    const button = document.createElement('button');
    button.className = `quick-share-btn ${option.primary ? 'primary' : 'secondary'}`;
    button.setAttribute('data-platform', option.platform);
    button.setAttribute('aria-label', option.description);
    button.setAttribute('title', option.description);

    button.innerHTML = `
      <span class="btn-icon" aria-hidden="true">${option.icon}</span>
      <span class="btn-label">${option.label}</span>
      <div class="btn-loading" style="display: none;">
        <div class="loading-spinner"></div>
      </div>
    `;

    // 클릭 이벤트
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      await this.handleQuickShareClick(option.platform, button);
    });

    // 키보드 이벤트
    button.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        await this.handleQuickShareClick(option.platform, button);
      }
    });
    
    // 마이크로 인터랙션 이벤트
    this.addMicroInteractions(button);

    return button;
  }

  /**
   * 더보기 옵션 버튼 생성
   * @returns {HTMLElement} 더보기 버튼
   */
  createMoreOptionsButton() {
    const language = this.shareManager.language;
    const button = document.createElement('button');
    button.className = 'quick-share-btn more-options';
    button.setAttribute('aria-label', language === 'ko' ? '더 많은 공유 옵션' : 'More share options');

    button.innerHTML = `
      <span class="btn-icon" aria-hidden="true">⋯</span>
      <span class="btn-label">${language === 'ko' ? '더보기' : 'More'}</span>
    `;

    // 클릭 시 기존 공유 모달 표시
    button.addEventListener('click', (e) => {
      e.preventDefault();
      this.showFullShareModal();
    });

    return button;
  }

  /**
   * 빠른 공유 클릭 처리
   * @param {string} platform - 플랫폼 이름
   * @param {HTMLElement} button - 클릭된 버튼
   */
  async handleQuickShareClick(platform, button) {
    try {
      // 버튼 로딩 상태
      this.setButtonLoading(button, true);

      // 햅틱 피드백
      this.provideFeedback('light');

      let customMessage = null;

      // 특정 플랫폼의 경우 간단한 커스터마이징 옵션 제공
      if (platform === 'kakao') {
        // 카카오톡의 경우 간단한 메시지 선택 옵션
        const quickMessage = await this.showQuickMessagePicker(platform);
        if (quickMessage === null) {
          return; // 사용자가 취소함
        }
        customMessage = quickMessage;
      } else if (platform === 'instagram-stories') {
        // Instagram Stories의 경우 템플릿 선택
        const storyOptimizer = window.currentInstagramOptimizer || new InstagramStoriesOptimizer(this.shareManager);
        const templateId = await storyOptimizer.showTemplateSelector();
        if (templateId === null) {
          return; // 사용자가 취소함
        }
        
        // 스토리 이미지 생성
        const storyImageUrl = await storyOptimizer.generateStoryImage(templateId);
        
        // Instagram Stories로 공유 (Web Share API 또는 URL scheme 사용)
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [] })) {
          // Base64를 Blob으로 변환
          const response = await fetch(storyImageUrl);
          const blob = await response.blob();
          const file = new File([blob], 'match-meter-story.png', { type: 'image/png' });
          
          await navigator.share({
            files: [file],
            title: this.shareManager.language === 'ko' ? 'Match Meter 궁합 결과' : 'Match Meter Compatibility',
            text: this.getSimpleShareMessage()
          });
        } else {
          // 대체 방법: 이미지 다운로드 + Instagram 앱 열기
          this.downloadImageAndOpenInstagram(storyImageUrl);
        }
        
        this.showQuickFeedback('success', platform);
        this.provideFeedback('success');
        return;
      } else if (platform === 'twitter') {
        // Twitter/X 공유
        const twitterOptimizer = window.currentTwitterOptimizer || new TwitterCardOptimizer(this.shareManager);
        await twitterOptimizer.shareToTwitter();
        this.showQuickFeedback('success', platform);
        this.provideFeedback('success');
        return;
      } else if (platform === 'facebook') {
        // Facebook 공유
        const facebookOptimizer = window.currentFacebookOptimizer || new FacebookPreviewOptimizer(this.shareManager);
        await facebookOptimizer.shareToFacebook();
        this.showQuickFeedback('success', platform);
        this.provideFeedback('success');
        return;
      }

      // 공유 실행
      await this.shareManager.shareToPlatform(platform, customMessage);

      // 성공 피드백
      this.showQuickFeedback('success', platform);
      this.provideFeedback('success');
      
      // 성공 애니메이션
      if (window.currentAnimationController) {
        window.currentAnimationController.showSuccessFeedback(button);
      }

    } catch (error) {
      console.error(`Quick share failed for ${platform}:`, error);
      
      // 에러 피드백
      this.showQuickFeedback('error', platform);
      this.provideFeedback('error');
      
      // 에러 애니메이션
      if (window.currentAnimationController) {
        window.currentAnimationController.showErrorFeedback(button);
      }
    } finally {
      this.setButtonLoading(button, false);
    }
  }

  /**
   * 빠른 메시지 선택기 표시 (카카오톡용)
   * @param {string} platform - 플랫폼 이름
   * @returns {Promise<string|null>} 선택된 메시지 또는 null
   */
  async showQuickMessagePicker(platform) {
    return new Promise((resolve) => {
      const language = this.shareManager.language;
      const renderer = new ShareRenderer(this.shareManager.resultData, language);
      
      // 미리 정의된 메시지 템플릿들
      const messageTemplates = [
        {
          key: 'default',
          label: language === 'ko' ? '기본 메시지' : 'Default',
          message: renderer.formatShareText(platform)
        },
        {
          key: 'fun',
          label: language === 'ko' ? '재미있게' : 'Fun',
          message: this.getFunShareMessage()
        },
        {
          key: 'simple',
          label: language === 'ko' ? '간단하게' : 'Simple',
          message: this.getSimpleShareMessage()
        }
      ];

      // 빠른 선택 팝오버 생성
      const popover = document.createElement('div');
      popover.className = 'quick-message-popover';
      popover.innerHTML = `
        <div class="popover-content">
          <h4>${language === 'ko' ? '메시지 스타일 선택' : 'Choose message style'}</h4>
          <div class="message-options">
            ${messageTemplates.map(template => `
              <button class="message-option" data-key="${template.key}">
                <span class="option-label">${template.label}</span>
                <span class="option-preview">${template.message.substring(0, 30)}...</span>
              </button>
            `).join('')}
          </div>
          <button class="cancel-btn">${language === 'ko' ? '취소' : 'Cancel'}</button>
        </div>
      `;

      // 이벤트 리스너
      popover.addEventListener('click', (e) => {
        if (e.target.matches('.message-option')) {
          const key = e.target.getAttribute('data-key');
          const template = messageTemplates.find(t => t.key === key);
          popover.remove();
          resolve(template.message);
        } else if (e.target.matches('.cancel-btn')) {
          popover.remove();
          resolve(null);
        }
      });

      // DOM에 추가
      document.body.appendChild(popover);
      
      // 3초 후 자동 기본값 선택
      setTimeout(() => {
        if (document.body.contains(popover)) {
          popover.remove();
          resolve(messageTemplates[0].message);
        }
      }, 3000);
    });
  }

  /**
   * 재미있는 공유 메시지 생성
   * @returns {string} 재미있는 메시지
   */
  getFunShareMessage() {
    const { score, names } = this.shareManager.resultData;
    const language = this.shareManager.language;
    
    if (language === 'ko') {
      return `🎉 ${names.name1}님과 ${names.name2}님의 궁합은 ${score}%! 과연 이 결과가 맞을까요? 😄`;
    } else {
      return `🎉 ${names.name1} & ${names.name2} scored ${score}% compatibility! What do you think? 😄`;
    }
  }

  /**
   * 간단한 공유 메시지 생성
   * @returns {string} 간단한 메시지
   */
  getSimpleShareMessage() {
    const { score, names } = this.shareManager.resultData;
    const language = this.shareManager.language;
    
    if (language === 'ko') {
      return `${names.name1} ⚡ ${names.name2} = ${score}%`;
    } else {
      return `${names.name1} ⚡ ${names.name2} = ${score}%`;
    }
  }

  /**
   * 전체 공유 모달 표시
   */
  showFullShareModal() {
    // 미리보기 모달 표시
    if (window.currentSharePreview) {
      window.currentSharePreview.showPreviewModal();
    } else {
      // 기존 ShareUI 사용 (fallback)
      if (window.currentShareUI) {
        window.currentShareUI.showShareModal();
      }
    }
  }

  /**
   * 빠른 피드백 표시
   * @param {string} type - success 또는 error
   * @param {string} platform - 플랫폼 이름
   */
  showQuickFeedback(type, platform) {
    const language = this.shareManager.language;
    const platformName = this.getPlatformName(platform);
    
    let message;
    if (type === 'success') {
      message = language === 'ko' ? 
        `${platformName}에 공유되었습니다!` : 
        `Shared to ${platformName}!`;
    } else {
      message = language === 'ko' ? 
        `${platformName} 공유에 실패했습니다.` : 
        `Failed to share to ${platformName}.`;
    }

    // 기존 피드백 제거
    const existingFeedback = document.querySelector('.quick-feedback');
    if (existingFeedback) {
      existingFeedback.remove();
    }

    // 새 피드백 생성
    const feedback = document.createElement('div');
    feedback.className = `quick-feedback ${type}`;
    feedback.textContent = message;
    
    this.quickShareContainer.appendChild(feedback);
    
    // 3초 후 제거
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.remove();
      }
    }, 3000);
  }

  /**
   * 버튼 로딩 상태 설정
   * @param {HTMLElement} button - 버튼 요소
   * @param {boolean} loading - 로딩 상태
   */
  setButtonLoading(button, loading) {
    const loadingEl = button.querySelector('.btn-loading');
    const icon = button.querySelector('.btn-icon');
    const label = button.querySelector('.btn-label');

    if (loading) {
      button.classList.add('loading');
      button.disabled = true;
      if (loadingEl) loadingEl.style.display = 'block';
      if (icon) icon.style.opacity = '0.3';
      if (label) label.style.opacity = '0.7';
    } else {
      button.classList.remove('loading');
      button.disabled = false;
      if (loadingEl) loadingEl.style.display = 'none';
      if (icon) icon.style.opacity = '1';
      if (label) label.style.opacity = '1';
    }
  }

  /**
   * 터치 피드백 처리
   */
  handleTouchStart(button) {
    if (this.isMobile()) {
      button.classList.add('touch-active');
      this.provideFeedback('light');
    }
  }

  handleTouchEnd(button) {
    if (this.isMobile()) {
      setTimeout(() => {
        button.classList.remove('touch-active');
      }, 150);
    }
  }

  /**
   * 마이크로 인터랙션 추가
   * @param {HTMLElement} button - 버튼 요소
   */
  addMicroInteractions(button) {
    // 호버 효과 (데스크톱)
    if (!this.isMobile()) {
      button.addEventListener('mouseenter', () => {
        const icon = button.querySelector('.btn-icon');
        if (icon && window.currentAnimationController) {
          icon.style.transform = 'scale(1.2) rotate(5deg)';
        }
      });
      
      button.addEventListener('mouseleave', () => {
        const icon = button.querySelector('.btn-icon');
        if (icon) {
          icon.style.transform = 'scale(1) rotate(0deg)';
        }
      });
    }
    
    // 클릭 애니메이션
    button.addEventListener('mousedown', () => {
      if (window.currentAnimationController) {
        window.currentAnimationController.showSuccessFeedback(button);
      }
    });
    
    // 포커스 애니메이션
    button.addEventListener('focus', () => {
      button.classList.add('glow-effect');
    });
    
    button.addEventListener('blur', () => {
      button.classList.remove('glow-effect');
    });
  }

  /**
   * 유틸리티 메서드들
   */
  isMobile() {
    return window.innerWidth < 768 || 'ontouchstart' in window;
  }

  isKoreanUser() {
    // 간단한 한국 사용자 감지 (언어, 시간대 등)
    return navigator.language.startsWith('ko') || 
           Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Seoul';
  }

  getLocalizedText(key) {
    const language = this.shareManager.language;
    const texts = {
      quickShareTitle: language === 'ko' ? '빠른 공유' : 'Quick Share',
      quickShareSubtitle: language === 'ko' ? '원터치로 바로 공유하세요' : 'Share with one tap'
    };
    return texts[key] || key;
  }

  /**
   * 이미지 다운로드 후 Instagram 앱 열기
   * @param {string} imageUrl - 이미지 데이터 URL
   */
  downloadImageAndOpenInstagram(imageUrl) {
    // 이미지 다운로드
    const link = document.createElement('a');
    link.download = 'match-meter-story.png';
    link.href = imageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Instagram 앱 열기 시도
    setTimeout(() => {
      const instagramUrl = 'instagram://story-camera';
      const fallbackUrl = 'https://instagram.com';
      
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = instagramUrl;
      document.body.appendChild(iframe);
      
      setTimeout(() => {
        document.body.removeChild(iframe);
        // Instagram 앱이 없을 경우 웹사이트로 이동
        window.open(fallbackUrl, '_blank');
      }, 1000);
    }, 500);
  }

  getPlatformName(platform) {
    const names = {
      native: this.shareManager.language === 'ko' ? '공유' : 'Share',
      kakao: '카카오톡',
      copy: this.shareManager.language === 'ko' ? '링크' : 'Link',
      image: this.shareManager.language === 'ko' ? '이미지' : 'Image',
      'instagram-stories': 'Instagram Stories',
      twitter: 'X (Twitter)',
      facebook: 'Facebook'
    };
    return names[platform] || platform;
  }

  provideFeedback(type = 'light') {
    if ('vibrate' in navigator && this.isMobile()) {
      const patterns = {
        light: [10],
        medium: [20],
        success: [10, 50, 10],
        error: [50, 100, 50]
      };
      navigator.vibrate(patterns[type] || patterns.light);
    }
  }
}

// 전역 스코프에서 사용 가능하도록 export
window.QuickShare = QuickShare;
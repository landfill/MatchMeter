/**
 * @fileoverview 소셜 공유 UI 컴포넌트 관리자
 * @author Match Meter Team
 */

/**
 * 소셜 공유 UI 관리 클래스
 */
class ShareUI {
  /**
   * ShareUI 생성자
   * @param {HTMLElement} container - 공유 UI가 렌더링될 컨테이너
   * @param {ShareManager} shareManager - 공유 관리자 인스턴스
   */
  constructor(container, shareManager) {
    this.container = container;
    this.shareManager = shareManager;
    this.modal = null;
    this.isModalOpen = false;
    
    this.init();
  }

  /**
   * 초기화
   */
  init() {
    this.bindEvents();
  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isModalOpen) {
        this.hideShareModal();
      }
    });
  }

  /**
   * 공유 버튼 렌더링
   */
  renderShareButton() {
    // 기존 공유 버튼이 있다면 제거
    const existingButton = this.container.querySelector('.share-button');
    if (existingButton) {
      existingButton.remove();
    }

    const shareButton = document.createElement('button');
    shareButton.className = 'share-button mobile-button mobile-button-secondary';
    shareButton.setAttribute('aria-label', this.getLocalizedText('shareButtonLabel'));
    shareButton.setAttribute('aria-describedby', 'share-description');
    
    shareButton.innerHTML = `
      <span aria-hidden="true">📤</span> 
      <span class="share-button-text">${this.getLocalizedText('shareButtonText')}</span>
    `;

    // 설명 요소 추가
    const description = document.createElement('div');
    description.id = 'share-description';
    description.className = 'sr-only';
    description.textContent = this.getLocalizedText('shareDescription');

    // 로딩 상태 표시를 위한 스피너 요소
    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'share-loading-spinner';
    loadingSpinner.style.display = 'none';
    loadingSpinner.innerHTML = '<div class="spinner"></div>';

    shareButton.appendChild(loadingSpinner);

    // 이벤트 리스너 추가
    shareButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleShareButtonClick();
    });

    // 키보드 접근성
    shareButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleShareButtonClick();
      }
    });

    // 터치 피드백 (모바일)
    if (this.isMobile()) {
      shareButton.addEventListener('touchstart', () => {
        shareButton.classList.add('touch-active');
        this.provideFeedback('light');
      }, { passive: true });

      shareButton.addEventListener('touchend', () => {
        setTimeout(() => {
          shareButton.classList.remove('touch-active');
        }, 150);
      }, { passive: true });
    }

    this.container.appendChild(shareButton);
    this.container.appendChild(description);
    
    // 버튼 참조 저장
    this.shareButton = shareButton;
  }

  /**
   * 현재 언어에 따른 텍스트 반환
   * @param {string} key - 텍스트 키
   * @returns {string} 로컬라이즈된 텍스트
   */
  getLocalizedText(key) {
    const language = this.shareManager.language;
    const templates = ShareTemplates.getMessageTemplates(language);
    
    const texts = {
      shareButtonLabel: language === 'ko' ? '결과 공유하기' : 'Share Results',
      shareButtonText: language === 'ko' ? '결과 공유하기' : 'Share Results',
      shareDescription: language === 'ko' ? '궁합 결과를 소셜 미디어에 공유합니다' : 'Share compatibility results on social media',
      shareModalTitle: language === 'ko' ? '결과 공유하기' : 'Share Results',
      shareModalOpened: language === 'ko' ? '공유 옵션 메뉴가 열렸습니다' : 'Share options menu opened',
      shareModalClosed: language === 'ko' ? '공유 옵션 메뉴가 닫혔습니다' : 'Share options menu closed',
      closeModal: language === 'ko' ? '모달 닫기' : 'Close modal'
    };

    return texts[key] || key;
  }

  /**
   * 햅틱 피드백 제공 (모바일)
   * @param {string} type - 피드백 타입
   */
  provideFeedback(type = 'light') {
    if ('vibrate' in navigator && this.isMobile()) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type] || patterns.light);
    }
  }

  /**
   * 공유 버튼 로딩 상태 설정
   * @param {boolean} loading - 로딩 상태
   */
  setShareButtonLoading(loading) {
    if (!this.shareButton) return;

    const spinner = this.shareButton.querySelector('.share-loading-spinner');
    const text = this.shareButton.querySelector('.share-button-text');

    if (loading) {
      this.shareButton.classList.add('share-loading');
      this.shareButton.disabled = true;
      if (spinner) spinner.style.display = 'block';
      if (text) text.style.opacity = '0.6';
    } else {
      this.shareButton.classList.remove('share-loading');
      this.shareButton.disabled = false;
      if (spinner) spinner.style.display = 'none';
      if (text) text.style.opacity = '1';
    }
  }

  /**
   * 공유 버튼 클릭 처리
   */
  async handleShareButtonClick() {
    try {
      this.setShareButtonLoading(true);
      
      // 모바일에서 네이티브 공유 API 사용 가능한 경우
      if (this.isMobile() && navigator.share) {
        await this.showNativeShareMenu();
      } else {
        this.showShareModal();
      }
    } catch (error) {
      console.error('Share button click error:', error);
      this.showErrorMessage(error.message);
    } finally {
      this.setShareButtonLoading(false);
    }
  }

  /**
   * 모바일 기기 여부 확인
   * @returns {boolean}
   */
  isMobile() {
    return window.innerWidth < 768 || 'ontouchstart' in window;
  }

  /**
   * 공유 옵션 모달 표시
   */
  showShareModal() {
    if (this.isModalOpen) return;

    this.createModal();
    this.isModalOpen = true;
    
    // 모달 표시 애니메이션
    requestAnimationFrame(() => {
      if (this.modal) {
        this.modal.classList.add('show');
      }
    });
    
    // 접근성을 위한 포커스 관리
    setTimeout(() => {
      const firstButton = this.modal.querySelector('.share-option');
      if (firstButton) {
        firstButton.focus();
      }
    }, 150);

    // 스크린 리더 알림
    this.announceToScreenReader(this.getLocalizedText('shareModalOpened'));
    
    // 모바일에서 햅틱 피드백
    this.provideFeedback('light');
  }

  /**
   * 공유 옵션 모달 숨김
   */
  hideShareModal() {
    if (!this.isModalOpen || !this.modal) return;

    // 모달 숨김 애니메이션
    this.modal.classList.add('hiding');
    
    setTimeout(() => {
      if (this.modal) {
        this.modal.remove();
        this.modal = null;
      }
      this.isModalOpen = false;
    }, 200);

    // 포커스를 공유 버튼으로 되돌림
    if (this.shareButton) {
      this.shareButton.focus();
    }

    this.announceToScreenReader(this.getLocalizedText('shareModalClosed'));
  }

  /**
   * 오류 메시지 표시
   * @param {string} message - 오류 메시지
   */
  showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'share-feedback error';
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // 3초 후 자동 제거
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 3000);
    
    // 접근성 알림
    this.announceToScreenReader(message);
  }

  /**
   * 성공 메시지 표시
   * @param {string} message - 성공 메시지
   */
  showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'share-feedback success';
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    
    // 3초 후 자동 제거
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.parentNode.removeChild(successDiv);
      }
    }, 3000);
    
    // 접근성 알림
    this.announceToScreenReader(message);
    
    // 성공 피드백
    this.provideFeedback('medium');
  }

  /**
   * 모달 생성
   */
  createModal() {
    // 기존 모달이 있다면 제거
    const existingModal = document.querySelector('.share-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // 모달 컨테이너 생성
    this.modal = document.createElement('div');
    this.modal.className = 'share-modal';
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('aria-labelledby', 'share-modal-title');

    // 모달 내용 생성
    const modalContent = document.createElement('div');
    modalContent.className = 'share-modal-content';

    // 모달 헤더
    const header = this.createModalHeader();
    modalContent.appendChild(header);

    // 공유 옵션들
    const optionsContainer = this.createShareOptions();
    modalContent.appendChild(optionsContainer);

    this.modal.appendChild(modalContent);

    // 이벤트 리스너 추가
    this.addModalEventListeners();

    // DOM에 추가
    document.body.appendChild(this.modal);
  }

  /**
   * 모달 헤더 생성
   * @returns {HTMLElement} 헤더 요소
   */
  createModalHeader() {
    const header = document.createElement('div');
    header.className = 'share-modal-header';

    const title = document.createElement('h3');
    title.id = 'share-modal-title';
    title.textContent = this.getLocalizedText('shareModalTitle');

    const closeButton = document.createElement('button');
    closeButton.className = 'share-modal-close';
    closeButton.setAttribute('aria-label', this.getLocalizedText('closeModal'));
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => this.hideShareModal());

    header.appendChild(title);
    header.appendChild(closeButton);

    return header;
  }

  /**
   * 공유 옵션들 생성
   * @returns {HTMLElement} 옵션 컨테이너
   */
  createShareOptions() {
    const container = document.createElement('div');
    container.className = 'share-options';

    const options = this.getShareOptions();

    options.forEach(option => {
      const button = this.createShareOptionButton(option);
      container.appendChild(button);
    });

    return container;
  }

  /**
   * 공유 옵션 목록 반환
   * @returns {Array} 공유 옵션 배열
   */
  getShareOptions() {
    const language = this.shareManager.language;
    
    const options = [
      {
        platform: 'kakao',
        icon: '💬',
        label: language === 'ko' ? '카카오톡' : 'KakaoTalk',
        description: language === 'ko' ? '카카오톡으로 공유' : 'Share via KakaoTalk'
      },
      {
        platform: 'facebook',
        icon: '📘',
        label: language === 'ko' ? '페이스북' : 'Facebook',
        description: language === 'ko' ? '페이스북에 공유' : 'Share on Facebook'
      },
      {
        platform: 'twitter',
        icon: '🐦',
        label: language === 'ko' ? '트위터' : 'Twitter',
        description: language === 'ko' ? '트위터에 공유' : 'Share on Twitter'
      },
      {
        platform: 'instagram',
        icon: '📷',
        label: language === 'ko' ? '인스타그램' : 'Instagram',
        description: language === 'ko' ? '인스타그램 스토리에 공유' : 'Share to Instagram Story'
      },
      {
        platform: 'copy',
        icon: '🔗',
        label: language === 'ko' ? '링크 복사' : 'Copy Link',
        description: language === 'ko' ? '링크를 클립보드에 복사' : 'Copy link to clipboard'
      },
      {
        platform: 'image',
        icon: '💾',
        label: language === 'ko' ? '이미지 저장' : 'Save Image',
        description: language === 'ko' ? '이미지로 저장' : 'Save as image'
      }
    ];

    return options;
  }

  /**
   * 공유 옵션 버튼 생성
   * @param {Object} option - 옵션 정보
   * @returns {HTMLElement} 버튼 요소
   */
  createShareOptionButton(option) {
    const button = document.createElement('button');
    button.className = 'share-option';
    button.setAttribute('data-platform', option.platform);
    button.setAttribute('aria-label', option.description);
    button.setAttribute('title', option.description);

    button.innerHTML = `
      <span class="share-icon" aria-hidden="true">${option.icon}</span>
      <span class="share-label">${option.label}</span>
    `;

    // 클릭 이벤트
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      await this.handleShareOptionClick(option.platform, button);
    });

    // 키보드 이벤트
    button.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        await this.handleShareOptionClick(option.platform, button);
      }
    });

    return button;
  }

  /**
   * 공유 옵션 클릭 처리
   * @param {string} platform - 플랫폼 이름
   * @param {HTMLElement} button - 클릭된 버튼
   */
  async handleShareOptionClick(platform, button) {
    try {
      // 버튼 로딩 상태
      this.setOptionButtonLoading(button, true);

      // 공유 실행
      await this.shareManager.shareToplatform(platform);

      // 성공 메시지
      const language = this.shareManager.language;
      const successMessage = language === 'ko' ? 
        `${this.getPlatformName(platform)}에 공유되었습니다!` : 
        `Shared to ${this.getPlatformName(platform)}!`;
      
      this.showSuccessMessage(successMessage);

      // 모달 닫기 (링크 복사나 이미지 저장의 경우)
      if (platform === 'copy' || platform === 'image') {
        setTimeout(() => this.hideShareModal(), 1000);
      } else {
        this.hideShareModal();
      }

    } catch (error) {
      console.error(`Failed to share to ${platform}:`, error);
      
      const language = this.shareManager.language;
      const errorMessage = language === 'ko' ? 
        `${this.getPlatformName(platform)} 공유에 실패했습니다.` : 
        `Failed to share to ${this.getPlatformName(platform)}.`;
      
      this.showErrorMessage(errorMessage);
    } finally {
      this.setOptionButtonLoading(button, false);
    }
  }

  /**
   * 플랫폼 이름 반환
   * @param {string} platform - 플랫폼 코드
   * @returns {string} 플랫폼 이름
   */
  getPlatformName(platform) {
    const names = {
      kakao: '카카오톡',
      facebook: '페이스북',
      twitter: '트위터',
      instagram: '인스타그램',
      copy: '클립보드',
      image: '이미지'
    };
    return names[platform] || platform;
  }

  /**
   * 옵션 버튼 로딩 상태 설정
   * @param {HTMLElement} button - 버튼 요소
   * @param {boolean} loading - 로딩 상태
   */
  setOptionButtonLoading(button, loading) {
    if (loading) {
      button.classList.add('loading');
      button.disabled = true;
      
      // 로딩 스피너 추가
      const spinner = document.createElement('div');
      spinner.className = 'option-spinner';
      spinner.innerHTML = '<div class="spinner"></div>';
      button.appendChild(spinner);
    } else {
      button.classList.remove('loading');
      button.disabled = false;
      
      // 스피너 제거
      const spinner = button.querySelector('.option-spinner');
      if (spinner) {
        spinner.remove();
      }
    }
  }

  /**
   * 모달 이벤트 리스너 추가
   */
  addModalEventListeners() {
    // 배경 클릭으로 모달 닫기
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hideShareModal();
      }
    });

    // 키보드 네비게이션
    this.modal.addEventListener('keydown', (e) => {
      this.handleModalKeydown(e);
    });
  }

  /**
   * 모달 키보드 이벤트 처리
   * @param {KeyboardEvent} e - 키보드 이벤트
   */
  handleModalKeydown(e) {
    const focusableElements = this.modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this.hideShareModal();
        break;
        
      case 'Tab':
        // Tab 순환 처리
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
        break;
    }
  }

  /**
   * 모바일 네이티브 공유 메뉴 표시
   */
  showNativeShareMenu() {
    // 구현 예정
    console.log('Showing native share menu');
  }

  /**
   * 스크린 리더 알림
   * @param {string} message - 알림 메시지
   */
  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
}

// 전역 스코프에서 사용 가능하도록 export
window.ShareUI = ShareUI;
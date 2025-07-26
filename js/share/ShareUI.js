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
      shareModalClosed: language === 'ko' ? '공유 옵션 메뉴가 닫혔습니다' : 'Share options menu closed'
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
    // 구현 예정
    console.log('Creating share modal');
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
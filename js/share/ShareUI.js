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
    const shareButton = document.createElement('button');
    shareButton.className = 'share-button mobile-button mobile-button-secondary';
    shareButton.setAttribute('aria-label', '결과 공유하기');
    shareButton.setAttribute('aria-describedby', 'share-description');
    
    shareButton.innerHTML = `
      <span aria-hidden="true">📤</span> 
      <span class="share-button-text">결과 공유하기</span>
    `;

    // 설명 요소 추가
    const description = document.createElement('div');
    description.id = 'share-description';
    description.className = 'sr-only';
    description.textContent = '궁합 결과를 소셜 미디어에 공유합니다';

    shareButton.addEventListener('click', () => {
      this.handleShareButtonClick();
    });

    // 키보드 접근성
    shareButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleShareButtonClick();
      }
    });

    this.container.appendChild(shareButton);
    this.container.appendChild(description);
  }

  /**
   * 공유 버튼 클릭 처리
   */
  handleShareButtonClick() {
    // 모바일에서 네이티브 공유 API 사용 가능한 경우
    if (this.isMobile() && navigator.share) {
      this.showNativeShareMenu();
    } else {
      this.showShareModal();
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
    
    // 접근성을 위한 포커스 관리
    setTimeout(() => {
      const firstButton = this.modal.querySelector('.share-option');
      if (firstButton) firstButton.focus();
    }, 100);

    // 스크린 리더 알림
    this.announceToScreenReader('공유 옵션 메뉴가 열렸습니다');
  }

  /**
   * 공유 옵션 모달 숨김
   */
  hideShareModal() {
    if (!this.isModalOpen || !this.modal) return;

    this.modal.remove();
    this.modal = null;
    this.isModalOpen = false;

    // 포커스를 공유 버튼으로 되돌림
    const shareButton = this.container.querySelector('.share-button');
    if (shareButton) shareButton.focus();

    this.announceToScreenReader('공유 옵션 메뉴가 닫혔습니다');
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
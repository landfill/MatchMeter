/**
 * @fileoverview 공유 텍스트 편집 및 커스터마이징 관리자
 * @author Match Meter Team
 */

/**
 * 공유 텍스트 편집 관리 클래스
 */
class ShareTextEditor {
  /**
   * ShareTextEditor 생성자
   * @param {ShareManager} shareManager - 공유 관리자
   * @param {string} language - 언어 설정
   */
  constructor(shareManager, language = 'ko') {
    this.shareManager = shareManager;
    this.language = language;
    this.customMessages = new Map();
    this.textLimits = this.getTextLimits();
  }

  /**
   * 플랫폼별 텍스트 제한 반환
   * @returns {Object} 텍스트 제한 정보
   */
  getTextLimits() {
    return {
      twitter: {
        max: 280,
        recommended: 250,
        warning: 260
      },
      facebook: {
        max: 63206,
        recommended: 500,
        warning: 1000
      },
      kakao: {
        max: 200,
        recommended: 150,
        warning: 180
      },
      instagram: {
        max: 2200,
        recommended: 300,
        warning: 500
      },
      copy: {
        max: 1000,
        recommended: 300,
        warning: 500
      },
      native: {
        max: 500,
        recommended: 200,
        warning: 300
      }
    };
  }

  /**
   * 텍스트 편집 모달 표시
   * @param {string} platform - 플랫폼 이름
   * @param {string} defaultText - 기본 텍스트
   * @returns {Promise<string|null>} 편집된 텍스트 또는 null (취소)
   */
  async showTextEditor(platform, defaultText) {
    return new Promise((resolve) => {
      const modal = this.createTextEditorModal(platform, defaultText, resolve);
      document.body.appendChild(modal);
      
      // 포커스 설정
      setTimeout(() => {
        const textarea = modal.querySelector('.text-editor-textarea');
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        }
      }, 100);
    });
  }

  /**
   * 텍스트 편집 모달 생성
   * @param {string} platform - 플랫폼 이름
   * @param {string} defaultText - 기본 텍스트
   * @param {Function} resolve - Promise resolve 함수
   * @returns {HTMLElement} 모달 요소
   */
  createTextEditorModal(platform, defaultText, resolve) {
    const modal = document.createElement('div');
    modal.className = 'text-editor-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'text-editor-title');

    const platformName = this.getPlatformDisplayName(platform);
    const limits = this.textLimits[platform] || this.textLimits.copy;

    modal.innerHTML = `
      <div class="text-editor-content">
        <div class="text-editor-header">
          <h3 id="text-editor-title">
            ${this.language === 'ko' ? `${platformName} 공유 메시지 편집` : `Edit ${platformName} Share Message`}
          </h3>
          <button class="text-editor-close" aria-label="${this.language === 'ko' ? '닫기' : 'Close'}">&times;</button>
        </div>
        
        <div class="text-editor-body">
          <div class="text-editor-input-group">
            <label for="text-editor-textarea" class="text-editor-label">
              ${this.language === 'ko' ? '공유 메시지' : 'Share Message'}
            </label>
            <textarea 
              id="text-editor-textarea" 
              class="text-editor-textarea"
              placeholder="${this.language === 'ko' ? '공유할 메시지를 입력하세요...' : 'Enter your share message...'}"
              maxlength="${limits.max}"
            >${defaultText}</textarea>
            
            <div class="text-editor-info">
              <div class="character-count">
                <span class="current-count">${defaultText.length}</span>
                <span class="max-count">/${limits.max}</span>
              </div>
              <div class="text-status"></div>
            </div>
          </div>
          
          <div class="text-editor-suggestions">
            <div class="suggestions-header">
              ${this.language === 'ko' ? '추천 해시태그' : 'Suggested Hashtags'}
            </div>
            <div class="hashtag-buttons"></div>
          </div>
          
          <div class="text-editor-preview">
            <div class="preview-header">
              ${this.language === 'ko' ? '미리보기' : 'Preview'}
            </div>
            <div class="preview-content"></div>
          </div>
        </div>
        
        <div class="text-editor-footer">
          <button class="text-editor-btn text-editor-btn-secondary" data-action="cancel">
            ${this.language === 'ko' ? '취소' : 'Cancel'}
          </button>
          <button class="text-editor-btn text-editor-btn-primary" data-action="save">
            ${this.language === 'ko' ? '저장' : 'Save'}
          </button>
        </div>
      </div>
    `;

    // 이벤트 리스너 추가
    this.addTextEditorEventListeners(modal, platform, limits, resolve);
    
    // 해시태그 버튼 생성
    this.renderHashtagSuggestions(modal, platform);
    
    // 초기 미리보기 업데이트
    this.updatePreview(modal, platform, defaultText);

    return modal;
  }

  /**
   * 텍스트 편집기 이벤트 리스너 추가
   * @param {HTMLElement} modal - 모달 요소
   * @param {string} platform - 플랫폼 이름
   * @param {Object} limits - 텍스트 제한
   * @param {Function} resolve - Promise resolve 함수
   */
  addTextEditorEventListeners(modal, platform, limits, resolve) {
    const textarea = modal.querySelector('.text-editor-textarea');
    const closeBtn = modal.querySelector('.text-editor-close');
    const cancelBtn = modal.querySelector('[data-action="cancel"]');
    const saveBtn = modal.querySelector('[data-action="save"]');

    // 텍스트 입력 이벤트
    textarea.addEventListener('input', (e) => {
      this.updateCharacterCount(modal, e.target.value, limits);
      this.updatePreview(modal, platform, e.target.value);
      this.validateText(modal, e.target.value, limits);
    });

    // 키보드 단축키
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.saveAndClose(modal, textarea.value, resolve);
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        this.cancelAndClose(modal, resolve);
      }
    });

    // 버튼 이벤트
    closeBtn.addEventListener('click', () => this.cancelAndClose(modal, resolve));
    cancelBtn.addEventListener('click', () => this.cancelAndClose(modal, resolve));
    saveBtn.addEventListener('click', () => this.saveAndClose(modal, textarea.value, resolve));

    // 배경 클릭으로 닫기
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.cancelAndClose(modal, resolve);
      }
    });
  }

  /**
   * 해시태그 제안 렌더링
   * @param {HTMLElement} modal - 모달 요소
   * @param {string} platform - 플랫폼 이름
   */
  renderHashtagSuggestions(modal, platform) {
    const container = modal.querySelector('.hashtag-buttons');
    const hashtags = ShareTemplates.generateHashtags(platform, this.shareManager.resultData, this.language);

    hashtags.forEach(hashtag => {
      const button = document.createElement('button');
      button.className = 'hashtag-btn';
      button.textContent = `#${hashtag}`;
      button.addEventListener('click', () => {
        this.insertHashtag(modal, hashtag);
      });
      container.appendChild(button);
    });
  }

  /**
   * 해시태그 삽입
   * @param {HTMLElement} modal - 모달 요소
   * @param {string} hashtag - 해시태그
   */
  insertHashtag(modal, hashtag) {
    const textarea = modal.querySelector('.text-editor-textarea');
    const cursorPos = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, cursorPos);
    const textAfter = textarea.value.substring(textarea.selectionEnd);
    
    const hashtagText = `#${hashtag}`;
    const newText = textBefore + hashtagText + textAfter;
    
    textarea.value = newText;
    textarea.setSelectionRange(cursorPos + hashtagText.length, cursorPos + hashtagText.length);
    textarea.focus();
    
    // 이벤트 트리거
    textarea.dispatchEvent(new Event('input'));
  }

  /**
   * 문자 수 업데이트
   * @param {HTMLElement} modal - 모달 요소
   * @param {string} text - 텍스트
   * @param {Object} limits - 제한 정보
   */
  updateCharacterCount(modal, text, limits) {
    const currentCount = modal.querySelector('.current-count');
    const textStatus = modal.querySelector('.text-status');
    
    currentCount.textContent = text.length;
    
    if (text.length > limits.warning) {
      currentCount.className = 'current-count warning';
      textStatus.textContent = this.language === 'ko' ? '권장 길이를 초과했습니다' : 'Exceeds recommended length';
      textStatus.className = 'text-status warning';
    } else if (text.length > limits.recommended) {
      currentCount.className = 'current-count caution';
      textStatus.textContent = this.language === 'ko' ? '권장 길이에 근접했습니다' : 'Approaching recommended length';
      textStatus.className = 'text-status caution';
    } else {
      currentCount.className = 'current-count';
      textStatus.textContent = '';
      textStatus.className = 'text-status';
    }
  }

  /**
   * 미리보기 업데이트
   * @param {HTMLElement} modal - 모달 요소
   * @param {string} platform - 플랫폼 이름
   * @param {string} text - 텍스트
   */
  updatePreview(modal, platform, text) {
    const previewContent = modal.querySelector('.preview-content');
    
    // 플랫폼별 미리보기 스타일 적용
    const previewHTML = this.generatePreviewHTML(platform, text);
    previewContent.innerHTML = previewHTML;
  }

  /**
   * 플랫폼별 미리보기 HTML 생성
   * @param {string} platform - 플랫폼 이름
   * @param {string} text - 텍스트
   * @returns {string} 미리보기 HTML
   */
  generatePreviewHTML(platform, text) {
    const shareData = this.shareManager.prepareShareData();
    
    switch (platform) {
      case 'twitter':
        return `
          <div class="preview-twitter">
            <div class="tweet-content">${this.escapeHtml(text)}</div>
            <div class="tweet-link">${shareData.url}</div>
          </div>
        `;
      
      case 'facebook':
        return `
          <div class="preview-facebook">
            <div class="fb-post-text">${this.escapeHtml(text)}</div>
            <div class="fb-link-preview">
              <div class="fb-link-title">${shareData.title}</div>
              <div class="fb-link-url">${shareData.url}</div>
            </div>
          </div>
        `;
      
      case 'kakao':
        return `
          <div class="preview-kakao">
            <div class="kakao-message">${this.escapeHtml(text)}</div>
            <div class="kakao-link">
              <div class="kakao-link-title">${shareData.title}</div>
              <div class="kakao-link-desc">${shareData.description}</div>
            </div>
          </div>
        `;
      
      default:
        return `
          <div class="preview-default">
            <div class="preview-text">${this.escapeHtml(text)}</div>
            <div class="preview-url">${shareData.url}</div>
          </div>
        `;
    }
  }

  /**
   * 텍스트 유효성 검사
   * @param {HTMLElement} modal - 모달 요소
   * @param {string} text - 텍스트
   * @param {Object} limits - 제한 정보
   */
  validateText(modal, text, limits) {
    const saveBtn = modal.querySelector('[data-action="save"]');
    
    if (text.length > limits.max) {
      saveBtn.disabled = true;
      saveBtn.textContent = this.language === 'ko' ? '텍스트가 너무 깁니다' : 'Text too long';
    } else {
      saveBtn.disabled = false;
      saveBtn.textContent = this.language === 'ko' ? '저장' : 'Save';
    }
  }

  /**
   * 저장 후 닫기
   * @param {HTMLElement} modal - 모달 요소
   * @param {string} text - 텍스트
   * @param {Function} resolve - Promise resolve 함수
   */
  saveAndClose(modal, text, resolve) {
    modal.remove();
    resolve(text.trim());
  }

  /**
   * 취소 후 닫기
   * @param {HTMLElement} modal - 모달 요소
   * @param {Function} resolve - Promise resolve 함수
   */
  cancelAndClose(modal, resolve) {
    modal.remove();
    resolve(null);
  }

  /**
   * 플랫폼 표시 이름 반환
   * @param {string} platform - 플랫폼 코드
   * @returns {string} 표시 이름
   */
  getPlatformDisplayName(platform) {
    const names = {
      ko: {
        twitter: '트위터',
        facebook: '페이스북',
        kakao: '카카오톡',
        instagram: '인스타그램',
        copy: '클립보드',
        native: '공유'
      },
      en: {
        twitter: 'Twitter',
        facebook: 'Facebook',
        kakao: 'KakaoTalk',
        instagram: 'Instagram',
        copy: 'Clipboard',
        native: 'Share'
      }
    };

    return names[this.language]?.[platform] || platform;
  }

  /**
   * HTML 이스케이프
   * @param {string} text - 이스케이프할 텍스트
   * @returns {string} 이스케이프된 텍스트
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 커스텀 메시지 저장
   * @param {string} platform - 플랫폼 이름
   * @param {string} message - 메시지
   */
  saveCustomMessage(platform, message) {
    this.customMessages.set(platform, message);
  }

  /**
   * 커스텀 메시지 반환
   * @param {string} platform - 플랫폼 이름
   * @returns {string|null} 커스텀 메시지
   */
  getCustomMessage(platform) {
    return this.customMessages.get(platform) || null;
  }

  /**
   * 모든 커스텀 메시지 초기화
   */
  clearCustomMessages() {
    this.customMessages.clear();
  }
}

// 전역 스코프에서 사용 가능하도록 export
window.ShareTextEditor = ShareTextEditor;
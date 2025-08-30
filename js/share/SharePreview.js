/**
 * @fileoverview 공유 미리보기 카드 컴포넌트
 * @author Match Meter Team
 */

/**
 * 공유 미리보기 카드 관리 클래스
 * 공유하기 전에 결과를 시각적으로 미리볼 수 있는 카드를 제공
 */
class SharePreview {
  /**
   * SharePreview 생성자
   * @param {ShareManager} shareManager - 공유 관리자 인스턴스
   */
  constructor(shareManager) {
    this.shareManager = shareManager;
    this.canvas = null;
    this.previewContainer = null;
    
    this.init();
  }

  /**
   * 초기화
   */
  init() {
    this.createCanvas();
    this.bindEvents();
  }

  /**
   * 캔버스 생성 및 설정
   */
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.canvas.style.display = 'none';
    document.body.appendChild(this.canvas);
  }

  /**
   * 이벤트 바인딩
   */
  bindEvents() {
    // 미리보기 요청 시 자동 생성
    document.addEventListener('sharePreviewRequested', (e) => {
      this.generatePreviewCard(e.detail.platform);
    });
  }

  /**
   * 공유 미리보기 카드 생성
   * @param {string} platform - 대상 플랫폼
   * @returns {Promise<string>} 생성된 이미지 데이터 URL
   */
  async generatePreviewCard(platform = 'default') {
    const ctx = this.canvas.getContext('2d');
    const { resultData } = this.shareManager;
    const language = this.shareManager.language;
    
    // 배경 그라데이션 생성
    await this.drawBackground(ctx);
    
    // 헤더 영역
    await this.drawHeader(ctx, language);
    
    // 메인 결과 영역
    await this.drawMainResult(ctx, resultData, language);
    
    // 진행 바 영역
    await this.drawProgressBar(ctx, resultData.score);
    
    // 하단 브랜딩 영역
    await this.drawFooter(ctx, language);
    
    // 플랫폼별 최적화
    if (platform === 'instagram') {
      return this.optimizeForInstagram();
    } else if (platform === 'kakao') {
      return this.optimizeForKakao();
    }
    
    return this.canvas.toDataURL('image/png', 0.9);
  }

  /**
   * 배경 그라데이션 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   */
  async drawBackground(ctx) {
    // Bubblegum 테마 그라데이션 배경
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, 'oklch(0.9582 0.0152 90.2357)'); // --background
    gradient.addColorStop(0.3, 'oklch(0.8348 0.0426 88.8064)'); // --accent
    gradient.addColorStop(0.7, 'oklch(0.8846 0.0302 85.5655)'); // --secondary
    gradient.addColorStop(1, 'oklch(0.9914 0.0098 87.4695)'); // --card
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 반투명 오버레이
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 장식적 요소들
    await this.drawDecorativeElements(ctx);
  }

  /**
   * 장식적 요소 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   */
  async drawDecorativeElements(ctx) {
    ctx.save();
    
    // 하트 모양들
    const hearts = ['💕', '💖', '✨', '⭐'];
    ctx.font = '24px Arial';
    
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const heart = hearts[Math.floor(Math.random() * hearts.length)];
      
      ctx.globalAlpha = 0.3;
      ctx.fillText(heart, x, y);
    }
    
    ctx.restore();
  }

  /**
   * 헤더 영역 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {string} language - 언어 코드
   */
  async drawHeader(ctx, language) {
    ctx.save();
    
    // 제목
    ctx.fillStyle = 'oklch(0.3760 0.0225 64.3434)'; // --foreground
    ctx.font = 'bold 36px Libre Baskerville, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const title = language === 'ko' ? '💕 Match Meter 💕' : '💕 Match Meter 💕';
    ctx.fillText(title, this.canvas.width / 2, 80);
    
    // 부제목
    ctx.font = '18px Libre Baskerville, serif';
    ctx.fillStyle = 'oklch(0.5391 0.0387 71.1655)'; // --muted-foreground
    const subtitle = language === 'ko' ? 
      '이름으로 알아보는 궁합 지수' : 
      'Name Compatibility Calculator';
    ctx.fillText(subtitle, this.canvas.width / 2, 120);
    
    ctx.restore();
  }

  /**
   * 메인 결과 영역 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {Object} resultData - 결과 데이터
   * @param {string} language - 언어 코드
   */
  async drawMainResult(ctx, resultData, language) {
    ctx.save();
    
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // 이름들
    ctx.fillStyle = 'oklch(0.3760 0.0225 64.3434)'; // --foreground
    ctx.font = 'bold 32px Libre Baskerville, serif';
    ctx.textAlign = 'center';
    
    const name1 = resultData.names.name1;
    const name2 = resultData.names.name2;
    
    ctx.fillText(name1, centerX - 100, centerY - 50);
    ctx.fillText(name2, centerX + 100, centerY - 50);
    
    // 하트 아이콘
    ctx.font = '40px Arial';
    ctx.fillText('💖', centerX, centerY - 50);
    
    // 점수
    ctx.font = 'bold 64px Libre Baskerville, serif';
    ctx.fillStyle = 'oklch(0.6180 0.0778 65.5444)'; // --primary
    ctx.strokeStyle = 'oklch(0.3760 0.0225 64.3434)'; // --foreground
    ctx.lineWidth = 2;
    
    const scoreText = `${resultData.score}%`;
    ctx.strokeText(scoreText, centerX, centerY + 20);
    ctx.fillText(scoreText, centerX, centerY + 20);
    
    // 궁합 설명
    ctx.font = '20px Libre Baskerville, serif';
    ctx.fillStyle = 'oklch(0.5391 0.0387 71.1655)'; // --muted-foreground
    const compatibility = this.getCompatibilityText(resultData.score, language);
    ctx.fillText(compatibility, centerX, centerY + 60);
    
    ctx.restore();
  }

  /**
   * 진행 바 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {number} score - 점수
   */
  async drawProgressBar(ctx, score) {
    ctx.save();
    
    const barWidth = 400;
    const barHeight = 20;
    const barX = (this.canvas.width - barWidth) / 2;
    const barY = this.canvas.height / 2 + 100;
    
    // 배경 바
    ctx.fillStyle = 'oklch(0.9239 0.0190 83.0636)'; // --muted with opacity
    ctx.roundRect(barX, barY, barWidth, barHeight, 10);
    ctx.fill();
    
    // 점수 바
    const fillWidth = (score / 100) * barWidth;
    const barGradient = ctx.createLinearGradient(barX, 0, barX + fillWidth, 0);
    
    if (score >= 80) {
      barGradient.addColorStop(0, 'oklch(0.6180 0.0778 65.5444)'); // --primary
      barGradient.addColorStop(1, 'oklch(0.7264 0.0581 66.6967)'); // --chart-5
    } else if (score >= 60) {
      barGradient.addColorStop(0, 'oklch(0.6777 0.0624 64.7755)'); // --chart-4
      barGradient.addColorStop(1, 'oklch(0.7264 0.0581 66.6967)'); // --chart-5
    } else {
      barGradient.addColorStop(0, 'oklch(0.4851 0.0570 72.6827)'); // --chart-3
      barGradient.addColorStop(1, 'oklch(0.5604 0.0624 68.5805)'); // --chart-2
    }
    
    ctx.fillStyle = barGradient;
    ctx.roundRect(barX, barY, fillWidth, barHeight, 10);
    ctx.fill();
    
    // 점수 레이블
    ctx.fillStyle = 'oklch(0.5391 0.0387 71.1655)'; // --muted-foreground
    ctx.font = '14px Libre Baskerville, serif';
    ctx.textAlign = 'center';
    ctx.fillText('0%', barX, barY + 40);
    ctx.fillText('50%', barX + barWidth/2, barY + 40);
    ctx.fillText('100%', barX + barWidth, barY + 40);
    
    ctx.restore();
  }

  /**
   * 하단 브랜딩 영역 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {string} language - 언어 코드
   */
  async drawFooter(ctx, language) {
    ctx.save();
    
    ctx.fillStyle = 'oklch(0.5391 0.0387 71.1655)'; // --muted-foreground
    ctx.font = '16px Libre Baskerville, serif';
    ctx.textAlign = 'center';
    
    const footerText = language === 'ko' ? 
      'MatchMeter로 더 많은 궁합을 확인해보세요!' : 
      'Check more compatibility with MatchMeter!';
    
    ctx.fillText(footerText, this.canvas.width / 2, this.canvas.height - 40);
    
    ctx.restore();
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
   * Instagram용 최적화 (정사각형)
   * @returns {string} 최적화된 이미지 데이터 URL
   */
  optimizeForInstagram() {
    const squareCanvas = document.createElement('canvas');
    squareCanvas.width = 1080;
    squareCanvas.height = 1080;
    
    const ctx = squareCanvas.getContext('2d');
    
    // 원본 이미지를 정사각형으로 크롭하여 그리기
    const sourceSize = Math.min(this.canvas.width, this.canvas.height);
    const sourceX = (this.canvas.width - sourceSize) / 2;
    const sourceY = (this.canvas.height - sourceSize) / 2;
    
    ctx.drawImage(
      this.canvas,
      sourceX, sourceY, sourceSize, sourceSize,
      0, 0, 1080, 1080
    );
    
    return squareCanvas.toDataURL('image/png', 0.9);
  }

  /**
   * 카카오톡용 최적화 (가로형)
   * @returns {string} 최적화된 이미지 데이터 URL
   */
  optimizeForKakao() {
    const kakaoCanvas = document.createElement('canvas');
    kakaoCanvas.width = 800;
    kakaoCanvas.height = 400;
    
    const ctx = kakaoCanvas.getContext('2d');
    
    // 원본 이미지를 가로형으로 크롭하여 그리기
    ctx.drawImage(
      this.canvas,
      0, 100, this.canvas.width, 400,
      0, 0, 800, 400
    );
    
    return kakaoCanvas.toDataURL('image/png', 0.9);
  }

  /**
   * 미리보기 모달 표시
   * @param {string} platform - 대상 플랫폼
   */
  async showPreviewModal(platform = 'default') {
    const imageDataUrl = await this.generatePreviewCard(platform);
    
    // 기존 모달 제거
    const existingModal = document.querySelector('.share-preview-modal');
    if (existingModal) {
      existingModal.remove();
    }
    
    // 새 모달 생성
    const modal = document.createElement('div');
    modal.className = 'share-preview-modal';
    modal.innerHTML = `
      <div class="preview-modal-content">
        <div class="preview-header">
          <h3>${this.shareManager.language === 'ko' ? '미리보기' : 'Preview'}</h3>
          <button class="preview-close-btn" aria-label="닫기">×</button>
        </div>
        <div class="preview-image-container">
          <img src="${imageDataUrl}" alt="공유 미리보기" class="preview-image" />
        </div>
        <div class="preview-actions">
          <button class="btn-secondary preview-edit-btn">
            ${this.shareManager.language === 'ko' ? '편집' : 'Edit'}
          </button>
          <button class="btn-primary preview-share-btn" data-platform="${platform}">
            ${this.shareManager.language === 'ko' ? '공유하기' : 'Share'}
          </button>
        </div>
      </div>
    `;
    
    // 이벤트 리스너
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.matches('.preview-close-btn')) {
        modal.remove();
      } else if (e.target.matches('.preview-share-btn')) {
        const platform = e.target.getAttribute('data-platform');
        this.shareManager.shareToPlatform(platform, null, imageDataUrl);
        modal.remove();
      } else if (e.target.matches('.preview-edit-btn')) {
        // 편집 기능 (추후 구현)
      }
    });
    
    document.body.appendChild(modal);
    
    // 애니메이션
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  }

  /**
   * roundRect 폴리필 (구형 브라우저 지원)
   */
  static addRoundRectPolyfill() {
    if (!CanvasRenderingContext2D.prototype.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
      };
    }
  }
}

// 폴리필 적용
SharePreview.addRoundRectPolyfill();

// 전역 스코프에서 사용 가능하도록 export
window.SharePreview = SharePreview;
/**
 * @fileoverview 모바일 공유 최적화 유틸리티
 * @author Match Meter Team
 */

/**
 * 모바일 공유 최적화 클래스
 */
class MobileShareOptimizer {
  /**
   * 현재 기기/브라우저 정보 반환
   * @returns {Object} 기기 정보
   */
  static getDeviceInfo() {
    const userAgent = navigator.userAgent;
    
    return {
      isIOS: /iPad|iPhone|iPod/.test(userAgent),
      isAndroid: /Android/.test(userAgent),
      isSafari: /Safari/.test(userAgent) && !/Chrome|CriOS|FxiOS/.test(userAgent),
      isChrome: /Chrome/.test(userAgent) && !/Edge|OPR/.test(userAgent),
      isFirefox: /Firefox/.test(userAgent),
      isEdge: /Edge/.test(userAgent),
      isMobile: this.isMobileDevice(),
      hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    };
  }

  /**
   * 모바일 기기 감지
   * @returns {boolean} 모바일 여부
   */
  static isMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    const mobilePatterns = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i
    ];

    return mobilePatterns.some(pattern => pattern.test(userAgent)) ||
           (window.innerWidth < 768 && 'ontouchstart' in window);
  }

  /**
   * 네이티브 공유 지원 여부 확인
   * @returns {Object} 지원 정보
   */
  static getNativeShareSupport() {
    const deviceInfo = this.getDeviceInfo();
    
    return {
      supported: !!navigator.share,
      canShareFiles: !!navigator.canShare,
      recommendedForDevice: deviceInfo.isMobile && (deviceInfo.isIOS || deviceInfo.isAndroid),
      limitations: this.getNativeShareLimitations(deviceInfo)
    };
  }

  /**
   * 플랫폼별 네이티브 공유 제한사항
   * @param {Object} deviceInfo - 기기 정보
   * @returns {Array} 제한사항 목록
   */
  static getNativeShareLimitations(deviceInfo) {
    const limitations = [];

    if (deviceInfo.isIOS) {
      limitations.push('iOS에서는 URL과 텍스트를 함께 공유할 때 URL이 별도로 표시됩니다.');
      if (deviceInfo.isSafari) {
        limitations.push('Safari에서는 파일 공유가 제한적일 수 있습니다.');
      }
    }

    if (deviceInfo.isAndroid) {
      limitations.push('Android에서는 앱별로 공유 지원이 다를 수 있습니다.');
      if (!deviceInfo.isChrome) {
        limitations.push('Chrome 외 브라우저에서는 네이티브 공유가 제한적일 수 있습니다.');
      }
    }

    return limitations;
  }

  /**
   * 플랫폼별 최적화된 공유 데이터 생성
   * @param {Object} baseShareData - 기본 공유 데이터
   * @param {Object} deviceInfo - 기기 정보
   * @returns {Object} 최적화된 공유 데이터
   */
  static optimizeShareData(baseShareData, deviceInfo = null) {
    if (!deviceInfo) {
      deviceInfo = this.getDeviceInfo();
    }

    const optimized = { ...baseShareData };

    // iOS 최적화
    if (deviceInfo.isIOS) {
      // iOS에서는 텍스트와 URL을 합치는 것이 더 자연스러움
      if (optimized.url && optimized.text) {
        optimized.text = `${optimized.text}\n\n${optimized.url}`;
        delete optimized.url;
      }
      
      // 제목 길이 제한 (iOS 공유 시트에서 잘림 방지)
      if (optimized.title && optimized.title.length > 60) {
        optimized.title = optimized.title.substring(0, 57) + '...';
      }
    }

    // Android 최적화
    if (deviceInfo.isAndroid) {
      // Android에서는 제목이 중요
      if (!optimized.title && optimized.text) {
        optimized.title = optimized.text.split('\n')[0];
        if (optimized.title.length > 50) {
          optimized.title = optimized.title.substring(0, 47) + '...';
        }
      }
    }

    return optimized;
  }

  /**
   * 햅틱 피드백 제공
   * @param {string} type - 피드백 타입 ('light', 'medium', 'heavy', 'success', 'error')
   */
  static provideHapticFeedback(type = 'light') {
    if (!this.isMobileDevice() || !navigator.vibrate) {
      return;
    }

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 50, 10],
      error: [50, 100, 50],
      click: [5],
      doubleClick: [5, 50, 5]
    };

    const pattern = patterns[type] || patterns.light;
    
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // 진동 실패 시 무시
    }
  }

  /**
   * 모바일 공유 UI 최적화 설정
   * @returns {Object} UI 최적화 설정
   */
  static getMobileUIOptimizations() {
    const deviceInfo = this.getDeviceInfo();
    
    return {
      // 터치 타겟 크기
      minTouchTarget: deviceInfo.isMobile ? 48 : 32,
      
      // 애니메이션 지속시간
      animationDuration: deviceInfo.isMobile ? 200 : 300,
      
      // 모달 크기
      modalMaxWidth: deviceInfo.screenWidth < 480 ? '95%' : '400px',
      
      // 버튼 간격
      buttonSpacing: deviceInfo.isMobile ? '0.75rem' : '1rem',
      
      // 폰트 크기 조정
      baseFontSize: deviceInfo.screenWidth < 360 ? '0.875rem' : '1rem',
      
      // 스크롤 동작
      scrollBehavior: deviceInfo.isMobile ? 'smooth' : 'auto',
      
      // 포커스 관리
      autoFocus: !deviceInfo.isMobile, // 모바일에서는 자동 포커스 비활성화
      
      // 키보드 회피
      avoidKeyboard: deviceInfo.isMobile && deviceInfo.hasTouch
    };
  }

  /**
   * 네트워크 상태 확인 (PWA 환경에서 유용)
   * @returns {Object} 네트워크 정보
   */
  static getNetworkInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    return {
      online: navigator.onLine,
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
      saveData: connection?.saveData || false
    };
  }

  /**
   * 공유 성능 최적화 권장사항
   * @returns {Object} 최적화 권장사항
   */
  static getPerformanceRecommendations() {
    const deviceInfo = this.getDeviceInfo();
    const networkInfo = this.getNetworkInfo();
    
    const recommendations = {
      useNativeShare: deviceInfo.isMobile && !!navigator.share,
      compressImages: networkInfo.saveData || networkInfo.effectiveType === 'slow-2g',
      reduceAnimations: networkInfo.saveData || !deviceInfo.hasTouch,
      preloadContent: networkInfo.effectiveType === '4g' && !networkInfo.saveData,
      cacheResults: true
    };

    return recommendations;
  }

  /**
   * 접근성 최적화 설정
   * @returns {Object} 접근성 설정
   */
  static getAccessibilityOptimizations() {
    return {
      // 모션 감소 설정 확인
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      
      // 고대비 모드 확인
      prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
      
      // 다크 모드 확인
      prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      
      // 스크린 리더 사용 추정
      likelyScreenReader: !window.speechSynthesis || navigator.userAgent.includes('NVDA') || navigator.userAgent.includes('JAWS'),
      
      // 키보드 네비게이션 우선
      keyboardNavigation: !('ontouchstart' in window)
    };
  }
}

// 전역 스코프에서 사용 가능하도록 export
window.MobileShareOptimizer = MobileShareOptimizer;
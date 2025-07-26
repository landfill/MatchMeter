# Social Sharing Feature Design Document

## Overview

이 문서는 Match Meter 앱에 소셜 공유 기능을 추가하는 설계를 다룹니다. 사용자가 궁합 측정 결과를 다양한 소셜 미디어 플랫폼에 쉽게 공유할 수 있도록 하며, 공유에 최적화된 시각적 결과를 제공합니다.

현재 앱은 Vanilla JavaScript, HTML, CSS, 그리고 Tailwind CSS를 사용하는 단순한 구조로 되어 있어, 외부 라이브러리 의존성을 최소화하면서 네이티브 웹 API를 활용한 구현을 목표로 합니다.

## Architecture

### Core Components

1. **ShareManager**: 공유 기능의 중앙 관리자
2. **ShareUI**: 공유 인터페이스 렌더링 및 상호작용 관리
3. **ShareRenderer**: 공유용 시각적 콘텐츠 생성
4. **PlatformAdapters**: 각 소셜 플랫폼별 공유 로직
5. **ImageGenerator**: Canvas API를 활용한 이미지 생성

### System Flow

```
사용자 결과 확인 → 공유 버튼 클릭 → 공유 옵션 선택 → 플랫폼별 처리 → 공유 실행
                                    ↓
                            공유용 콘텐츠 생성 → 이미지/텍스트 포맷팅
```

## Components and Interfaces

### 1. ShareManager Class

```javascript
class ShareManager {
  constructor(resultData, language = 'ko')
  
  // 공유 가능 여부 확인
  isShareSupported(): boolean
  
  // 공유 데이터 준비
  prepareShareData(): ShareData
  
  // 플랫폼별 공유 실행
  shareToplatform(platform: string, customMessage?: string): Promise<void>
  
  // 이미지로 저장
  saveAsImage(): Promise<void>
}
```

### 2. ShareUI Class

```javascript
class ShareUI {
  constructor(container: HTMLElement, shareManager: ShareManager)
  
  // 공유 버튼 렌더링
  renderShareButton(): void
  
  // 공유 옵션 모달 표시
  showShareModal(): void
  
  // 공유 옵션 모달 숨김
  hideShareModal(): void
  
  // 모바일 네이티브 공유 메뉴 표시
  showNativeShareMenu(): void
}
```

### 3. ShareRenderer Class

```javascript
class ShareRenderer {
  constructor(resultData: ResultData, language: string)
  
  // 공유용 HTML 콘텐츠 생성
  generateShareHTML(): string
  
  // Canvas를 이용한 이미지 생성
  generateShareImage(): Promise<Blob>
  
  // 플랫폼별 텍스트 포맷팅
  formatShareText(platform: string, customMessage?: string): string
}
```

### 4. Platform Adapters

각 플랫폼별 공유 로직을 처리하는 어댑터들:

```javascript
// 카카오톡 공유
class KakaoShareAdapter {
  share(data: ShareData): Promise<void>
}

// 페이스북 공유
class FacebookShareAdapter {
  share(data: ShareData): Promise<void>
}

// 트위터 공유
class TwitterShareAdapter {
  share(data: ShareData): Promise<void>
}

// 네이티브 공유 (모바일)
class NativeShareAdapter {
  share(data: ShareData): Promise<void>
}
```

## Data Models

### ShareData Interface

```javascript
interface ShareData {
  title: string;           // 공유 제목
  description: string;     // 공유 설명
  url: string;            // 공유 URL
  imageUrl?: string;      // 공유 이미지 URL
  hashtags: string[];     // 해시태그 배열
  score: number;          // 궁합 점수
  names: {                // 이름 정보
    name1: string;
    name2: string;
  };
  language: string;       // 언어 설정
}
```

### ResultData Interface

```javascript
interface ResultData {
  score: number;
  names: {
    name1: string;
    name2: string;
  };
  messages: {
    positive: string;
    negative: string;
  };
  language: string;
  timestamp: Date;
}
```

## User Interface Design

### 1. 공유 버튼 디자인

결과 영역 하단에 위치하는 공유 버튼:

```html
<button class="share-button mobile-button mobile-button-secondary">
  <span aria-hidden="true">📤</span> 결과 공유하기
</button>
```

**스타일링 특징:**
- 모바일 친화적인 터치 타겟 (최소 48px)
- 기존 앱 디자인과 일관성 유지
- 접근성을 위한 적절한 색상 대비
- 로딩 상태 표시 지원

### 2. 공유 옵션 모달

공유 버튼 클릭 시 표시되는 모달:

```html
<div class="share-modal">
  <div class="share-modal-content">
    <h3>결과 공유하기</h3>
    <div class="share-options">
      <button class="share-option" data-platform="kakao">
        <span class="share-icon">💬</span>
        <span>카카오톡</span>
      </button>
      <button class="share-option" data-platform="facebook">
        <span class="share-icon">📘</span>
        <span>페이스북</span>
      </button>
      <button class="share-option" data-platform="twitter">
        <span class="share-icon">🐦</span>
        <span>트위터</span>
      </button>
      <button class="share-option" data-platform="instagram">
        <span class="share-icon">📷</span>
        <span>인스타그램</span>
      </button>
      <button class="share-option" data-platform="copy">
        <span class="share-icon">🔗</span>
        <span>링크 복사</span>
      </button>
      <button class="share-option" data-platform="image">
        <span class="share-icon">💾</span>
        <span>이미지 저장</span>
      </button>
    </div>
  </div>
</div>
```

### 3. 공유용 결과 디자인

공유에 최적화된 시각적 결과 레이아웃:

```html
<div class="share-result-container">
  <div class="share-header">
    <div class="app-branding">
      <span class="app-logo">📊</span>
      <span class="app-name">Match Meter</span>
    </div>
  </div>
  
  <div class="share-content">
    <div class="share-names">
      <span class="name1">{name1}</span>
      <span class="heart">💕</span>
      <span class="name2">{name2}</span>
    </div>
    
    <div class="share-score">
      <div class="score-circle">
        <span class="score-number">{score}%</span>
      </div>
    </div>
    
    <div class="share-message">
      <p class="positive-message">{positiveMessage}</p>
    </div>
  </div>
  
  <div class="share-footer">
    <span class="app-url">matchmeter.app</span>
  </div>
</div>
```

## Technical Implementation Details

### 1. Canvas 기반 이미지 생성

HTML2Canvas 라이브러리 대신 네이티브 Canvas API 사용:

```javascript
async function generateShareImage(resultData) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // 소셜 미디어 최적 크기 설정 (1200x630)
  canvas.width = 1200;
  canvas.height = 630;
  
  // 배경 그라디언트 생성
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#dbeafe');
  gradient.addColorStop(1, '#faf5ff');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 텍스트 및 그래픽 요소 렌더링
  // ... 상세 구현
  
  return canvas.toBlob('image/png');
}
```

### 2. 플랫폼별 공유 URL 생성

```javascript
const shareUrls = {
  facebook: (data) => 
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}&quote=${encodeURIComponent(data.description)}`,
  
  twitter: (data) => 
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.description)}&url=${encodeURIComponent(data.url)}&hashtags=${data.hashtags.join(',')}`,
  
  kakao: (data) => {
    // 카카오 SDK 사용
    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        link: { mobileWebUrl: data.url, webUrl: data.url }
      }
    });
  }
};
```

### 3. 모바일 네이티브 공유 API

```javascript
async function shareNatively(shareData) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: shareData.title,
        text: shareData.description,
        url: shareData.url
      });
    } catch (error) {
      // 폴백 처리
      fallbackShare(shareData);
    }
  } else {
    fallbackShare(shareData);
  }
}
```

## Error Handling

### 1. 공유 실패 처리

```javascript
class ShareErrorHandler {
  static handle(error, platform) {
    const errorMessages = {
      ko: {
        network: '네트워크 연결을 확인해주세요.',
        permission: '공유 권한이 필요합니다.',
        platform: `${platform} 공유에 실패했습니다.`,
        generic: '공유 중 오류가 발생했습니다.'
      },
      en: {
        network: 'Please check your network connection.',
        permission: 'Share permission is required.',
        platform: `Failed to share to ${platform}.`,
        generic: 'An error occurred while sharing.'
      }
    };
    
    // 사용자에게 적절한 오류 메시지 표시
    showErrorMessage(errorMessages[currentLanguage][error.type] || errorMessages[currentLanguage].generic);
  }
}
```

### 2. 브라우저 호환성 처리

```javascript
const featureDetection = {
  canvasSupport: () => !!document.createElement('canvas').getContext,
  nativeShare: () => !!navigator.share,
  clipboardAPI: () => !!navigator.clipboard,
  downloadSupport: () => {
    const a = document.createElement('a');
    return typeof a.download !== 'undefined';
  }
};
```

## Testing Strategy

### 1. 단위 테스트

- ShareManager 클래스의 각 메서드
- 플랫폼별 어댑터 기능
- 이미지 생성 로직
- 텍스트 포맷팅 함수

### 2. 통합 테스트

- 전체 공유 플로우
- 모바일/데스크톱 환경에서의 동작
- 다양한 브라우저에서의 호환성

### 3. 접근성 테스트

- 키보드 네비게이션
- 스크린 리더 호환성
- 색상 대비 검증
- 터치 타겟 크기 확인

### 4. 성능 테스트

- 이미지 생성 시간 측정
- 메모리 사용량 모니터링
- 모바일 기기에서의 성능 확인

## Security Considerations

### 1. XSS 방지

- 사용자 입력 데이터 sanitization
- innerHTML 대신 textContent 사용
- CSP (Content Security Policy) 적용

### 2. 개인정보 보호

- 공유 데이터에 개인 식별 정보 제외
- 임시 이미지 파일 자동 정리
- 공유 URL에 민감한 정보 포함 금지

## Performance Optimization

### 1. 이미지 생성 최적화

- Canvas 렌더링 최적화
- 이미지 압축 적용
- 메모리 누수 방지

### 2. 모바일 최적화

- 터치 이벤트 최적화
- 네트워크 요청 최소화
- 배터리 사용량 고려

### 3. 로딩 성능

- 공유 기능 지연 로딩
- 필요시에만 외부 SDK 로드
- 캐싱 전략 적용

## Accessibility Features

### 1. 키보드 접근성

- Tab 순서 관리
- Enter/Space 키 지원
- Escape 키로 모달 닫기

### 2. 스크린 리더 지원

- 적절한 ARIA 라벨
- 상태 변화 알림
- 의미있는 텍스트 제공

### 3. 시각적 접근성

- 고대비 모드 지원
- 색상에 의존하지 않는 UI
- 적절한 폰트 크기

이 설계는 현재 앱의 단순한 구조를 유지하면서도 강력한 소셜 공유 기능을 제공하며, 모바일 우선 접근 방식과 접근성을 중시합니다.
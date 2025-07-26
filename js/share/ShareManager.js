/**
 * @fileoverview 소셜 공유 기능의 중앙 관리자
 * @author Match Meter Team
 */

/**
 * @typedef {Object} ShareData
 * @property {string} title - 공유 제목
 * @property {string} description - 공유 설명
 * @property {string} url - 공유 URL
 * @property {string} [imageUrl] - 공유 이미지 URL
 * @property {string[]} hashtags - 해시태그 배열
 * @property {number} score - 궁합 점수
 * @property {Object} names - 이름 정보
 * @property {string} names.name1 - 첫 번째 이름
 * @property {string} names.name2 - 두 번째 이름
 * @property {string} language - 언어 설정
 */

/**
 * @typedef {Object} ResultData
 * @property {number} score - 궁합 점수
 * @property {Object} names - 이름 정보
 * @property {string} names.name1 - 첫 번째 이름
 * @property {string} names.name2 - 두 번째 이름
 * @property {Object} messages - 메시지 정보
 * @property {string} messages.positive - 긍정적 메시지
 * @property {string} messages.negative - 부정적 메시지
 * @property {string} language - 언어 설정
 * @property {Date} timestamp - 생성 시간
 */

/**
 * 소셜 공유 기능의 중앙 관리자 클래스
 */
class ShareManager {
  /**
   * ShareManager 생성자
   * @param {ResultData} resultData - 궁합 결과 데이터
   * @param {string} [language='ko'] - 언어 설정
   */
  constructor(resultData, language = 'ko') {
    this.resultData = resultData;
    this.language = language;
    this.baseUrl = window.location.origin + window.location.pathname;
  }

  /**
   * 공유 기능 지원 여부 확인
   * @returns {boolean} 공유 지원 여부
   */
  isShareSupported() {
    // 기본적으로 모든 브라우저에서 URL 공유는 지원
    return true;
  }

  /**
   * 공유 데이터 준비
   * @returns {ShareData} 공유용 데이터
   */
  prepareShareData() {
    const { score, names, language } = this.resultData;
    
    const shareTexts = {
      ko: {
        title: `${names.name1}과 ${names.name2}의 궁합은 ${score}%!`,
        description: `Match Meter에서 측정한 ${names.name1}과 ${names.name2}의 궁합 점수는 ${score}%입니다! 당신도 궁합을 측정해보세요!`,
        hashtags: ['매치미터', '궁합', '이름궁합', '재미', '테스트']
      },
      en: {
        title: `${names.name1} & ${names.name2} compatibility: ${score}%!`,
        description: `${names.name1} and ${names.name2} scored ${score}% compatibility on Match Meter! Try your own compatibility test!`,
        hashtags: ['MatchMeter', 'Compatibility', 'NameTest', 'Fun', 'Test']
      }
    };

    const texts = shareTexts[language] || shareTexts.ko;

    return {
      title: texts.title,
      description: texts.description,
      url: this.baseUrl,
      hashtags: texts.hashtags,
      score,
      names,
      language
    };
  }

  /**
   * 플랫폼별 공유 실행
   * @param {string} platform - 공유 플랫폼 ('facebook', 'twitter', 'kakao', 'copy', 'image')
   * @param {string} [customMessage] - 사용자 커스텀 메시지
   * @returns {Promise<void>}
   */
  async shareToplatform(platform, customMessage) {
    // 구현 예정
    console.log(`Sharing to ${platform}:`, this.prepareShareData());
  }

  /**
   * 이미지로 저장
   * @returns {Promise<void>}
   */
  async saveAsImage() {
    // 구현 예정
    console.log('Saving as image:', this.prepareShareData());
  }
}

// 전역 스코프에서 사용 가능하도록 export
window.ShareManager = ShareManager;
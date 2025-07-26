/**
 * @fileoverview 소셜 공유 메시지 템플릿 관리
 * @author Match Meter Team
 */

/**
 * 소셜 공유 메시지 템플릿 클래스
 */
class ShareTemplates {
  /**
   * 언어별 기본 메시지 템플릿 반환
   * @param {string} language - 언어 코드
   * @returns {Object} 메시지 템플릿 객체
   */
  static getMessageTemplates(language = 'ko') {
    const templates = {
      ko: {
        // 기본 공유 메시지
        basic: {
          title: '{name1}과 {name2}의 궁합은 {score}%!',
          description: 'Match Meter에서 측정한 {name1}과 {name2}의 궁합 점수는 {score}%입니다! 당신도 궁합을 측정해보세요!',
          short: '{name1}과 {name2}의 궁합: {score}%'
        },
        
        // 점수대별 메시지
        scoreMessages: {
          perfect: '완벽한 궁합이에요! 🔥💕',
          excellent: '정말 잘 어울려요! ✨💖',
          good: '좋은 궁합이에요! 😊💝',
          average: '괜찮은 궁합이네요! 👍💛',
          fair: '노력하면 될 것 같아요! 🤔💙',
          poor: '친구부터 시작해보세요! 😅💚',
          bad: '...음... 다른 인연을 찾아보세요! 😰💔'
        },
        
        // 플랫폼별 특화 메시지
        platforms: {
          facebook: {
            prefix: '📊 Match Meter 결과 📊\n\n',
            suffix: '\n\n당신도 궁합을 측정해보세요!\n👉 matchmeter.app',
            cta: '지금 바로 테스트하기'
          },
          twitter: {
            prefix: '📊 ',
            suffix: '\n\n#매치미터 #궁합 #이름궁합',
            cta: '테스트해보기'
          },
          kakao: {
            prefix: '💕 궁합 결과 💕\n\n',
            suffix: '\n\n나도 테스트해볼까? 🤔',
            cta: '궁합 측정하기'
          },
          instagram: {
            prefix: '📊✨ Match Meter ✨📊\n\n',
            suffix: '\n\n#매치미터 #궁합 #이름궁합 #재미 #테스트 #커플 #사랑',
            cta: '스토리에 공유하기'
          }
        },
        
        // 액션 메시지
        actions: {
          copy: '링크가 복사되었습니다!',
          share: '공유하기',
          save: '이미지로 저장',
          close: '닫기',
          retry: '다시 시도',
          error: '공유 중 오류가 발생했습니다'
        }
      },
      
      en: {
        // 기본 공유 메시지
        basic: {
          title: '{name1} & {name2} compatibility: {score}%!',
          description: '{name1} and {name2} scored {score}% compatibility on Match Meter! Try your own compatibility test!',
          short: '{name1} & {name2}: {score}% match'
        },
        
        // 점수대별 메시지
        scoreMessages: {
          perfect: 'Perfect match! 🔥💕',
          excellent: 'Excellent compatibility! ✨💖',
          good: 'Good match! 😊💝',
          average: 'Not bad! 👍💛',
          fair: 'Could work with effort! 🤔💙',
          poor: 'Better as friends! 😅💚',
          bad: '...Maybe try someone else! 😰💔'
        },
        
        // 플랫폼별 특화 메시지
        platforms: {
          facebook: {
            prefix: '📊 Match Meter Results 📊\n\n',
            suffix: '\n\nTry your own compatibility test!\n👉 matchmeter.app',
            cta: 'Take the test now'
          },
          twitter: {
            prefix: '📊 ',
            suffix: '\n\n#MatchMeter #Compatibility #NameTest',
            cta: 'Try it out'
          },
          kakao: {
            prefix: '💕 Compatibility Results 💕\n\n',
            suffix: '\n\nShould I try it too? 🤔',
            cta: 'Test Compatibility'
          },
          instagram: {
            prefix: '📊✨ Match Meter ✨📊\n\n',
            suffix: '\n\n#MatchMeter #Compatibility #NameTest #Fun #Test #Couple #Love',
            cta: 'Share to Story'
          }
        },
        
        // 액션 메시지
        actions: {
          copy: 'Link copied to clipboard!',
          share: 'Share',
          save: 'Save as Image',
          close: 'Close',
          retry: 'Retry',
          error: 'An error occurred while sharing'
        }
      }
    };

    return templates[language] || templates.ko;
  }

  /**
   * 메시지 템플릿에 데이터 바인딩
   * @param {string} template - 템플릿 문자열
   * @param {Object} data - 바인딩할 데이터
   * @returns {string} 바인딩된 메시지
   */
  static bindTemplate(template, data) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  /**
   * 점수에 따른 메시지 카테고리 반환
   * @param {number} score - 궁합 점수
   * @returns {string} 메시지 카테고리
   */
  static getScoreCategory(score) {
    if (score >= 95) return 'perfect';
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 55) return 'average';
    if (score >= 40) return 'fair';
    if (score >= 25) return 'poor';
    return 'bad';
  }

  /**
   * 플랫폼별 완성된 공유 메시지 생성
   * @param {string} platform - 플랫폼 이름
   * @param {Object} resultData - 결과 데이터
   * @param {string} language - 언어 코드
   * @param {string} [customMessage] - 사용자 커스텀 메시지
   * @returns {string} 완성된 공유 메시지
   */
  static generateShareMessage(platform, resultData, language = 'ko', customMessage = null) {
    if (customMessage) {
      return customMessage;
    }

    const templates = this.getMessageTemplates(language);
    const { score, names } = resultData;
    const scoreCategory = this.getScoreCategory(score);
    
    const data = {
      name1: names.name1,
      name2: names.name2,
      score: score,
      scoreMessage: templates.scoreMessages[scoreCategory]
    };

    // 기본 메시지 생성
    const basicMessage = this.bindTemplate(templates.basic.title, data);
    
    // 플랫폼별 특화 처리
    const platformConfig = templates.platforms[platform];
    if (platformConfig) {
      const prefix = platformConfig.prefix || '';
      const suffix = platformConfig.suffix || '';
      
      return `${prefix}${basicMessage}\n\n${data.scoreMessage}${suffix}`;
    }

    return `${basicMessage}\n\n${data.scoreMessage}`;
  }

  /**
   * 해시태그 생성
   * @param {string} platform - 플랫폼 이름
   * @param {Object} resultData - 결과 데이터
   * @param {string} language - 언어 코드
   * @returns {string[]} 해시태그 배열
   */
  static generateHashtags(platform, resultData, language = 'ko') {
    const { score } = resultData;
    
    const hashtagSets = {
      ko: {
        base: ['매치미터', '궁합', '이름궁합', '재미', '테스트'],
        high: ['완벽한궁합', '천생연분', '커플'],
        medium: ['좋은궁합', '인연'],
        low: ['친구', '우정']
      },
      en: {
        base: ['MatchMeter', 'Compatibility', 'NameTest', 'Fun', 'Test'],
        high: ['PerfectMatch', 'Soulmates', 'Couple'],
        medium: ['GoodMatch', 'Connection'],
        low: ['Friends', 'Friendship']
      }
    };

    const tags = hashtagSets[language] || hashtagSets.ko;
    let hashtags = [...tags.base];

    // 점수에 따른 추가 해시태그
    if (score >= 80) {
      hashtags = [...hashtags, ...tags.high];
    } else if (score >= 60) {
      hashtags = [...hashtags, ...tags.medium];
    } else {
      hashtags = [...hashtags, ...tags.low];
    }

    // 플랫폼별 해시태그 수 제한
    const limits = {
      twitter: 3,
      instagram: 10,
      facebook: 5,
      default: 5
    };

    const limit = limits[platform] || limits.default;
    return hashtags.slice(0, limit);
  }
}

// 전역 스코프에서 사용 가능하도록 export
window.ShareTemplates = ShareTemplates;
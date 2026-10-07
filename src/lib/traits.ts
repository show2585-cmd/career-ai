// 성향 지표와 관심 분야 정의.
// 진단 점수, 직업 성향 벡터(커리어넷 데이터에서 변환), 추천 근거 문구가 모두 이 정의를 공유한다.

export const TRAIT_KEYS = ['analytic', 'creative', 'collab', 'autonomy', 'stability', 'people'] as const
export type TraitKey = (typeof TRAIT_KEYS)[number]
export type TraitScores = Record<TraitKey, number>

interface TraitInfo {
  label: string
  /** 점수가 높을 때의 강점 */
  strength: string
  /** 점수가 높을 때 잘 맞는 환경 */
  environment: string
  /** 점수가 높을 때 선호하는 업무 방식 */
  workStyle: string
  /** 직업 추천 근거: 사용자와 직업이 모두 높을 때 */
  matchReason: string
  /** 점수가 높을 때 주의할 환경 */
  cautionHigh: string
  /** 점수가 낮을 때 주의할 환경 */
  cautionLow: string
  /** 직업은 요구하는데 사용자는 낮을 때 */
  gap: string
}

export const TRAITS: Record<TraitKey, TraitInfo> = {
  analytic: {
    label: '분석적 사고',
    strength: '복잡한 문제를 논리적으로 쪼개고 근거를 찾아요.',
    environment: '데이터와 근거로 의사결정하는 환경',
    workStyle: '원인을 분석하고 기준을 세운 뒤 움직여요.',
    matchReason: '분석적 문제 해결 성향이 높아요.',
    cautionHigh: '근거 없이 감으로만 결정하는 환경',
    cautionLow: '숫자와 데이터 분석이 대부분인 업무',
    gap: '논리적 분석과 데이터 해석 역량을 키워야 할 수 있어요.',
  },
  creative: {
    label: '창의적 사고',
    strength: '익숙한 방식에서 벗어나 새로운 아이디어를 떠올려요.',
    environment: '새로운 시도를 환영하는 환경',
    workStyle: '여러 가능성을 탐색하며 나만의 방법을 만들어요.',
    matchReason: '새로운 아이디어를 만드는 것을 선호해요.',
    cautionHigh: '정해진 방식만 반복하는 업무',
    cautionLow: '정답 없이 새 아이디어를 계속 요구받는 환경',
    gap: '아이디어를 발산하고 표현하는 연습이 필요할 수 있어요.',
  },
  collab: {
    label: '협업 선호',
    strength: '다양한 의견을 모아 함께 결과를 만들어요.',
    environment: '팀 단위로 소통하며 일하는 환경',
    workStyle: '역할을 나누고 의견을 주고받으며 진행해요.',
    matchReason: '다양한 사람과 협업하는 환경을 선호해요.',
    cautionHigh: '혼자 고립되어 일하는 환경',
    cautionLow: '회의와 공동 작업이 끊임없이 이어지는 환경',
    gap: '여러 이해관계자와 조율하는 경험을 쌓아야 할 수 있어요.',
  },
  autonomy: {
    label: '자율성 선호',
    strength: '스스로 방향을 정하고 주도적으로 실행해요.',
    environment: '목표만 주어지고 방법은 맡겨지는 환경',
    workStyle: '큰 방향을 잡고 상황에 맞게 유연하게 움직여요.',
    matchReason: '높은 자율성을 가진 업무 환경과 잘 맞아요.',
    cautionHigh: '세세한 지시와 통제가 많은 환경',
    cautionLow: '모든 판단을 혼자 내려야 하는 환경',
    gap: '스스로 판단하고 결정하는 상황에 익숙해져야 할 수 있어요.',
  },
  stability: {
    label: '안정성 선호',
    strength: '정해진 기준과 절차를 지키며 꼼꼼하게 마무리해요.',
    environment: '역할과 절차가 명확한 환경',
    workStyle: '계획을 세우고 단계별로 실수 없이 진행해요.',
    matchReason: '체계적이고 안정적인 업무 방식과 잘 맞아요.',
    cautionHigh: '변화가 잦고 불확실성이 큰 환경',
    cautionLow: '반복적이고 변화가 없는 업무',
    gap: '정확성과 절차를 꼼꼼히 지키는 습관이 필요할 수 있어요.',
  },
  people: {
    label: '사람 중심',
    strength: '상대의 입장을 이해하고 마음을 움직여요.',
    environment: '사람을 만나고 돕는 일이 많은 환경',
    workStyle: '상대의 필요를 먼저 파악하고 그에 맞춰 움직여요.',
    matchReason: '사람을 이해하고 돕는 일에 강점이 있어요.',
    cautionHigh: '사람과의 교류 없이 기계·문서만 다루는 업무',
    cautionLow: '하루 종일 고객이나 대중을 응대해야 하는 업무',
    gap: '사람을 대하고 설득하는 경험을 늘려야 할 수 있어요.',
  },
}

export const INTEREST_KEYS = ['tech', 'business', 'art', 'media', 'care', 'field'] as const
export type InterestKey = (typeof INTEREST_KEYS)[number]
export type InterestScores = Record<InterestKey, number>

export const INTERESTS: Record<InterestKey, { label: string }> = {
  tech: { label: '기술·과학' },
  business: { label: '비즈니스·경영' },
  art: { label: '디자인·예술' },
  media: { label: '콘텐츠·미디어' },
  care: { label: '교육·복지·보건' },
  field: { label: '현장·자연·신체활동' },
}

export function emptyTraits(): TraitScores {
  return { analytic: 0, creative: 0, collab: 0, autonomy: 0, stability: 0, people: 0 }
}

export function emptyInterests(): InterestScores {
  return { tech: 0, business: 0, art: 0, media: 0, care: 0, field: 0 }
}

import type { InterestKey, TraitKey } from '@/lib/traits'

// 상황형 질문. 화면에는 질문 의도(측정 영역)를 노출하지 않는다.
// 각 선택지는 성향 지표(traits) 또는 관심 분야(interests)에 점수를 더한다.

export type QuestionArea = '문제 해결' | '업무 방식' | '정보 처리' | '동기' | '대인관계' | '관심 분야'

export interface QuestionOption {
  text: string
  traits?: Partial<Record<TraitKey, number>>
  interests?: Partial<Record<InterestKey, number>>
}

export interface Question {
  id: string
  area: QuestionArea
  text: string
  options: QuestionOption[]
}

export const QUESTIONS: Question[] = [
  // ── 문제 해결 ──
  {
    id: 'q01',
    area: '문제 해결',
    text: '팀 프로젝트에서 예상하지 못한 문제가 발생했습니다. 당신은 어떻게 행동할 가능성이 높나요?',
    options: [
      { text: '문제의 원인을 먼저 분석한다.', traits: { analytic: 2 } },
      { text: '팀원들의 의견을 듣는다.', traits: { collab: 2 } },
      { text: '여러 해결 방법을 직접 시도한다.', traits: { autonomy: 2 } },
      { text: '기존과 다른 새로운 방법을 생각한다.', traits: { creative: 2 } },
    ],
  },
  {
    id: 'q02',
    area: '문제 해결',
    text: '처음 맡은 업무인데 참고할 자료가 거의 없습니다. 어떻게 시작하나요?',
    options: [
      { text: '비슷한 사례와 데이터를 찾아 기준을 세운다.', traits: { analytic: 2 } },
      { text: '경험 있는 사람에게 물어 방향을 잡는다.', traits: { people: 1, collab: 1 } },
      { text: '일단 내 방식대로 해보면서 방법을 찾는다.', traits: { autonomy: 2 } },
      { text: '실수하지 않도록 단계별 체크리스트부터 만든다.', traits: { stability: 2 } },
    ],
  },
  {
    id: 'q03',
    area: '문제 해결',
    text: '회의에서 낸 아이디어가 반대에 부딪혔습니다. 다음 행동은?',
    options: [
      { text: '근거 자료를 보강해서 다시 설득한다.', traits: { analytic: 2 } },
      { text: '반대 의견을 반영해 함께 수정안을 만든다.', traits: { collab: 2 } },
      { text: '완전히 다른 관점의 대안을 제시한다.', traits: { creative: 2 } },
      { text: '상대가 무엇을 걱정하는지 먼저 이해하려 한다.', traits: { people: 2 } },
    ],
  },
  {
    id: 'q04',
    area: '문제 해결',
    text: '마감 직전, 결과물에서 큰 오류를 발견했습니다.',
    options: [
      { text: '오류의 범위와 영향을 정확히 파악한다.', traits: { analytic: 2 } },
      { text: '팀에 바로 공유하고 역할을 나눠 대응한다.', traits: { collab: 2 } },
      { text: '정해진 절차대로 보고하고 승인 후 수정한다.', traits: { stability: 2 } },
      { text: '내 판단으로 고칠 수 있는 것부터 바로 고친다.', traits: { autonomy: 2 } },
    ],
  },
  {
    id: 'q05',
    area: '문제 해결',
    text: '해결 방법이 여러 가지인 문제가 주어졌습니다. 무엇을 기준으로 고르나요?',
    options: [
      { text: '방법별 장단점을 비교표로 정리해 고른다.', traits: { analytic: 2 } },
      { text: '이미 검증된 가장 안전한 방법을 고른다.', traits: { stability: 2 } },
      { text: '아무도 시도하지 않은 방법에 끌린다.', traits: { creative: 2 } },
      { text: '영향을 받는 사람들에게 가장 좋은 방법을 고른다.', traits: { people: 2 } },
    ],
  },

  // ── 업무 방식 ──
  {
    id: 'q06',
    area: '업무 방식',
    text: '새 프로젝트를 시작할 때 가장 먼저 하는 일은?',
    options: [
      { text: '일정과 단계를 구체적으로 계획한다.', traits: { stability: 2 } },
      { text: '큰 방향만 잡고 상황에 맞게 움직인다.', traits: { autonomy: 2 } },
      { text: '팀원들과 모여 역할부터 나눈다.', traits: { collab: 2 } },
      { text: '레퍼런스를 찾아보며 아이디어를 모은다.', traits: { creative: 2 } },
    ],
  },
  {
    id: 'q07',
    area: '업무 방식',
    text: '언제 가장 일에 몰입이 잘 되나요?',
    options: [
      { text: '혼자 조용히 한 가지를 깊게 파고들 때', traits: { analytic: 1, autonomy: 1 } },
      { text: '사람들과 의견을 활발히 주고받을 때', traits: { collab: 2 } },
      { text: '없던 것을 새로 만들어낼 때', traits: { creative: 2 } },
      { text: '누군가에게 도움이 되고 있다고 느낄 때', traits: { people: 2 } },
    ],
  },
  {
    id: 'q08',
    area: '업무 방식',
    text: '상사가 업무를 맡길 때, 어떤 방식이 가장 편한가요?',
    options: [
      { text: '목표만 주고 방법은 나에게 맡겨준다.', traits: { autonomy: 2 } },
      { text: '명확한 기준과 절차를 함께 알려준다.', traits: { stability: 2 } },
      { text: '팀과 함께 논의하면서 정하게 한다.', traits: { collab: 2 } },
      { text: '배경과 데이터까지 충분히 설명해준다.', traits: { analytic: 2 } },
    ],
  },
  {
    id: 'q09',
    area: '업무 방식',
    text: '갑자기 업무 우선순위가 바뀌었습니다. 당신의 반응은?',
    options: [
      { text: '바뀐 이유와 영향부터 확인한다.', traits: { analytic: 2 } },
      { text: '새로운 기회로 보고 바로 적응한다.', traits: { autonomy: 1, creative: 1 } },
      { text: '계획이 흔들려 불편하지만 다시 계획을 세운다.', traits: { stability: 2 } },
      { text: '관련된 사람들과 일정을 다시 맞춘다.', traits: { collab: 2 } },
    ],
  },
  {
    id: 'q10',
    area: '업무 방식',
    text: '하루 일을 마쳤을 때 가장 뿌듯한 순간은?',
    options: [
      { text: '복잡한 문제를 논리적으로 풀어냈을 때', traits: { analytic: 2 } },
      { text: '계획한 일을 실수 없이 끝냈을 때', traits: { stability: 2 } },
      { text: '누군가 고맙다고 말해줬을 때', traits: { people: 2 } },
      { text: '내 아이디어가 실제 형태를 갖췄을 때', traits: { creative: 2 } },
    ],
  },

  // ── 정보 처리 ──
  {
    id: 'q11',
    area: '정보 처리',
    text: '새로운 내용을 배울 때 가장 잘 이해되는 방식은?',
    options: [
      { text: '숫자와 데이터로 정리된 자료', traits: { analytic: 2 } },
      { text: '순서대로 잘 정리된 설명서', traits: { stability: 2 } },
      { text: '그림이나 도식으로 표현된 자료', traits: { creative: 2 } },
      { text: '일단 직접 해보면서 익히기', traits: { autonomy: 2 } },
    ],
  },
  {
    id: 'q12',
    area: '정보 처리',
    text: '친구가 노트북을 사려는데 고민이라고 합니다. 당신은?',
    options: [
      { text: '스펙과 가격을 비교해서 알려준다.', traits: { analytic: 2 } },
      { text: '어떤 용도로 쓰려는지 먼저 물어본다.', traits: { people: 2 } },
      { text: '오래 쓸 수 있는 검증된 제품을 추천한다.', traits: { stability: 2 } },
      { text: '디자인이 독특하거나 새로운 기능이 있는 제품을 보여준다.', traits: { creative: 2 } },
    ],
  },
  {
    id: 'q13',
    area: '정보 처리',
    text: '보고서를 작성할 때 가장 신경 쓰는 부분은?',
    options: [
      { text: '핵심 수치와 그래프', traits: { analytic: 2 } },
      { text: '읽는 사람이 쉽게 이해할 수 있는지', traits: { people: 2 } },
      { text: '정해진 양식과 형식을 지키는 것', traits: { stability: 2 } },
      { text: '남들과 다른 독창적인 구성', traits: { creative: 2 } },
    ],
  },
  {
    id: 'q14',
    area: '정보 처리',
    text: '한꺼번에 많은 정보가 쏟아질 때 어떻게 정리하나요?',
    options: [
      { text: '기준을 세워 분류한다.', traits: { analytic: 2 } },
      { text: '사람들과 나눠서 함께 정리한다.', traits: { collab: 2 } },
      { text: '중요해 보이는 것만 골라 바로 처리한다.', traits: { autonomy: 2 } },
      { text: '정보들을 연결해 새로운 인사이트를 찾는다.', traits: { creative: 2 } },
    ],
  },

  // ── 동기 ──
  {
    id: 'q15',
    area: '동기',
    text: '직장을 고를 때 가장 중요하게 생각하는 것은?',
    options: [
      { text: '오래 안정적으로 다닐 수 있는 곳', traits: { stability: 2 } },
      { text: '새로운 것을 배우며 빠르게 성장할 수 있는 곳', traits: { creative: 1, analytic: 1 } },
      { text: '일하는 시간과 방식이 자유로운 곳', traits: { autonomy: 2 } },
      { text: '좋은 사람들과 함께 일할 수 있는 곳', traits: { collab: 2 } },
    ],
  },
  {
    id: 'q16',
    area: '동기',
    text: '성과에 대해 어떤 보상을 받을 때 가장 만족스러운가요?',
    options: [
      { text: '명확한 기준에 따른 공정한 평가', traits: { stability: 2 } },
      { text: '팀 전체가 함께 받는 보상', traits: { collab: 2 } },
      { text: '내가 기여한 만큼 확실한 개인 보상', traits: { autonomy: 2 } },
      { text: '도움을 받은 사람들의 진심 어린 감사', traits: { people: 2 } },
    ],
  },
  {
    id: 'q17',
    area: '동기',
    text: '10년 뒤 되고 싶은 모습에 가장 가까운 것은?',
    options: [
      { text: '한 분야를 깊이 아는 전문가', traits: { analytic: 2 } },
      { text: '내 일을 스스로 주도하는 독립적인 사람', traits: { autonomy: 2 } },
      { text: '사람들을 이끌고 성장을 돕는 리더', traits: { people: 1, collab: 1 } },
      { text: '세상에 없던 것을 만들어낸 사람', traits: { creative: 2 } },
    ],
  },
  {
    id: 'q18',
    area: '동기',
    text: '주말에 새로운 것을 하나 배운다면?',
    options: [
      { text: '코딩이나 데이터 분석', traits: { analytic: 2 } },
      { text: '그림, 영상, 글쓰기 같은 창작', traits: { creative: 2 } },
      { text: '취업이나 업무에 도움이 되는 자격증', traits: { stability: 2 } },
      { text: '사람들과 함께하는 모임이나 커뮤니티 활동', traits: { collab: 1, people: 1 } },
    ],
  },

  // ── 대인관계 ──
  {
    id: 'q19',
    area: '대인관계',
    text: '처음 만난 사람이 많은 자리에서 당신은?',
    options: [
      { text: '먼저 다가가 대화를 이끈다.', traits: { people: 2 } },
      { text: '분위기를 살피며 필요할 때 거든다.', traits: { collab: 2 } },
      { text: '사람들을 관찰하며 어떤 사람인지 파악한다.', traits: { analytic: 2 } },
      { text: '굳이 어울리기보다 내 페이스를 유지한다.', traits: { autonomy: 2 } },
    ],
  },
  {
    id: 'q20',
    area: '대인관계',
    text: '함께 일하는 동료가 힘들어 보입니다.',
    options: [
      { text: '먼저 말을 걸고 이야기를 들어준다.', traits: { people: 2 } },
      { text: '업무를 나눠서 함께 처리한다.', traits: { collab: 2 } },
      { text: '무엇이 문제인지 파악해 해결책을 알려준다.', traits: { analytic: 2 } },
      { text: '스스로 해결할 수 있도록 지켜본다.', traits: { autonomy: 2 } },
    ],
  },
  {
    id: 'q21',
    area: '대인관계',
    text: '다른 사람을 설득해야 할 때 주로 쓰는 방법은?',
    options: [
      { text: '데이터와 근거를 제시한다.', traits: { analytic: 2 } },
      { text: '상대의 입장에 공감하며 이야기한다.', traits: { people: 2 } },
      { text: '상대가 생각지 못한 신선한 아이디어를 보여준다.', traits: { creative: 2 } },
      { text: '이전의 성공 사례나 규정을 근거로 든다.', traits: { stability: 2 } },
    ],
  },

  // ── 관심 분야 ──
  {
    id: 'q22',
    area: '관심 분야',
    text: '평소 가장 눈길이 가는 뉴스나 콘텐츠는?',
    options: [
      { text: '새로운 기술, IT, 과학 소식', interests: { tech: 2 } },
      { text: '기업, 경제, 창업 이야기', interests: { business: 2 } },
      { text: '디자인, 미술, 공연 소식', interests: { art: 2 } },
      { text: '영화, 드라마, 유튜브 트렌드', interests: { media: 2 } },
      { text: '교육, 복지, 건강 관련 이야기', interests: { care: 2 } },
      { text: '스포츠, 여행, 자연·환경 이야기', interests: { field: 2 } },
    ],
  },
  {
    id: 'q23',
    area: '관심 분야',
    text: '하루 동안 어떤 일이든 체험할 수 있다면?',
    options: [
      { text: '앱이나 로봇을 직접 만들어보기', interests: { tech: 2 } },
      { text: '투자자 앞에서 사업 계획 발표하기', interests: { business: 2 } },
      { text: '브랜드 로고나 작품 디자인하기', interests: { art: 2 } },
      { text: '영상이나 기사 기획하고 제작하기', interests: { media: 2 } },
      { text: '학생을 가르치거나 누군가를 상담하기', interests: { care: 2 } },
      { text: '야외 현장에서 몸으로 직접 일해보기', interests: { field: 2 } },
    ],
  },
  {
    id: 'q24',
    area: '관심 분야',
    text: '일을 하면서 가장 듣고 싶은 칭찬은?',
    options: [
      { text: '"이 문제를 기술적으로 깔끔하게 해결했네요."', interests: { tech: 2 } },
      { text: '"덕분에 성과와 매출이 올랐어요."', interests: { business: 2 } },
      { text: '"보기 좋고 감각적이에요."', interests: { art: 2 } },
      { text: '"이야기에 푹 빠져들었어요."', interests: { media: 2 } },
      { text: '"덕분에 큰 힘이 됐어요."', interests: { care: 2 } },
      { text: '"손이 빠르고 현장에서 믿음직해요."', interests: { field: 2 } },
    ],
  },
  {
    id: 'q25',
    area: '관심 분야',
    text: '동아리 하나를 고른다면?',
    options: [
      { text: '코딩·과학 실험 동아리', interests: { tech: 2 } },
      { text: '창업·투자 동아리', interests: { business: 2 } },
      { text: '미술·디자인·음악 동아리', interests: { art: 2 } },
      { text: '영상·글쓰기·방송 동아리', interests: { media: 2 } },
      { text: '봉사·멘토링 동아리', interests: { care: 2 } },
      { text: '운동·캠핑·요리 동아리', interests: { field: 2 } },
    ],
  },
]

/** 한 문항에 약 12초 기준 */
export const ESTIMATED_MINUTES = Math.ceil((QUESTIONS.length * 12) / 60)

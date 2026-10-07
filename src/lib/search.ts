import type { JobSummary } from '@/lib/jobs'

// 직업 검색: 직업명 > 관련 직업명 > 직업군 > 설명 순으로 점수를 매긴다.
// 공백은 무시하고, 초성만 입력하면(예: ㄱㅊㄱ) 직업명 초성과 비교한다.

const CHOSUNG = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'

function normalize(text: string) {
  return text.replace(/\s+/g, '').toLowerCase()
}

/** 한글 음절을 초성으로 바꾼다. 한글이 아닌 글자는 그대로 둔다. */
export function toChosung(text: string) {
  return [...text]
    .map((ch) => {
      const code = ch.charCodeAt(0) - 0xac00
      return code >= 0 && code <= 11171 ? CHOSUNG[Math.floor(code / 588)] : ch
    })
    .join('')
}

function isChosungOnly(text: string) {
  return text.length > 0 && [...text].every((ch) => CHOSUNG.includes(ch))
}

export function searchScore(job: JobSummary, query: string): number {
  const q = normalize(query)
  if (!q) return 1

  const name = normalize(job.name)
  if (isChosungOnly(q)) {
    const initials = toChosung(name)
    if (initials.startsWith(q)) return 90
    return initials.includes(q) ? 70 : 0
  }

  if (name === q) return 100
  if (name.startsWith(q)) return 90
  if (name.includes(q)) return 80
  if (job.related && normalize(job.related).includes(q)) return 60
  if (normalize(job.group).includes(q)) return 40
  if (normalize(job.summary).includes(q)) return 20
  return 0
}

// 커리어넷 직업백과 상세(job.json) 응답 중 화면에서 쓰는 필드.
// 개발 중에는 Vite 프록시(/api/careernet)가 인증키를 붙여 중계한다.

export interface CareerNetJobDetail {
  baseInfo: {
    job_nm: string
    aptit_name: string
    wage?: number | string
    wage_source?: string
    wlb?: string
    social?: string
    satisfication?: number
    rel_job_nm?: string
  }
  workList?: { work: string }[]
  abilityList?: { ability_name: string }[]
  aptitudeList?: { aptitude: string }[]
  interestList?: { interest: string }[]
  forecastList?: { forecast: string }[]
  departList?: { depart_id: number; depart_name: string }[]
  certiList?: { certi: string; LINK?: string }[]
  jobReadyList?: {
    recruit?: { recruit: string }[]
    certificate?: { certificate: string }[]
    training?: { training: string }[]
    curriculum?: { curriculum: string }[]
  }
  performList?: {
    perform?: ({ perform: string; inform: string; importance: number } | null)[]
    environment?: ({ environment: string; inform: string; importance: number } | null)[]
  }
}

const cache = new Map<string, Promise<CareerNetJobDetail>>()

export function fetchJobDetail(id: string): Promise<CareerNetJobDetail> {
  let promise = cache.get(id)
  if (!promise) {
    promise = fetch(`/api/careernet/job.json?seq=${encodeURIComponent(id)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`직업 정보를 불러오지 못했어요. (HTTP ${res.status})`)
        const data = (await res.json()) as CareerNetJobDetail
        if (!data?.baseInfo) throw new Error('직업 정보 응답 형식이 올바르지 않아요.')
        return data
      })
      .catch((err) => {
        cache.delete(id) // 실패한 요청은 다시 시도할 수 있게 캐시하지 않는다.
        throw err
      })
    cache.set(id, promise)
  }
  return promise
}

/** "1. 내용" 같은 번호·불릿 접두어를 걷어낸다. */
export function cleanText(text: string) {
  return text.replace(/^\s*(?:[-•·]|\d+[.)])\s*/, '').trim()
}

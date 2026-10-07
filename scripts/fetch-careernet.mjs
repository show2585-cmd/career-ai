// 커리어넷 직업백과 원본 수집기.
// 전체 직업 목록과 직업별 상세를 받아 scripts/.cache/careernet/에 원본 그대로 저장한다.
// 이미 받은 상세는 건너뛰므로 중간에 끊겨도 다시 실행하면 이어서 받는다.
//
//   npm run data:fetch            (목록 + 전체 상세)
//   npm run data:fetch -- --limit 5   (상세 5개만, 응답 구조 확인용)

import fs from 'node:fs/promises'
import path from 'node:path'

const BASE = 'https://www.career.go.kr/cnet/front/openapi'
const CACHE_DIR = path.resolve(import.meta.dirname, '.cache/careernet')
const CONCURRENCY = 4
const DELAY_MS = 150

const apiKey = process.env.CAREERNET_API_KEY
if (!apiKey) {
  console.error('CAREERNET_API_KEY가 없습니다. .env.local에 인증키를 넣어주세요.')
  process.exit(1)
}

const limitArg = process.argv.indexOf('--limit')
const limit = limitArg === -1 ? Infinity : Number(process.argv[limitArg + 1])

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function get(endpoint, params) {
  const url = new URL(`${BASE}/${endpoint}`)
  for (const [k, v] of Object.entries({ ...params, apiKey })) url.searchParams.set(k, String(v))
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      try {
        return JSON.parse(text)
      } catch {
        throw new Error(`JSON이 아닌 응답: ${text.slice(0, 200)}`)
      }
    } catch (err) {
      if (attempt >= 3) throw new Error(`${endpoint} ${JSON.stringify(params)} 실패: ${err.message}`)
      await sleep(1000 * attempt)
    }
  }
}

async function fetchList() {
  const jobs = []
  for (let pageIndex = 1; ; pageIndex++) {
    const page = await get('jobs.json', { pageIndex })
    const items = page.jobs ?? []
    jobs.push(...items)
    console.log(`목록 ${pageIndex}페이지: ${jobs.length}/${page.count}`)
    if (items.length === 0 || jobs.length >= Number(page.count)) break
    await sleep(DELAY_MS)
  }
  return jobs
}

async function fetchDetails(jobs) {
  const queue = jobs.slice(0, limit)
  let done = 0
  let failed = 0
  async function worker() {
    while (queue.length) {
      const job = queue.shift()
      const file = path.join(CACHE_DIR, `job-${job.job_cd}.json`)
      try {
        await fs.access(file)
      } catch {
        try {
          const detail = await get('job.json', { seq: job.job_cd })
          await fs.writeFile(file, JSON.stringify(detail))
          await sleep(DELAY_MS)
        } catch (err) {
          failed++
          console.warn(err.message)
        }
      }
      done++
      if (done % 25 === 0) console.log(`상세 ${done}/${Math.min(jobs.length, limit)}`)
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  console.log(`상세 완료: ${done - failed}개 성공, ${failed}개 실패`)
}

await fs.mkdir(CACHE_DIR, { recursive: true })
const jobs = await fetchList()
await fs.writeFile(path.join(CACHE_DIR, 'jobs.json'), JSON.stringify(jobs))
await fetchDetails(jobs)

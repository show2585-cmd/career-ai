// Vercel 함수: 커리어넷 Open API 중계 (배포 환경용).
// 개발 중에는 vite.config.ts의 프록시가 같은 역할을 한다.
//
//   브라우저  /api/careernet/job.json?seq=209
//   → (vercel.json rewrite) /api/careernet?endpoint=job.json&seq=209
//   → https://www.career.go.kr/cnet/front/openapi/job.json?seq=209&apiKey=...
//
// 인증키(CAREERNET_API_KEY)는 Vercel 환경 변수에만 두고 브라우저로 내보내지 않는다.

const UPSTREAM = 'https://www.career.go.kr/cnet/front/openapi'

/** 앱이 실제로 쓰는 엔드포인트와 파라미터만 허용해 열린 프록시로 악용되지 않게 한다. */
const ALLOWED: Record<string, string[]> = {
  'job.json': ['seq'],
}

// 직업 정보는 자주 바뀌지 않으므로 CDN에 하루 캐시하고, 만료 후에도 일주일간은 이전 응답을 주며 갱신한다.
const CACHE_CONTROL = 'public, s-maxage=86400, stale-while-revalidate=604800'

export async function GET(request: Request): Promise<Response> {
  const apiKey = process.env.CAREERNET_API_KEY
  if (!apiKey) return json({ error: '서버에 CAREERNET_API_KEY가 설정되지 않았습니다.' }, 500)

  const url = new URL(request.url)
  const endpoint = url.searchParams.get('endpoint') ?? ''
  const allowedParams = ALLOWED[endpoint]
  if (!allowedParams) return json({ error: '허용되지 않은 요청입니다.' }, 404)

  const upstream = new URL(`${UPSTREAM}/${endpoint}`)
  for (const name of allowedParams) {
    const value = url.searchParams.get(name)
    if (!value || !/^\d+$/.test(value)) return json({ error: `${name} 값이 올바르지 않습니다.` }, 400)
    upstream.searchParams.set(name, value)
  }
  upstream.searchParams.set('apiKey', apiKey)

  try {
    const res = await fetch(upstream, { signal: AbortSignal.timeout(10_000) })
    if (!res.ok) return json({ error: `커리어넷 응답 오류 (HTTP ${res.status})` }, 502)
    return new Response(await res.text(), {
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': CACHE_CONTROL },
    })
  } catch {
    return json({ error: '커리어넷에 연결하지 못했습니다.' }, 504)
  }
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })
}

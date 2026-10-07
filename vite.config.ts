import https from 'node:https'
import path from 'node:path'
import tls from 'node:tls'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.CAREERNET_API_KEY ?? ''

  // 배포 도메인(canonical·OG 절대 URL). 지정이 없으면 Vercel 프로덕션 도메인을 쓴다.
  // index.html의 %VITE_SITE_URL% 치환과 앱 코드(import.meta.env)에 반영되도록 process.env에 넣는다.
  if (!env.VITE_SITE_URL && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    process.env.VITE_SITE_URL = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  process.env.VITE_SITE_URL ??= env.VITE_SITE_URL || 'http://localhost:4173'

  // 사내망처럼 TLS를 가로채는 환경에서도 동작하도록 OS 인증서 저장소를 함께 신뢰한다.
  const agent = new https.Agent({
    ca: [...tls.getCACertificates('default'), ...tls.getCACertificates('system')],
  })

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        // /api/careernet/job.json?seq=1 → https://www.career.go.kr/cnet/front/openapi/job.json?seq=1&apiKey=...
        // 인증키는 서버에서만 붙이므로 브라우저에 노출되지 않는다.
        '/api/careernet': {
          target: 'https://www.career.go.kr',
          changeOrigin: true,
          agent,
          rewrite: (p) => {
            const url = new URL(p.replace(/^\/api\/careernet/, '/cnet/front/openapi'), 'http://localhost')
            url.searchParams.set('apiKey', apiKey)
            return url.pathname + url.search
          },
        },
      },
    },
  }
})

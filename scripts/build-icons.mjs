// 파비콘·앱 아이콘·OG 이미지·메인 비주얼(KV) 최적화본 생성 (public/에 결과물을 커밋한다).
// KV 원본은 public/kv.png. 화면에는 용량을 줄인 WebP(kv-800/kv-1600)를 쓴다.
//
//   npm run icons
//
// OG 이미지의 한글은 시스템 폰트로 그린다(Windows: 맑은 고딕, macOS: Apple SD Gothic Neo).

import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const PUBLIC = path.resolve(import.meta.dirname, '../public')
const BRAND = '#3a5bf0'
const BRAND_DEEP = '#5b3fd6'

// lucide "compass" 아이콘 경로 (24x24 기준)
const COMPASS = `
  <circle cx="12" cy="12" r="10" />
  <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />`

function iconSvg(size, { rounded = true } = {}) {
  const r = rounded ? size * 0.22 : 0
  const pad = size * 0.2
  const scale = (size - pad * 2) / 24
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="${BRAND}" />
  <g transform="translate(${pad} ${pad}) scale(${scale})" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${COMPASS}</g>
</svg>`
}

const FONT = `'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif`

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${BRAND}" />
      <stop offset="1" stop-color="${BRAND_DEEP}" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <circle cx="1080" cy="80" r="220" fill="#fff" fill-opacity="0.08" />
  <circle cx="120" cy="620" r="180" fill="#fff" fill-opacity="0.08" />

  <g transform="translate(96 92)">
    <rect width="64" height="64" rx="16" fill="#fff" />
    <g transform="translate(12 12) scale(1.6667)" fill="none" stroke="${BRAND}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${COMPASS}</g>
    <text x="84" y="44" font-family="${FONT}" font-size="34" font-weight="700" fill="#fff">Career AI</text>
  </g>

  <text font-family="${FONT}" font-weight="700" fill="#fff" font-size="72">
    <tspan x="96" y="300">나는 어떤 환경에서</tspan>
    <tspan x="96" y="396">일할 때 가장 즐거울까?</tspan>
  </text>
  <text x="96" y="500" font-family="${FONT}" font-size="34" fill="#fff" fill-opacity="0.85">5분 성향 진단 · 맞춤 직무 TOP 5 추천 · 무료</text>
</svg>`

await fs.writeFile(path.join(PUBLIC, 'favicon.svg'), iconSvg(64))
await sharp(Buffer.from(iconSvg(180, { rounded: false }))).png().toFile(path.join(PUBLIC, 'apple-touch-icon.png'))
await sharp(Buffer.from(iconSvg(192))).png().toFile(path.join(PUBLIC, 'icon-192.png'))
await sharp(Buffer.from(iconSvg(512))).png().toFile(path.join(PUBLIC, 'icon-512.png'))
// OG: KV 위에 왼쪽 흰 그라데이션 + 문구. KV가 없으면 단색 그라데이션 버전을 쓴다.
const KV = path.join(PUBLIC, 'kv.png')
const hasKv = await fs.access(KV).then(() => true, () => false)
if (hasKv) {
  for (const width of [800, 1600]) {
    await sharp(KV).resize({ width }).webp({ quality: 78 }).toFile(path.join(PUBLIC, `kv-${width}.webp`))
  }
  const kvOg = await sharp(KV).resize(1200, 630, { fit: 'cover', position: 'right' }).toBuffer()
  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#f4fafd" stop-opacity="0.97" />
      <stop offset="0.42" stop-color="#f4fafd" stop-opacity="0.9" />
      <stop offset="0.62" stop-color="#f4fafd" stop-opacity="0" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#fade)" />
  <g transform="translate(72 84)">
    <rect width="56" height="56" rx="14" fill="${BRAND}" />
    <g transform="translate(10 10) scale(1.5)" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${COMPASS}</g>
    <text x="74" y="38" font-family="${FONT}" font-size="30" font-weight="700" fill="#1f2a44">Career AI</text>
  </g>
  <text font-family="${FONT}" font-weight="700" font-size="50" fill="#1f2a44">
    <tspan x="72" y="282">나는 어떤 환경에서</tspan>
    <tspan x="72" y="352">일할 때</tspan>
    <tspan x="72" y="422" fill="${BRAND}">가장 즐거울까?</tspan>
  </text>
  <text x="72" y="508" font-family="${FONT}" font-size="26" fill="#4a5470">5분 성향 진단 · 맞춤 직무 TOP 5 추천</text>
</svg>`
  await sharp(kvOg).composite([{ input: Buffer.from(overlay) }]).jpeg({ quality: 85, mozjpeg: true }).toFile(path.join(PUBLIC, 'og.jpg'))
} else {
  await sharp(Buffer.from(ogSvg)).jpeg({ quality: 85, mozjpeg: true }).toFile(path.join(PUBLIC, 'og.jpg'))
}

await fs.writeFile(
  path.join(PUBLIC, 'site.webmanifest'),
  JSON.stringify(
    {
      name: 'Career AI - 성향 기반 진로 추천',
      short_name: 'Career AI',
      lang: 'ko',
      start_url: '/',
      display: 'standalone',
      background_color: '#f8f9ff',
      theme_color: BRAND,
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  ) + '\n',
)
console.log(`아이콘과 OG 이미지${hasKv ? ', KV 최적화본' : ''}을 public/에 생성했습니다.`)

import { useEffect } from 'react'
import { absoluteUrl, DEFAULT_DESCRIPTION, OG_IMAGE_PATH, PRIVATE_PAGES, type SeoMeta } from '@/lib/seo'

const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin

/**
 * 페이지별 head 메타를 갱신한다.
 * 프리렌더된 HTML에 이미 있는 태그를 찾아 값만 바꾸므로 클라이언트 이동 시에도 태그가 중복되지 않는다.
 */
export function Seo({ title, description, path, noindex, type = 'website' }: SeoMeta) {
  useEffect(() => {
    const url = absoluteUrl(SITE_URL, path)
    document.title = title
    setMeta('name', 'description', description)
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:image', absoluteUrl(SITE_URL, OG_IMAGE_PATH))
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    setLink('canonical', url)
  }, [title, description, path, noindex, type])

  return null
}

/** 검색 노출을 막는 개인화 페이지용 */
export function PrivateSeo({ path }: { path: keyof typeof PRIVATE_PAGES }) {
  const meta = PRIVATE_PAGES[path]
  return <Seo {...meta} path={path} description={DEFAULT_DESCRIPTION} />
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

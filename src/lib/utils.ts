export { cn } from "cn"

/** 마지막 글자의 받침 유무에 맞춰 조사를 붙인다. 예: josa('사람 중심', '과', '와') → '사람 중심과' */
export function josa(word: string, withBatchim: string, withoutBatchim: string) {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  const hasBatchim = code >= 0 && code <= 11171 && code % 28 !== 0
  return word + (hasBatchim ? withBatchim : withoutBatchim)
}

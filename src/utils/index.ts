export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  const parts = [
    h > 0 ? h : null,
    (h > 0 && m < 10 ? '0' : '') + m,
    (s < 10 ? '0' : '') + s,
  ].filter(Boolean)

  return parts.join(':')
}

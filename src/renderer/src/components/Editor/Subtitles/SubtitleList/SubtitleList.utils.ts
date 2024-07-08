import { Subtitle } from '@renderer/store/store'
import { SubtitleFormat } from './SubtitleList.types'

export function generateSRT(subtitles: Subtitle[]): string {
  return subtitles
    .map((subtitle, index) => {
      const start = formatTime(subtitle.start, SubtitleFormat.SRT)
      const end = formatTime(subtitle.end, SubtitleFormat.SRT)
      return `${index + 1}\n${start} --> ${end}\n${subtitle.text}\n`
    })
    .join('\n')
}

export function generateVTT(subtitles: Subtitle[]): string {
  return (
    'WEBVTT\n\n' +
    subtitles
      .map((subtitle) => {
        const start = formatTime(subtitle.start, SubtitleFormat.VTT)
        const end = formatTime(subtitle.end, SubtitleFormat.VTT)
        return `${start} --> ${end}\n${subtitle.text}\n`
      })
      .join('\n')
  )
}

function generateTXT(subtitles: Subtitle[]): string {
  return subtitles.map((subtitle) => `${subtitle.text}\n`).join('')
}

export function downloadSubtitles(subtitles: Subtitle[], format: SubtitleFormat): void {
  const content =
    format === SubtitleFormat.SRT
      ? generateSRT(subtitles)
      : format === SubtitleFormat.VTT
        ? generateVTT(subtitles)
        : generateTXT(subtitles)

  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `subtitles.${format}`
  document.body.appendChild(a)
  a.click()

  // Cleanup
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function formatTime(seconds: number, format?: SubtitleFormat): string {
  const formattedTime = new Date(seconds * 1000).toISOString()
  if (format === SubtitleFormat.SRT) return formattedTime.slice(11, -1).replace('.', ',')
  if (format === SubtitleFormat.VTT) return formattedTime.slice(11, -1)
  // UI display format e.g. 01:12.5
  const uiDisplayFormat = formattedTime.slice(11, -3)
  const hoursEndIndex = uiDisplayFormat.indexOf(':')
  const hours = parseInt(uiDisplayFormat.slice(0, hoursEndIndex))
  return hours > 0 ? uiDisplayFormat : uiDisplayFormat.slice(hoursEndIndex + 1)
}

export function isSubtitlePlaying(currentTime: number, start: number, end: number): boolean {
  return +currentTime.toFixed(2) >= +start.toFixed(2) && +currentTime.toFixed(2) < +end.toFixed(2)
}

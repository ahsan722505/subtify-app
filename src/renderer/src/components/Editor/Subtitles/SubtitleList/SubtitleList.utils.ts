import { BackgroundType, Subtitle } from '@renderer/store/store'
import { SubtitleFormat } from './SubtitleList.types'
import Konva from 'konva'
import { Context } from 'konva/lib/Context'
import { Shape, ShapeConfig } from 'konva/lib/Shape'

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

export function generateTXT(subtitles: Subtitle[]): string {
  return subtitles.map((subtitle) => `${subtitle.text}\n`).join('')
}

export function downloadSubtitles(subtitles: string, format: SubtitleFormat): void {
  const blob = new Blob([subtitles], { type: 'text/plain' })
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
  if (format === SubtitleFormat.ASS) {
    const totalSeconds = Math.floor(seconds)
    const deciseconds = Math.floor((seconds - totalSeconds) * 100)
    const hours = Math.floor(totalSeconds / 3600)
    const remainingSeconds = totalSeconds % 3600
    const minutes = Math.floor(remainingSeconds / 60)
    const secs = remainingSeconds % 60
    const pad = (num: number, size: number): string => {
      const s = '0' + num
      return s.slice(s.length - size)
    }
    return `${hours}:${pad(minutes, 2)}:${pad(secs, 2)}.${pad(deciseconds, 2)}`
  }
  // UI display format e.g. 01:12.5
  const uiDisplayFormat = formattedTime.slice(11, -2)
  const hoursEndIndex = uiDisplayFormat.indexOf(':')
  const hours = parseInt(uiDisplayFormat.slice(0, hoursEndIndex))
  return hours > 0 ? uiDisplayFormat : uiDisplayFormat.slice(hoursEndIndex + 1)
}

export function isSubtitlePlaying(currentTime: number, start: number, end: number): boolean {
  return (
    +currentTime?.toFixed(2) >= +start?.toFixed(2) && +currentTime?.toFixed(2) < +end?.toFixed(2)
  )
}

export function matchStrings(s1: string, s2: string): boolean {
  return (
    s1.trim().toLowerCase().includes(s2.trim().toLowerCase()) ||
    s2.trim().toLowerCase().includes(s1.trim().toLowerCase())
  )
}

export function generateUniqueId(): string {
  return Math.random().toString(16).slice(2)
}

export function hmsToSecondsOnly(str: string): number {
  const p = str.split(':')
  let s = 0
  let m = 1
  while (p.length > 0) {
    const part = p.pop()
    if (part === undefined) break
    s += parseFloat(part) * m
    m *= 60
  }
  return s
}

export function getBackgroundDrawFunc(
  subtitleTextProps: Konva.TextConfig,
  backgroundColor: string,
  backgroundType: BackgroundType,
  borderRadius: boolean
): (context: Context, shape: Shape<ShapeConfig>) => void {
  return function (context: Context, shape: Shape<ShapeConfig>): void {
    const typecastedShape = shape as Konva.Text
    const align = subtitleTextProps?.align || 'center'
    context.fillStyle = backgroundColor || '#000000FF'
    const xAdjustment = -8
    const widthAdjustment = 12
    const heightAdjustment = 8
    const yAdjustment = -6
    if (backgroundType === BackgroundType.SINGLE) {
      const textWidth = typecastedShape.getTextWidth()
      const diff = typecastedShape.width() - textWidth
      let x = 0
      if (align === 'center') {
        x = diff / 2
      }
      if (align === 'right') {
        x = diff
      }
      x += xAdjustment
      const width = textWidth + widthAdjustment
      const height = typecastedShape.height() + heightAdjustment
      if (borderRadius) {
        context.beginPath()
        context.roundRect(x, yAdjustment, width, height, 6)
        context.fill()
      } else context.fillRect(x, yAdjustment, width, height)
    } else {
      const textNode = getKonvaTextNode(
        subtitleTextProps,
        context.canvas.width,
        context.canvas.height
      )
      let y = yAdjustment
      typecastedShape.textArr.forEach((t) => {
        textNode.setText(t.text)
        const width = t.width
        const height = textNode.height() + heightAdjustment
        const diff = typecastedShape.width() - width
        let x = 0
        if (align === 'center') {
          x = diff / 2
        }
        if (align === 'right') {
          x = diff
        }
        x += xAdjustment
        if (borderRadius) {
          context.beginPath()
          context.roundRect(x, y, width + widthAdjustment, height, 6)
          context.fill()
        } else context.fillRect(x, y, width + widthAdjustment, height)
        y += height + yAdjustment
      })
    }
    typecastedShape._sceneFunc(context)
  }
}

export async function saveStageAsImage(
  stage: Konva.Stage,
  pixelRatio: number,
  exportId: string,
  imageNumber: number
): Promise<void> {
  return new Promise((res) => {
    stage.toDataURL({
      pixelRatio: pixelRatio,
      callback: (image) => {
        window.electron.ipcRenderer
          .invoke('save-subtitle-image', image, exportId, imageNumber)
          .then(res)
      }
    })
  })
}
export async function handleBurnSubtitles(
  textProps: Konva.TextConfig,
  showBackground: boolean,
  backgroundColor: string,
  subtitles: Subtitle[],
  videoPath: string,
  canvasWidth: number,
  canvasHeight: number,
  originalVideoWidth: number,
  originalVideoHeight: number,
  backgroundType: BackgroundType,
  borderRadius: boolean
): Promise<void> {
  const exportId = generateUniqueId()
  const container = document.createElement('div')
  container.id = 'headless-konva'
  const stage = new Konva.Stage({
    container,
    width: canvasWidth,
    height: canvasHeight
  })
  const layer = new Konva.Layer()
  const text = new Konva.Text({
    ...textProps,
    sceneFunc: showBackground
      ? getBackgroundDrawFunc(textProps, backgroundColor, backgroundType, borderRadius)
      : undefined
  })
  layer.add(text)
  stage.add(layer)
  const pixelRatioX = originalVideoWidth / canvasWidth
  const pixelRatioY = originalVideoHeight / canvasHeight
  for (let i = 0; i < subtitles.length; i++) {
    const subtitle = subtitles[i]
    text.setText(subtitle.text)
    await saveStageAsImage(stage, Math.max(pixelRatioX, pixelRatioY), exportId, i + 1)
  }
  await window.electron.ipcRenderer.invoke('burn-subtitles', subtitles, exportId, videoPath)
}

export function getKonvaTextNode(
  textProps: Konva.TextConfig,
  canvasWidth: number,
  canvasHeight: number
): Konva.Text {
  const container = document.createElement('div')
  container.id = 'headless-konva'
  const stage = new Konva.Stage({
    container,
    width: canvasWidth,
    height: canvasHeight
  })
  const layer = new Konva.Layer()
  const text = new Konva.Text({
    ...textProps
  })
  layer.add(text)
  stage.add(layer)
  return text
}

import useAppStore from '@renderer/store/store'
import { useProjectStore } from './useProjectStore'
import React from 'react'
import useGetPixelRatio from './useGetPixelRatio'

export default function useCaptureFramesFromCanvas(): (
  exportId: string,
  callback: () => void
) => void {
  const setCaptureFramesPayload = useAppStore((state) => state.setCaptureFramesPayload)
  const captureFramesPayload = useAppStore((state) => state.captureFramesPayload)
  const subtitles = useProjectStore((state) => state.subtitles)
  const konvaStage = useAppStore((state) => state.konvaStage)
  const currentSubtitleIndex = React.useRef(0)
  const currentWordIndex = React.useRef(0)
  const currentStartCharacterIndex = React.useRef(0)
  const exportIdRef = React.useRef('')
  const callbackRef = React.useRef<() => void>(() => {})
  const imageNumber = React.useRef(1)
  const pixelRatio = useGetPixelRatio()
  const updateStage = (): void => {
    const currentWord =
      subtitles[currentSubtitleIndex.current].text.split(' ')[currentWordIndex.current]
    setCaptureFramesPayload({
      subtitle: subtitles[currentSubtitleIndex.current].text,
      currentWordIndex: currentWordIndex.current,
      currentStartCharacterIndex: currentStartCharacterIndex.current,
      currentEndCharacterIndex: currentStartCharacterIndex.current + currentWord.length - 1
    })
  }
  const initiateCapturing = (exportId: string, callback: () => void): void => {
    exportIdRef.current = exportId
    callbackRef.current = callback
    updateStage()
  }
  React.useEffect(() => {
    if (!captureFramesPayload || !konvaStage) return
    const start = new Date().getTime()
    const capture = (): void => {
      konvaStage.toDataURL({
        pixelRatio: pixelRatio,
        callback: (image) => {
          window.electron.ipcRenderer.invoke(
            'save-subtitle-image',
            image,
            exportIdRef.current,
            imageNumber.current
          )
          imageNumber.current++
        }
      })
      if (new Date().getTime() - start <= 300) {
        requestAnimationFrame(capture)
        return
      }
      const currentSubtitleWords = subtitles[currentSubtitleIndex.current].text.split(' ')
      const lastSubtitle = currentSubtitleIndex.current === subtitles.length - 1
      const lastWord = currentWordIndex.current === currentSubtitleWords.length - 1
      if (lastSubtitle && lastWord) {
        setCaptureFramesPayload(null)
        callbackRef.current()
        return
      }
      if (lastWord) {
        currentSubtitleIndex.current++
        currentWordIndex.current = 0
        currentStartCharacterIndex.current = 0
      } else {
        const currentWord = currentSubtitleWords[currentWordIndex.current]
        currentWordIndex.current++
        currentStartCharacterIndex.current += currentWord.length + 1
      }
      //   setTimeout(updateStage, 20)
      updateStage()
    }
    capture()
  }, [captureFramesPayload])

  return initiateCapturing
}

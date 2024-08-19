import React from 'react'
import { useProjectStore } from './useProjectStore'
import { Subtitle } from '@renderer/store/store'
import { isSubtitlePlaying } from '@renderer/components/Editor/Subtitles/SubtitleList/SubtitleList.utils'

interface SubtitleWithWordIndex extends Subtitle {
  currentWordIndex: number
  currentStartCharacterIndex: number
  currentEndCharacterIndex: number
}

export default function useGetSubtitleFromTime(): SubtitleWithWordIndex | null {
  const subtitles = useProjectStore((state) => state.subtitles)
  const currentTime = useProjectStore((state) => state.mediaCurrentTime)
  const getSubtitleFromTime = React.useCallback(
    (time: number) => {
      let low = 0
      let high = subtitles.length - 1

      while (low <= high) {
        const mid = Math.floor((low + high) / 2)
        const subtitle = subtitles[mid]

        if (isSubtitlePlaying(time, subtitle.start, subtitle.end)) {
          const words = subtitle.text.split(' ')
          const subtitleDuration = subtitle.end - subtitle.start
          const timeIntoSubtitle = time - subtitle.start
          const wordDuration = subtitleDuration / words.length
          const currentWordIndex = Math.floor(timeIntoSubtitle / wordDuration)
          let currentStartCharacterIndex = 0
          let currentEndCharacterIndex = 0
          let charIndex = 0
          for (let i = 0; i < words.length; i++) {
            const wordLength = words[i].length
            const startCharIndex = charIndex
            const endCharIndex = charIndex + wordLength - 1

            if (i === currentWordIndex) {
              currentStartCharacterIndex = startCharIndex
              currentEndCharacterIndex = endCharIndex
              break
            }
            charIndex += wordLength + 1 // +1 to account for the space
          }

          return {
            ...subtitle,
            currentWordIndex: Math.min(currentWordIndex, words.length - 1),
            currentStartCharacterIndex,
            currentEndCharacterIndex
          }
        } else if (time < subtitle.start) {
          high = mid - 1
        } else {
          low = mid + 1
        }
      }

      return null
    },
    [subtitles]
  )
  const subtitle = React.useMemo(
    () => getSubtitleFromTime(currentTime),
    [currentTime, getSubtitleFromTime]
  )
  return subtitle
}

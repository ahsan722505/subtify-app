import React from 'react'
import { useProjectStore } from './useProjectStore'
import { Subtitle } from '@renderer/store/store'
import { isSubtitlePlaying } from '@renderer/components/Editor/Subtitles/SubtitleList/SubtitleList.utils'

export default function useGetSubtitleFromTime(): Subtitle | null {
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
          return subtitle
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

import React from 'react'
import { useProjectStore } from './useProjectStore'
import { Subtitle } from '@renderer/store/store'

const precision = 0.01
export default function useGetSubtitleFromTime(): Subtitle | null {
  const subtitles = useProjectStore((state) => state.subtitles)
  const currentTime = useProjectStore((state) => state.mediaCurrentTime)
  const lookupTable = React.useMemo(() => {
    const lookupTable = new Map<number, number>()
    subtitles.forEach((sub, index) => {
      for (let time = sub.start; time <= sub.end; time += precision) {
        const roundedTime = Math.floor(time / precision) * precision
        lookupTable.set(roundedTime, index)
      }
    })
    return lookupTable
  }, [subtitles])
  const time = currentTime
  const key = Math.floor(time / precision) * precision
  const index = lookupTable.get(key)
  return index !== undefined ? subtitles[index] : null
}

import {
  PlayCircleFilled,
  PauseCircleFilled,
  StepForwardFilled,
  StepBackwardFilled
} from '@ant-design/icons'
import React from 'react'
import { formatTime } from '../Subtitles/SubtitleList/SubtitleList.utils'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import useAppStore from '@renderer/store/store'
export default function ControlPanel(): JSX.Element {
  const mediaPath = useProjectStore((state) => state.mediaPath)
  const mediaRef = React.useRef<HTMLVideoElement | HTMLAudioElement | null>(null)
  const [isMediaPlaying, setMediaPlaying] = React.useState(false)
  const currentTime = useProjectStore((state) => state.mediaCurrentTime)
  const duration = useProjectStore((state) => state.mediaDuration)
  const setCurrentTime = useAppStore((state) => state.setMediaCurrentTime)
  const setDuration = useAppStore((state) => state.setMediaDuration)

  React.useEffect(() => {
    const handleUpdateCurrentTime = (): void => {
      setCurrentTime(mediaRef.current?.currentTime || 0)
      handleUpdateDuration()
    }
    const handleUpdateDuration = (): void => setDuration(mediaRef.current?.duration || 0)
    const handleMediaEnded = (): void => setMediaPlaying(false)
    if (mediaPath) {
      mediaRef.current = document.getElementById('media') as HTMLVideoElement
      mediaRef.current.addEventListener('ended', handleMediaEnded)
      mediaRef.current.addEventListener('timeupdate', handleUpdateCurrentTime)
      mediaRef.current.addEventListener('loadedmetadata', handleUpdateDuration)
    }
    return () => {
      if (mediaRef.current) {
        mediaRef.current.removeEventListener('timeupdate', handleUpdateCurrentTime)
        mediaRef.current.removeEventListener('loadedmetadata', handleUpdateDuration)
        mediaRef.current.removeEventListener('ended', handleMediaEnded)
      }
    }
  }, [mediaPath])

  const handelPlayMedia = (): void => {
    if (!mediaRef.current) return
    mediaRef.current.play()
    setMediaPlaying(true)
  }

  const handelPauseMedia = (): void => {
    if (!mediaRef.current) return
    mediaRef.current.pause()
    setMediaPlaying(false)
  }

  const handelForwardMedia = (): void => {
    if (!mediaRef.current) return
    mediaRef.current.currentTime = Math.min(
      mediaRef.current.duration,
      mediaRef.current.currentTime + 10
    )
  }

  const handelRewindMedia = (): void => {
    if (!mediaRef.current) return
    mediaRef.current.currentTime = Math.max(0, mediaRef.current.currentTime - 10)
  }

  return (
    <div className="w-full h-full flex justify-center items-center">
      <StepBackwardFilled
        onClick={handelRewindMedia}
        className="text-5xl text-black-500 cursor-pointer"
      />

      {!isMediaPlaying && (
        <PlayCircleFilled
          onClick={handelPlayMedia}
          className="text-5xl text-black-500 cursor-pointer"
        />
      )}

      {isMediaPlaying && (
        <PauseCircleFilled
          onClick={handelPauseMedia}
          className="text-5xl text-black-500 cursor-pointer"
        />
      )}

      <StepForwardFilled
        onClick={handelForwardMedia}
        className="text-5xl text-black-500 cursor-pointer"
      />
      <div className="ml-4">
        {formatTime(currentTime)}
        <span className="mx-2">/</span>
        {formatTime(duration)}
      </div>
    </div>
  )
}

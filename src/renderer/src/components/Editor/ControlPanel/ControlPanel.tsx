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
  const fileNotFound = useProjectStore((state) => state.fileNotFound)

  React.useEffect(() => {
    const handleUpdateTime = (): void => {
      setCurrentTime(mediaRef.current?.currentTime || 0)
      setDuration(mediaRef.current?.duration || 0)
    }
    const handleMediaEnded = (): void => setMediaPlaying(false)
    mediaRef.current = document.getElementById('media') as HTMLVideoElement
    if (mediaPath && mediaRef.current) {
      mediaRef.current.addEventListener('ended', handleMediaEnded)
      mediaRef.current.addEventListener('timeupdate', handleUpdateTime)
      mediaRef.current.addEventListener('loadedmetadata', handleUpdateTime)
    }
    return () => {
      if (mediaRef.current) {
        mediaRef.current.removeEventListener('timeupdate', handleUpdateTime)
        mediaRef.current.removeEventListener('loadedmetadata', handleUpdateTime)
        mediaRef.current.removeEventListener('ended', handleMediaEnded)
      }
    }
  }, [mediaPath, fileNotFound])

  const handelPlayMedia = (): void => {
    if (!mediaRef.current || fileNotFound) return
    mediaRef.current.play()
    setMediaPlaying(true)
  }

  const handelPauseMedia = (): void => {
    if (!mediaRef.current || fileNotFound) return
    mediaRef.current.pause()
    setMediaPlaying(false)
  }

  const handelForwardMedia = (): void => {
    if (!mediaRef.current || fileNotFound) return
    mediaRef.current.currentTime = Math.min(
      mediaRef.current.duration,
      mediaRef.current.currentTime + 10
    )
  }

  const handelRewindMedia = (): void => {
    if (!mediaRef.current || fileNotFound) return
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

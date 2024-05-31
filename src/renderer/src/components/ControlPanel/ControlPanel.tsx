import {
  PlayCircleFilled,
  PauseCircleFilled,
  StepForwardFilled,
  StepBackwardFilled
} from '@ant-design/icons'
import useTranscriptionStore from '@renderer/store/transcription'
import React from 'react'
export default function ControlPanel(): JSX.Element {
  const file = useTranscriptionStore((state) => state.file)
  const mediaRef = React.useRef<HTMLVideoElement | HTMLAudioElement | null>(null)
  const [isMediaPlaying, setMediaPlaying] = React.useState(false)

  React.useEffect(() => {
    if (file) {
      mediaRef.current = document.getElementById('media') as HTMLVideoElement
      mediaRef.current.addEventListener('ended', () => setMediaPlaying(false))
    }
  }, [file])

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
        className="text-6xl text-black-500 cursor-pointer"
      />

      {!isMediaPlaying && (
        <PlayCircleFilled
          onClick={handelPlayMedia}
          className="text-6xl text-black-500 cursor-pointer"
        />
      )}

      {isMediaPlaying && (
        <PauseCircleFilled
          onClick={handelPauseMedia}
          className="text-6xl text-black-500 cursor-pointer"
        />
      )}

      <StepForwardFilled
        onClick={handelForwardMedia}
        className="text-6xl text-black-500 cursor-pointer"
      />
    </div>
  )
}

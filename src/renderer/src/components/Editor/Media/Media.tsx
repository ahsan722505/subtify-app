import { useProjectStore } from '@renderer/hooks/useProjectStore'
import React from 'react'
import { PlaySquareFilled } from '@ant-design/icons'
import { isVideo } from './Media.utils'
import CanvasEditor from './CanvasEditor'
// import { isSubtitlePlaying } from '../Subtitles/SubtitleList/SubtitleList.utils'

function Media(): JSX.Element {
  const mediaPath = useProjectStore((state) => state.mediaPath)
  const currentTime = useProjectStore((state) => state.mediaCurrentTime)
  const mediaType = useProjectStore((state) => state.mediaType)
  const currentSubtitleIndex = useProjectStore((state) => state.currentSubtitleIndex)
  const subtitles = useProjectStore((state) => state.subtitles)
  const mediaRef = React.useRef<HTMLVideoElement | null>(null)
  const [canvasWidth, setCanvasWidth] = React.useState<number>(0)
  const [canvasHeight, setCanvasHeight] = React.useState<number>(0)

  console.log('sub', currentSubtitleIndex)

  React.useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = currentTime
    }
  }, [mediaPath])

  React.useEffect(() => {
    const handleSetStageSize = (): void => {
      setCanvasWidth(mediaRef.current?.clientWidth || 0)
      setCanvasHeight(mediaRef.current?.clientHeight || 0)
    }
    mediaRef.current?.addEventListener('loadedmetadata', handleSetStageSize)
    return () => {
      mediaRef.current?.removeEventListener('loadedmetadata', handleSetStageSize)
    }
  }, [])

  const currentSubtitle = currentSubtitleIndex !== null && subtitles[currentSubtitleIndex]

  console.log('sub9', currentSubtitle)
  return (
    <div className="w-full h-full flex flex-col items-center justify-start relative">
      {mediaPath && mediaType ? (
        <>
          {isVideo(mediaType) ? (
            <div className="w-10/12 h-[80%] relative">
              <video
                ref={mediaRef}
                key={mediaPath}
                id="media"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-full"
              >
                <source src={`file://${mediaPath}`} type={mediaType} />
                Your browser does not support the video tag.
              </video>
              {canvasWidth && canvasHeight && currentSubtitle && (
                <CanvasEditor
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  width={canvasWidth}
                  height={canvasHeight}
                  subtitle={currentSubtitle.text}
                />
              )}
            </div>
          ) : (
            <>
              <audio ref={mediaRef} key={mediaPath} id="media" className="w-10/12 h-[80%]">
                <source src={`file://${mediaPath}`} type={mediaType} />
                Your browser does not support the audio tag.
              </audio>
              <PlaySquareFilled className="text-9xl text-gray-300 h-48 absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </>
          )}
        </>
      ) : (
        <PlaySquareFilled className="text-9xl text-gray-300 h-48 absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      )}
    </div>
  )
}

export default Media

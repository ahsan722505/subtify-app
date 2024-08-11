import { useProjectStore } from '@renderer/hooks/useProjectStore'
import React from 'react'
import { PlaySquareFilled } from '@ant-design/icons'
import { checkFileExistence, isVideo } from './Media.utils'
import CanvasEditor from './CanvasEditor'
import useAppStore from '@renderer/store/store'
import { Empty, Spin } from 'antd'
import useGetSubtitleFromTime from '@renderer/hooks/useGetSubtitleIndexFromTime'

function Media(): JSX.Element {
  const mediaPath = useProjectStore((state) => state.mediaPath)
  const mediaType = useProjectStore((state) => state.mediaType)
  const initializeSubtitleStyleProps = useAppStore((state) => state.initializeSubtitleStyleProps)
  const setCanvasWidth = useAppStore((state) => state.setCanvasWidth)
  const setCanvasHeight = useAppStore((state) => state.setCanvasHeight)
  const canvasWidth = useProjectStore((state) => state.canvasWidth)
  const canvasHeight = useProjectStore((state) => state.canvasHeight)
  const fileNotFound = useProjectStore((state) => state.fileNotFound)
  const setFileNotFound = useAppStore((state) => state.setFileNotFound)
  const mediaRef = React.useRef<HTMLVideoElement | null>(null)
  const currentSubtitle = useGetSubtitleFromTime()

  React.useEffect(() => {
    const handleSetParameters = (): void => {
      const width = mediaRef.current?.clientWidth || 0
      const height = mediaRef.current?.clientHeight || 0
      setCanvasWidth(width)
      setCanvasHeight(height)
      initializeSubtitleStyleProps({
        fill: 'white',
        fontSize: 24,
        id: 'subtitle',
        x: 0,
        y: height / 2,
        align: 'center',
        width
      })
    }
    if (mediaPath) checkFileExistence(mediaPath).then((exists) => setFileNotFound(!exists))
    mediaRef.current?.addEventListener('loadedmetadata', handleSetParameters)
    return () => {
      mediaRef.current?.removeEventListener('loadedmetadata', handleSetParameters)
    }
  }, [mediaPath])

  console.log('cuurent word', currentSubtitle?.currentWordIndex)

  return (
    <div className="w-full h-full flex flex-col items-center justify-start relative">
      {mediaPath && mediaType ? (
        fileNotFound ? (
          <Empty
            className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            description={
              <div>
                <span className="text-lg">File not Found</span>
                <br />
                <span className="text-lg">Make sure that file exists at following path:</span>
                <br />
                <br />
                <span>{mediaPath}</span>
              </div>
            }
          />
        ) : (
          <>
            {isVideo(mediaType) ? (
              <div className="w-10/12 h-[80%] relative">
                <video
                  ref={mediaRef}
                  key={mediaPath}
                  id="media"
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-full"
                >
                  <source src={`file://${mediaPath}`} />
                  Your browser does not support the video tag.
                </video>
                {Boolean(canvasWidth) && Boolean(canvasHeight) ? (
                  <CanvasEditor
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    width={canvasWidth}
                    height={canvasHeight}
                    subtitle={currentSubtitle && currentSubtitle.text}
                    currentWordIndex={currentSubtitle && currentSubtitle.currentWordIndex}
                  />
                ) : (
                  <Spin
                    size="large"
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
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
        )
      ) : (
        <PlaySquareFilled className="text-9xl text-gray-300 h-48 absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      )}
    </div>
  )
}

export default Media

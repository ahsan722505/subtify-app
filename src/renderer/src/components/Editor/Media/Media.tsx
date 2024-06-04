import { useProjectStore } from '@renderer/hooks/useProjectStore'
import React from 'react'
import { PlaySquareFilled } from '@ant-design/icons'
import { isVideo } from './Media.utils'

function Media(): JSX.Element {
  const mediaPath = useProjectStore((state) => state.mediaPath)
  const mediaRef = React.useRef<HTMLVideoElement | HTMLAudioElement | null>(null)
  const currentTime = useProjectStore((state) => state.mediaCurrentTime)
  const mediaType = useProjectStore((state) => state.mediaType)

  React.useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = currentTime
    }
  }, [mediaPath])
  return (
    <div className="w-full h-full flex flex-col items-center justify-start relative">
      {mediaPath && mediaType ? (
        <>
          {isVideo(mediaType) ? (
            <video
              ref={mediaRef as React.MutableRefObject<HTMLVideoElement>}
              key={mediaPath}
              id="media"
              className="w-10/12 h-[80%]"
            >
              <source src={`file://${mediaPath}`} type={mediaType} />
              Your browser does not support the video tag.
            </video>
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

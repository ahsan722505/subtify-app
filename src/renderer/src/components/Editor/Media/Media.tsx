import { useProjectStore } from '@renderer/hooks/useProjectStore'
import React from 'react'

function Media(): JSX.Element {
  const mediaPath = useProjectStore((state) => state.mediaPath)
  const mediaRef = React.useRef<HTMLVideoElement | null>(null)
  return (
    <div className="w-full h-full flex flex-col items-center justify-evenly">
      {mediaPath && (
        <video ref={mediaRef} key={mediaPath} id="media" className="w-10/12 h-[80%]">
          <source src={`serve-file://${mediaPath}`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  )
}

export default Media

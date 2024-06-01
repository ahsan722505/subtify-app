import useTranscriptionStore from '@renderer/store/transcription'
import React from 'react'

function Media(): JSX.Element {
  const file = useTranscriptionStore((state) => state.file)
  const mediaRef = React.useRef<HTMLVideoElement | null>(null)
  return (
    <div className="w-full h-full flex flex-col items-center justify-evenly">
      {file && (
        <video ref={mediaRef} key={file.name} id="media" className="w-10/12 h-[80%]">
          <source src={URL.createObjectURL(file)} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  )
}

export default Media

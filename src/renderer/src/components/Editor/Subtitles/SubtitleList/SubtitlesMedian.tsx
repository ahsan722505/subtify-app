import useAppStore from '@renderer/store/store'
import React from 'react'

export default React.memo(function SubtitlesMedian({ index }: { index: number }): JSX.Element {
  const insertSubtitleLine = useAppStore((state) => state.insertSubtitleLine)

  return (
    <div className="py-[10px] opacity-0 hover:opacity-100 cursor-pointer relative">
      <hr className="bg-black h-1" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <span
          onClick={() => insertSubtitleLine(index + 1)}
          className="px-3 rounded-xl border border-black bg-white mr-3"
        >
          Add line
        </span>
        <span className="px-3 rounded-xl border border-black bg-white">Merge</span>
      </div>
    </div>
  )
})

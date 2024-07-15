import useAppStore from '@renderer/store/store'
import clsx from 'clsx'
import React from 'react'

export default React.memo(function SubtitlesMedian({
  currentIndex,
  currentEnd,
  nextStart,
  lastIndex
}: {
  currentIndex: number
  currentEnd: number
  nextStart: number
  lastIndex: number
}): JSX.Element {
  const insertSubtitleLine = useAppStore((state) => state.insertSubtitleLine)
  const mergeSubtitleLines = useAppStore((state) => state.mergeSubtitleLines)

  const disableInsert = currentEnd === nextStart
  const disableMerge = currentIndex === lastIndex

  const handleInsert = (): void => {
    if (disableInsert) return
    insertSubtitleLine(currentIndex + 1)
  }
  const handleMerge = (): void => {
    if (disableMerge) return
    mergeSubtitleLines(currentIndex, currentIndex + 1)
  }

  return (
    <div className="py-[10px] opacity-0 hover:opacity-100 cursor-pointer relative">
      <hr className="bg-black h-1" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <span
          onClick={handleInsert}
          className={clsx(
            'px-3 rounded-xl border border-black bg-white mr-3',
            disableInsert && 'cursor-not-allowed'
          )}
        >
          Add line
        </span>

        <span
          onClick={handleMerge}
          className={clsx(
            'px-3 rounded-xl border border-black bg-white',
            disableMerge && 'cursor-not-allowed'
          )}
        >
          Merge
        </span>
      </div>
    </div>
  )
})

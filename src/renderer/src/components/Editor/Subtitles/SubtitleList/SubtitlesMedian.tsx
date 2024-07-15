import useAppStore from '@renderer/store/store'
import clsx from 'clsx'
import React from 'react'

export default React.memo(function SubtitlesMedian({
  id,
  disableInsert,
  disableMerge
}: {
  id: string
  disableInsert: boolean
  disableMerge: boolean
}): JSX.Element {
  const insertSubtitleLine = useAppStore((state) => state.insertSubtitleLine)
  const mergeSubtitleLines = useAppStore((state) => state.mergeSubtitleLines)

  const handleInsert = (): void => {
    if (disableInsert) return
    insertSubtitleLine(id)
  }
  const handleMerge = (): void => {
    if (disableMerge) return
    mergeSubtitleLines(id)
  }

  console.log('ree-rendering', id)

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

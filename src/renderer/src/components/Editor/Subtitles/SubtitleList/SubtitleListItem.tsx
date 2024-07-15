import { ClockCircleOutlined } from '@ant-design/icons'
import { formatTime } from './SubtitleList.utils'
import React from 'react'
import clsx from 'clsx'
import { Input } from 'antd'
import useAppStore, { Subtitle } from '@renderer/store/store'
import { DeleteFilled } from '@ant-design/icons'
import { useDebouncedCallback } from 'use-debounce'
const { TextArea } = Input

export default React.memo(function SubtitleListItem({
  end,
  start,
  text: globalText,
  currentlyPlaying,
  id
}: Subtitle & { currentlyPlaying: boolean }): JSX.Element {
  const editSubtitle = useAppStore((state) => state.editSubtitle)
  const setCurrentSubtitleIndex = useAppStore((state) => state.setCurrentSubtitleIndex)
  const deleteSubtitleLine = useAppStore((state) => state.deleteSubtitleLine)
  const subtitleRef = React.useRef<HTMLDivElement>(null)
  const [localText, setLocalText] = React.useState(globalText)
  const debounced = useDebouncedCallback((value) => {
    editSubtitle(id, value)
  }, 1000)

  React.useEffect(() => {
    // If the global text changes, update the local text
    setLocalText(globalText)
  }, [globalText])

  React.useEffect(() => {
    if (currentlyPlaying) {
      setCurrentSubtitleIndex(id)
      subtitleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentlyPlaying])

  const handleSeek = (): void => {
    const media = document.getElementById('media') as HTMLVideoElement
    media.currentTime = start
  }

  const handleDeleteSubtitle = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>): void => {
    e.stopPropagation()
    deleteSubtitleLine(id)
  }

  console.log('re-rendering', id)
  return (
    <div
      onClick={handleSeek}
      ref={subtitleRef}
      className={clsx('flex justify-between items-center pr-2', currentlyPlaying && '!bg-gray-300')}
    >
      <TextArea
        placeholder="New Text"
        onChange={(e) => {
          setLocalText(e.target.value)
          debounced(e.target.value)
        }}
        value={localText}
        className="w-2/3 border-none focus:ring-0 text-base overflow-hidden bg-inherit focus:bg-inherit hover:bg-inherit"
        autoSize
      />
      <div className="flex">
        <div className="mr-4">
          <div className="flex justify-between items-center">
            <span className="text-xs mr-4">
              <ClockCircleOutlined /> In
            </span>
            <span>{formatTime(start)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs mr-4">
              <ClockCircleOutlined /> Out
            </span>
            <span>{formatTime(end)}</span>
          </div>
        </div>
        <DeleteFilled
          onClick={handleDeleteSubtitle}
          className="text-black cursor-pointer hover:text-red-500"
        />
      </div>
    </div>
  )
})

import { ClockCircleOutlined } from '@ant-design/icons'
import { formatTime } from './SubtitleList.utils'
import { useDebouncedCallback } from '@renderer/hooks/useDebouncedCallback'
import React from 'react'
import clsx from 'clsx'
import { Input } from 'antd'
import useAppStore, { Subtitle } from '@renderer/store/store'
import { DeleteFilled } from '@ant-design/icons'
const { TextArea } = Input

export default React.memo(function SubtitleListItem({
  end,
  start,
  text,
  index,
  currentlyPlaying
}: Subtitle & { index: number; currentlyPlaying: boolean }): JSX.Element {
  const editSubtitle = useAppStore((state) => state.editSubtitle)
  const setCurrentSubtitleIndex = useAppStore((state) => state.setCurrentSubtitleIndex)
  const handleEdit = useDebouncedCallback((e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    editSubtitle(index, e.target.value)
  })
  const subtitleRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (currentlyPlaying) {
      setCurrentSubtitleIndex(index)
      subtitleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentlyPlaying])

  const handleSeek = (): void => {
    const media = document.getElementById('media') as HTMLVideoElement
    media.currentTime = start
  }

  return (
    <div
      onClick={handleSeek}
      ref={subtitleRef}
      className={clsx('flex justify-between items-center pr-2', currentlyPlaying && '!bg-gray-300')}
    >
      <TextArea
        placeholder="New Text"
        onChange={handleEdit}
        defaultValue={text}
        className="w-2/3 border-none focus:ring-0 text-base overflow-hidden bg-inherit focus:bg-inherit hover:bg-inherit"
        autoSize
      />
      <div>
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
      <DeleteFilled className="text-red-500 cursor-pointer" />
    </div>
  )
})

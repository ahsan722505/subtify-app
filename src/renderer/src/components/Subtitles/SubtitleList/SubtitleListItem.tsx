import useTranscriptionStore, { Subtitle } from '@renderer/store/transcription'
import { ClockCircleOutlined } from '@ant-design/icons'
import { formatTime } from './SubtitleList.utils'
import { useDebouncedCallback } from '@renderer/hooks/useDebouncedCallback'
import React from 'react'
import { Input } from 'antd'
import clsx from 'clsx'
const { TextArea } = Input

export default function SubtitleListItem({
  end,
  start,
  text,
  index
}: Subtitle & { index: number }): JSX.Element {
  const editSubtitle = useTranscriptionStore((state) => state.editSubtitle)
  const handleEdit = useDebouncedCallback((e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    editSubtitle(index, e.target.value)
  })
  const subtitleRef = React.useRef<HTMLDivElement>(null)
  const currentTime = useTranscriptionStore((state) => state.mediaCurrentTime)
  const currentlyPlaying =
    +currentTime.toFixed(2) >= +start.toFixed(2) && +currentTime.toFixed(2) < +end.toFixed(2)

  React.useEffect(() => {
    if (currentlyPlaying && subtitleRef.current) {
      subtitleRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
      className={clsx(
        'flex justify-between items-center mb-5 pr-2',
        currentlyPlaying && '!bg-gray-300'
      )}
    >
      <TextArea
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
    </div>
  )
}

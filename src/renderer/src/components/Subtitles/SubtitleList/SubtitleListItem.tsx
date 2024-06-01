import useTranscriptionStore, { Subtitle } from '@renderer/store/transcription'
import { ClockCircleOutlined } from '@ant-design/icons'
import { formatTime } from './SubtitleList.utils'
import { useDebouncedCallback } from '@renderer/hooks/useDebouncedCallback'
import React from 'react'
import { Input } from 'antd'
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

  return (
    <div className="flex justify-between items-center mb-5">
      <TextArea
        onChange={handleEdit}
        defaultValue={text}
        className="w-2/3 border-none focus:ring-0 text-base overflow-hidden"
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

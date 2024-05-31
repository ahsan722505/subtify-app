import useTranscriptionStore, { Subtitle } from '@renderer/store/transcription'
import { ClockCircleOutlined } from '@ant-design/icons'
import { formatTime } from './SubtitleList.utils'

export default function SubtitleListItem({
  end,
  start,
  text,
  index
}: Subtitle & { index: number }): JSX.Element {
  const editSubtitle = useTranscriptionStore((state) => state.editSubtitle)
  const handleEdit = (e: React.ChangeEvent<HTMLInputElement>): void => {
    editSubtitle(index, e.target.value)
  }

  return (
    <div className="flex justify-between items-center mb-5">
      <input value={text} onChange={handleEdit} className="w-2/3 outline-none" />
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

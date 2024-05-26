import useTranscriptionStore from '@renderer/store/transcription'
import { ClockCircleOutlined } from '@ant-design/icons'

export default function SubtitleList(): JSX.Element {
  const subtitles = useTranscriptionStore((state) => state.subtitles)
  function secondsToHms(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60

    const hDisplay = h < 10 ? '0' + h : h
    const mDisplay = m < 10 ? '0' + m : m
    const sDisplay = s < 10 ? '0' + s.toFixed(1) : s.toFixed(1)

    return `${h > 0 ? hDisplay + ':' : ''}${mDisplay}:${sDisplay}`
  }
  return (
    <div>
      {subtitles.map((s) => (
        <div className="flex justify-between items-center mb-5" key={s.start}>
          <div className="w-2/3">{s.text}</div>
          <div>
            <div className="flex justify-between items-center">
              <span className="text-xs mr-4">
                <ClockCircleOutlined /> In
              </span>
              <span>{secondsToHms(s.start)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs mr-4">
                <ClockCircleOutlined /> Out
              </span>
              <span>{secondsToHms(s.end)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

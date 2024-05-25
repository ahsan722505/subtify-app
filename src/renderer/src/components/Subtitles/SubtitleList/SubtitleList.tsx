import useTranscriptionStore from '@renderer/store/transcription'

export default function SubtitleList(): JSX.Element {
  const subtitles = useTranscriptionStore((state) => state.subtitles)
  return <div>{subtitles}</div>
}

import UploadFile from './UploadFile/UploadFile'
import GenerationProgress from './GenerationProgress/GenerationProgress'
import useTranscriptionStore, { TranscriptionStatus } from '@renderer/store/transcription'
import SubtitleList from './SubtitleList/SubtitleList'

function Subtitles(): JSX.Element {
  const status = useTranscriptionStore((state) => state.transcriptionStatus)
  return (
    <div className="w-full h-full p-6">
      {status === TranscriptionStatus.IDLE && <UploadFile />}
      {status === TranscriptionStatus.LOADING && <GenerationProgress />}
      {status === TranscriptionStatus.SUCCESS && <SubtitleList />}
    </div>
  )
}

export default Subtitles

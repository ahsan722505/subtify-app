import UploadFile from './UploadFile/UploadFile'
import GenerationProgress from './GenerationProgress/GenerationProgress'
import SubtitleList from './SubtitleList/SubtitleList'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import { TranscriptionStatus } from '@renderer/store/store'

function Subtitles(): JSX.Element {
  const status = useProjectStore((state) => state.transcriptionStatus)
  return (
    <div className="w-full h-full p-6">
      {status === TranscriptionStatus.IDLE && <UploadFile />}
      {status === TranscriptionStatus.LOADING && <GenerationProgress />}
      {status === TranscriptionStatus.SUCCESS && <SubtitleList />}
    </div>
  )
}

export default Subtitles

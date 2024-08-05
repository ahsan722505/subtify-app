import GenerationProgress from './GenerationProgress/GenerationProgress'
import MediaInput from './MediaInput/MediaInput'
import SubtitleList from './SubtitleList/SubtitleList'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import { TranscriptionStatus } from '@renderer/store/store'
import SubtitleTypeInput from './SubtitleTypeInput/SubtitleTypeInput'
import AutoSubtitleInput from './AutoSubtitleInput/AutoSubtitleInput'
import SubtitleStyles from './SubtitleStyles/SubtitleStyles'
import SubtitleAnimations from './SubtitleAnimations/SubtitleAnimations'

function Subtitles(): JSX.Element {
  const status = useProjectStore((state) => state.transcriptionStatus)
  return (
    <div className="w-full h-full p-6">
      {status === TranscriptionStatus.MediaInput && <MediaInput />}
      {status === TranscriptionStatus.SubtitleTypeInput && <SubtitleTypeInput />}
      {status === TranscriptionStatus.AutoSubtitleInput && <AutoSubtitleInput />}
      {status === TranscriptionStatus.LOADING && <GenerationProgress />}
      {status === TranscriptionStatus.SUCCESS && <SubtitleList />}
      {status === TranscriptionStatus.STYLES && <SubtitleStyles />}
      {status === TranscriptionStatus.ANIMATIONS && <SubtitleAnimations />}
    </div>
  )
}

export default Subtitles

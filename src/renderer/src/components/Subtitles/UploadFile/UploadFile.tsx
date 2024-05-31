import { Button, Upload, UploadProps } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import useTranscriptionStore, { TranscriptionStatus } from '@renderer/store/transcription'

function UploadFile(): JSX.Element {
  const setStatus = useTranscriptionStore((state) => state.setTranscriptionStatus)
  const setProgress = useTranscriptionStore((state) => state.setSubtitleGenerationProgress)
  const setSubtitles = useTranscriptionStore((state) => state.setSubtitles)
  const file = useTranscriptionStore((state) => state.file)
  const setFile = useTranscriptionStore((state) => state.setFile)

  const props: UploadProps = {
    accept:
      'audio/mp3, audio/wav, audio/mpeg, audio/ogg, audio/flac, audio/aac, audio/aiff, audio/wma, audio/opus, audio/webm, video/mp4, video/ogg, video/webm',
    customRequest: async ({ file }) => setFile(file as File),
    showUploadList: false
  }

  const handleCreateSubtitles = async (): Promise<void> => {
    if (!file) return
    setStatus(TranscriptionStatus.LOADING)
    let progress = 0
    const estimatedTime = 60000 // 1 minute
    const interval = estimatedTime / 100
    const intervalId = setInterval(() => {
      progress += 1
      setProgress(progress)
      if (progress === 95) {
        clearInterval(intervalId)
      }
    }, interval)
    const subtitles = await window.electron.ipcRenderer.invoke('transcribe', file.path)
    setStatus(TranscriptionStatus.SUCCESS)
    setSubtitles(subtitles)
  }
  return (
    <div className="w-full h-full flex flex-col items-center justify-evenly">
      <Upload {...props}>
        <Button className="mb-4" type="primary" icon={<UploadOutlined />}>
          Upload audio/video file
        </Button>
      </Upload>
      <Button onClick={handleCreateSubtitles} disabled={!file}>
        Create Subtitles
      </Button>
    </div>
  )
}

export default UploadFile

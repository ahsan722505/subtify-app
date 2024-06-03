import { Button, Upload, UploadProps } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import useAppStore, { TranscriptionStatus } from '@renderer/store/store'
import { useProjectStore } from '@renderer/hooks/useProjectStore'

function UploadFile(): JSX.Element {
  const setStatus = useAppStore((state) => state.setTranscriptionStatus)
  const setProgress = useAppStore((state) => state.setSubtitleGenerationProgress)
  const setSubtitles = useAppStore((state) => state.setSubtitles)
  const setMediaPath = useAppStore((state) => state.setMediaPath)
  const setMediaName = useAppStore((state) => state.setMediaName)
  const mediaPath = useProjectStore((state) => state.mediaPath)
  console.log(mediaPath)

  const props: UploadProps = {
    accept:
      'audio/mp3, audio/wav, audio/mpeg, audio/ogg, audio/flac, audio/aac, audio/aiff, audio/wma, audio/opus, audio/webm, video/mp4, video/ogg, video/webm',
    customRequest: async ({ file }) => {
      const typecastedFile = file as File
      setMediaPath(typecastedFile.path)
      setMediaName(typecastedFile.name)
    },
    showUploadList: false
  }

  const handleCreateSubtitles = async (): Promise<void> => {
    if (!mediaPath) return
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
    const subtitles = await window.electron.ipcRenderer.invoke('transcribe', mediaPath)
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
      <Button onClick={handleCreateSubtitles} disabled={!mediaPath}>
        Create Subtitles
      </Button>
    </div>
  )
}

export default UploadFile

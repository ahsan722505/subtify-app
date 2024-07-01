import { Button, Upload, UploadProps, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import useAppStore, { TranscriptionStatus } from '@renderer/store/store'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import { generateVideoThumbnail, isVideo } from '../../Media/Media.utils'

function UploadFile(): JSX.Element {
  const setStatus = useAppStore((state) => state.setTranscriptionStatus)
  const setSubtitles = useAppStore((state) => state.setSubtitles)
  const setMediaPath = useAppStore((state) => state.setMediaPath)
  const setMediaName = useAppStore((state) => state.setMediaName)
  const mediaPath = useProjectStore((state) => state.mediaPath)
  const currentProjectIndex = useAppStore((state) => state.currentProjectIndex)
  const setMediaThumbnail = useAppStore((state) => state.setMediaThumbnail)
  const setMediaType = useAppStore((state) => state.setMediaType)
  const supportedFormats = [
    'audio/mp3',
    'audio/wav',
    'audio/mpeg',
    'audio/ogg',
    'audio/flac',
    'audio/aac',
    'audio/webm',
    'video/mp4',
    'video/webm'
  ]

  const props: UploadProps = {
    accept: supportedFormats.join(', '),
    customRequest: async ({ file }) => {
      const typecastedFile = file as File
      const type = typecastedFile.type
      if (!supportedFormats.includes(type)) message.error('File format is not supported.')
      else {
        setMediaPath(typecastedFile.path)
        setMediaName(typecastedFile.name)
        setMediaType(typecastedFile.type)
        if (isVideo(typecastedFile.type))
          setMediaThumbnail(await generateVideoThumbnail(`file://${typecastedFile.path}`))
      }
    },
    showUploadList: false
  }

  const handleCreateSubtitles = async (): Promise<void> => {
    if (!mediaPath || currentProjectIndex === null) return
    setStatus(TranscriptionStatus.LOADING, currentProjectIndex)
    const subtitles = await window.electron.ipcRenderer.invoke('transcribe', mediaPath)
    setStatus(TranscriptionStatus.SUCCESS, currentProjectIndex)
    setSubtitles(subtitles, currentProjectIndex)
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

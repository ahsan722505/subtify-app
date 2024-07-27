import { Button, Upload, UploadProps, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import useAppStore, { TranscriptionStatus } from '@renderer/store/store'
import { generateVideoThumbnail, isVideo } from '../../Media/Media.utils'

export default function MediaInput(): JSX.Element {
  const setMediaPath = useAppStore((state) => state.setMediaPath)
  const setMediaName = useAppStore((state) => state.setMediaName)
  const setMediaThumbnail = useAppStore((state) => state.setMediaThumbnail)
  const setMediaType = useAppStore((state) => state.setMediaType)
  const setStatus = useAppStore((state) => state.setTranscriptionStatus)
  const currentProjectIndex = useAppStore((state) => state.currentProjectIndex)
  const projects = useAppStore((state) => state.projects)
  const supportedFormats = [
    'audio/mp3',
    'audio/wav',
    'audio/mpeg',
    'audio/ogg',
    'audio/flac',
    'audio/aac',
    'audio/webm',
    'video/mp4',
    'video/webm',
    'vidoe/mkv',
    'video/quicktime'
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
        setStatus(TranscriptionStatus.SubtitleTypeInput, projects[currentProjectIndex!].id)
      }
    },
    showUploadList: false
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-20">
      <Upload {...props}>
        <Button className="mb-4" type="primary" icon={<UploadOutlined />}>
          Upload audio/video file
        </Button>
      </Upload>
    </div>
  )
}

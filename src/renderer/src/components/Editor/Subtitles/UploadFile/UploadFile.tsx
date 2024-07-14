import { Button, Checkbox, Select, Tooltip, Upload, UploadProps, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import useAppStore, { TranscriptionStatus } from '@renderer/store/store'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import { generateVideoThumbnail, isVideo } from '../../Media/Media.utils'
import { InfoCircleFilled } from '@ant-design/icons'
import { SupportedLanguages } from './UploadFile.utils'
import React from 'react'

function UploadFile(): JSX.Element {
  const [language, setLanguage] = React.useState<string | null>(null)
  const [translate, setTranslate] = React.useState<boolean>(false)
  const setStatus = useAppStore((state) => state.setTranscriptionStatus)
  const setSubtitles = useAppStore((state) => state.setSubtitles)
  const setMediaPath = useAppStore((state) => state.setMediaPath)
  const setMediaName = useAppStore((state) => state.setMediaName)
  const mediaPath = useProjectStore((state) => state.mediaPath)
  const currentProjectIndex = useAppStore((state) => state.currentProjectIndex)
  const projects = useAppStore((state) => state.projects)
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
    const projectId = projects[currentProjectIndex].id
    setStatus(TranscriptionStatus.LOADING, projectId)
    const subtitles = await window.electron.ipcRenderer.invoke('transcribe', {
      filePath: mediaPath,
      language,
      translate
    })
    setSubtitles(subtitles, projectId)
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-20">
      {!mediaPath && (
        <Upload {...props}>
          <Button className="mb-4" type="primary" icon={<UploadOutlined />}>
            Upload audio/video file
          </Button>
        </Upload>
      )}
      {mediaPath && (
        <>
          <p className="self-start mb-2">
            What Language is being spoken?{' '}
            <Tooltip title="Selecting a language speeds up the subtitle generation process.">
              <InfoCircleFilled className="ml-2 text-gray-400" />
            </Tooltip>
          </p>
          <Select
            onChange={setLanguage}
            className="w-full mb-6 h-10"
            showSearch
            placeholder="Select a language"
            options={Object.values(SupportedLanguages)
              .filter((k) => isNaN(Number(k)))
              .map((language) => ({
                value: language,
                label: language
              }))}
          />
          <Checkbox
            checked={translate}
            onChange={(e) => setTranslate(e.target.checked)}
            className="mb-6 self-start text-base"
          >
            Translate to English
          </Checkbox>
          <Button
            type="primary"
            className="w-full py-5 flex justify-center items-center"
            onClick={handleCreateSubtitles}
            disabled={!mediaPath}
          >
            Create Subtitles
          </Button>
        </>
      )}
    </div>
  )
}

export default UploadFile

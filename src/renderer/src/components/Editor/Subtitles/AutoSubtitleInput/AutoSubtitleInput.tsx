import { InfoCircleFilled } from '@ant-design/icons'
import { Button, Checkbox, Select, Tooltip } from 'antd'
import React from 'react'
import useAppStore, { TranscriptionStatus } from '@renderer/store/store'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import { SupportedLanguages } from './AutoSubtitleInput.utils'

export default function AutoSubtitleInput(): JSX.Element {
  const [language, setLanguage] = React.useState<string | null>(null)
  const [translate, setTranslate] = React.useState<boolean>(false)
  const setStatus = useAppStore((state) => state.setTranscriptionStatus)
  const currentProjectIndex = useAppStore((state) => state.currentProjectIndex)
  const projects = useAppStore((state) => state.projects)
  const mediaPath = useProjectStore((state) => state.mediaPath)

  const handleCreateSubtitles = async (): Promise<void> => {
    if (!mediaPath || currentProjectIndex === null) return
    const projectId = projects[currentProjectIndex].id
    setStatus(TranscriptionStatus.LOADING, projectId)
    window.electron.ipcRenderer.invoke('transcribe', {
      filePath: mediaPath,
      language,
      translate,
      projectId
    })
  }
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-20">
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
    </div>
  )
}

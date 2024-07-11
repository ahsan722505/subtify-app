import { Modal, Tooltip, message } from 'antd'
import React from 'react'
import { Switch } from 'antd'
import { InfoCircleFilled } from '@ant-design/icons'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import { generateASS, generateSRT, generateVTT } from './SubtitleList.utils'
import { SubtitleFormat } from './SubtitleList.types'

export default function ExportVideo(): JSX.Element {
  const subtitles = useProjectStore((state) => state.subtitles)
  const filePath = useProjectStore((state) => state.mediaPath)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [burnSubtitles, setBurnSubtitles] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const mediaType = useProjectStore((state) => state.mediaType)
  const canvasWidth = useProjectStore((state) => state.canvasWidth)
  const canvasHeight = useProjectStore((state) => state.canvasHeight)
  const subtitleStyleProps = useProjectStore((state) => state.subtitleStyleProps)

  const handleExportVideo = async (): Promise<void> => {
    setLoading(true)
    let subtitleMetadata: { text: string; type: SubtitleFormat } | null = null
    const isWebm = mediaType === 'video/webm'
    if (burnSubtitles) {
      subtitleMetadata = {
        text: generateASS(canvasWidth, canvasHeight, subtitleStyleProps!, subtitles),
        type: SubtitleFormat.ASS
      }
    } else if (isWebm) {
      subtitleMetadata = {
        text: generateVTT(subtitles),
        type: SubtitleFormat.VTT
      }
    } else {
      subtitleMetadata = {
        text: generateSRT(subtitles),
        type: SubtitleFormat.SRT
      }
    }

    try {
      await window.electron.ipcRenderer.invoke('export-video', {
        filePath,
        burnSubtitles,
        subtitleMetadata,
        mediaType
      })
      message.success('Video exported successfully. Please Check your downloads folder.')
    } catch (error) {
      message.error('Failed to export video.')
    } finally {
      setIsModalOpen(false)
      setLoading(false)
    }
  }
  return (
    <>
      <span onClick={() => setIsModalOpen(true)}>Export Video</span>
      <Modal
        title="Export Video"
        open={isModalOpen}
        onOk={handleExportVideo}
        onCancel={() => setIsModalOpen(false)}
        okText="Export"
        okButtonProps={{ loading }}
      >
        <div className="flex justify-between items-center my-5 border border-gray-200 p-3 rounded">
          <div>
            <span>Burn Subtitles</span>
            <Tooltip title="Burning subtitles permanently embeds text onto a video, making it unchangeable and necessary for applying styles on the exported video.">
              <InfoCircleFilled className="ml-2 text-gray-400" />
            </Tooltip>
          </div>
          <Switch checked={burnSubtitles} onChange={setBurnSubtitles} />
        </div>
      </Modal>
    </>
  )
}

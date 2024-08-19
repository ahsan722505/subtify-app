import { Modal, Tooltip, message } from 'antd'
import React from 'react'
import { Switch } from 'antd'
import { InfoCircleFilled } from '@ant-design/icons'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import { generateSRT, generateUniqueId, generateVTT } from './SubtitleList.utils'
import { SubtitleFormat } from './SubtitleList.types'
import { DownloadOutlined } from '@ant-design/icons'
import useCaptureFramesFromCanvas from '@renderer/hooks/useCaptureFramesFromCanvas'

export default function ExportVideo(): JSX.Element {
  const subtitles = useProjectStore((state) => state.subtitles)
  const filePath = useProjectStore((state) => state.mediaPath)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [burnSubtitles, setBurnSubtitles] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const mediaType = useProjectStore((state) => state.mediaType)
  const initiateCapture = useCaptureFramesFromCanvas()

  const handleAddSubtitleStream = async (): Promise<void> => {
    try {
      let subtitleMetadata: { text: string; type: SubtitleFormat } | null = null
      const isWebm = mediaType === 'video/webm'
      if (isWebm) {
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
      await window.electron.ipcRenderer.invoke('add-subtitle-stream', {
        filePath,
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

  const handleBurnSubtitles = async (): Promise<void> => {
    return new Promise((res) => {
      setLoading(true)
      const exportId = generateUniqueId()
      initiateCapture(exportId, () => {
        setLoading(false)
        setIsModalOpen(false)
        res()
      })
    })
  }
  return (
    <>
      <span className="flex w-full px-3 py-1" onClick={() => setIsModalOpen(true)}>
        <DownloadOutlined className="!text-base mr-2" />
        Export Video
      </span>
      <Modal
        title="Export Video"
        open={isModalOpen}
        onOk={burnSubtitles ? handleBurnSubtitles : handleAddSubtitleStream}
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

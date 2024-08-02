import { Modal, Tooltip, message } from 'antd'
import React from 'react'
import { Switch } from 'antd'
import { InfoCircleFilled } from '@ant-design/icons'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import { generateSRT, generateVTT, handleBurnSubtitles } from './SubtitleList.utils'
import { SubtitleFormat } from './SubtitleList.types'
import { DownloadOutlined } from '@ant-design/icons'
import { BackgroundType } from '@renderer/store/store'

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
  const subtitleBackgroundColor = useProjectStore((state) => state.subtitleBackgroundColor)
  const showSubtitleBackground = useProjectStore((state) => state.showSubtitleBackground)
  const mediaPath = useProjectStore((state) => state.mediaPath)
  const backgroundType = useProjectStore((state) => state.backgroundType)
  const borderRadius = useProjectStore((state) => state.borderRadius)

  const handleExportVideo = async (): Promise<void> => {
    try {
      setLoading(true)
      if (burnSubtitles) {
        const video = document.getElementById('media') as HTMLVideoElement
        await handleBurnSubtitles(
          subtitleStyleProps!,
          showSubtitleBackground,
          subtitleBackgroundColor,
          subtitles,
          mediaPath!,
          canvasWidth,
          canvasHeight,
          video.videoWidth,
          video.videoHeight,
          backgroundType || BackgroundType.SINGLE,
          borderRadius
        )
      } else {
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
      }

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
      <span className="flex w-full px-3 py-1" onClick={() => setIsModalOpen(true)}>
        <DownloadOutlined className="!text-base mr-2" />
        Export Video
      </span>
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

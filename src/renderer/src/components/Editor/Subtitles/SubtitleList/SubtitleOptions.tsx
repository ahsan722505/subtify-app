import { Button, Dropdown, MenuProps } from 'antd'
import { SettingOutlined, DownloadOutlined } from '@ant-design/icons'
import {
  downloadSubtitles,
  generateASS,
  generateSRT,
  generateTXT,
  generateVTT
} from './SubtitleList.utils'
import { SubtitleFormat } from './SubtitleList.types'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import ExportVideo from './ExportVideo'
import { isVideo } from '../../Media/Media.utils'
import ShiftTimings from './ShiftTimings'

export default function SubtitleOptions(): JSX.Element {
  const canvasWidth = useProjectStore((state) => state.canvasWidth)
  const canvasHeight = useProjectStore((state) => state.canvasHeight)
  const subtitleStyleProps = useProjectStore((state) => state.subtitleStyleProps)
  const mediaType = useProjectStore((state) => state.mediaType)
  const subtitles = useProjectStore((state) => state.subtitles)
  const showSubtitleBackground = useProjectStore((state) => state.showSubtitleBackground)
  const subtitleBackgroundColor = useProjectStore((state) => state.subtitleBackgroundColor)

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <span className="mr-5">Export Subtitles</span>,
      icon: <DownloadOutlined className="!text-base" />,
      children: [
        {
          key: '1-1',
          label: '.SRT format',
          onClick: (): void => {
            downloadSubtitles(generateSRT(subtitles), SubtitleFormat.SRT)
          }
        },
        {
          key: '1-2',
          label: '.VTT format',
          onClick: (): void => {
            downloadSubtitles(generateVTT(subtitles), SubtitleFormat.VTT)
          }
        },
        {
          key: '1-3',
          label: '.TXT format',
          onClick: (): void => {
            downloadSubtitles(generateTXT(subtitles), SubtitleFormat.TXT)
          }
        },
        isVideo(mediaType || '')
          ? {
              key: '1-4',
              label: '.ASS format (Styled)',
              onClick: (): void => {
                downloadSubtitles(
                  generateASS(
                    canvasWidth,
                    canvasHeight,
                    subtitleStyleProps!,
                    showSubtitleBackground ? subtitleBackgroundColor : '#00FFFFFF',
                    subtitles
                  ),
                  SubtitleFormat.ASS
                )
              }
            }
          : null
      ]
    },
    isVideo(mediaType || '')
      ? {
          key: '2',
          label: <ExportVideo />,
          className: '!p-0'
        }
      : null,
    { key: '3', label: <ShiftTimings />, className: '!p-0' }
  ]
  return (
    <Dropdown menu={{ items }} placement="bottom">
      <Button className="flex items-center">
        Options <SettingOutlined />
      </Button>
    </Dropdown>
  )
}

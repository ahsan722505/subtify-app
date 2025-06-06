import { Button, Dropdown, MenuProps } from 'antd'
import { SettingOutlined, DownloadOutlined } from '@ant-design/icons'
import { downloadSubtitles, generateSRT, generateTXT, generateVTT } from './SubtitleList.utils'
import { SubtitleFormat } from './SubtitleList.types'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import ExportVideo from './ExportVideo'
import { isVideo } from '../../Media/Media.utils'
import ShiftTimings from './ShiftTimings'

export default function SubtitleOptions(): JSX.Element {
  const mediaType = useProjectStore((state) => state.mediaType)
  const subtitles = useProjectStore((state) => state.subtitles)

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
        }
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

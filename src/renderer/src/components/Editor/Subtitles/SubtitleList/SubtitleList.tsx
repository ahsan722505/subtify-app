import SubtitleListItem from './SubtitleListItem'
import { Button, Dropdown, MenuProps } from 'antd'
import { SettingOutlined, DownloadOutlined } from '@ant-design/icons'
import { downloadSubtitles, isSubtitlePlaying } from './SubtitleList.utils'
import { SubtitleFormat } from './SubtitleList.types'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import ExportVideo from './ExportVideo'
import { isVideo } from '../../Media/Media.utils'

export default function SubtitleList(): JSX.Element {
  const subtitles = useProjectStore((state) => state.subtitles)
  const mediaType = useProjectStore((state) => state.mediaType)
  const currentTime = useProjectStore((state) => state.mediaCurrentTime)

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
            downloadSubtitles(subtitles, SubtitleFormat.SRT)
          }
        },
        {
          key: '1-2',
          label: '.VTT format',
          onClick: (): void => {
            downloadSubtitles(subtitles, SubtitleFormat.VTT)
          }
        },
        {
          key: '1-3',
          label: '.TXT format',
          onClick: (): void => {
            downloadSubtitles(subtitles, SubtitleFormat.TXT)
          }
        }
      ]
    }
  ]
  if (isVideo(mediaType || ''))
    items.push({
      key: '2',
      label: <ExportVideo />,
      icon: <DownloadOutlined className="!text-base" />
    })
  return (
    <div>
      <div className="sticky top-0 mb-4 bg-white flex justify-between items-center py-6 z-50">
        <p className="text-2xl font-bold">Subtitles</p>
        <Dropdown menu={{ items }} placement="bottom">
          <Button className="flex items-center">
            Options <SettingOutlined />
          </Button>
        </Dropdown>
      </div>
      {subtitles.map((s, i) => (
        <SubtitleListItem
          currentlyPlaying={isSubtitlePlaying(currentTime, s.start, s.end)}
          key={s.start}
          {...s}
          index={i}
        />
      ))}
    </div>
  )
}

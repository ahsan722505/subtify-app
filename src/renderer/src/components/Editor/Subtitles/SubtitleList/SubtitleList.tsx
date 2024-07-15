import SubtitleListItem from './SubtitleListItem'
import { Button, Dropdown, MenuProps } from 'antd'
import { SettingOutlined, DownloadOutlined } from '@ant-design/icons'
import {
  downloadSubtitles,
  generateASS,
  generateSRT,
  generateTXT,
  generateVTT,
  isSubtitlePlaying
} from './SubtitleList.utils'
import { SubtitleFormat } from './SubtitleList.types'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import ExportVideo from './ExportVideo'
import { isVideo } from '../../Media/Media.utils'
import SubtitlesMedian from './SubtitlesMedian'

export default function SubtitleList(): JSX.Element {
  const subtitles = useProjectStore((state) => state.subtitles)
  const mediaType = useProjectStore((state) => state.mediaType)
  const currentTime = useProjectStore((state) => state.mediaCurrentTime)
  const canvasWidth = useProjectStore((state) => state.canvasWidth)
  const mediaDuration = useProjectStore((state) => state.mediaDuration)
  const canvasHeight = useProjectStore((state) => state.canvasHeight)
  const subtitleStyleProps = useProjectStore((state) => state.subtitleStyleProps)

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
              label: '.ASS format',
              onClick: (): void => {
                downloadSubtitles(
                  generateASS(canvasWidth, canvasHeight, subtitleStyleProps!, subtitles),
                  SubtitleFormat.ASS
                )
              }
            }
          : null
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
        <div key={s.start}>
          <SubtitleListItem
            currentlyPlaying={isSubtitlePlaying(currentTime, s.start, s.end)}
            {...s}
            index={i}
          />
          <SubtitlesMedian
            currentEnd={subtitles[i].end}
            nextStart={subtitles[i + 1]?.start || mediaDuration}
            currentIndex={i}
            lastIndex={subtitles.length - 1}
          />
        </div>
      ))}
    </div>
  )
}

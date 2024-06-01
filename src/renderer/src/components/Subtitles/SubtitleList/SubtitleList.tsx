import useTranscriptionStore from '@renderer/store/transcription'
import SubtitleListItem from './SubtitleListItem'
import { Button, Dropdown, MenuProps } from 'antd'
import { SettingOutlined, DownloadOutlined } from '@ant-design/icons'
import { downloadSubtitles } from './SubtitleList.utils'
import { SubtitleFormat } from './SubtitleList.types'

export default function SubtitleList(): JSX.Element {
  const subtitles = useTranscriptionStore((state) => state.subtitles)
  console.log('re-rendering', subtitles)
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <span className="mr-5">Download</span>,
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
        <SubtitleListItem key={s.start} {...s} index={i} />
      ))}
    </div>
  )
}

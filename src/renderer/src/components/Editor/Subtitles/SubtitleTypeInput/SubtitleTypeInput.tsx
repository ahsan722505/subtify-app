import { RightOutlined } from '@ant-design/icons'
import useAppStore, { Subtitle, TranscriptionStatus } from '@renderer/store/store'
import { generateUniqueId } from '../SubtitleList/SubtitleList.utils'
import { Spin, Upload, UploadProps, message } from 'antd'
import React from 'react'
import clsx from 'clsx'
import srtParser2 from 'srt-parser-2'
import webvttparser from 'webvtt-parser'
enum SubtitleInput {
  AUTO = 'auto',
  MANUAL = 'manual',
  FILE = 'file'
}
type SubtitleTypeInputProps = {
  heading: string
  description: string
  type: SubtitleInput
  wrapper: React.FC<{ children: React.ReactNode }>
  wrapperProps?: UploadProps
}
const supportedFormats = ['.srt', '.vtt']

export default function SubtitleTypeInput(): JSX.Element {
  const setStatus = useAppStore((state) => state.setTranscriptionStatus)
  const projects = useAppStore((state) => state.projects)
  const setSubtitles = useAppStore((state) => state.setSubtitles)
  const currentProjectIndex = useAppStore((state) => state.currentProjectIndex)
  const [loading, setLoading] = React.useState(false)

  const handleCreateSubtitle = (subtitleInput: SubtitleInput): void => {
    if (subtitleInput === SubtitleInput.AUTO) {
      setStatus(TranscriptionStatus.AutoSubtitleInput, projects[currentProjectIndex!].id)
    }

    if (subtitleInput === SubtitleInput.MANUAL) {
      setSubtitles(
        [{ start: 0, end: 1, text: '', id: generateUniqueId() }],
        projects[currentProjectIndex!].id
      )
    }
  }

  const parseFile = async (file: File): Promise<Subtitle[]> => {
    return new Promise((resolve, reject) => {
      const type = file.name.split('.').pop()
      if (!type) {
        message.error('Unable to parse file.')
        reject()
        return
      }
      if (!supportedFormats.includes('.' + type)) {
        message.error('File format is not supported.')
        reject()
        return
      }
      const reader = new FileReader()
      reader.onload = (): void => {
        const text = reader.result as string
        let subtitles: Subtitle[] = []
        if (type === 'srt') {
          const parser = new srtParser2()
          subtitles = parser.fromSrt(text).map((s) => ({
            start: s.startSeconds,
            end: s.endSeconds,
            text: s.text,
            id: generateUniqueId()
          }))
        }
        if (type === 'vtt') {
          const { WebVTTParser } = webvttparser
          const parser = new WebVTTParser()
          const tree = parser.parse(text, 'metadata')
          subtitles = tree.cues.map((c) => ({
            start: c.startTime,
            end: c.endTime,
            text: c.text,
            id: generateUniqueId()
          }))
        }
        if (subtitles.length === 0) {
          message.error('Unable to parse file.')
          reject()
          return
        }
        resolve(subtitles)
      }
      reader.readAsText(file)
    })
  }

  const uploadProps: UploadProps = {
    accept: supportedFormats.join(', '),
    customRequest: async ({ file }) => {
      try {
        setLoading(true)
        const subtitles = await parseFile(file as File)
        setSubtitles(subtitles, projects[currentProjectIndex!].id)
      } catch (error) {
        console.error('parse-error', error)
        setLoading(false)
      }
    },
    showUploadList: false
  }

  const subtitleTypeInputs: SubtitleTypeInputProps[] = [
    {
      heading: 'AI Subtitles',
      description: 'Generate subtitles automatically with AI',
      type: SubtitleInput.AUTO,
      wrapper: React.Fragment
    },
    {
      heading: 'Manual Transcribe',
      description: 'Type your subtitles manually',
      type: SubtitleInput.MANUAL,
      wrapper: React.Fragment
    },
    {
      heading: 'Upload Subtitle File',
      description: 'Use an existing subtitles file (SRT, VTT)',
      type: SubtitleInput.FILE,
      wrapper: Upload,
      wrapperProps: uploadProps
    }
  ]

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-20 relative">
      {loading ? (
        <Spin size="large" />
      ) : (
        subtitleTypeInputs.map((i) => (
          <i.wrapper {...(i.wrapperProps || {})} key={i.type}>
            <div
              onClick={() => handleCreateSubtitle(i.type)}
              className={clsx(
                'flex justify-between items-center border border-gray-300 w-80 rounded-xl p-4 cursor-pointer mb-4'
              )}
            >
              <div className="flex flex-col">
                <span className="text-lg">{i.heading}</span>
                <span className="text-xs text-gray-500">{i.description}</span>
              </div>
              <RightOutlined />
            </div>
          </i.wrapper>
        ))
      )}
    </div>
  )
}

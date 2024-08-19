import { LeftOutlined } from '@ant-design/icons'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import useAppStore, { TranscriptionStatus } from '@renderer/store/store'
import { Select } from 'antd'
import React from 'react'
import ColorPicker from './ColorPicker'
import Background from './Background'
import FontStyles from './FontStyles'
import AlphabetCasing from './AlphabetCasing'
import Spacing from './Spacing'
import Alignment from './Alignment'
import FontFamily from './FontFamily/FontFamily'
import TextAnimation from './TextAnimation'

const availablefontSizes = [
  18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84, 90, 96, 102, 108, 114, 120, 136, 148, 160
]

export default function SubtitleStyles(): JSX.Element {
  const projects = useAppStore((state) => state.projects)
  const currentProjectIndex = useAppStore((state) => state.currentProjectIndex)
  const setTranscriptionStatus = useAppStore((state) => state.setTranscriptionStatus)
  const setSubtitleStyleProps = useAppStore((state) => state.setSubtitleStyleProps)
  const subtitleStyleProps = useProjectStore((state) => state.subtitleStyleProps)
  const [fontSizes, setFontSizes] = React.useState(availablefontSizes)

  return (
    <>
      <div className="sticky top-0 mb-4 bg-white flex justify-between items-center py-6 z-50">
        <p className="text-2xl font-bold">
          <LeftOutlined
            className="mr-4"
            onClick={() =>
              setTranscriptionStatus(TranscriptionStatus.SUCCESS, projects[currentProjectIndex!].id)
            }
          />
          Styles
        </p>
      </div>
      <div className="flex gap-2 mb-4">
        <FontFamily />
        <Select
          className="w-1/4 h-10"
          showSearch
          placeholder="Select a font size"
          options={fontSizes.map((size) => ({
            value: size,
            label: size + 'px'
          }))}
          value={
            subtitleStyleProps?.fontSize ? Math.floor(subtitleStyleProps?.fontSize) + 'px' : ''
          }
          onChange={(value) => setSubtitleStyleProps({ ...subtitleStyleProps, fontSize: +value })}
          onSearch={(value) => {
            const number = parseInt(value)
            if (!isNaN(number) && !fontSizes.includes(number)) {
              setFontSizes([...fontSizes, number])
            }
          }}
        />
        <ColorPicker
          color={subtitleStyleProps?.fill as string}
          setColor={(color) => setSubtitleStyleProps({ ...subtitleStyleProps, fill: color })}
        />
      </div>
      <Background />
      <div className="flex gap-2 mt-4">
        <FontStyles />
        <Alignment />
        <AlphabetCasing />
        <Spacing />
      </div>
      <TextAnimation />
    </>
  )
}

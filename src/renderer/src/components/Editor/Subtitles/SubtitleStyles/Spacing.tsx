import { ArrowsAltOutlined } from '@ant-design/icons'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import useAppStore from '@renderer/store/store'
import { Input, InputRef, Modal, Slider } from 'antd'
import React from 'react'

const DEFAULT_LINE_HEIGHT = 1
const DEFAULT_LETTER_SPACING = 0
const MAX_LINE_HEIGHT = 5
const MAX_LETTER_SPACING = 200
export default function Spacing(): JSX.Element {
  const subtitleStyleProps = useProjectStore((state) => state.subtitleStyleProps)
  const setSubtitleStyleProps = useAppStore((state) => state.setSubtitleStyleProps)
  const [openModal, setOpenModal] = React.useState(false)
  const lineHeightRef = React.useRef<InputRef>(null)
  const letterSpacingRef = React.useRef<InputRef>(null)

  const lineHeight =
    subtitleStyleProps?.lineHeight === undefined
      ? DEFAULT_LINE_HEIGHT
      : subtitleStyleProps.lineHeight
  const letterSpacing = subtitleStyleProps?.letterSpacing || DEFAULT_LETTER_SPACING

  const handleUpdateLineHeight = (): void => {
    const input = lineHeightRef.current?.input?.value
    const v = parseFloat(input || '')
    if (!isNaN(v) && v >= 0 && v <= MAX_LINE_HEIGHT) {
      setSubtitleStyleProps({ ...subtitleStyleProps, lineHeight: v })
    }
  }

  const handleUpdateLetterSpacing = (): void => {
    const input = letterSpacingRef.current?.input?.value
    const v = parseFloat(input || '')
    if (!isNaN(v) && v >= 0 && v <= MAX_LETTER_SPACING) {
      setSubtitleStyleProps({ ...subtitleStyleProps, letterSpacing: v })
    }
  }

  return (
    <>
      <span
        onClick={() => setOpenModal(true)}
        className="rounded-md border border-gray-300 hover:border-blue-500 cursor-pointer flex justify-center items-center h-10 w-11"
      >
        <ArrowsAltOutlined className="!text-xl" />
      </span>
      <Modal footer={null} open={openModal} onCancel={() => setOpenModal(false)} title="Spacing">
        <div className="flex justify-between items-center gap-4">
          <span>Line Height</span>
          <Slider
            className="grow"
            value={lineHeight}
            onChange={(v) => setSubtitleStyleProps({ ...subtitleStyleProps, lineHeight: v })}
            step={0.01}
            max={MAX_LINE_HEIGHT}
          />
          <Input
            ref={lineHeightRef}
            className="m-0 border-none w-20 bg-gray-300 focus:bg-gray-300 focus:ring-0 hover:bg-gray-300"
            defaultValue={lineHeight}
            onPressEnter={handleUpdateLineHeight}
            onBlur={handleUpdateLineHeight}
            key={lineHeight}
          />
        </div>
        <div className="flex justify-between items-center gap-4">
          <span>Letter Spacing</span>
          <Slider
            className="grow"
            value={letterSpacing}
            onChange={(v) => setSubtitleStyleProps({ ...subtitleStyleProps, letterSpacing: v })}
            step={0.01}
            max={MAX_LETTER_SPACING}
          />
          <Input
            className="m-0 border-none w-20 bg-gray-300 focus:bg-gray-300 focus:ring-0 hover:bg-gray-300"
            defaultValue={letterSpacing}
            ref={letterSpacingRef}
            onPressEnter={handleUpdateLetterSpacing}
            onBlur={handleUpdateLetterSpacing}
            key={letterSpacing}
          />
        </div>
      </Modal>
    </>
  )
}

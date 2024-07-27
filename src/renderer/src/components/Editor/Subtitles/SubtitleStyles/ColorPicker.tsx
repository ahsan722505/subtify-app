import { HexAlphaColorPicker } from 'react-colorful'
import { BgColorsOutlined } from '@ant-design/icons'
import React from 'react'
import useOutsideClick from '@renderer/hooks/useOutsideClick'

export default function ColorPicker({
  color,
  setColor
}: {
  color: string
  setColor: (color: string) => void
}): JSX.Element {
  const [showPicker, setShowPicker] = React.useState(false)
  const pickerRef = React.useRef<HTMLDivElement>(null)
  useOutsideClick(pickerRef, () => setShowPicker(false), ['toggle-color-picker'])

  return (
    <div className="w-11 relative">
      {showPicker && (
        <div
          ref={pickerRef}
          className="!absolute z-[200] transform -translate-y-1/3 -translate-x-[102%]"
        >
          <HexAlphaColorPicker color={color} onChange={setColor} />
        </div>
      )}
      <span
        className="rounded-md border border-gray-300 hover:border-blue-500 cursor-pointer flex justify-center items-center h-10 toggle-color-picker"
        onClick={() => {
          setShowPicker((showPicker) => !showPicker)
        }}
      >
        <BgColorsOutlined className="!text-xl" />
      </span>
    </div>
  )
}

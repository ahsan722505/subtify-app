import { BgColorsOutlined } from '@ant-design/icons'
import React from 'react'
import useOutsideClick from '@renderer/hooks/useOutsideClick'
import Sketch from '@uiw/react-color-sketch'
import { Button } from 'antd'
import useAppStore from '@renderer/store/store'

export default function ColorPicker({
  color,
  setColor
}: {
  color: string
  setColor: (color: string) => void
}): JSX.Element {
  const [showPicker, setShowPicker] = React.useState(false)
  const pickerRef = React.useRef<HTMLDivElement>(null)
  const presetColors = useAppStore((state) => state.presetColors)
  const addPresetColor = useAppStore((state) => state.addPresetColor)
  useOutsideClick(pickerRef, () => setShowPicker(false), ['toggle-color-picker'])

  return (
    <div className="w-11 relative">
      {showPicker && (
        <div
          ref={pickerRef}
          className="!absolute z-[200] transform -translate-y-1/3 -translate-x-[102%]"
        >
          <Sketch
            color={color}
            onChange={(color) => {
              setColor(color.hexa)
            }}
            presetColors={presetColors}
          />

          {color && (
            <Button onClick={() => addPresetColor(color)} className="mt-2 w-full">
              Save Color
            </Button>
          )}
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

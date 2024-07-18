import useAppStore from '@renderer/store/store'
import { Input, Modal } from 'antd'
import React from 'react'
import { EnterOutlined } from '@ant-design/icons'

export default function ShiftTimings(): JSX.Element {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [duration, setDuration] = React.useState<number | null>(null)
  const shiftSubtitles = useAppStore((state) => state.shiftSubtitles)
  const handleShiftSubtitles = (): void => {
    if (duration === null) return
    shiftSubtitles(duration)
    setIsModalOpen(false)
  }

  return (
    <>
      <span className="flex w-full px-3 py-1" onClick={() => setIsModalOpen(true)}>
        <EnterOutlined className="!text-base mr-2" />
        Shift all timings
      </span>
      <Modal
        title="Shift Timings"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        okText="Shift"
        onOk={handleShiftSubtitles}
      >
        <Input
          onChange={(e) => setDuration(+e.target.value)}
          className="mb-2"
          type="number"
          placeholder="Enter seconds"
        />
        <p className="text-xs text-gray-500">
          Enter a negative number to shift subtitles backward (eg. -0.5) and a positive number to
          shift subtitles forward (eg. 0.5)
        </p>
      </Modal>
    </>
  )
}

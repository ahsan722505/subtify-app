import React from 'react'
import { Input, message } from 'antd'
import useAppStore from '@renderer/store/store'

export default React.memo(function SubtitleTime({
  time,
  id,
  type
}: {
  type: 'start' | 'end'
  time: string
  id: string
}): JSX.Element {
  const [localTime, setlocalTime] = React.useState(time)
  const setTime = useAppStore((state) => state.setTime)

  const handleUpdateTime = (): void => {
    try {
      setTime(localTime, id, type)
    } catch (error) {
      message.error((error as Error).message)
      setlocalTime(time)
    }
  }

  React.useEffect(() => {
    setlocalTime(time) // Reset the local time when the global time changes
  }, [time])
  return (
    <Input
      className="p-0 m-0 border-none bg-inherit focus:bg-inherit focus:ring-0 hover:bg-inherit"
      style={{ width: time.length - 1 + 'ch' }}
      value={localTime}
      onBlur={handleUpdateTime}
      onPressEnter={handleUpdateTime}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setlocalTime(e.target.value)}
    />
  )
})

import { Switch } from 'antd'
import ColorPicker from './ColorPicker'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import useAppStore, { BackgroundType } from '@renderer/store/store'
import clsx from 'clsx'

const SplittedBackground = ({
  borderRadius,
  selected,
  onClick
}: {
  borderRadius?: boolean
  selected: boolean
  onClick: () => void
}): JSX.Element => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'w-1/6 hover:bg-gray-300 rounded-md flex justify-center items-center flex-col cursor-pointer p-2 gap-1',
        selected && 'bg-gray-300'
      )}
    >
      <div className={clsx('w-3/5 h-2 bg-black', borderRadius && 'rounded-md')} />
      <div className={clsx('w-2/5 h-2 bg-black', borderRadius && 'rounded-md')} />
    </div>
  )
}

const SingleBackground = ({
  borderRadius,
  selected,
  onClick
}: {
  borderRadius?: boolean
  selected: boolean
  onClick: () => void
}): JSX.Element => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'w-1/6 hover:bg-gray-300 rounded-md flex justify-center items-center flex-col cursor-pointer p-2 gap-1',
        selected && 'bg-gray-300'
      )}
    >
      <div className={clsx('w-3/5 h-5 bg-black', borderRadius && 'rounded-md')} />
    </div>
  )
}

export default function Background(): JSX.Element {
  const showSubtitleBackground = useProjectStore((state) => state.showSubtitleBackground)
  const setShowSubtitleBackground = useAppStore((state) => state.setShowSubtitleBackground)
  const subtitleBackgroundColor = useProjectStore((state) => state.subtitleBackgroundColor)
  const setSubtitleBackgroundColor = useAppStore((state) => state.setSubtitleBackgroundColor)
  const backgroundType = useProjectStore((state) => state.backgroundType) || BackgroundType.SPLITTED
  const borderRadius = useProjectStore((state) => state.borderRadius)
  const setBackgroundType = useAppStore((state) => state.setBackgroundType)
  const setBorderRadius = useAppStore((state) => state.setBorderRadius)
  return (
    <div className="min-h-10 rounded-md border border-gray-300 p-4 flex flex-col items-center gap-4">
      <div className="flex justify-between items-center h-full w-full">
        <span className="font-medium">Background</span>
        <Switch checked={showSubtitleBackground} onChange={(v) => setShowSubtitleBackground(v)} />
      </div>
      {showSubtitleBackground && (
        <div className="flex w-full items-center justify-between">
          <div className="w-3/4 border border-gray-300 flex justify-between items-center p-2 rounded-md">
            <SplittedBackground
              onClick={() => {
                setBackgroundType(BackgroundType.SPLITTED)
                setBorderRadius(false)
              }}
              selected={backgroundType === BackgroundType.SPLITTED && !borderRadius}
            />
            <SplittedBackground
              onClick={() => {
                setBackgroundType(BackgroundType.SPLITTED)
                setBorderRadius(true)
              }}
              selected={backgroundType === BackgroundType.SPLITTED && borderRadius}
              borderRadius
            />
            <SingleBackground
              onClick={() => {
                setBackgroundType(BackgroundType.SINGLE)
                setBorderRadius(false)
              }}
              selected={backgroundType === BackgroundType.SINGLE && !borderRadius}
            />
            <SingleBackground
              onClick={() => {
                setBackgroundType(BackgroundType.SINGLE)
                setBorderRadius(true)
              }}
              selected={backgroundType === BackgroundType.SINGLE && borderRadius}
              borderRadius
            />
          </div>
          <ColorPicker
            color={subtitleBackgroundColor || '#000000FF'}
            setColor={setSubtitleBackgroundColor}
          />
        </div>
      )}
    </div>
  )
}

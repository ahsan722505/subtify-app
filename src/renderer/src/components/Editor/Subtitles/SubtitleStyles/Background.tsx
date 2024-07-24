import { Switch } from 'antd'
import ColorPicker from './ColorPicker'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import useAppStore from '@renderer/store/store'

export default function Background(): JSX.Element {
  const showSubtitleBackground = useProjectStore((state) => state.showSubtitleBackground)
  const setShowSubtitleBackground = useAppStore((state) => state.setShowSubtitleBackground)
  const subtitleBackgroundColor = useProjectStore((state) => state.subtitleBackgroundColor)
  const setSubtitleBackgroundColor = useAppStore((state) => state.setSubtitleBackgroundColor)
  return (
    <div className="min-h-10 rounded-md border border-gray-300 p-2 flex flex-col items-center">
      <div className="flex justify-between items-center h-full w-full">
        <span className="font-medium">Background</span>
        <Switch checked={showSubtitleBackground} onChange={(v) => setShowSubtitleBackground(v)} />
      </div>
      {showSubtitleBackground && (
        <ColorPicker
          color={subtitleBackgroundColor || '#000000FF'}
          setColor={setSubtitleBackgroundColor}
        />
      )}
    </div>
  )
}

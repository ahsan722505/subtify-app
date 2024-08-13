import { Switch } from 'antd'
import ColorPicker from './ColorPicker'
import { RightOutlined } from '@ant-design/icons'
import useAppStore, { TranscriptionStatus } from '@renderer/store/store'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import { DEFAULT_ANIMATION, DEFAULT_ANIMATION_COLOR } from '@renderer/constants'

export default function TextAnimation(): JSX.Element {
  const projects = useAppStore((state) => state.projects)
  const currentProjectIndex = useAppStore((state) => state.currentProjectIndex)
  const setTranscriptionStatus = useAppStore((state) => state.setTranscriptionStatus)
  const showAnimation = useProjectStore((state) => state.showAnimation)
  const setShowAnimation = useAppStore((state) => state.setShowAnimation)
  const currentAnimation = useProjectStore((state) => state.currentAnimation) || DEFAULT_ANIMATION
  const animationColor = useProjectStore((state) => state.animationColor) || DEFAULT_ANIMATION_COLOR
  const setAnimationColor = useAppStore((state) => state.setAnimationColor)
  return (
    <div className="min-h-10 rounded-md border border-gray-300 p-4 flex flex-col items-center gap-4 mt-4">
      <div className="flex justify-between items-center h-full w-full">
        <span className="font-medium">Text Animation</span>
        <Switch checked={showAnimation} onChange={setShowAnimation} />
      </div>
      {showAnimation && (
        <div className="flex w-full items-center justify-between">
          <div
            className="w-3/4 border border-gray-300 flex justify-between items-center p-2 rounded-md cursor-pointer hover:border-blue-500"
            onClick={() =>
              setTranscriptionStatus(
                TranscriptionStatus.ANIMATIONS,
                projects[currentProjectIndex!].id
              )
            }
          >
            <h1>{currentAnimation}</h1>
            <RightOutlined />
          </div>
          <ColorPicker color={animationColor} setColor={setAnimationColor} />
        </div>
      )}
    </div>
  )
}

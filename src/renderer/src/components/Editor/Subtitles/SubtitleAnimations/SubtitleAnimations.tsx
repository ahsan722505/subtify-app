import { LeftOutlined } from '@ant-design/icons'
import useAppStore, { TranscriptionStatus } from '@renderer/store/store'
import AnimationItem from './AnimationItem'
import { ANIMATIONS, AnimationType, DEFAULT_ANIMATION } from '@renderer/constants'
import { useProjectStore } from '@renderer/hooks/useProjectStore'

export default function SubtitleAnimations(): JSX.Element {
  const projects = useAppStore((state) => state.projects)
  const currentProjectIndex = useAppStore((state) => state.currentProjectIndex)
  const setTranscriptionStatus = useAppStore((state) => state.setTranscriptionStatus)
  const currentAnimation = useProjectStore((state) => state.currentAnimation) || DEFAULT_ANIMATION

  return (
    <>
      <div className="sticky top-0 mb-4 bg-white flex justify-between items-center py-6 z-50">
        <p className="text-2xl font-bold">
          <LeftOutlined
            className="mr-4"
            onClick={() =>
              setTranscriptionStatus(TranscriptionStatus.STYLES, projects[currentProjectIndex!].id)
            }
          />
          Animation
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-3">
        {Object.keys(ANIMATIONS).map((animation) => (
          <AnimationItem
            key={animation}
            Icon={ANIMATIONS[animation].icon}
            name={animation as AnimationType}
            selected={currentAnimation === animation}
          />
        ))}
      </div>
    </>
  )
}

import { LeftOutlined } from '@ant-design/icons'
import useAppStore, { TranscriptionStatus } from '@renderer/store/store'
import BoxHighlight from '@renderer/assets/box-highlight.svg?react'
import AnimationItem from './AnimationItem'

const ANIMATIONS = [{ name: 'Box Highlight', icon: BoxHighlight }]

export default function SubtitleAnimations(): JSX.Element {
  const projects = useAppStore((state) => state.projects)
  const currentProjectIndex = useAppStore((state) => state.currentProjectIndex)
  const setTranscriptionStatus = useAppStore((state) => state.setTranscriptionStatus)

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
        {ANIMATIONS.map((animation, i) => (
          <AnimationItem
            key={animation.name}
            Icon={animation.icon}
            name={animation.name}
            selected={i === 1}
          />
        ))}
      </div>
    </>
  )
}

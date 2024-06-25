import { useProjectStore } from '@renderer/hooks/useProjectStore'
import { Progress } from 'antd'

export default function GenerationProgress(): JSX.Element {
  const progress = useProjectStore((state) => state.subtitleGenerationProgress)
  return (
    <div className="w-full h-full flex justify-center items-center flex-col">
      <Progress percent={progress} type="circle" />
      <h1 className="mt-2 text-xl">Generating Subtitles...</h1>
    </div>
  )
}

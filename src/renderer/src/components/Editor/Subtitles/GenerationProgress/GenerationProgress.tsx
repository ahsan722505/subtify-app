import { useProjectStore } from '@renderer/hooks/useProjectStore'
import { Progress } from 'antd'

export default function GenerationProgress(): JSX.Element {
  const percent = useProjectStore((state) => state.generatedSubtitlesPercentage)
  return (
    <div className="w-full h-full flex justify-center items-center flex-col">
      <Progress type="circle" percent={Math.floor(percent)} />
      <h1 className="mt-2 text-xl text-center">
        Generating Subtitles...
        <br /> Feel free to work on another project.
      </h1>
    </div>
  )
}

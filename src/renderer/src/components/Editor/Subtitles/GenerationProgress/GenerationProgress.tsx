import { Spin } from 'antd'

export default function GenerationProgress(): JSX.Element {
  return (
    <div className="w-full h-full flex justify-center items-center flex-col">
      <Spin size="large" />
      <h1 className="mt-2 text-xl">Generating Subtitles...</h1>
    </div>
  )
}

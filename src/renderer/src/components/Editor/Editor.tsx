import ControlPanel from './ControlPanel/ControlPanel'
import Media from './Media/Media'
import Subtitles from './Subtitles/Subtitles'

export default function Editor(): JSX.Element {
  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="flex w-full h-3/4">
        <div className="w-1/2 border-r border-gray-200 overflow-auto">
          <Subtitles />
        </div>
        <div className="w-1/2">
          <Media />
        </div>
      </div>
      <div className="h-1/4 border border-gray-200">
        <ControlPanel />
      </div>
    </div>
  )
}

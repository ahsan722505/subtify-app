import ControlPanel from './components/ControlPanel/ControlPanel'
import Subtitles from './components/Subtitles/Subtitles'
import Media from './components/Media/Media'

function App(): JSX.Element {
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

export default App

import Subtitles from './components/Subtitles/Subtitles'

function App(): JSX.Element {
  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="flex w-full h-3/4">
        <div className="w-1/2 border-r border-gray-200">
          <Subtitles />
        </div>
        <div className="w-1/2">video</div>
      </div>
      <div className="h-1/4 border border-gray-200">control panel</div>
    </div>
  )
}

export default App

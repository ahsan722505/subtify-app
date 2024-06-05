import Editor from './components/Editor/Editor'
import Projects from './components/Projects/Projects'
import useAppStore from './store/store'

function App(): JSX.Element {
  console.log('app initialized')
  const currentProjectIndex = useAppStore((state) => state.currentProjectIndex)
  return <>{currentProjectIndex === null ? <Projects /> : <Editor />}</>
}

export default App

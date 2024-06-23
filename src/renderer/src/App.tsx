import { Spin } from 'antd'
import Editor from './components/Editor/Editor'
import Projects from './components/Projects/Projects'
import useAppStore from './store/store'
import React from 'react'

function App(): JSX.Element {
  const currentProjectIndex = useAppStore((state) => state.currentProjectIndex)
  const modelFilesDownloaded = useAppStore((state) => state.modelFilesDownloaded)
  const setModelFilesDownloaded = useAppStore((state) => state.setModelFilesDownloaded)
  React.useEffect(() => {
    window.electron.ipcRenderer.on('model-files-downloaded', () => setModelFilesDownloaded(true))
    return () => {
      window.electron.ipcRenderer.removeAllListeners('model-files-downloaded')
    }
  }, [])
  return (
    <>
      {modelFilesDownloaded ? (
        currentProjectIndex === null ? (
          <Projects />
        ) : (
          <Editor />
        )
      ) : (
        <div className="flex flex-col w-screen h-screen items-center justify-center">
          <Spin size="large" />
          <div className="mt-4 text-xl">Downloading model files. Please do not close the app.</div>
        </div>
      )}
    </>
  )
}

export default App

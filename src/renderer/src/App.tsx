import React from 'react'
import Dashboard from './components/Dashboard/Dashboard'
import Editor from './components/Editor/Editor'
import useAppStore, { AppUpdatesLifecycle } from './store/store'

function App(): JSX.Element {
  const setAppUpdateStatus = useAppStore((state) => state.setAppUpdateStatus)
  const setDownloadedUpdatesPercentage = useAppStore(
    (state) => state.setDownloadedUpdatesPercentage
  )
  React.useEffect(() => {
    window.electron.ipcRenderer.on('update-status', (_, status: AppUpdatesLifecycle) => {
      setAppUpdateStatus(status)
    })
    window.electron.ipcRenderer.on('downloaded-updates-percentage', (_, percentage: number) => {
      setDownloadedUpdatesPercentage(percentage)
    })
    return () => {
      window.electron.ipcRenderer.removeAllListeners('update-status')
      window.electron.ipcRenderer.removeAllListeners('downloaded-updates-percentage')
    }
  }, [])
  const currentProjectIndex = useAppStore((state) => state.currentProjectIndex)
  return <>{currentProjectIndex === null ? <Dashboard /> : <Editor />}</>
}

export default App

import React from 'react'
import Dashboard from './components/Dashboard/Dashboard'
import Editor from './components/Editor/Editor'
import useAppStore, { AppUpdatesLifecycle } from './store/store'
import indexedDBService from './database/IndexedDBService'
import { PROJECTS_LIMIT } from './constants'

function App(): JSX.Element {
  const setAppUpdateStatus = useAppStore((state) => state.setAppUpdateStatus)
  const setDownloadedUpdatesPercentage = useAppStore(
    (state) => state.setDownloadedUpdatesPercentage
  )
  const pageNumber = useAppStore((state) => state.pageNumber)
  const setTotalProjects = useAppStore((state) => state.setTotalProjects)
  const fetchProjects = useAppStore((state) => state.fetchProjects)
  const currentProjectIndex = useAppStore((state) => state.currentProjectIndex)
  const projectsSearchFilter = useAppStore((state) => state.projectsSearchFilter)

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

  React.useEffect(() => {
    fetchProjects(pageNumber, PROJECTS_LIMIT, projectsSearchFilter)
  }, [pageNumber, projectsSearchFilter])

  React.useEffect(() => {
    indexedDBService.getProjectsCount(projectsSearchFilter).then(setTotalProjects)
  }, [projectsSearchFilter])

  return <>{currentProjectIndex === null ? <Dashboard /> : <Editor />}</>
}

export default App

import React from 'react'
import Dashboard from './components/Dashboard/Dashboard'
import Editor from './components/Editor/Editor'
import useAppStore, { AppUpdatesLifecycle, Subtitle } from './store/store'
import indexedDBService from './database/IndexedDBService'
import { PROJECTS_LIMIT } from './constants'
import { usePostHog } from 'posthog-js/react'

type SubtitleGenerationProgressPayload = {
  type: 'progress' | 'completed' | 'error'
  projectId: IDBValidKey
  subtitles?: Subtitle[]
  duration?: number
}

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
  const setSubtitles = useAppStore((state) => state.setSubtitles)
  const handleSubtitleGenerationError = useAppStore((state) => state.handleSubtitleGenerationError)
  const setGeneratedSubtitlesPercentage = useAppStore(
    (state) => state.setGeneratedSubtitlesPercentage
  )
  const posthog = usePostHog()

  React.useEffect(() => {
    window.electron.ipcRenderer.on('update-status', (_, status: AppUpdatesLifecycle) => {
      setAppUpdateStatus(status)
    })
    window.electron.ipcRenderer.on('downloaded-updates-percentage', (_, percentage: number) => {
      setDownloadedUpdatesPercentage(percentage)
    })
    window.electron.ipcRenderer.on(
      'subtitle-generation-progress',
      (_, payload: SubtitleGenerationProgressPayload) => {
        if (payload.type === 'progress')
          setGeneratedSubtitlesPercentage(payload.duration!, payload.projectId)
        if (payload.type === 'completed') setSubtitles(payload.subtitles!, payload.projectId)
        if (payload.type === 'error') handleSubtitleGenerationError(payload.projectId)
      }
    )
    window.electron.ipcRenderer.invoke('get-system-info').then((systemInfo) => {
      posthog.capture('$set', {
        $set: { ...systemInfo }
      })
    })
    return () => {
      window.electron.ipcRenderer.removeAllListeners('update-status')
      window.electron.ipcRenderer.removeAllListeners('downloaded-updates-percentage')
      window.electron.ipcRenderer.removeAllListeners('subtitle-generation-progress')
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

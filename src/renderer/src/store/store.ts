import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import localforage from 'localforage'
export enum TranscriptionStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

export type Subtitle = {
  start: number
  end: number
  text: string
}

export type Project = {
  id: number
  name: string
  mediaThumbnail: string | null
  subtitles: Subtitle[]
  mediaPath: string | null
  mediaName: string | null
  mediaCurrentTime: number
  mediaDuration: number
  transcriptionStatus: TranscriptionStatus
  subtitleGenerationProgress: number
  mediaType: string | null
}

type State = {
  projects: Project[]
  currentProjectIndex: number | null
  modelFilesDownloaded: boolean
  createNewProject: (project: Project) => void
  setTranscriptionStatus: (status: TranscriptionStatus, projectIndex: number) => void
  setSubtitleGenerationProgress: (progress: number, projectIndex: number) => void
  setSubtitles: (subtitles: Subtitle[], projectIndex: number) => void
  editSubtitle: (index: number, text: string) => void
  setMediaCurrentTime: (time: number) => void
  setMediaDuration: (duration: number) => void
  setMediaPath: (mediaPath: string) => void
  setMediaName: (mediaName: string) => void
  setProjectName: (name: string) => void
  setCurrentProjectIndex: (index: number | null) => void
  setMediaThumbnail: (thumbnail: string) => void
  setMediaType: (mediaType: string) => void
  deleteProject: (id: number) => Promise<void>
  setModelFilesDownloaded: (downloaded: boolean) => void
}

const storage = {
  getItem: async (name: string): Promise<string | null> => {
    return await localforage.getItem(name)
  },
  setItem: async (name: string, value: string): Promise<string> => {
    return await localforage.setItem(name, value)
  },
  removeItem: async (name: string): Promise<void> => {
    return await localforage.removeItem(name)
  }
}

const useAppStore = create<State>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectIndex: null,
      modelFilesDownloaded: false,
      setTranscriptionStatus: (status, projectIndex): void => {
        set((state) => {
          const projects = [...state.projects]
          projects[projectIndex].transcriptionStatus = status
          return { projects }
        })
      },
      setSubtitleGenerationProgress: (progress, projectIndex): void => {
        set((state) => {
          const projects = [...state.projects]
          projects[projectIndex].subtitleGenerationProgress = progress
          return { projects }
        })
      },
      setSubtitles: (subtitles, projectIndex): void => {
        set((state) => {
          const projects = [...state.projects]
          projects[projectIndex].subtitles = subtitles
          return { projects }
        })
      },
      editSubtitle: (index, text): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          projects[state.currentProjectIndex].subtitles[index].text = text
          return { projects }
        })
      },
      setMediaCurrentTime: (time): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          projects[state.currentProjectIndex].mediaCurrentTime = time
          return { projects }
        })
      },
      setMediaDuration: (duration): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          projects[state.currentProjectIndex].mediaDuration = duration
          return { projects }
        })
      },
      createNewProject: (project): void => {
        set((state) => {
          const projects = [...state.projects, project]
          return { projects, currentProjectIndex: projects.length - 1 }
        })
      },
      setMediaPath: (mediaPath): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          projects[state.currentProjectIndex].mediaPath = mediaPath
          return { projects }
        })
      },
      setMediaName: (mediaName): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          projects[state.currentProjectIndex].mediaName = mediaName
          return { projects }
        })
      },
      setProjectName: (name): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          projects[state.currentProjectIndex].name = name
          return { projects }
        })
      },
      setCurrentProjectIndex: (index): void => {
        set({ currentProjectIndex: index })
      },
      setMediaThumbnail: (thumbnail): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          projects[state.currentProjectIndex].mediaThumbnail = thumbnail
          return { projects }
        })
      },
      setMediaType: (mediaType): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          projects[state.currentProjectIndex].mediaType = mediaType
          return { projects }
        })
      },
      deleteProject: async (id): Promise<void> => {
        const state = get()
        const project = state.projects.find((project) => project.id === id)
        if (project?.mediaThumbnail)
          await window.electron.ipcRenderer.invoke('delete-thumbnail', project.mediaThumbnail)
        const projects = state.projects.filter((project) => project.id !== id)
        set({ projects })
      },
      setModelFilesDownloaded: (downloaded): void => {
        set({ modelFilesDownloaded: downloaded })
      }
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => storage)
    }
  )
)

export default useAppStore

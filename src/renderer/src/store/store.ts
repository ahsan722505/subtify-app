import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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
}

type State = {
  projects: Project[]
  currentProjectIndex: number | null
  createNewProject: (project: Project) => void
  setTranscriptionStatus: (status: TranscriptionStatus) => void
  setSubtitleGenerationProgress: (progress: number) => void
  setSubtitles: (subtitles: Subtitle[]) => void
  editSubtitle: (index: number, text: string) => void
  setMediaCurrentTime: (time: number) => void
  setMediaDuration: (duration: number) => void
  setMediaPath: (mediaPath: string) => void
  setMediaName: (mediaName: string) => void
}

const useAppStore = create<State>()(
  persist(
    (set) => ({
      projects: [],
      currentProjectIndex: null,
      setTranscriptionStatus: (status): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          projects[state.currentProjectIndex].transcriptionStatus = status
          return { projects }
        })
      },
      setSubtitleGenerationProgress: (progress): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          projects[state.currentProjectIndex].subtitleGenerationProgress = progress
          return { projects }
        })
      },
      setSubtitles: (subtitles): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          projects[state.currentProjectIndex].subtitles = subtitles
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
      }
    }),
    {
      name: 'app-store'
    }
  )
)

export default useAppStore

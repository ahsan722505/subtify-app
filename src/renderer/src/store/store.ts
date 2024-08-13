import { create } from 'zustand'
import Konva from 'konva'
import indexedDBService from '@renderer/database/IndexedDBService'
import { AnimationType, PROJECTS_LIMIT } from '@renderer/constants'
import {
  generateUniqueId,
  hmsToSecondsOnly
} from '@renderer/components/Editor/Subtitles/SubtitleList/SubtitleList.utils'
import { message } from 'antd'
import { persist } from 'zustand/middleware'

export enum navItems {
  myProjects = 'My Projects',
  appUpdates = 'App Updates'
}

export enum AppUpdatesLifecycle {
  Checking = 'checking',
  UPTODATE = 'up-to-date',
  DOWNLOADING = 'downloading',
  DOWNLOADED = 'downloaded'
}

export enum TranscriptionStatus {
  MediaInput = 'mediaInput',
  SubtitleTypeInput = 'subtitleTypeInput',
  AutoSubtitleInput = 'autoSubtitleInput',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
  STYLES = 'styles',
  ANIMATIONS = 'animations'
}

export enum AlphabetCase {
  UPPERCASE = 'uppercase',
  LOWERCASE = 'lowercase',
  CAPITALIZE = 'capitalize'
}

export enum BackgroundType {
  SINGLE = 'single',
  SPLITTED = 'splitted'
}

export type Subtitle = {
  start: number
  end: number
  text: string
  id: string
}

export type UserFont = {
  name: string
  path: string
}

export type Project = {
  id: IDBValidKey
  name: string
  mediaThumbnail: string | null
  subtitles: Subtitle[]
  mediaPath: string | null
  mediaName: string | null
  mediaCurrentTime: number
  mediaDuration: number
  transcriptionStatus: TranscriptionStatus
  mediaType: string | null
  subtitleStyleProps: Konva.TextConfig | null
  canvasWidth: number
  canvasHeight: number
  generatedSubtitlesPercentage: number
  showSubtitleBackground: boolean
  subtitleBackgroundColor: string
  alphabetCase: AlphabetCase | null
  fileNotFound: boolean
  backgroundType: BackgroundType | null
  borderRadius: boolean
  animationColor: string | null
  currentAnimation: AnimationType | null
  showAnimation: boolean
}

type State = {
  projects: Project[]
  currentProjectIndex: number | null
  currentNavItem: navItems
  appUpdateStatus: AppUpdatesLifecycle
  downloadedUpdatesPercentage: number
  loadingProjects: boolean
  pageNumber: number
  totalProjects: number
  projectsSearchFilter: string
  userFonts: UserFont[]
  presetColors: string[]
  fetchProjects: (pageNumber: number, limit: number, searchFilter: string) => Promise<void>
  createNewProject: (project: Project) => void
  setTranscriptionStatus: (status: TranscriptionStatus, projectId: IDBValidKey) => void
  setSubtitles: (subtitles: Subtitle[], projectId: IDBValidKey) => void
  editSubtitle: (id: string, text: string) => void
  setMediaCurrentTime: (time: number) => void
  setMediaDuration: (duration: number) => void
  setMediaPath: (mediaPath: string) => void
  setMediaName: (mediaName: string) => void
  setProjectName: (name: string) => void
  setCurrentProjectIndex: (index: number | null) => void
  setMediaThumbnail: (thumbnail: string) => void
  setMediaType: (mediaType: string) => void
  deleteProject: (id: IDBValidKey) => Promise<void>
  setCurrentNavItem: (navItem: navItems) => void
  setAppUpdateStatus: (status: AppUpdatesLifecycle) => void
  setDownloadedUpdatesPercentage: (percentage: number) => void
  initializeSubtitleStyleProps: (props: Konva.TextConfig) => void
  setSubtitleStyleProps: (props: Konva.TextConfig) => void
  setCanvasWidth: (width: number) => void
  setCanvasHeight: (height: number) => void
  setPageNumber: (pageNumber: number) => void
  setTotalProjects: (totalProjects: number) => void
  setProjectsSearchFilter: (filter: string) => void
  insertSubtitleLine: (id: string) => void
  deleteSubtitleLine: (id: string) => void
  mergeSubtitleLines: (id: string) => void
  setGeneratedSubtitlesPercentage: (duration: number, projectId: IDBValidKey) => void
  setTime: (updatedTime: string, subtitleId: string, subtitleType: 'start' | 'end') => void
  shiftSubtitles: (time: number) => void
  handleSubtitleGenerationError: (projectId: IDBValidKey) => void
  setShowSubtitleBackground: (showSubtitleBackground: boolean) => void
  setSubtitleBackgroundColor: (subtitleBackgroundColor: string) => void
  setAlphabetCase: (alphabetCase: AlphabetCase | null) => void
  setFileNotFound: (fileNotFound: boolean) => void
  addUserFont: (font: UserFont) => void
  addPresetColor: (color: string) => void
  setBackgroundType: (backgroundType: BackgroundType) => void
  setBorderRadius: (borderRadius: boolean) => void
  setAnimationColor: (color: string) => void
  setCurrentAnimation: (animation: AnimationType) => void
  setShowAnimation: (showAnimation: boolean) => void
}

const useAppStore = create<State>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectIndex: null,
      currentNavItem: navItems.myProjects,
      appUpdateStatus: AppUpdatesLifecycle.Checking,
      downloadedUpdatesPercentage: 0,
      loadingProjects: false,
      pageNumber: 1,
      totalProjects: 0,
      projectsSearchFilter: '',
      userFonts: [],
      presetColors: [],
      setProjectsSearchFilter: (filter): void => {
        set({ projectsSearchFilter: filter })
      },
      setTotalProjects: (totalProjects): void => {
        set({ totalProjects })
      },
      setPageNumber: (pageNumber): void => {
        set({ pageNumber })
      },
      fetchProjects: async (pageNumber, limit, searchFilter): Promise<void> => {
        set({ loadingProjects: true })
        const projects = await indexedDBService.getProjects(pageNumber, limit, searchFilter)
        set({ projects, loadingProjects: false })
      },
      setTranscriptionStatus: async (status, projectId): Promise<void> => {
        const project = await indexedDBService.getProject(projectId)
        await indexedDBService.updateProject({ ...project, transcriptionStatus: status })
        const projects = get().projects.map((project) => {
          if (project.id === projectId) return { ...project, transcriptionStatus: status }
          return project
        })
        set({ projects })
      },
      setSubtitles: async (subtitles, projectId): Promise<void> => {
        const project = await indexedDBService.getProject(projectId)
        await indexedDBService.updateProject({
          ...project,
          subtitles,
          transcriptionStatus: TranscriptionStatus.SUCCESS
        })
        const projects = get().projects.map((project) => {
          if (project.id === projectId)
            return { ...project, subtitles, transcriptionStatus: TranscriptionStatus.SUCCESS }
          return project
        })
        set({ projects })
      },
      editSubtitle: (id, text): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          const project = projects[state.currentProjectIndex]
          project.subtitles = project.subtitles.slice()
          const index = project.subtitles.findIndex((subtitle) => subtitle.id === id)
          project.subtitles[index].text = text
          indexedDBService.updateProject(project)
          return { projects }
        })
      },
      setMediaCurrentTime: (time): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          const project = projects[state.currentProjectIndex]
          project.mediaCurrentTime = time
          indexedDBService.updateProject(project)
          return { projects }
        })
      },
      setMediaDuration: (duration): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          const project = projects[state.currentProjectIndex]
          project.mediaDuration = duration
          indexedDBService.updateProject(project)
          return { projects }
        })
      },
      createNewProject: async (project): Promise<void> => {
        const state = get()
        const projects = [project, ...state.projects].slice(0, PROJECTS_LIMIT)
        await indexedDBService.addProject(project)
        set({
          projects,
          currentProjectIndex: 0,
          pageNumber: 1,
          totalProjects: state.totalProjects + 1,
          projectsSearchFilter: ''
        })
      },
      setMediaPath: (mediaPath): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          const project = projects[state.currentProjectIndex]
          project.mediaPath = mediaPath
          indexedDBService.updateProject(project)
          return { projects }
        })
      },
      setMediaName: (mediaName): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          const project = projects[state.currentProjectIndex]
          project.mediaName = mediaName
          indexedDBService.updateProject(project)
          return { projects }
        })
      },
      setProjectName: (name): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          const project = projects[state.currentProjectIndex]
          project.name = name
          indexedDBService.updateProject(project)
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
          const project = projects[state.currentProjectIndex]
          project.mediaThumbnail = thumbnail
          indexedDBService.updateProject(project)
          return { projects }
        })
      },
      setMediaType: (mediaType): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          const project = projects[state.currentProjectIndex]
          project.mediaType = mediaType
          indexedDBService.updateProject(project)
          return { projects }
        })
      },
      deleteProject: async (id): Promise<void> => {
        const state = get()
        const project = state.projects.find((project) => project.id === id)
        if (project?.mediaThumbnail)
          await window.electron.ipcRenderer.invoke('delete-thumbnail', project.mediaThumbnail)
        const projects = state.projects.filter((project) => project.id !== id)
        await indexedDBService.deleteProject(id)
        if (projects.length === 0) {
          const previousPage = Math.max(1, state.pageNumber - 1)
          state.fetchProjects(previousPage, PROJECTS_LIMIT, state.projectsSearchFilter)
          state.setPageNumber(previousPage)
        } else {
          state.fetchProjects(state.pageNumber, PROJECTS_LIMIT, state.projectsSearchFilter)
        }
        state.setTotalProjects(Math.max(0, state.totalProjects - 1))
      },
      setCurrentNavItem: (navItem): void => {
        set({ currentNavItem: navItem })
      },
      setAppUpdateStatus: (status): void => {
        set({ appUpdateStatus: status })
      },
      setDownloadedUpdatesPercentage: (percentage): void => {
        set({ downloadedUpdatesPercentage: percentage })
      },
      initializeSubtitleStyleProps: (props): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          const project = projects[state.currentProjectIndex]
          if (!project.subtitleStyleProps) project.subtitleStyleProps = props
          indexedDBService.updateProject(project)
          return { projects }
        })
      },
      setSubtitleStyleProps: (props): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          const project = projects[state.currentProjectIndex]
          project.subtitleStyleProps = props
          indexedDBService.updateProject(project)
          return { projects }
        })
      },
      setCanvasWidth: (width): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          const project = projects[state.currentProjectIndex]
          project.canvasWidth = width
          indexedDBService.updateProject(project)
          return { projects }
        })
      },
      setCanvasHeight: (height): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          const project = projects[state.currentProjectIndex]
          project.canvasHeight = height
          indexedDBService.updateProject(project)
          return { projects }
        })
      },
      insertSubtitleLine: (id): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          const project = projects[state.currentProjectIndex]
          project.subtitles = project.subtitles.slice()
          const index = project.subtitles.findIndex((subtitle) => subtitle.id === id) + 1
          project.subtitles.splice(index, 0, { start: 0, end: 0, text: '', id: generateUniqueId() })
          project.subtitles[index].start = project.subtitles[index - 1].end
          project.subtitles[index].end =
            project.subtitles[index + 1]?.start || project.mediaDuration
          indexedDBService.updateProject(project)
          return { projects }
        })
      },
      deleteSubtitleLine: (id): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          const project = projects[state.currentProjectIndex]
          if (project.subtitles.length === 1) return state
          project.subtitles = project.subtitles.slice()
          const index = project.subtitles.findIndex((subtitle) => subtitle.id === id)
          project.subtitles.splice(index, 1)
          indexedDBService.updateProject(project)
          return { projects }
        })
      },
      mergeSubtitleLines: (id): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          const project = projects[state.currentProjectIndex]
          project.subtitles = project.subtitles.slice()
          const index1 = project.subtitles.findIndex((subtitle) => subtitle.id === id)
          const index2 = index1 + 1
          project.subtitles[index1].end = project.subtitles[index2].end
          project.subtitles[index1].text =
            project.subtitles[index1].text + ' ' + project.subtitles[index2].text
          project.subtitles.splice(index2, 1)
          indexedDBService.updateProject(project)
          return { projects }
        })
      },
      setGeneratedSubtitlesPercentage: async (duration, projectId): Promise<void> => {
        const project = await indexedDBService.getProject(projectId)
        const percentage = (duration / project.mediaDuration) * 100
        await indexedDBService.updateProject({
          ...project,
          generatedSubtitlesPercentage: percentage
        })
        const projects = get().projects.map((project) => {
          if (project.id === projectId)
            return { ...project, generatedSubtitlesPercentage: percentage }
          return project
        })
        set({ projects })
      },
      setTime: (updatedTime, subtitleId, subtitleType): void => {
        const state = get()
        if (state.currentProjectIndex === null) return
        const projects = [...state.projects]
        const project = projects[state.currentProjectIndex]
        project.subtitles = project.subtitles.slice()
        const index = project.subtitles.findIndex((subtitle) => subtitle.id === subtitleId)
        const subtitle = project.subtitles[index]
        const timeInSeconds = hmsToSecondsOnly(updatedTime)
        if (isNaN(timeInSeconds) || timeInSeconds < 0) throw new Error('Invalid time format')
        const previousSubtitle = project.subtitles[index - 1]
        const nextSubtitle = project.subtitles[index + 1]
        if (subtitleType === 'start') {
          if (previousSubtitle && timeInSeconds < previousSubtitle.end) {
            throw new Error(
              'Start time should be greater than or equal to previous subtitle end time'
            )
          }
          if (timeInSeconds >= subtitle.end) {
            throw new Error('Start time should be less than end time')
          }
          subtitle.start = timeInSeconds
        } else {
          if (timeInSeconds <= subtitle.start) {
            throw new Error('Start time should be less than end time')
          }
          if (timeInSeconds > (nextSubtitle?.start || project.mediaDuration)) {
            throw new Error('End time should be less than or equal to next subtitle start time')
          }
          subtitle.end = timeInSeconds
        }
        indexedDBService.updateProject(project)
        set({ projects })
      },
      shiftSubtitles: (time): void => {
        const state = get()
        if (state.currentProjectIndex === null) return
        const projects = [...state.projects]
        const project = projects[state.currentProjectIndex]
        const firstSubtitle = project.subtitles[0]
        if (firstSubtitle.start + time < 0) {
          message.error(
            'Subtitle start time cannot be negative. Either remove first subtitle or update its start time'
          )
          return
        }
        const lastSubtitle = project.subtitles[project.subtitles.length - 1]
        if (lastSubtitle.end + time > project.mediaDuration) {
          message.error(
            'Subtitle end time cannot be greater than media duration. Either remove last subtitle or update its end time.'
          )
          return
        }
        project.subtitles = project.subtitles.map((subtitle) => {
          return {
            ...subtitle,
            start: Math.max(0, subtitle.start + time),
            end: Math.max(0, subtitle.end + time)
          }
        })
        indexedDBService.updateProject(project)
        set({ projects })
      },
      handleSubtitleGenerationError: async (projectId): Promise<void> => {
        const project = await indexedDBService.getProject(projectId)
        message.error('Subtitle generation failed. Please report the issue on the feedback page.')
        await indexedDBService.updateProject({
          ...project,
          transcriptionStatus: TranscriptionStatus.SubtitleTypeInput,
          generatedSubtitlesPercentage: 0
        })
        const projects = get().projects.map((project) => {
          if (project.id === projectId)
            return {
              ...project,
              transcriptionStatus: TranscriptionStatus.SubtitleTypeInput,
              generatedSubtitlesPercentage: 0
            }
          return project
        })
        set({ projects })
      },
      setShowSubtitleBackground: (showSubtitleBackground): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          const project = projects[state.currentProjectIndex]
          project.showSubtitleBackground = showSubtitleBackground
          indexedDBService.updateProject(project)
          return { projects }
        })
      },
      setSubtitleBackgroundColor: (subtitleBackgroundColor): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          const project = projects[state.currentProjectIndex]
          project.subtitleBackgroundColor = subtitleBackgroundColor
          indexedDBService.updateProject(project)
          return { projects }
        })
      },
      setAlphabetCase: (alphabetCase): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          const project = projects[state.currentProjectIndex]
          project.alphabetCase = alphabetCase
          indexedDBService.updateProject(project)
          return { projects }
        })
      },
      setFileNotFound: (fileNotFound): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          const project = projects[state.currentProjectIndex]
          project.fileNotFound = fileNotFound
          indexedDBService.updateProject(project)
          return { projects }
        })
      },
      addUserFont: (font): void => {
        set((state) => {
          if (state.userFonts.find((f) => f.path === font.path)) return state
          const userFonts = [...state.userFonts, font]
          return { userFonts }
        })
      },
      addPresetColor: (color): void => {
        set((state) => {
          if (state.presetColors.includes(color)) return state
          const presetColors = [...state.presetColors, color]
          return { presetColors }
        })
      },
      setBackgroundType: (backgroundType): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          const project = projects[state.currentProjectIndex]
          project.backgroundType = backgroundType
          indexedDBService.updateProject(project)
          return { projects }
        })
      },
      setBorderRadius: (borderRadius): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          const project = projects[state.currentProjectIndex]
          project.borderRadius = borderRadius
          indexedDBService.updateProject(project)
          return { projects }
        })
      },
      setAnimationColor: (color): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          const project = projects[state.currentProjectIndex]
          project.animationColor = color
          indexedDBService.updateProject(project)
          return { projects }
        })
      },
      setCurrentAnimation: (animation): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          const project = projects[state.currentProjectIndex]
          project.currentAnimation = animation
          indexedDBService.updateProject(project)
          return { projects }
        })
      },
      setShowAnimation: (showAnimation): void => {
        set((state) => {
          if (state.currentProjectIndex === null) return state
          const projects = [...state.projects]
          const project = projects[state.currentProjectIndex]
          project.showAnimation = showAnimation
          indexedDBService.updateProject(project)
          return { projects }
        })
      }
    }),
    {
      name: 'app-store',
      getStorage: () => localStorage,
      partialize: (state) => ({
        userFonts: state.userFonts,
        presetColors: state.presetColors
      })
    }
  )
)

export default useAppStore

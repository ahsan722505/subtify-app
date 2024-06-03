import useAppStore, { Project } from '@renderer/store/store'

export const useProjectStore = <T>(selector: (project: Project) => T): T => {
  return useAppStore((state) => {
    if (state.currentProjectIndex === null) throw new Error('No project selected')
    const project = state.projects[state.currentProjectIndex]
    return selector(project)
  })
}

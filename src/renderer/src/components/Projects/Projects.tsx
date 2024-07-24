import { Button, Empty, Input, Pagination, Spin } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import useAppStore, { TranscriptionStatus } from '@renderer/store/store'
import ProjectListItem from './ProjectListItem'
import { PROJECTS_LIMIT } from '@renderer/constants'
import { useDebouncedCallback } from '@renderer/hooks/useDebouncedCallback'

export default function Projects(): JSX.Element {
  const projects = useAppStore((state) => state.projects)
  const createNewProject = useAppStore((state) => state.createNewProject)
  const loadingProjects = useAppStore((state) => state.loadingProjects)
  const pageNumber = useAppStore((state) => state.pageNumber)
  const setPageNumber = useAppStore((state) => state.setPageNumber)
  const totalProjects = useAppStore((state) => state.totalProjects)
  const setProjectsSearchFilter = useAppStore((state) => state.setProjectsSearchFilter)
  const projectsSearchFilter = useAppStore((state) => state.projectsSearchFilter)
  const handleCreateNewProject = (): void => {
    createNewProject({
      mediaCurrentTime: 0,
      mediaDuration: 0,
      name: 'Untitled Project',
      subtitles: [],
      id: new Date().getTime(),
      mediaThumbnail: null,
      transcriptionStatus: TranscriptionStatus.MediaInput,
      mediaName: null,
      mediaPath: null,
      mediaType: null,
      subtitleStyleProps: null,
      canvasWidth: 0,
      canvasHeight: 0,
      generatedSubtitlesPercentage: 0,
      showSubtitleBackground: false,
      subtitleBackgroundColor: '',
      alphabetCase: null
    })
  }

  const handleSearch = useDebouncedCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setProjectsSearchFilter(e.target.value)
  })

  return (
    <div className="px-6 pt-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Projects</h1>
        <Button
          onClick={handleCreateNewProject}
          icon={<PlusOutlined />}
          className="bg-blue-500 text-white"
        >
          New Project
        </Button>
      </div>
      <Input.Search
        defaultValue={projectsSearchFilter}
        onChange={handleSearch}
        placeholder="Search projects by name"
        className="mb-6 w-1/2"
      />
      <div className="min-h-screen">
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-3">
            {projects.map((project, i) => (
              <ProjectListItem key={project.id as number} index={i} project={project} />
            ))}
          </div>
        ) : loadingProjects ? (
          <div className="h-[70vh] flex justify-center items-center">
            <Spin size="large" />
          </div>
        ) : (
          <div className="flex justify-center items-center h-[55vh]">
            <Empty
              description={
                projectsSearchFilter
                  ? 'No projects found please update the search filter.'
                  : "You don't have any projects. Please create a new project."
              }
            />
          </div>
        )}
      </div>
      <div className="sticky bottom-0 w-full p-3 bg-white flex justify-center">
        <Pagination
          onChange={(page) => setPageNumber(page)}
          pageSize={PROJECTS_LIMIT}
          current={pageNumber}
          total={totalProjects}
          showSizeChanger={false}
        />
      </div>
    </div>
  )
}

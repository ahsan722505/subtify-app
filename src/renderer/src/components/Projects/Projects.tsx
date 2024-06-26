import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import useAppStore, { TranscriptionStatus } from '@renderer/store/store'
import ProjectListItem from './ProjectListItem'

export default function Projects(): JSX.Element {
  const projects = useAppStore((state) => state.projects)
  const createNewProject = useAppStore((state) => state.createNewProject)
  const handleCreateNewProject = (): void => {
    createNewProject({
      mediaCurrentTime: 0,
      mediaDuration: 0,
      name: 'Untitled Project',
      subtitles: [],
      id: new Date().getTime(),
      mediaThumbnail: null,
      subtitleGenerationProgress: 0,
      transcriptionStatus: TranscriptionStatus.IDLE,
      mediaName: null,
      mediaPath: null,
      mediaType: null
    })
  }

  return (
    <div className="p-6">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, i) => (
          <ProjectListItem key={project.id} index={i} project={project} />
        ))}
      </div>
    </div>
  )
}

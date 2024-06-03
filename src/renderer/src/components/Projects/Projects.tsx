import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import useAppStore, { TranscriptionStatus } from '@renderer/store/store'

export default function Projects(): JSX.Element {
  const projects = useAppStore((state) => state.projects)
  const createNewProject = useAppStore((state) => state.createNewProject)
  const handleCreateNewProject = (): void => {
    createNewProject({
      file: null,
      mediaCurrentTime: 0,
      mediaDuration: 0,
      name: 'New Project',
      subtitles: [],
      id: new Date().getTime(),
      mediaThumbnail: null,
      subtitleGenerationProgress: 0,
      transcriptionStatus: TranscriptionStatus.IDLE
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
        {projects.map((project) => (
          <div key={project.id} className="border p-4 rounded-lg shadow-lg">
            <img
              src={project.mediaThumbnail || ''}
              alt={project.name}
              className="w-full h-48 object-cover rounded-md"
            />
            <h2 className="mt-4 text-lg font-semibold">{project.name}</h2>
            <p className="text-gray-500">{project.mediaDuration}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

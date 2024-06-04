import { Button } from 'antd'
import { PlusOutlined, PlaySquareFilled } from '@ant-design/icons'
import useAppStore, { TranscriptionStatus } from '@renderer/store/store'
import { formatTime } from '../Editor/Subtitles/SubtitleList/SubtitleList.utils'

export default function Projects(): JSX.Element {
  const projects = useAppStore((state) => state.projects)
  const createNewProject = useAppStore((state) => state.createNewProject)
  const setCurrentProjectIndex = useAppStore((state) => state.setCurrentProjectIndex)
  const handleCreateNewProject = (): void => {
    createNewProject({
      mediaCurrentTime: 0,
      mediaDuration: 0,
      name: 'New Project',
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
          <div
            key={project.id}
            className="border p-4 rounded-lg shadow-lg cursor-pointer"
            onClick={() => setCurrentProjectIndex(i)}
          >
            <div className="flex justify-center">
              {project.mediaThumbnail ? (
                <img
                  src={project.mediaThumbnail}
                  alt={project.name}
                  className="w-full h-48 object-cover rounded-md"
                />
              ) : (
                <PlaySquareFilled className="text-9xl text-gray-300 h-48" />
              )}
            </div>
            <h2 className="mt-4 text-lg font-semibold">{project.name}</h2>
            <p className="text-gray-500">{formatTime(project.mediaDuration)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

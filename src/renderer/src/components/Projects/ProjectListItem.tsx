import useAppStore, { Project } from '@renderer/store/store'
import { Dropdown, MenuProps, Popconfirm } from 'antd'
import { formatTime } from '../Editor/Subtitles/SubtitleList/SubtitleList.utils'
import { MoreOutlined, DeleteOutlined, PlaySquareFilled } from '@ant-design/icons'

export default function ProjectListItem({
  project,
  index
}: {
  project: Project
  index: number
}): JSX.Element {
  const setCurrentProjectIndex = useAppStore((state) => state.setCurrentProjectIndex)
  const deleteProject = useAppStore((state) => state.deleteProject)
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <Popconfirm
          title="Delete the project"
          description="Are you sure to delete this project?"
          onConfirm={() => deleteProject(project.id)}
          okText="Yes"
          cancelText="No"
          okButtonProps={{ danger: true }}
        >
          Delete
        </Popconfirm>
      ),
      icon: <DeleteOutlined />,
      danger: true
    }
  ]
  return (
    <div
      key={+project.id}
      className="border p-4 rounded-lg shadow-lg cursor-pointer"
      onClick={() => setCurrentProjectIndex(index)}
    >
      <div className="flex justify-end mb-4 text-xl" onClick={(e) => e.stopPropagation()}>
        <Dropdown menu={{ items }} placement="bottomLeft">
          <MoreOutlined className="cursor-pointer" />
        </Dropdown>
      </div>
      <div className="flex justify-center">
        {project.mediaThumbnail ? (
          <img
            src={`file://${project.mediaThumbnail}`}
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
  )
}

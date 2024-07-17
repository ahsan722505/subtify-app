import { Button, Input } from 'antd'
import ControlPanel from './ControlPanel/ControlPanel'
import Media from './Media/Media'
import Subtitles from './Subtitles/Subtitles'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import { useDebouncedCallback } from '@renderer/hooks/useDebouncedCallback'
import useAppStore from '@renderer/store/store'

export default function Editor(): JSX.Element {
  const projectName = useProjectStore((state) => state.name)
  const setProjectName = useAppStore((state) => state.setProjectName)
  const setCurrentProjectIndex = useAppStore((state) => state.setCurrentProjectIndex)
  const handleUpdateProjectName = useDebouncedCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      setProjectName(e.target.value)
    }
  )
  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="flex w-full h-3/4">
        <div className="w-1/2 border-r border-gray-200 overflow-auto" id="scrollableDiv">
          <Subtitles />
        </div>
        <div className="w-1/2">
          <div className="flex justify-between p-4">
            <Input
              defaultValue={projectName}
              onChange={handleUpdateProjectName}
              className="border-none focus:ring-0 w-auto text-2xl font-semibold"
            />
            <Button onClick={() => setCurrentProjectIndex(null)}>My Projects</Button>
          </div>
          <Media />
        </div>
      </div>
      <div className="h-1/4 border border-gray-200">
        <ControlPanel />
      </div>
    </div>
  )
}

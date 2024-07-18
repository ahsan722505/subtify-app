import appIcon from '@renderer/assets/icon.ico'
import useAppStore, { navItems } from '@renderer/store/store'
import { FileDoneOutlined } from '@ant-design/icons'
import clsx from 'clsx'
import { Button, message } from 'antd'

export default function Sider(): JSX.Element {
  const setCurrentNavItem = useAppStore((state) => state.setCurrentNavItem)
  const currentNavItem = useAppStore((state) => state.currentNavItem)
  return (
    <div className="w-[15%] border-r border-gray-200 px-3">
      <div className="flex justify-start items-center my-9">
        <img src={appIcon} alt="app icon" className="w-10 h-10" />
        <h1 className="ml-2 text-2xl font-bold">Subtify</h1>
      </div>
      <ul>
        {Object.values(navItems).map((item) => (
          <li
            key={item}
            className={clsx(
              'p-2 mb-4 cursor-pointer rounded hover:bg-gray-200',
              currentNavItem === item && 'bg-gray-200'
            )}
            onClick={() => setCurrentNavItem(item)}
          >
            {item}
          </li>
        ))}
      </ul>
      <h1 className="fixed bottom-5 left-5">
        <Button
          icon={<FileDoneOutlined />}
          type="primary"
          onClick={() => {
            message.info('Opening feedback page in your browser')
            window.electron.ipcRenderer.invoke('open-link', 'https://subtify.canny.io/feedback')
          }}
        >
          Feedback
        </Button>
      </h1>
    </div>
  )
}

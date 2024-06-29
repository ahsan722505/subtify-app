import useAppStore, { navItems } from '@renderer/store/store'
import Projects from '../Projects/Projects'
import AppUpdates from '../AppUpdates/AppUpdates'
import appIcon from '@renderer/assets/icon.ico'
import clsx from 'clsx'

const navItemsComponentMap = {
  [navItems.myProjects]: <Projects />,
  [navItems.appUpdates]: <AppUpdates />
}

export default function Dashboard(): JSX.Element {
  const currentNavItem = useAppStore((state) => state.currentNavItem)
  const setCurrentNavItem = useAppStore((state) => state.setCurrentNavItem)

  return (
    <div className="flex h-screen">
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
      </div>
      <div className="w-[85%] p-4">{navItemsComponentMap[currentNavItem]}</div>
    </div>
  )
}

import useAppStore, { navItems } from '@renderer/store/store'
import Projects from '../Projects/Projects'
import AppUpdates from '../AppUpdates/AppUpdates'

import Sider from './Sider/Sider'

const navItemsComponentMap = {
  [navItems.myProjects]: <Projects />,
  [navItems.appUpdates]: <AppUpdates />
}

export default function Dashboard(): JSX.Element {
  const currentNavItem = useAppStore((state) => state.currentNavItem)

  return (
    <div className="flex">
      <Sider />
      <div className="w-[85%] px-4 pt-4">{navItemsComponentMap[currentNavItem]}</div>
    </div>
  )
}

import { AnimationType } from '@renderer/constants'
import useAppStore from '@renderer/store/store'
import clsx from 'clsx'
import React from 'react'

export default React.memo(function AnimationItem({
  Icon,
  name,
  selected
}: {
  name: AnimationType
  Icon: Icon
  selected: boolean
}): JSX.Element {
  const setCurrentAnimation = useAppStore((state) => state.setCurrentAnimation)
  return (
    <div
      className={clsx('flex flex-col cursor-pointer', selected && 'text-blue-500')}
      onClick={() => setCurrentAnimation(name)}
    >
      <span
        className={clsx(
          'border border-black flex justify-center items-center rounded-md',
          selected && 'border-blue-500'
        )}
      >
        <Icon />
      </span>
      <span>{name}</span>
    </div>
  )
})

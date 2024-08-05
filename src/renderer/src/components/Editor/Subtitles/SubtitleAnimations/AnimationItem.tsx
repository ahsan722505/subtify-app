import clsx from 'clsx'
import React from 'react'

export default React.memo(function AnimationItem({
  Icon,
  name,
  selected
}: {
  name: string
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  selected: boolean
}): JSX.Element {
  return (
    <div className={clsx('flex flex-col cursor-pointer', selected && 'text-blue-500')}>
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

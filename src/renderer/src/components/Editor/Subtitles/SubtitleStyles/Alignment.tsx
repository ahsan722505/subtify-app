import clsx from 'clsx'
import { AlignCenterOutlined, AlignLeftOutlined, AlignRightOutlined } from '@ant-design/icons'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import useAppStore from '@renderer/store/store'

export default function Alignment(): JSX.Element {
  const subtitleStyleProps = useProjectStore((state) => state.subtitleStyleProps)
  const setSubtitleStyleProps = useAppStore((state) => state.setSubtitleStyleProps)
  const alignment = subtitleStyleProps?.align || 'center'
  const setAlignment = (align: string): void => {
    setSubtitleStyleProps({ ...subtitleStyleProps, align })
  }
  return (
    <div className="h-10 rounded-md border border-gray-300 flex justify-between items-center px-3 grow">
      <AlignLeftOutlined
        onClick={() => setAlignment('left')}
        className={clsx(
          'cursor-pointer hover:bg-gray-300 p-1 rounded-md',
          alignment === 'left' && 'bg-gray-300'
        )}
      />
      <AlignCenterOutlined
        onClick={() => setAlignment('center')}
        className={clsx(
          'cursor-pointer hover:bg-gray-300 p-1 rounded-md',
          alignment === 'center' && 'bg-gray-300'
        )}
      />
      <AlignRightOutlined
        onClick={() => setAlignment('right')}
        className={clsx(
          'cursor-pointer hover:bg-gray-300 p-1 rounded-md',
          alignment === 'right' && 'bg-gray-300'
        )}
      />
    </div>
  )
}

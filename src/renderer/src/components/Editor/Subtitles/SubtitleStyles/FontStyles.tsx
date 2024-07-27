import { BoldOutlined, ItalicOutlined } from '@ant-design/icons'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import useAppStore from '@renderer/store/store'
import clsx from 'clsx'

// possible values: 'normal' 'bold', 'italic', 'italic bold'
export default function FontStyles(): JSX.Element {
  const subtitleStyleProps = useProjectStore((state) => state.subtitleStyleProps)
  const setSubtitleStyleProps = useAppStore((state) => state.setSubtitleStyleProps)
  const boldEnabled = subtitleStyleProps?.fontStyle?.includes('bold')
  const italicEnabled = subtitleStyleProps?.fontStyle?.includes('italic')
  const toggleStyle = (style: string): void => {
    let newStyle = ''
    if (subtitleStyleProps?.fontStyle?.includes(style)) {
      newStyle = subtitleStyleProps.fontStyle.replace(style, '').trim()
    } else {
      newStyle = ((subtitleStyleProps?.fontStyle || '') + ' ' + style).trim()
    }
    if (!newStyle) newStyle = 'normal'
    else newStyle = newStyle.replace('normal', '').trim()
    setSubtitleStyleProps({ ...subtitleStyleProps, fontStyle: newStyle })
  }

  return (
    <div className="h-10 rounded-md border border-gray-300 w-36 flex justify-between items-center px-5">
      <BoldOutlined
        className={clsx(
          'cursor-pointer hover:bg-gray-300 p-1 rounded-md',
          boldEnabled && 'bg-gray-300'
        )}
        onClick={() => toggleStyle('bold')}
      />
      <ItalicOutlined
        className={clsx(
          'cursor-pointer hover:bg-gray-300 p-1 rounded-md',
          italicEnabled && 'bg-gray-300'
        )}
        onClick={() => toggleStyle('italic')}
      />
    </div>
  )
}

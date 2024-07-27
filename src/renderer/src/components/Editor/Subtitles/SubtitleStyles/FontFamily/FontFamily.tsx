import { FONTS_FAMILIES } from '@renderer/constants'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import useAppStore from '@renderer/store/store'
import { Select } from 'antd'
import FontFamilyItem from './FontFamilyItem'

export default function FontFamily(): JSX.Element {
  const subtitleStyleProps = useProjectStore((state) => state.subtitleStyleProps)
  const setSubtitleStyleProps = useAppStore((state) => state.setSubtitleStyleProps)

  return (
    <Select
      className="w-4/6 h-10"
      showSearch
      placeholder="Select a font"
      options={FONTS_FAMILIES.map((font) => ({
        value: font.family,
        label: font.family
      }))}
      value={subtitleStyleProps?.fontFamily}
      style={{ fontFamily: subtitleStyleProps?.fontFamily }}
      onChange={(value) => setSubtitleStyleProps({ ...subtitleStyleProps, fontFamily: value })}
      optionRender={({ value }) => <FontFamilyItem family={value as string} />}
    />
  )
}

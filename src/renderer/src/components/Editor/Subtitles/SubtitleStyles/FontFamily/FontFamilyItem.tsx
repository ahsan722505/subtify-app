import React from 'react'
import { loadFontFamily } from '../SubtitleStyles.utils'

export default React.memo(function FontFamilyItem({
  name,
  path
}: {
  name: string
  path?: string
}): JSX.Element {
  React.useEffect(() => {
    loadFontFamily(name, path)
  }, [name, path])
  return <span style={{ fontFamily: name }}>{name}</span>
})

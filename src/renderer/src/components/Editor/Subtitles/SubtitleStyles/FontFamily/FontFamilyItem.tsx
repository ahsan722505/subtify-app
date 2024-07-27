import React from 'react'
import { loadFontFamily } from '../SubtitleStyles.utils'

export default React.memo(function FontFamilyItem({ family }: { family: string }): JSX.Element {
  React.useEffect(() => {
    loadFontFamily(family)
  }, [family])
  return <span style={{ fontFamily: family }}>{family}</span>
})

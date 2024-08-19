import tinycolor from 'tinycolor2'

export const lightenColor = (color: string): string => {
  const colorObj = tinycolor(color)
  if (colorObj.getBrightness() === 255) return colorObj.darken(35).toString()
  return colorObj.lighten(35).toString()
}

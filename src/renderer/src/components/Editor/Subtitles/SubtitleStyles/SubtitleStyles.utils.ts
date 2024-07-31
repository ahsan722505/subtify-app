export function loadFontFamily(name: string, path?: string): void {
  if (path) {
    const url = 'file://' + path
    const fontFace = new FontFace(name, `url(${encodeURI(url)})`)
    fontFace.load().then((loadedFont) => {
      document.fonts.add(loadedFont)
    })
    return
  }

  // Load font from Google Fonts
  const href = `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, '+')}:ital,wght@0,400;0,700;1,400;1,700&display=swap`
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
  }
}

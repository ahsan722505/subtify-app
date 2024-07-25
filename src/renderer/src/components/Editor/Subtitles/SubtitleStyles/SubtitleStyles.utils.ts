export function loadFontFamily(family: string): void {
  const href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:ital,wght@0,400;0,700;1,400;1,700&display=swap`
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
  }
}

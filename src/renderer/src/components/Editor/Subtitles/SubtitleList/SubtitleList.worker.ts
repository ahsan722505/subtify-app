self.onmessage = (event): void => {
  const { subtitles, id } = event.data
  const index = subtitles.findIndex((subtitle) => subtitle.id === id)
  self.postMessage(index)
}

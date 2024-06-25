export async function generateVideoThumbnail(videoPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.src = videoPath
    video.currentTime = 1
    video.onloadeddata = async (): Promise<void> => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
      const dataURL = canvas.toDataURL('image/png')
      const thumbnailPath = await window.electron.ipcRenderer.invoke('save-thumbnail', dataURL)
      resolve(thumbnailPath)
    }
    video.onerror = reject
  })
}

export const isVideo = (mimeType: string): boolean => mimeType.startsWith('video')

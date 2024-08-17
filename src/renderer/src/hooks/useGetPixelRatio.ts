import { useProjectStore } from './useProjectStore'

export default function useGetPixelRatio(): number {
  const canvasWidth = useProjectStore((state) => state.canvasWidth)
  const canvasHeight = useProjectStore((state) => state.canvasHeight)
  const videoElement = document.getElementById('media') as HTMLVideoElement
  const videoWidth = videoElement?.videoWidth
  const videoHeight = videoElement?.videoHeight
  const pixelRatioX = videoWidth / canvasWidth
  const pixelRatioY = videoHeight / canvasHeight
  return Math.max(pixelRatioX, pixelRatioY)
}

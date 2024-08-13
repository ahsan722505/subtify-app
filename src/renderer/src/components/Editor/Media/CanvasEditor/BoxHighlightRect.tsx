import React from 'react'
import { Rect } from 'react-konva'
import Konva from 'konva'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import { DEFAULT_ANIMATION_COLOR } from '@renderer/constants'

export default function BoxHighlightRect({
  x: initialX,
  y: initialY,
  width: initialWidth,
  height: initialHeight
}: Konva.RectConfig): JSX.Element {
  const rectRef = React.useRef(null)
  const animationColor = useProjectStore((state) => state.animationColor) || DEFAULT_ANIMATION_COLOR

  React.useEffect(() => {
    const rect = rectRef.current
    if (!rect || !initialX || !initialY || !initialWidth || !initialHeight) return
    let tween2: Konva.Tween | null = null
    let tween1: Konva.Tween | null = null

    const animate = (): void => {
      // First animation
      tween1 = new Konva.Tween({
        node: rect,
        duration: 0.1,
        x: initialX - 5,
        y: initialY - 5,
        width: initialWidth + 10,
        height: initialHeight + 10,
        onFinish: (): void => {
          // Second animation (reverse)
          tween2 = new Konva.Tween({
            node: rect,
            duration: 0.1,
            x: initialX - 2,
            y: initialY - 2,
            width: initialWidth + 4,
            height: initialHeight + 4
          })
          tween2.play()
        }
      })
      tween1.play()
    }

    animate()

    return () => {
      if (tween1) tween1.destroy()
      if (tween2) tween2.destroy()
    }
  }, [initialX, initialY, initialWidth, initialHeight])

  return (
    <Rect
      ref={rectRef}
      width={initialWidth}
      height={initialHeight}
      x={initialX}
      y={initialY}
      fill={animationColor}
      cornerRadius={6}
    />
  )
}

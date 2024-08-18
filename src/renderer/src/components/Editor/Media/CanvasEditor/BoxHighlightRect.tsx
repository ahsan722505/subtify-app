import { useSpring, animated } from '@react-spring/konva'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import { DEFAULT_ANIMATION_COLOR } from '@renderer/constants'

export default function BoxHighlightRect({
  x: initialX,
  y: initialY,
  width: initialWidth,
  height: initialHeight
}: {
  x: number
  y: number
  width: number
  height: number
}): JSX.Element {
  const animationColor = useProjectStore((state) => state.animationColor) || DEFAULT_ANIMATION_COLOR

  const spring = useSpring({
    from: {
      x: initialX,
      y: initialY,
      width: initialWidth,
      height: initialHeight
    },
    to: [
      {
        x: initialX - 5,
        y: initialY - 5,
        width: initialWidth + 10,
        height: initialHeight + 10
      },
      {
        x: initialX - 2,
        y: initialY - 2,
        width: initialWidth + 4,
        height: initialHeight + 4
      }
    ],
    config: { duration: 100 }
  })
  // @ts-ignore - unkown type error
  return <animated.Rect {...spring} fill={animationColor} cornerRadius={6} />
}

import { animated, easings, useSpring } from '@react-spring/konva'
import { AnimationType, DEFAULT_ANIMATION } from '@renderer/constants'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import Konva from 'konva'
import React, { PropsWithChildren } from 'react'

export default React.forwardRef<Konva.Group, PropsWithChildren & Konva.GroupConfig>(
  function AnimatedGroup({ children, ...props }, ref): JSX.Element {
    const showAnimation = useProjectStore((state) => state.showAnimation)
    const currentAnimation = useProjectStore((state) => state.currentAnimation) || DEFAULT_ANIMATION
    const springs = useSpring({
      from: {
        opacity: showAnimation && currentAnimation === AnimationType.FlipClock ? 0 : 1,
        scaleY: showAnimation && currentAnimation === AnimationType.FlipClock ? -1 : 1
      },
      to: {
        opacity: 1,
        scaleY: 1
      },
      config: (key) => {
        return {
          duration: key === 'opacity' ? 200 : 180,
          easing: easings.easeOutSine
        }
      }
    })
    return (
      // @ts-ignore - unkown type error
      <animated.Group ref={ref} {...springs} {...props}>
        {children}
      </animated.Group>
    )
  }
)

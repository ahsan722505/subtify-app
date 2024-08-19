import { useSpring, animated } from '@react-spring/konva'
import { AnimationType } from '@renderer/constants'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import Konva from 'konva'
import { Text } from 'react-konva'

export default function AnimatedText({
  characterIndex,
  currentEndCharacterIndex,
  currentStartCharacterIndex,
  ...props
}: Konva.TextConfig & {
  characterIndex: number
  currentStartCharacterIndex: number
  currentEndCharacterIndex: number
}): JSX.Element {
  const showAnimation = useProjectStore((state) => state.showAnimation)
  const currentAnimation = useProjectStore((state) => state.currentAnimation)
  if (!showAnimation) return <Text {...props} />
  if (currentAnimation === AnimationType.Reveal) {
    return (
      <RevealAnimatedText
        characterIndex={characterIndex}
        currentEndCharacterIndex={currentEndCharacterIndex}
        {...props}
      />
    )
  }
  if (currentAnimation === AnimationType.FloatDown) {
    return (
      <FloatDownAnimatedText
        characterIndex={characterIndex}
        currentEndCharacterIndex={currentEndCharacterIndex}
        currentStartCharacterIndex={currentStartCharacterIndex}
        {...props}
      />
    )
  }
  if (currentAnimation === AnimationType.FloatUp) {
    return (
      <FloatUpAnimatedText
        characterIndex={characterIndex}
        currentEndCharacterIndex={currentEndCharacterIndex}
        currentStartCharacterIndex={currentStartCharacterIndex}
        {...props}
      />
    )
  }
  if (currentAnimation === AnimationType.DropIn) {
    return (
      <DropInAnimatedText
        characterIndex={characterIndex}
        currentEndCharacterIndex={currentEndCharacterIndex}
        currentStartCharacterIndex={currentStartCharacterIndex}
        {...props}
      />
    )
  }
  if (currentAnimation === AnimationType.ImpactPop) {
    return <ImpactPopAnimatedText {...props} />
  }

  return <Text {...props} />
}

function RevealAnimatedText({
  characterIndex,
  currentEndCharacterIndex,
  ...props
}: Konva.TextConfig & {
  characterIndex: number
  currentEndCharacterIndex: number
}): JSX.Element {
  let opacity = 1
  if (characterIndex > currentEndCharacterIndex) opacity = 0
  return <Text {...props} opacity={opacity} />
}

function FloatDownAnimatedText({
  characterIndex,
  currentEndCharacterIndex,
  currentStartCharacterIndex,
  ...props
}: Konva.TextConfig & {
  characterIndex: number
  currentEndCharacterIndex: number
  currentStartCharacterIndex: number
}): JSX.Element {
  const animateFloatDown =
    characterIndex >= currentStartCharacterIndex && characterIndex <= currentEndCharacterIndex
  const springs = useSpring({
    from: {
      opacity: characterIndex < currentStartCharacterIndex ? 1 : 0,
      y: animateFloatDown ? props.y! - 30 : props.y
    },
    to: {
      opacity: 1,
      y: props.y
    },
    cancel: !animateFloatDown,
    config: {
      duration: 150
    }
  })
  //   @ts-ignore - unkown type error
  return <animated.Text {...props} {...springs} />
}

function FloatUpAnimatedText({
  characterIndex,
  currentEndCharacterIndex,
  currentStartCharacterIndex,
  ...props
}: Konva.TextConfig & {
  characterIndex: number
  currentEndCharacterIndex: number
  currentStartCharacterIndex: number
}): JSX.Element {
  const animateFloatUp =
    characterIndex >= currentStartCharacterIndex && characterIndex <= currentEndCharacterIndex
  const springs = useSpring({
    from: {
      opacity: characterIndex < currentStartCharacterIndex ? 1 : 0,
      y: animateFloatUp ? props.y! + 30 : props.y
    },
    to: {
      opacity: 1,
      y: props.y
    },
    cancel: !animateFloatUp,
    config: {
      duration: 150
    }
  })
  //   @ts-ignore - unkown type error
  return <animated.Text {...props} {...springs} />
}

function DropInAnimatedText({
  characterIndex,
  currentEndCharacterIndex,
  currentStartCharacterIndex,
  ...props
}: Konva.TextConfig & {
  characterIndex: number
  currentEndCharacterIndex: number
  currentStartCharacterIndex: number
}): JSX.Element {
  const animateDropIn =
    characterIndex >= currentStartCharacterIndex && characterIndex <= currentEndCharacterIndex
  const springs = useSpring({
    from: {
      opacity: characterIndex < currentStartCharacterIndex ? 1 : 0,
      x: animateDropIn ? props.x! + 30 : props.x,
      scaleX: animateDropIn ? 2 : 1,
      scaleY: animateDropIn ? 2 : 1
    },
    to: {
      opacity: 1,
      x: props.x,
      scaleX: 1,
      scaleY: 1
    },
    cancel: !animateDropIn,
    config: {
      duration: 150
    }
  })
  //   @ts-ignore - unkown type error
  return <animated.Text {...props} {...springs} />
}

function ImpactPopAnimatedText(props: Konva.TextConfig): JSX.Element {
  const springs = useSpring({
    from: {
      opacity: 0,
      scaleX: 0.5,
      scaleY: 0.5
    },
    to: {
      opacity: 1,
      scaleX: 1,
      scaleY: 1
    },
    config: {
      duration: 150
    }
  })
  //   @ts-ignore - unkown type error
  return <animated.Text {...props} {...springs} />
}

import { useProjectStore } from '@renderer/hooks/useProjectStore'
import useAppStore, { AlphabetCase, BackgroundType } from '@renderer/store/store'
import Konva from 'konva'
import { KonvaEventObject } from 'konva/lib/Node'
import React from 'react'
import { Layer, Rect, Stage, StageProps, Transformer } from 'react-konva'
import { loadFontFamily } from '../../Subtitles/SubtitleStyles/SubtitleStyles.utils'
import FontFaceObserver from 'fontfaceobserver'
import BoxHighlightRect from './BoxHighlightRect'
import {
  AnimationType,
  DEFAULT_ANIMATION,
  DEFAULT_ANIMATION_COLOR,
  DEFAULT_TEXT_COLOR
} from '@renderer/constants'
import AnimatedGroup from './AnimatedGroup'
import { lightenColor } from './CanvasEditor.utils'
import AnimatedText from './AnimatedText'

const canvas = document.createElement('canvas')
const context = canvas.getContext('2d')

const GUIDELINE_OFFSET = 5

type Snap = 'start' | 'center' | 'end'
type SnappingEdges = {
  vertical: Array<{
    guide: number
    offset: number
    snap: Snap
  }>
  horizontal: Array<{
    guide: number
    offset: number
    snap: Snap
  }>
}

export default React.memo(function CanvasEditor(
  props: StageProps & {
    subtitle: string | null
    currentWordIndex: number | null
    currentStartCharacterIndex: number | null
    currentEndCharacterIndex: number | null
  }
): JSX.Element {
  const setSubtitleStyleProps = useAppStore((state) => state.setSubtitleStyleProps)
  const subtitleStyleProps = useProjectStore((state) => state.subtitleStyleProps)
  const [isSelected, setIsSelected] = React.useState(false)
  const [fontAvailable, setFontAvailable] = React.useState(false)
  const subtitleNodeRef = React.useRef<Konva.Group>(null)
  const trRef = React.useRef<Konva.Transformer>(null)
  const alphabetCase = useProjectStore((state) => state.alphabetCase)
  const userFonts = useAppStore((state) => state.userFonts)

  const showBackground = useProjectStore((state) => state.showSubtitleBackground)
  const backgroundColor = useProjectStore((state) => state.subtitleBackgroundColor) || '#000000FF'
  const backgroundRadius = useProjectStore((state) => state.borderRadius)
  const backgroundType = useProjectStore((state) => state.backgroundType) || BackgroundType.SPLITTED
  const showAnimation = useProjectStore((state) => state.showAnimation)
  const currentAnimation = useProjectStore((state) => state.currentAnimation) || DEFAULT_ANIMATION
  const animationColor = useProjectStore((state) => state.animationColor) || DEFAULT_ANIMATION_COLOR

  React.useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      trRef.current?.nodes([subtitleNodeRef.current!])
      trRef.current?.getLayer()?.batchDraw()
    }
  }, [isSelected])

  React.useEffect(() => {
    const handleDeselectionOutsideCanvas = (e: MouseEvent): void => {
      const clickedElement = e.target as HTMLElement
      if (clickedElement.tagName !== 'CANVAS') setIsSelected(false)
    }
    document.addEventListener('click', handleDeselectionOutsideCanvas)
    return () => {
      document.removeEventListener('click', handleDeselectionOutsideCanvas)
    }
  }, [])

  const handleNodeClick = (): void => setIsSelected(true)

  const checkDeselect = (e: KonvaEventObject<MouseEvent | TouchEvent>): void => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage()
    if (clickedOnEmpty) setIsSelected(false)
  }

  const getLineGuideStops = (
    skipShape: Konva.Shape
  ): { vertical: number[]; horizontal: number[] } => {
    const stage = skipShape.getStage()
    if (!stage) return { vertical: [], horizontal: [] }

    // we can snap to stage borders and the center of the stage
    const vertical = [0, stage.width() / 2, stage.width()]
    const horizontal = [0, stage.height() / 2, stage.height()]

    // and we snap over edges and center of each object on the canvas
    stage.find('.object').forEach((guideItem) => {
      if (guideItem === skipShape) {
        return
      }
      const box = guideItem.getClientRect()
      // and we can snap to all edges of shapes
      vertical.push(box.x, box.x + box.width, box.x + box.width / 2)
      horizontal.push(box.y, box.y + box.height, box.y + box.height / 2)
    })
    return {
      vertical,
      horizontal
    }
  }

  const getObjectSnappingEdges = React.useCallback((node: Konva.Shape): SnappingEdges => {
    const box = node.getClientRect()
    const absPos = node.absolutePosition()

    return {
      vertical: [
        {
          guide: Math.round(box.x),
          offset: Math.round(absPos.x - box.x),
          snap: 'start'
        },
        {
          guide: Math.round(box.x + box.width / 2),
          offset: Math.round(absPos.x - box.x - box.width / 2),
          snap: 'center'
        },
        {
          guide: Math.round(box.x + box.width),
          offset: Math.round(absPos.x - box.x - box.width),
          snap: 'end'
        }
      ],
      horizontal: [
        {
          guide: Math.round(box.y),
          offset: Math.round(absPos.y - box.y),
          snap: 'start'
        },
        {
          guide: Math.round(box.y + box.height / 2),
          offset: Math.round(absPos.y - box.y - box.height / 2),
          snap: 'center'
        },
        {
          guide: Math.round(box.y + box.height),
          offset: Math.round(absPos.y - box.y - box.height),
          snap: 'end'
        }
      ]
    }
  }, [])

  const getGuides = React.useCallback(
    (
      lineGuideStops: ReturnType<typeof getLineGuideStops>,
      itemBounds: ReturnType<typeof getObjectSnappingEdges>
    ) => {
      const resultV: Array<{
        lineGuide: number
        diff: number
        snap: Snap
        offset: number
      }> = []

      const resultH: Array<{
        lineGuide: number
        diff: number
        snap: Snap
        offset: number
      }> = []

      lineGuideStops.vertical.forEach((lineGuide) => {
        itemBounds.vertical.forEach((itemBound) => {
          const diff = Math.abs(lineGuide - itemBound.guide)
          if (diff < GUIDELINE_OFFSET) {
            resultV.push({
              lineGuide: lineGuide,
              diff: diff,
              snap: itemBound.snap,
              offset: itemBound.offset
            })
          }
        })
      })

      lineGuideStops.horizontal.forEach((lineGuide) => {
        itemBounds.horizontal.forEach((itemBound) => {
          const diff = Math.abs(lineGuide - itemBound.guide)
          if (diff < GUIDELINE_OFFSET) {
            resultH.push({
              lineGuide: lineGuide,
              diff: diff,
              snap: itemBound.snap,
              offset: itemBound.offset
            })
          }
        })
      })

      const guides: Array<{
        lineGuide: number
        offset: number
        orientation: 'V' | 'H'
        snap: 'start' | 'center' | 'end'
      }> = []

      const minV = resultV.sort((a, b) => a.diff - b.diff)[0]
      const minH = resultH.sort((a, b) => a.diff - b.diff)[0]

      if (minV) {
        guides.push({
          lineGuide: minV.lineGuide,
          offset: minV.offset,
          orientation: 'V',
          snap: minV.snap
        })
      }

      if (minH) {
        guides.push({
          lineGuide: minH.lineGuide,
          offset: minH.offset,
          orientation: 'H',
          snap: minH.snap
        })
      }

      return guides
    },
    []
  )

  const drawGuides = React.useCallback(
    (guides: ReturnType<typeof getGuides>, layer: Konva.Layer) => {
      guides.forEach((lg) => {
        if (lg.orientation === 'H') {
          const line = new Konva.Line({
            points: [-6000, 0, 6000, 0],
            stroke: 'rgb(0, 161, 255)',
            strokeWidth: 1,
            name: 'guid-line',
            dash: [4, 6]
          })
          layer.add(line)
          line.absolutePosition({
            x: 0,
            y: lg.lineGuide
          })
        } else if (lg.orientation === 'V') {
          const line = new Konva.Line({
            points: [0, -6000, 0, 6000],
            stroke: 'rgb(0, 161, 255)',
            strokeWidth: 1,
            name: 'guid-line',
            dash: [4, 6]
          })
          layer.add(line)
          line.absolutePosition({
            x: lg.lineGuide,
            y: 0
          })
        }
      })
    },
    []
  )

  const handleSnapOnDragMove = React.useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const layer = e.target.getLayer()

      // clear all previous lines on the screen
      layer?.find('.guid-line').forEach((l) => l.destroy())

      // find possible snapping lines
      const lineGuideStops = getLineGuideStops(e.target as Konva.Shape)
      // find snapping points of current object
      const itemBounds = getObjectSnappingEdges(e.target as Konva.Shape)

      // now find where can we snap current object
      const guides = getGuides(lineGuideStops, itemBounds)

      // do nothing if no snapping
      if (!guides.length) {
        return
      }

      drawGuides(guides, layer!)

      const absPos = e.target.absolutePosition()
      // now force object position
      guides.forEach((lg) => {
        switch (lg.snap) {
          case 'start': {
            switch (lg.orientation) {
              case 'V': {
                absPos.x = lg.lineGuide + lg.offset
                break
              }
              case 'H': {
                absPos.y = lg.lineGuide + lg.offset
                break
              }
            }
            break
          }
          case 'center': {
            switch (lg.orientation) {
              case 'V': {
                absPos.x = lg.lineGuide + lg.offset
                break
              }
              case 'H': {
                absPos.y = lg.lineGuide + lg.offset
                break
              }
            }
            break
          }
          case 'end': {
            switch (lg.orientation) {
              case 'V': {
                absPos.x = lg.lineGuide + lg.offset
                break
              }
              case 'H': {
                absPos.y = lg.lineGuide + lg.offset
                break
              }
            }
            break
          }
        }
      })
      e.target.absolutePosition(absPos)
    },
    [drawGuides, getGuides, getObjectSnappingEdges]
  )

  const handleSnapOnDragEnd = (e: Konva.KonvaEventObject<DragEvent>): void => {
    const layer = e.target.getLayer()
    // clear all previous lines on the screen
    layer?.find('.guid-line').forEach((l) => l.destroy())
  }

  let casedSubtitle = props.subtitle || ''
  switch (alphabetCase) {
    case AlphabetCase.LOWERCASE:
      casedSubtitle = casedSubtitle.toLowerCase()
      break
    case AlphabetCase.UPPERCASE:
      casedSubtitle = casedSubtitle.toUpperCase()
      break
    case AlphabetCase.CAPITALIZE:
      casedSubtitle = casedSubtitle
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
      break
  }
  if (
    showAnimation &&
    (currentAnimation === AnimationType.Impact || currentAnimation === AnimationType.ImpactPop)
  )
    casedSubtitle = casedSubtitle.split(' ')[props.currentWordIndex!]

  context!.font = `${subtitleStyleProps?.fontStyle || 'normal'} ${subtitleStyleProps?.fontSize || 12}px ${subtitleStyleProps?.fontFamily || 'Arial'}`
  const subtitleWidth = subtitleStyleProps?.width || props.width!
  const subtitleAlignment = subtitleStyleProps?.align || 'center'
  const letterSpacing = subtitleStyleProps?.letterSpacing || 0
  const fontStyle = subtitleStyleProps?.fontStyle || 'normal'
  const lineHeight = subtitleStyleProps?.lineHeight || 1

  React.useEffect(() => {
    if (subtitleStyleProps?.fontFamily) {
      loadFontFamily(
        subtitleStyleProps.fontFamily,
        userFonts.find((font) => font.name === subtitleStyleProps.fontFamily)?.path
      )
      const font = new FontFaceObserver(subtitleStyleProps?.fontFamily)
      font.load().then(
        function () {
          setFontAvailable(true)
        },
        function () {
          setFontAvailable(true)
        }
      )
    } else setFontAvailable(true)
  }, [subtitleStyleProps?.fontFamily])

  return (
    <Stage {...props} onMouseDown={checkDeselect} onTouchStart={checkDeselect}>
      <Layer id="canvas-editor">
        {casedSubtitle && fontAvailable && (
          <AnimatedGroup
            key={casedSubtitle}
            name="object"
            ref={subtitleNodeRef}
            onClick={handleNodeClick}
            onTap={handleNodeClick}
            x={subtitleStyleProps?.x}
            y={subtitleStyleProps?.y}
            rotation={subtitleStyleProps?.rotation}
            width={subtitleStyleProps?.width}
            draggable
            onDragEnd={(e) => {
              setSubtitleStyleProps({
                ...subtitleStyleProps,
                x: e.target.x(),
                y: e.target.y()
              })
              handleSnapOnDragEnd(e)
            }}
            onDragMove={handleSnapOnDragMove}
            onTransformEnd={() => {
              const node = subtitleNodeRef.current!
              setSubtitleStyleProps({
                ...subtitleStyleProps,
                x: node.x(),
                y: node.y(),
                width: Math.max(10, (node.children[0] as Konva.Rect).width() * node.scaleX()),
                fontSize: Math.max(
                  5,
                  (node.children[node.children.length - 1] as Konva.Text).fontSize() * node.scaleY()
                ),
                rotation: node.rotation()
              })
              node.scaleX(1)
              node.scaleY(1)
            }}
          >
            {((): Array<JSX.Element | null> => {
              let accumulatedWidth = 0
              let accumulatedHeight = 8
              const textHeight = subtitleStyleProps?.fontSize || 12
              let currentLine: JSX.Element[] = []
              const splittedBackgrounds: Array<JSX.Element> = []
              let wordIndex = 0
              let lineNumber = 0

              // box highlight animation
              let currentWordBackground: JSX.Element | null = null
              let currentWordLineNumber: number | null = null

              const renderLine = (
                lineNodes: Array<JSX.Element | null>,
                align: string
              ): Array<JSX.Element | null> => {
                const totalLineWidth = accumulatedWidth
                let xOffset = 0

                if (align === 'center') {
                  xOffset = (subtitleWidth - totalLineWidth) / 2
                } else if (align === 'right') {
                  xOffset = subtitleWidth - totalLineWidth
                }

                if (showBackground && backgroundType === BackgroundType.SPLITTED) {
                  splittedBackgrounds.push(
                    <Rect
                      key={'split-background-' + lineNumber}
                      width={totalLineWidth + 12}
                      height={textHeight + 16}
                      y={accumulatedHeight - 8}
                      x={lineNodes[0] ? lineNodes[0].props.x + xOffset - 8 : 0}
                      fill={backgroundColor}
                      cornerRadius={backgroundRadius ? 6 : 0}
                    />
                  )
                }

                if (currentWordLineNumber === lineNumber && currentWordBackground) {
                  currentWordBackground = React.cloneElement(currentWordBackground, {
                    x: currentWordBackground.props.x + xOffset
                  })
                }

                lineNumber++

                return lineNodes.map((node) => {
                  if (node) {
                    return React.cloneElement(node, {
                      x: (node.props.x || 0) + xOffset
                    })
                  }
                  return null
                })
              }

              const allTextNodes = casedSubtitle.split('').flatMap((w, i) => {
                let textColor = subtitleStyleProps?.fill || DEFAULT_TEXT_COLOR
                const currentCharacter =
                  i >= props.currentStartCharacterIndex! && i <= props.currentEndCharacterIndex!
                if (
                  showAnimation &&
                  currentAnimation === AnimationType.Highlight &&
                  !currentCharacter
                ) {
                  textColor = lightenColor(textColor as string)
                }

                if (
                  showAnimation &&
                  currentAnimation === AnimationType.Karaoke &&
                  i > props.currentEndCharacterIndex!
                ) {
                  textColor = lightenColor(textColor as string)
                }

                if (
                  showAnimation &&
                  currentAnimation === AnimationType.ColorHighlight &&
                  currentCharacter
                ) {
                  textColor = animationColor
                }

                if (w === '\n') {
                  const lineNodes = renderLine(currentLine, subtitleAlignment)
                  accumulatedWidth = 0
                  accumulatedHeight += textHeight * lineHeight
                  currentLine = []
                  return lineNodes
                }

                const characterWidth = (context?.measureText(w).width || 0) + letterSpacing
                const firstCharacterOfWord = i === 0 || casedSubtitle[i - 1] === ' '
                let currentWidth = characterWidth

                if (firstCharacterOfWord) {
                  const word = ((): string => {
                    let endIndex = i
                    while (endIndex < casedSubtitle.length && casedSubtitle[endIndex] !== ' ')
                      endIndex++
                    return casedSubtitle.slice(i, endIndex)
                  })()

                  const wordWidth =
                    (context?.measureText(word).width || 0) + letterSpacing * word.length
                  if (wordWidth <= subtitleWidth) currentWidth = wordWidth

                  // box highlight animation
                  if (
                    wordIndex === props.currentWordIndex &&
                    showAnimation &&
                    currentAnimation === AnimationType.BoxHighlight
                  ) {
                    currentWordLineNumber = lineNumber
                    let x = accumulatedWidth
                    let y = accumulatedHeight
                    if (accumulatedWidth + currentWidth > subtitleWidth) {
                      x = 0
                      y += textHeight * lineHeight
                      currentWordLineNumber++
                    }
                    currentWordBackground = (
                      <BoxHighlightRect
                        key="box-highlight-rect"
                        width={wordWidth}
                        height={textHeight}
                        x={x}
                        y={y}
                      />
                    )
                  }

                  wordIndex++
                }

                if (accumulatedWidth + currentWidth > subtitleWidth) {
                  const lineNodes = renderLine(currentLine, subtitleAlignment)
                  accumulatedHeight += textHeight * lineHeight
                  currentLine = [
                    <AnimatedText
                      characterIndex={i}
                      currentEndCharacterIndex={props.currentEndCharacterIndex!}
                      currentStartCharacterIndex={props.currentStartCharacterIndex!}
                      key={i}
                      text={w}
                      x={0}
                      y={accumulatedHeight}
                      fontSize={subtitleStyleProps?.fontSize}
                      fontFamily={subtitleStyleProps?.fontFamily}
                      fill={textColor}
                      fontStyle={fontStyle}
                    />
                  ]
                  accumulatedWidth = characterWidth
                  return lineNodes
                }

                const textNode = (
                  <AnimatedText
                    characterIndex={i}
                    currentEndCharacterIndex={props.currentEndCharacterIndex!}
                    currentStartCharacterIndex={props.currentStartCharacterIndex!}
                    key={i}
                    text={w}
                    x={accumulatedWidth}
                    y={accumulatedHeight}
                    fontSize={subtitleStyleProps?.fontSize}
                    fontFamily={subtitleStyleProps?.fontFamily}
                    fill={textColor}
                    fontStyle={fontStyle}
                  />
                )

                accumulatedWidth += characterWidth
                currentLine.push(textNode)
                return []
              })

              allTextNodes.push(...renderLine(currentLine, subtitleAlignment))

              const singleBackground = (
                <Rect
                  key="single-background"
                  width={subtitleStyleProps?.width}
                  height={accumulatedHeight + textHeight + 8}
                  fill={
                    showBackground && backgroundType === BackgroundType.SINGLE
                      ? backgroundColor
                      : ''
                  }
                  cornerRadius={backgroundRadius ? 6 : 0}
                />
              )

              return [
                singleBackground,
                ...splittedBackgrounds,
                currentWordBackground,
                ...allTextNodes
              ] //order of nodes in array is important. Group.onTransformEnd() depends on this order
            })()}
          </AnimatedGroup>
        )}
        {isSelected && (
          <Transformer
            ref={trRef}
            rotationSnaps={[0, 90, 180, 270]}
            flipEnabled={false}
            boundBoxFunc={(oldBox, newBox) => {
              // limit resize
              if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                return oldBox
              }
              return newBox
            }}
          />
        )}
      </Layer>
    </Stage>
  )
})

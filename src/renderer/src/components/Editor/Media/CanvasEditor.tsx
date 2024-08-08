import { useProjectStore } from '@renderer/hooks/useProjectStore'
import useAppStore, { AlphabetCase } from '@renderer/store/store'
import Konva from 'konva'
import { KonvaEventObject } from 'konva/lib/Node'
import React from 'react'
import { Group, Layer, Rect, Stage, StageProps, Text, Transformer } from 'react-konva'
import { loadFontFamily } from '../Subtitles/SubtitleStyles/SubtitleStyles.utils'
import FontFaceObserver from 'fontfaceobserver'
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
  props: StageProps & { subtitle: string | null }
): JSX.Element {
  const setSubtitleStyleProps = useAppStore((state) => state.setSubtitleStyleProps)
  const subtitleStyleProps = useProjectStore((state) => state.subtitleStyleProps)
  const [isSelected, setIsSelected] = React.useState(false)
  const [fontAvailable, setFontAvailable] = React.useState(false)
  const subtitleNodeRef = React.useRef<Konva.Group>(null)
  const trRef = React.useRef<Konva.Transformer>(null)
  const alphabetCase = useProjectStore((state) => state.alphabetCase)
  const userFonts = useAppStore((state) => state.userFonts)

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

  context!.font = `${subtitleStyleProps?.fontStyle || 'normal'} ${subtitleStyleProps?.fontSize || 12}px ${subtitleStyleProps?.fontFamily || 'Arial'}`
  const subtitleWidth = subtitleStyleProps?.width || props.width!
  return (
    <Stage {...props} onMouseDown={checkDeselect} onTouchStart={checkDeselect}>
      <Layer id="canvas-editor">
        {casedSubtitle && fontAvailable && (
          <Group
            name="object"
            ref={subtitleNodeRef}
            onClick={handleNodeClick}
            onTap={handleNodeClick}
            x={subtitleStyleProps?.x}
            y={subtitleStyleProps?.y}
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
                fontSize: Math.max(5, (node.children[1] as Konva.Text).fontSize() * node.scaleY()),
                rotation: node.rotation()
              })
              node.scaleX(1)
              node.scaleY(1)
            }}
          >
            <Rect width={subtitleStyleProps?.width} />
            {((): Array<JSX.Element | null> => {
              let accumulatedWidth = 0
              let accumulatedHeight = 0
              const lineHeight =
                (subtitleStyleProps?.fontSize || 12) * (subtitleStyleProps?.lineHeight || 1)

              return casedSubtitle.split('').map((w, i) => {
                if (w === '\n') {
                  //next line
                  accumulatedWidth = 0
                  accumulatedHeight += lineHeight
                  return null
                }

                const characterWidth = context?.measureText(w).width || 0
                const firstCharacterOfWord = i === 0 || casedSubtitle[i - 1] === ' '
                let currentWidth = characterWidth

                if (firstCharacterOfWord) {
                  const word = ((): string => {
                    let endIndex = i
                    while (endIndex < casedSubtitle.length && casedSubtitle[endIndex] !== ' ')
                      endIndex++
                    return casedSubtitle.slice(i, endIndex)
                  })()

                  const wordWidth = context?.measureText(word).width || 0
                  if (wordWidth <= subtitleWidth) currentWidth = wordWidth
                }

                if (accumulatedWidth + currentWidth > subtitleWidth) {
                  //next line
                  accumulatedWidth = 0
                  accumulatedHeight += lineHeight
                }

                const textNode = (
                  <Text
                    key={i}
                    text={w}
                    x={accumulatedWidth}
                    y={accumulatedHeight}
                    fontSize={subtitleStyleProps?.fontSize}
                    fontFamily={subtitleStyleProps?.fontFamily}
                    fill={subtitleStyleProps?.fill}
                  />
                )

                accumulatedWidth += characterWidth
                return textNode
              })
            })()}
          </Group>
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

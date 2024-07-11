import { useProjectStore } from '@renderer/hooks/useProjectStore'
import useAppStore from '@renderer/store/store'
import Konva from 'konva'
import { KonvaEventObject } from 'konva/lib/Node'
import React from 'react'
import { Layer, Stage, StageProps, Text, Transformer } from 'react-konva'

export default React.memo(function CanvasEditor(
  props: StageProps & { subtitle: string | null }
): JSX.Element {
  const setSubtitleStyleProps = useAppStore((state) => state.setSubtitleStyleProps)
  const subtitleStyleProps = useProjectStore((state) => state.subtitleStyleProps)
  const [isSelected, setIsSelected] = React.useState(false)
  const subtitleNodeRef = React.useRef<Konva.Text>(null)
  const trRef = React.useRef<Konva.Transformer>(null)

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

  return (
    <Stage {...props} onMouseDown={checkDeselect} onTouchStart={checkDeselect}>
      <Layer id="canvas-editor">
        {props.subtitle && (
          <Text
            onClick={handleNodeClick}
            onTap={handleNodeClick}
            ref={subtitleNodeRef}
            text={props.subtitle}
            {...(subtitleStyleProps || {})}
            sceneFunc={function (context, shape) {
              const typecastedShape = shape as Konva.Text
              const diff = typecastedShape.width() - typecastedShape.getTextWidth()
              context.fillStyle = 'rgb(0,0,0)'
              context.fillRect(
                diff / 2,
                0,
                typecastedShape.getTextWidth(),
                typecastedShape.height()
              )
              typecastedShape._sceneFunc(context)
            }}
            draggable
            onDragEnd={(e) => {
              setSubtitleStyleProps({
                ...subtitleStyleProps,
                x: e.target.x(),
                y: e.target.y()
              })
            }}
            onTransformEnd={() => {
              // transformer is changing scale of the node
              // and NOT its width or height
              // but in the store we have only width and height
              // to match the data better we will reset scale on transform end
              const node = subtitleNodeRef.current!

              const scaleX = node.scaleX()
              const scaleY = node.scaleY()

              // we will reset it back
              node.scaleX(1)
              node.scaleY(1)
              setSubtitleStyleProps({
                ...subtitleStyleProps,
                x: node.x(),
                y: node.y(),
                width: Math.max(10, node.width() * scaleX),
                fontSize: Math.max(5, node.fontSize() * scaleY),
                rotation: node.rotation()
              })
            }}
          />
        )}
        {isSelected && (
          <Transformer
            ref={trRef}
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

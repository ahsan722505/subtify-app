import Konva from 'konva'
import { KonvaEventObject } from 'konva/lib/Node'
import React from 'react'
import { Layer, Stage, StageProps, Text, Transformer } from 'react-konva'

export default React.memo(function CanvasEditor(
  props: StageProps & { subtitle: string }
): JSX.Element {
  const [isSelected, setIsSelected] = React.useState(false)
  const [subtitleNode, setSubtitleNode] = React.useState<Konva.TextConfig>(() => ({
    text: props.subtitle,
    fill: 'white',
    fontSize: 24,
    id: 'subtitle',
    x: 0,
    y: props.height! / 2,
    align: 'center',
    width: props.width
  }))
  console.log('pro', subtitleNode)
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
    setSubtitleNode((state) => ({
      ...state,
      text: props.subtitle
    }))
  }, [props.subtitle])

  // React.useEffect(() => {
  //   if (props.width && props.height && subtitleNodeRef.current) {
  //     const adjustedSubtitleWidth = Math.min(props.width, subtitleNodeRef.current.textWidth)
  //     const adjustedX = (props.width - adjustedSubtitleWidth) / 2
  //     const adjustedY = (props.height - subtitleNodeRef.current.height()) / 2
  //     setSubtitleNode((state) => ({
  //       ...state,
  //       x: adjustedX,
  //       y: adjustedY,
  //       width: adjustedSubtitleWidth
  //     }))
  //   }
  // }, [])

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
        <Text
          onClick={handleNodeClick}
          onTap={handleNodeClick}
          ref={subtitleNodeRef}
          {...subtitleNode}
          draggable
          onDragEnd={(e) => {
            setSubtitleNode({
              ...subtitleNode,
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
            setSubtitleNode({
              ...subtitleNode,
              x: node.x(),
              y: node.y(),
              // set minimal value
              width: Math.max(10, node.width() * scaleX),
              fontSize: Math.max(5, node.fontSize() * scaleY)
              // fontSize: node.fontSize()
              // height: Math.max(node.height() * scaleY)
            })
          }}
        />
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

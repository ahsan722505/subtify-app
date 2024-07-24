import SubtitleListItem from './SubtitleListItem'
import { isSubtitlePlaying } from './SubtitleList.utils'
import { useProjectStore } from '@renderer/hooks/useProjectStore'
import SubtitlesMedian from './SubtitlesMedian'
import React from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import SubtitleOptions from './SubtitleOptions'
import { Button } from 'antd'
import { BgColorsOutlined } from '@ant-design/icons'
import useAppStore, { TranscriptionStatus } from '@renderer/store/store'

const INITIAL_RENDERED_SUBTITLES_LENGTH = 30

export default function SubtitleList(): JSX.Element {
  const subtitles = useProjectStore((state) => state.subtitles)
  const setTranscriptionStatus = useAppStore((state) => state.setTranscriptionStatus)
  const projects = useAppStore((state) => state.projects)
  const currentProjectIndex = useAppStore((state) => state.currentProjectIndex)
  const currentTime = useProjectStore((state) => state.mediaCurrentTime)
  const mediaDuration = useProjectStore((state) => state.mediaDuration)
  const [renderedSubtitlesLength, setRenderedSubtitlesLength] = React.useState(
    INITIAL_RENDERED_SUBTITLES_LENGTH
  )
  const renderedSubtitles = subtitles.slice(0, renderedSubtitlesLength)

  const loadFunc = (): void => {
    setRenderedSubtitlesLength((length) => length + INITIAL_RENDERED_SUBTITLES_LENGTH)
  }

  return (
    <div>
      <div className="sticky top-0 mb-4 bg-white flex justify-between items-center py-6 z-50">
        <p className="text-2xl font-bold">Subtitles</p>
        <div className="flex gap-2">
          <Button
            onClick={() =>
              setTranscriptionStatus(TranscriptionStatus.STYLES, projects[currentProjectIndex!].id)
            }
            className="flex items-center"
          >
            Styles <BgColorsOutlined />
          </Button>
          <SubtitleOptions />
        </div>
      </div>
      <InfiniteScroll
        dataLength={renderedSubtitles.length}
        next={loadFunc}
        hasMore={subtitles.length > renderedSubtitlesLength}
        loader={<h4>Loading...</h4>}
        scrollableTarget="scrollableDiv"
      >
        {renderedSubtitles.map((s, i) => (
          <div key={s.id}>
            <SubtitleListItem
              currentlyPlaying={isSubtitlePlaying(currentTime, s.start, s.end)}
              {...s}
            />
            <SubtitlesMedian
              id={subtitles[i].id}
              disableInsert={
                +subtitles[i].end.toFixed(2) ===
                +(subtitles[i + 1]?.start.toFixed(2) || mediaDuration.toFixed(2))
              }
              disableMerge={i === subtitles.length - 1}
            />
          </div>
        ))}
      </InfiniteScroll>
    </div>
  )
}

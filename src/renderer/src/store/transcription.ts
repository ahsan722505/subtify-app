import { create } from 'zustand'
export enum TranscriptionStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

export type Subtitle = {
  start: number
  end: number
  text: string
}
type TranscriptionState = {
  transcriptionStatus: TranscriptionStatus
  setTranscriptionStatus: (status: TranscriptionStatus) => void
  subtitleGenerationProgress: number
  setSubtitleGenerationProgress: (progress: number) => void
  subtitles: Subtitle[]
  setSubtitles: (subtitles: Subtitle[]) => void
}

const useTranscriptionStore = create<TranscriptionState>((set) => ({
  transcriptionStatus: TranscriptionStatus.IDLE,
  setTranscriptionStatus: (status): void => set({ transcriptionStatus: status }),
  subtitleGenerationProgress: 0,
  setSubtitleGenerationProgress: (progress): void => set({ subtitleGenerationProgress: progress }),
  subtitles: [],
  setSubtitles: (subtitles): void => set({ subtitles })
}))

export default useTranscriptionStore

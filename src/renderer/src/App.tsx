import { Button, Spin, Upload, UploadProps, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useState } from 'react'

function App(): JSX.Element {
  const [file, setFile] = useState<File | null>(null)
  const [transcription, setTranscription] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const handleTranscribe = async (): Promise<void> => {
    if (!file) return
    try {
      setLoading(true)
      const transcription = await window.electron.ipcRenderer.invoke('transcribe', file.path)
      setTranscription(transcription)
    } catch (error) {
      message.error('There was an error. Please try again')
    } finally {
      setLoading(false)
    }
  }

  const props: UploadProps = {
    accept:
      'audio/mp3, audio/wav, audio/mpeg, audio/ogg, audio/flac, audio/aac, audio/aiff, audio/wma, audio/opus, audio/webm, video/mp4, video/ogg, video/webm',
    customRequest: async ({ file }) => setFile(file as File),
    showUploadList: false
  }
  return (
    <div className="flex justify-start items-center flex-col w-[100vw] h-[100vh] mt-10">
      <h1 className="text-3xl mb-12 text-center">Transcribe any audio/video file for free</h1>
      <Upload {...props}>
        <Button className="mb-4" type="primary" icon={<UploadOutlined />}>
          Upload audio/video file
        </Button>
        {file && <span className="ml-2">{file.name}</span>}
      </Upload>
      <Button
        loading={loading}
        disabled={!file}
        className="mb-20"
        type="primary"
        onClick={handleTranscribe}
      >
        Transcribe
      </Button>
      <div>
        <label>Transcription:</label>
        <div className="rounded-lg bg-gray-200 min-w-[90vw] max-w-[90vw] p-4 md:min-w-[50vw] md:max-w-[50vw] min-h-20 mt-2 flex justify-center items-center">
          {loading ? <Spin size="large" /> : transcription}
        </div>
      </div>
    </div>
  )
}

export default App

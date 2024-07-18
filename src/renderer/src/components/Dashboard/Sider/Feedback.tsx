import { Button, Input, Modal, message } from 'antd'
import { FileDoneOutlined } from '@ant-design/icons'
import React from 'react'
import { usePostHog } from 'posthog-js/react'

const { TextArea } = Input
const surveyId = '0190c538-1147-0000-c769-e2de1a7e79af'

export default function Feedback(): JSX.Element {
  const posthog = usePostHog()
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [input, setInput] = React.useState('')
  const handleSubmit = (): void => {
    const feedback = input.trim()
    if (!feedback) return
    posthog.capture('survey sent', {
      $survey_id: surveyId,
      $survey_response: feedback
    })
    setInput('')
    setIsModalOpen(false)
    message.success('Thank you for your feedback!')
  }
  React.useEffect(() => {
    if (isModalOpen) {
      posthog.capture('survey shown', {
        $survey_id: surveyId
      })
    }
  }, [isModalOpen])
  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} icon={<FileDoneOutlined />} type="primary">
        Feedback
      </Button>
      <Modal
        onOk={handleSubmit}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          posthog.capture('survey dismissed', {
            $survey_id: surveyId
          })
        }}
        okText="Submit"
        okButtonProps={{ disabled: !input.trim() }}
      >
        <h1 className="mb-3 text-lg font-bold">What can we do to improve our product?</h1>
        <TextArea value={input} onChange={(e) => setInput(e.target.value)} className="mb-2" />
      </Modal>
    </>
  )
}

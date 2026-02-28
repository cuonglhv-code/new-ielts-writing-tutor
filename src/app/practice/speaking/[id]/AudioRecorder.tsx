'use client'

import { useState, useRef } from 'react'
import { uploadAudio } from './actions'

interface AudioRecorderProps {
  questionId: string
}

export default function AudioRecorder({ questionId }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorderRef.current = new MediaRecorder(stream)
    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data)
    }
    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      setAudioBlob(audioBlob)
      audioChunksRef.current = []
    }
    mediaRecorderRef.current.start()
    setIsRecording(true)
  }

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleUpload = async () => {
    if (audioBlob) {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('question_id', questionId)
      
      // Server action to upload the audio
      await uploadAudio(formData)
    }
  }

  return (
    <div>
      {!isRecording && !audioBlob && (
        <button
          onClick={handleStartRecording}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700"
        >
          Start Recording
        </button>
      )}
      {isRecording && (
        <button
          onClick={handleStopRecording}
          className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700"
        >
          Stop Recording
        </button>
      )}
      {audioBlob && (
        <div className="mt-4">
            <audio src={URL.createObjectURL(audioBlob)} controls className="w-full" />
            <button
                onClick={handleUpload}
                className="w-full mt-4 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700"
            >
                Submit for Feedback
            </button>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useRef } from 'react'

export default function CollectPage() {
  const [topic, setTopic] = useState('')
  const [location, setLocation] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('Male')
  
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        if (chunksRef.current.length === 0) {
          setMessage('Error: No audio tracked. Please check your mic.')
          return
        }
        const audioBlob = new Blob(chunksRef.current)
        setRecordedBlob(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordedBlob(null)
      setMessage('')
    } catch (err) {
      console.error(err)
      setMessage('Microphone access denied')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
    mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop())
  }

  const handleUpload = async () => {
    if (!recordedBlob) return
    setIsUploading(true)
    setMessage('')

    const formData = new FormData()
    formData.append('file', recordedBlob, 'interview.webm')
    formData.append('topic', topic)
    formData.append('location', location)
    formData.append('speaker_age', age)
    formData.append('speaker_gender', gender)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/audio/transcribe_and_save`, {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        setMessage('Successfully uploaded and transcribed!')
        setRecordedBlob(null)
        setTopic('')
        setLocation('')
        setAge('')
      } else {
        setMessage('Upload failed.')
      }
    } catch (e) {
      setMessage('Network error.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex-1 max-w-3xl w-full mx-auto p-6 flex flex-col items-center justify-center">
      <div className="bg-slate-800 p-8 rounded-3xl w-full shadow-2xl border border-slate-700">
        <h1 className="text-3xl font-bold mb-6 text-slate-100 border-b border-slate-700 pb-4">
          Contribute Telugu Cultural Data
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-slate-400 text-sm font-semibold mb-2">Topic (e.g., Folk Story, Recipe)</label>
            <input type="text" value={topic} onChange={e => setTopic(e.target.value)} 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div>
            <label className="block text-slate-400 text-sm font-semibold mb-2">Region/Location</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div>
            <label className="block text-slate-400 text-sm font-semibold mb-2">Speaker Age</label>
            <input type="number" value={age} onChange={e => setAge(e.target.value)} 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div>
            <label className="block text-slate-400 text-sm font-semibold mb-2">Speaker Gender</label>
            <select value={gender} onChange={e => setGender(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors">
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-600 rounded-2xl bg-slate-900/50 mb-6">
          {!isRecording && !recordedBlob ? (
            <button onClick={startRecording} className="bg-blue-600 hover:bg-blue-500 text-white rounded-full p-6 transition-transform hover:scale-105 shadow-lg shadow-blue-500/30 font-bold flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Start Recording
            </button>
          ) : isRecording ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex space-x-2">
                <span className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></span>
                <span className="w-4 h-4 rounded-full bg-red-500 animate-pulse delay-75"></span>
                <span className="w-4 h-4 rounded-full bg-red-500 animate-pulse delay-150"></span>
              </div>
              <p className="text-red-400 font-medium">Recording in progress...</p>
              <button onClick={stopRecording} className="bg-red-600 hover:bg-red-500 text-white rounded-lg px-8 py-3 font-semibold transition-colors mt-4 shadow-lg">
                Stop Recording
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              <audio controls src={recordedBlob ? URL.createObjectURL(recordedBlob) : ''} className="w-full mb-6" />
              <div className="flex space-x-4">
                <button onClick={() => setRecordedBlob(null)} className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-lg font-medium transition-colors">
                  Discard
                </button>
                <button onClick={handleUpload} disabled={isUploading} className="bg-green-600 hover:bg-green-500 disabled:bg-slate-600 px-8 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-green-500/20">
                  {isUploading ? 'Uploading...' : 'Upload & Transcribe'}
                </button>
              </div>
            </div>
          )}
        </div>

        {message && (
          <div className={`p-4 rounded-lg flex items-center justify-center font-medium ${message.includes('failed') || message.includes('denied') || message.includes('error') ? 'bg-red-900/50 text-red-400 border border-red-800' : 'bg-green-900/50 text-green-400 border border-green-800'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

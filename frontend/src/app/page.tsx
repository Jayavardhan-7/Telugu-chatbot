'use client'

import { useState, useRef, useEffect } from 'react'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  audioUrl?: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'నమస్కారం! నేను తెలుగు సాంస్కృతిక ప్రతినిధిని. మీకేమైనా ప్రశ్నలు ఉన్నాయా?'
    }
  ])
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (text: string) => {
    if (!text.trim()) return
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      })
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      const data = await res.json()
      
      // Get TTS for response
      const ttsRes = await fetch(`${apiUrl}/audio/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: data.response })
      })
      const ttsData = await ttsRes.json()

      const botMsg: Message = { 
        id: Date.now().toString() + 'bot', 
        role: 'assistant', 
        content: data.response,
        audioUrl: `${apiUrl}${ttsData.audio_path}`
      }
      setMessages(prev => [...prev, botMsg])
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'క్షమించండి, ఒక లోపం జరిగింది.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleMicToggle = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        if (chunksRef.current.length === 0) {
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'లోపం: ఆడియో రికార్డ్ అవ్వలేదు. (Error: No audio tracked)' }])
          return
        }
        
        const audioBlob = new Blob(chunksRef.current)
        const formData = new FormData()
        formData.append('file', audioBlob, 'recording.webm')
        
        setIsLoading(true)
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const res = await fetch(`${apiUrl}/audio/transcribe`, {
            method: 'POST',
            body: formData
          })
          if (!res.ok) throw new Error(`Server returned ${res.status}`)
          const data = await res.json()
          if (data.transcription) {
            handleSend(data.transcription)
          }
        } catch (error) {
          console.error("Transcription error:", error)
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'సర్వర్ లోపం: ఆడియో ప్రాసెస్ చేయలేకపోయాము. (Server error processing audio)' }])
        } finally {
           setIsLoading(false)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error("Microphone access denied", err)
      alert("Error accessing microphone: Please ensure you have granted microphone permissions in your browser.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
    setIsRecording(false)
  }

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700 shadow-xl mb-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-sm shadow-md' 
                : 'bg-slate-700 text-slate-100 rounded-bl-sm shadow-md border border-slate-600'
            }`}>
              <p className="text-lg leading-relaxed">{msg.content}</p>
              {msg.audioUrl && (
                <audio controls src={msg.audioUrl} className="mt-3 h-8 w-full max-w-[200px] opacity-80" />
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 rounded-2xl px-5 py-3 rounded-bl-sm flex items-center space-x-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75" />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-slate-800 p-2 rounded-2xl border border-slate-700 shadow-lg flex items-end gap-2 px-4 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
        <button 
          onClick={handleMicToggle}
          className={`p-3 rounded-full transition-all ${isRecording ? 'bg-red-500 animate-pulse text-white shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          title={isRecording ? "Click to Stop" : "Click to Record"}
        >
          {/* Mic Icon SVG */}
          {isRecording ? (
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
               <path d="M6 6h12v12H6z" />
             </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>
        
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input); }
          }}
          placeholder="తెలుగులో టైప్ చేయండి లేదా మైక్ పట్టుకుని మాట్లాడండి..."
          className="flex-1 bg-transparent text-slate-100 placeholder-slate-400 resize-none outline-none py-4 max-h-32 text-lg"
          rows={1}
        />
        
        <button 
          onClick={() => handleSend(input)}
          disabled={!input.trim() || isLoading}
          className="p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl transition-colors mb-1"
        >
          {/* Send Icon SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-1">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}

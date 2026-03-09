'use client'

import { useState, useEffect } from 'react'

type Recording = {
  id: number
  audio_file_path: string
  speaker_age: number | null
  speaker_gender: string | null
  transcript: string
  status: string
  created_at: string
}

export default function AdminDashboard() {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending') // 'pending', 'approved', 'rejected', 'all'

  useEffect(() => {
    fetchRecordings()
  }, [])

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchRecordings = async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/recordings`)
      const data = await res.json()
      setRecordings(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      const res = await fetch(`${apiUrl}/admin/recordings/${id}/status?status=${status}`, {
        method: 'PUT'
      })
      if (res.ok) {
        setRecordings(prev => prev.map(rec => rec.id === id ? { ...rec, status } : rec))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const filtered = filter === 'all' ? recordings : recordings.filter(r => r.status === filter)

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto p-6">
      <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h1 className="text-2xl font-bold font-inter text-slate-100 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Dataset Validation Dashboard
          </h1>
          <div className="flex space-x-2">
            {['pending', 'approved', 'rejected', 'all'].map(t => (
              <button 
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filter === t ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-12 flex justify-center text-slate-500">
               <div className="w-8 h-8 rounded-full border-4 border-slate-600 border-t-blue-500 animate-spin"></div>
             </div>
          ) : filtered.length === 0 ? (
             <div className="p-12 text-center text-slate-500">No recordings found.</div>
          ) : (
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-slate-900/50 border-b border-slate-700">
                   <th className="p-4 font-semibold text-slate-400">ID</th>
                   <th className="p-4 font-semibold text-slate-400 w-1/4">Transcript</th>
                   <th className="p-4 font-semibold text-slate-400">Audio</th>
                   <th className="p-4 font-semibold text-slate-400">Metadata</th>
                   <th className="p-4 font-semibold text-slate-400 text-center">Status</th>
                   <th className="p-4 font-semibold text-slate-400 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-700">
                 {filtered.map(rec => (
                   <tr key={rec.id} className="hover:bg-slate-700/30 transition-colors group">
                     <td className="p-4 text-slate-400">#{rec.id}</td>
                     <td className="p-4 text-slate-300">
                       <div className="line-clamp-3 text-sm" title={rec.transcript}>{rec.transcript}</div>
                     </td>
                     <td className="p-4">
                       <audio controls src={`${apiUrl}/audio/file/${rec.audio_file_path}`} className="h-8 w-40 opacity-80" />
                     </td>
                     <td className="p-4 text-sm text-slate-400 flex flex-col">
                       {rec.speaker_age && <span>Age: {rec.speaker_age}</span>}
                       {rec.speaker_gender && <span>Gender: {rec.speaker_gender}</span>}
                     </td>
                     <td className="p-4 text-center">
                       <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                         rec.status === 'approved' ? 'bg-green-900/50 text-green-400 border border-green-800' :
                         rec.status === 'rejected' ? 'bg-red-900/50 text-red-400 border border-red-800' :
                         'bg-amber-900/50 text-amber-400 border border-amber-800'
                       }`}>
                         {rec.status}
                       </span>
                     </td>
                     <td className="p-4 text-right space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => handleStatusUpdate(rec.id, 'approved')} className="text-green-400 hover:text-green-300 transition-colors" title="Approve">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                       </button>
                       <button onClick={() => handleStatusUpdate(rec.id, 'rejected')} className="text-red-400 hover:text-red-300 transition-colors" title="Reject">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          )}
        </div>
      </div>
    </div>
  )
}

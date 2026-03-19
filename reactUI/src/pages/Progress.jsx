import { useState, useEffect } from 'react'
import { TrendingUp } from 'lucide-react'
import api from '../api/apiClient'

const Progress = () => {
  const [progressList, setProgressList] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProgress = async () => {
    try {
      const data = await api.get('/progress')
      setProgressList(data)
    } catch (err) {
      console.error('Failed to fetch progress:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProgress() }, [])

  const handleUpdate = async (id, newPercent) => {
    try {
      await api.put(`/progress/${id}`, { progress_percent: newPercent })
      fetchProgress()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading progress…</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Progress Tracking</h2>
        <p className="text-gray-600 mt-1">Monitor your skill development over time</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Progress Tracking</h3>
            <p className="text-sm text-gray-500">Your skill improvement progress</p>
          </div>
        </div>

        {progressList.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <TrendingUp size={48} className="mx-auto mb-3 opacity-40" />
            <p>No progress records yet.</p>
            <p className="text-sm mt-1">Add skills and start tracking your learning journey!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {progressList.map((item) => {
              const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F97316', '#EF4444', '#06B6D4']
              const color = colors[item.id % colors.length]
              return (
                <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.skill_name}</h4>
                      <p className="text-xs text-gray-500">
                        {item.current_level || '–'} → {item.target_level || '–'}
                      </p>
                    </div>
                    <span className="text-sm font-bold" style={{ color }}>
                      {item.progress_percent}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.progress_percent}%`, backgroundColor: color }}
                    />
                  </div>
                  <input
                    type="range"
                    className="w-full mt-2"
                    min="0"
                    max="100"
                    value={item.progress_percent}
                    onChange={(e) => handleUpdate(item.id, parseInt(e.target.value))}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Progress

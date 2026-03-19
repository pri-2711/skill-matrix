import { TrendingUp } from 'lucide-react'

const Progress = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Progress Tracking</h2>
        <p className="text-gray-600 mt-1">Monitor your skill development over time</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center py-12">
        <TrendingUp size={48} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">Progress tracking is completely disabled per your request.</p>
      </div>
    </div>
  )
}

export default Progress

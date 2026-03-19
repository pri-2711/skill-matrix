import { useState } from 'react'
import { Sparkles, Search, Loader2, ExternalLink } from 'lucide-react'
import api from '../api/apiClient'

const AISuggestions = () => {
  const [currentSkills, setCurrentSkills] = useState('')
  const [careerGoal, setCareerGoal] = useState('')
  const [topK, setTopK] = useState(5)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleAnalyze = async () => {
    if (!careerGoal.trim()) {
      alert('Please enter a career goal')
      return
    }

    setLoading(true)
    setSearched(true)
    try {
      // If user didn't type skills, try to fetch from DB
      let skills = currentSkills
      if (!skills.trim()) {
        try {
          const dbSkills = await api.get('/skills')
          skills = dbSkills.map((s) => {
            const match = s.skill_name.match(/^(.+?)\s*\[.*\]$/)
            return match ? match[1].trim() : s.skill_name
          }).join(', ')
          setCurrentSkills(skills)
        } catch (_) { /* ignore */ }
      }

      const data = await api.post('/recommendations', {
        current_skills: skills,
        goal: careerGoal,
        top_k: topK,
      })
      setRecommendations(data.recommendations || [])
    } catch (err) {
      alert('Recommendation failed: ' + err.message)
      setRecommendations([])
    } finally {
      setLoading(false)
    }
  }

  const platformColors = {
    Udemy:      'bg-purple-100 text-purple-700',
    Coursera:   'bg-blue-100 text-blue-700',
    edX:        'bg-red-100 text-red-700',
    Skillshare: 'bg-green-100 text-green-700',
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">AI Suggestions</h2>
        <p className="text-gray-600 mt-1">Get personalised course recommendations powered by AI</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="text-purple-600" size={24} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Career Goal Analyzer</h3>
            <p className="text-sm text-gray-500">Enter your skills and career goal to get AI-powered course recommendations</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Skills <span className="text-gray-400">(leave blank to auto-detect from your profile)</span>
            </label>
            <input
              type="text"
              value={currentSkills}
              onChange={(e) => setCurrentSkills(e.target.value)}
              placeholder="e.g., Python, SQL, React"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Career Goal</label>
            <input
              type="text"
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              placeholder="e.g., Data Scientist, Full Stack Developer, Machine Learning Engineer"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-end gap-4">
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">Results</label>
              <select
                value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={3}>Top 3</option>
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
              </select>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              {loading ? 'Analyzing…' : 'Get Recommendations'}
            </button>
          </div>
        </div>
      </div>

      {searched && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recommended Courses
            {recommendations.length > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">({recommendations.length} results)</span>
            )}
          </h3>

          {recommendations.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              No recommendations found. Try a different career goal or check that your course database is populated.
            </p>
          ) : (
            <div className="space-y-4">
              {recommendations.map((course, idx) => (
                <div key={idx} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{course.course_title}</h4>
                      {course.url && (
                        <a href={course.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${platformColors[course.platform] || 'bg-gray-100 text-gray-600'}`}>
                        {course.platform}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-200 rounded-full">{course.level}</span>
                    </div>
                    {course.skills && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-1">
                        <span className="font-medium">Skills:</span> {course.skills}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <span className="text-lg font-bold text-purple-600">{(course.score * 100).toFixed(0)}%</span>
                    <p className="text-xs text-gray-400">match</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AISuggestions

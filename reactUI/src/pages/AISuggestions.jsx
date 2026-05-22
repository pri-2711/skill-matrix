import { useState, useEffect } from 'react'
import { Sparkles, Search, Loader2, ExternalLink } from 'lucide-react'
import api from '../api/apiClient'

const AISuggestions = () => {
  const [currentSkills, setCurrentSkills] = useState('')
  const [careerGoal, setCareerGoal] = useState('')
  const [topK, setTopK] = useState(5)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [redirectedTargetSkills, setRedirectedTargetSkills] = useState([])
  const [redirectedMissingSkills, setRedirectedMissingSkills] = useState([])

  const handleAnalyze = async (overrideGoal) => {
    const goalToUse = typeof overrideGoal === 'string' ? overrideGoal : careerGoal
    if (!goalToUse.trim()) {
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
        goal: goalToUse,
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

  useEffect(() => {
    const savedGoal = localStorage.getItem('redirect_career_goal')
    if (savedGoal) {
      setCareerGoal(savedGoal)
      localStorage.removeItem('redirect_career_goal')
      
      const targetSkills = localStorage.getItem('redirect_target_skills')
      if (targetSkills) {
        try {
          setRedirectedTargetSkills(JSON.parse(targetSkills))
        } catch (_) {}
        localStorage.removeItem('redirect_target_skills')
      }
      
      const missingSkills = localStorage.getItem('redirect_missing_skills')
      if (missingSkills) {
        try {
          setRedirectedMissingSkills(JSON.parse(missingSkills))
        } catch (_) {}
        localStorage.removeItem('redirect_missing_skills')
      }

      handleAnalyze(savedGoal)
    }
  }, [])

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

      {(redirectedTargetSkills.length > 0 || redirectedMissingSkills.length > 0) && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-indigo-600 animate-pulse" />
              Imported Market Trends Context
            </h4>
            <button
              onClick={() => {
                setRedirectedTargetSkills([])
                setRedirectedMissingSkills([])
              }}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Clear Context
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {redirectedTargetSkills.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1.5">Target Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {redirectedTargetSkills.map((sk, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 bg-indigo-100/60 text-indigo-800 rounded-md font-semibold border border-indigo-200/40">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {redirectedMissingSkills.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1.5">Target Skill Gap (Missing)</p>
                <div className="flex flex-wrap gap-1.5">
                  {redirectedMissingSkills.map((sk, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 bg-amber-100/60 text-amber-800 rounded-md font-semibold border border-amber-200/40">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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

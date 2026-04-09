import { useState, useEffect } from 'react'
import { Target, Award, FolderKanban, TrendingUp } from 'lucide-react'
import api from '../api/apiClient'

const Overview = () => {
  const [stats, setStats] = useState([
    { icon: Target,       label: 'Total Skills',       value: '–', color: 'bg-blue-100 text-blue-600' },
    { icon: Award,        label: 'Certifications',     value: '–', color: 'bg-purple-100 text-purple-600' },
    { icon: FolderKanban, label: 'Projects',           value: '–', color: 'bg-green-100 text-green-600' },
    { icon: TrendingUp,   label: 'Avg. Skill Level',   value: '–', color: 'bg-orange-100 text-orange-600' },
  ])

  const [trendyCourses, setTrendyCourses] = useState([])
  const [loadingTrendy, setLoadingTrendy] = useState(true)
  const [errorTrendy, setErrorTrendy] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [skills, certs, projects] = await Promise.all([
          api.get('/skills'),
          api.get('/certificates'),
          api.get('/projects'),
        ])

        const levelMap = { Beginner: 25, Intermediate: 50, Advanced: 75, Expert: 100 }
        const avg = skills.length > 0
          ? Math.round(skills.reduce((sum, s) => sum + (levelMap[s.proficiency_level] || 50), 0) / skills.length)
          : 0

        setStats([
          { icon: Target,       label: 'Total Skills',       value: String(skills.length),   color: 'bg-blue-100 text-blue-600' },
          { icon: Award,        label: 'Certifications',     value: String(certs.length),     color: 'bg-purple-100 text-purple-600' },
          { icon: FolderKanban, label: 'Projects',           value: String(projects.length),  color: 'bg-green-100 text-green-600' },
          { icon: TrendingUp,   label: 'Avg. Skill Level',   value: `${avg}%`,                color: 'bg-orange-100 text-orange-600' },
        ])
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      }
    }
    fetchStats()
  }, [])

  const fetchTrendy = async (forceRefresh = false) => {
    setLoadingTrendy(true)
    setErrorTrendy(null)
    try {
      const endpoint = forceRefresh ? '/trendy-courses?refresh=true' : '/trendy-courses'
      const res = await api.get(endpoint)
      if (res && res.courses) {
         setTrendyCourses(res.courses)
      } else if (res && res.data && res.data.courses) {
         setTrendyCourses(res.data.courses)
      } else {
         setErrorTrendy('Received invalid data from server.')
      }
    } catch (err) {
      console.error('Failed to fetch trendy courses:', err)
      setErrorTrendy('Failed to load trending courses.')
    } finally {
      setLoadingTrendy(false)
    }
  }

  useEffect(() => {
    fetchTrendy()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600 mt-1">Get a quick snapshot of your skill development journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Trending Courses</h3>
            <p className="text-sm text-gray-500">Top courses based on the current most demanded skills</p>
          </div>
          <div className="flex items-center gap-3">
            {loadingTrendy && <span className="text-sm text-blue-500 animate-pulse font-medium">Fetching latest trends...</span>}
            <button 
              onClick={() => fetchTrendy(true)}
              disabled={loadingTrendy}
              className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[110px]"
            >
              {loadingTrendy ? 'Refreshing...' : 'Refresh Trends'}
            </button>
          </div>
        </div>
        
        {loadingTrendy ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-100 animate-pulse h-32"></div>
            ))}
          </div>
        ) : errorTrendy ? (
           <p className="text-sm text-red-500">{errorTrendy}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trendyCourses.map((course, idx) => (
              <div key={course.course_id || idx} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {course.matched_skill}
                    </span>
                    {course.rating && <span className="text-xs font-semibold text-gray-700 flex items-center gap-1 shadow-sm bg-white px-2 py-0.5 rounded-full">⭐ {course.rating}</span>}
                  </div>
                  <h4 className="font-semibold text-gray-900 leading-tight line-clamp-2" title={course.course_title}>{course.course_title}</h4>
                  <p className="text-xs text-gray-500 mt-2 capitalize font-medium">{course.level || 'All Levels'} • {course.platform}</p>
                </div>
                <a 
                  href={course.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="mt-5 text-sm text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1.5 transition-colors w-max group"
                >
                  View Course <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </a>
              </div>
            ))}
            {trendyCourses.length === 0 && (
              <div className="col-span-full py-8 text-center text-gray-500 font-medium">No trending courses available right now.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Overview

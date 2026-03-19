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
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Getting Started</h3>
          <p className="text-sm text-gray-500">Build your professional profile</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <Target size={24} className="text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">1. Add Skills</h4>
            <p className="text-sm text-gray-500 mt-1">Track your technical and soft skills with proficiency levels.</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <Award size={24} className="text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">2. Add Certifications</h4>
            <p className="text-sm text-gray-500 mt-1">Record your earned certificates and credentials.</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <FolderKanban size={24} className="text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">3. Add Projects</h4>
            <p className="text-sm text-gray-500 mt-1">Showcase your work and the technologies you used.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Overview

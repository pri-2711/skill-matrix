import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import Modal from '../components/Modal'
import api from '../api/apiClient'

const levelToPercent = {
  Beginner: 25,
  Intermediate: 50,
  Advanced: 75,
  Expert: 100,
}

const percentToLevel = (pct) => {
  if (pct <= 25) return 'Beginner'
  if (pct <= 50) return 'Intermediate'
  if (pct <= 75) return 'Advanced'
  return 'Expert'
}

const categoryColors = {
  Frontend:    'bg-blue-100 text-blue-600',
  Backend:     'bg-green-100 text-green-600',
  Database:    'bg-orange-100 text-orange-600',
  DevOps:      'bg-cyan-100 text-cyan-600',
  Programming: 'bg-purple-100 text-purple-600',
  Tools:       'bg-yellow-100 text-yellow-600',
}

const Skills = () => {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [activeViz, setActiveViz] = useState('radar')
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Programming', level: 50 })

  const fetchSkills = async () => {
    try {
      const data = await api.get('/skills')
      setSkills(data)
    } catch (err) {
      console.error('Failed to fetch skills:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSkills() }, [])

  const handleAddSkill = async (e) => {
    e.preventDefault()
    try {
      await api.post('/skills', {
        skill_name: `${newSkill.name} [${newSkill.category}]`,
        proficiency_level: percentToLevel(newSkill.level),
      })
      setNewSkill({ name: '', category: 'Programming', level: 50 })
      setShowAddSkill(false)
      fetchSkills()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this skill?')) return
    try {
      await api.del(`/skills/${id}`)
      fetchSkills()
    } catch (err) {
      alert(err.message)
    }
  }

  // Derive display data from DB records
  const displaySkills = skills.map((s) => {
    const match = s.skill_name.match(/^(.+?)\s*\[(.+?)\]$/)
    const name = match ? match[1].trim() : s.skill_name
    const category = match ? match[2].trim() : 'Programming'
    const level = levelToPercent[s.proficiency_level] || 50
    const color = categoryColors[category] || 'bg-gray-100 text-gray-600'
    return { ...s, name, category, level, color }
  })

  const radarData = displaySkills.map((s) => ({
    subject: s.name,
    A: s.level,
    fullMark: 100,
  }))

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading skills…</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Skills Management</h2>
        <p className="text-gray-600 mt-1">Add, edit, and visualize your skills</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Your Skills</h3>
            <p className="text-sm text-gray-500">Manage and track your skill proficiency levels</p>
          </div>
          <button
            onClick={() => setShowAddSkill(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={16} />
            Add Skill
          </button>
        </div>

        {displaySkills.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No skills yet. Add your first skill!</p>
        ) : (
          <div className="space-y-4">
            {displaySkills.map((skill) => (
              <div key={skill.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">{skill.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${skill.color}`}>
                      {skill.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">{skill.level}%</span>
                    <button
                      onClick={() => handleDelete(skill.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete skill"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {displaySkills.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Skill Visualization</h3>
            <p className="text-sm text-gray-500">Visual representation of your skill proficiency</p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveViz('radar')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeViz === 'radar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Radar Chart
            </button>
            <button
              onClick={() => setActiveViz('heatmap')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeViz === 'heatmap' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Heatmap
            </button>
          </div>

          <div className="h-80">
            {activeViz === 'radar' ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Skills" dataKey="A" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="grid grid-cols-3 gap-4">
                  {displaySkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="p-4 rounded-lg text-center"
                      style={{
                        backgroundColor: `rgba(79, 70, 229, ${skill.level / 100})`,
                        color: skill.level > 50 ? 'white' : '#374151',
                      }}
                    >
                      <p className="font-medium">{skill.name}</p>
                      <p className="text-sm">{skill.level}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={showAddSkill} onClose={() => setShowAddSkill(false)} title="Add New Skill">
        <form onSubmit={handleAddSkill} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
            <input
              type="text"
              required
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              placeholder="e.g., Docker"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Database">Database</option>
              <option value="DevOps">DevOps</option>
              <option value="Programming">Programming</option>
              <option value="Tools">Tools</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proficiency Level: {newSkill.level}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={newSkill.level}
              onChange={(e) => setNewSkill({ ...newSkill, level: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Skill
          </button>
        </form>
      </Modal>
    </div>
  )
}

export default Skills

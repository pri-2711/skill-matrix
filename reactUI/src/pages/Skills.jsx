import { useState } from 'react'
import { Upload, Plus, X } from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import Modal from '../components/Modal'

const initialSkills = [
  { name: 'React', category: 'Frontend', level: 85, color: 'bg-blue-100 text-blue-600' },
  { name: 'TypeScript', category: 'Programming', level: 78, color: 'bg-purple-100 text-purple-600' },
  { name: 'Node.js', category: 'Backend', level: 70, color: 'bg-green-100 text-green-600' },
  { name: 'Python', category: 'Programming', level: 65, color: 'bg-yellow-100 text-yellow-600' },
  { name: 'SQL', category: 'Database', level: 72, color: 'bg-orange-100 text-orange-600' },
  { name: 'Git', category: 'Tools', level: 80, color: 'bg-cyan-100 text-cyan-600' },
]

const radarData = [
  { subject: 'React', A: 85, fullMark: 100 },
  { subject: 'TypeScript', A: 78, fullMark: 100 },
  { subject: 'Node.js', A: 70, fullMark: 100 },
  { subject: 'Python', A: 65, fullMark: 100 },
  { subject: 'SQL', A: 72, fullMark: 100 },
  { subject: 'Git', A: 80, fullMark: 100 },
]

const Skills = () => {
  const [skills, setSkills] = useState(initialSkills)
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [showUploadCert, setShowUploadCert] = useState(false)
  const [activeViz, setActiveViz] = useState('radar')
  const [newSkill, setNewSkill] = useState({ name: '', category: '', level: 50 })

  const handleAddSkill = (e) => {
    e.preventDefault()
    const colors = ['bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600', 'bg-green-100 text-green-600', 'bg-orange-100 text-orange-600']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    setSkills([...skills, { ...newSkill, color: randomColor }])
    setNewSkill({ name: '', category: '', level: 50 })
    setShowAddSkill(false)
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
          <div className="flex gap-2">
            <button 
              onClick={() => setShowUploadCert(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload size={16} />
              Upload Certificate
            </button>
            <button 
              onClick={() => setShowAddSkill(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus size={16} />
              Add Skill
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {skills.map((skill, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">{skill.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${skill.color}`}>
                    {skill.category}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-600">{skill.level}%</span>
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
      </div>

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
                <Radar
                  name="Skills"
                  dataKey="A"
                  stroke="#4F46E5"
                  fill="#4F46E5"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="grid grid-cols-3 gap-4">
                {skills.map((skill, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg text-center"
                    style={{ 
                      backgroundColor: `rgba(79, 70, 229, ${skill.level / 100})`,
                      color: skill.level > 50 ? 'white' : '#374151'
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
              <option value="">Select category</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Database">Database</option>
              <option value="DevOps">DevOps</option>
              <option value="Programming">Programming</option>
              <option value="Tools">Tools</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proficiency Level: {newSkill.level}%</label>
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

      <Modal isOpen={showUploadCert} onClose={() => setShowUploadCert(false)} title="Upload Certificate">
        <form className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload size={48} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Drag and drop your certificate here, or click to browse</p>
            <input type="file" className="hidden" accept=".pdf,.jpg,.png" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Name</label>
            <input 
              type="text"
              placeholder="e.g., AWS Certified Developer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
            <input 
              type="text"
              placeholder="e.g., Amazon Web Services"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button 
            type="button"
            onClick={() => {
              alert('Certificate uploaded successfully!')
              setShowUploadCert(false)
            }}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload Certificate
          </button>
        </form>
      </Modal>
    </div>
  )
}

export default Skills

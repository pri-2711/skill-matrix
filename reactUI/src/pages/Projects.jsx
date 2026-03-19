import { useState } from 'react'
import { FolderKanban, Plus, Calendar, ExternalLink } from 'lucide-react'
import Modal from '../components/Modal'

const initialProjects = [
  {
    id: 1,
    name: 'E-commerce Platform',
    description: 'A full-stack e-commerce platform with payment integration',
    startDate: 'Jun 2024',
    endDate: 'Sep 2024',
    status: 'Completed',
    skills: ['React', 'Node.js', 'SQL'],
    icon: 'bg-blue-100 text-blue-600'
  },
  {
    id: 2,
    name: 'AI Chat Application',
    description: 'Real-time chat application with AI-powered responses',
    startDate: 'Oct 2024',
    endDate: 'Present',
    status: 'In Progress',
    skills: ['TypeScript', 'Python'],
    icon: 'bg-purple-100 text-purple-600'
  }
]

const Projects = () => {
  const [projects, setProjects] = useState(initialProjects)
  const [showAddProject, setShowAddProject] = useState(false)
  const [newProject, setNewProject] = useState({ 
    name: '', 
    description: '', 
    startDateRaw: '', 
    endDateRaw: '', 
    status: 'In Progress',
    skills: ''
  })

  const handleAddProject = (e) => {
    e.preventDefault()
    const colors = ['bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600', 'bg-green-100 text-green-600', 'bg-orange-100 text-orange-600']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    const skillList = newProject.skills.split(',').map(s => s.trim()).filter(s => s)
    
    const formatDate = (rawDate) => {
      if (!rawDate) return 'Present'
      const date = new Date(rawDate + '-01')
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }
    
    setProjects([...projects, { 
      name: newProject.name,
      description: newProject.description,
      startDate: formatDate(newProject.startDateRaw),
      endDate: formatDate(newProject.endDateRaw),
      status: newProject.status,
      icon: randomColor,
      skills: skillList
    }])
    setNewProject({ name: '', description: '', startDateRaw: '', endDateRaw: '', status: 'In Progress', skills: '' })
    setShowAddProject(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
        <p className="text-gray-600 mt-1">Manage and showcase your projects</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
            <p className="text-sm text-gray-500">Track your projects and applied skills</p>
          </div>
          <button 
            onClick={() => setShowAddProject(true)}
            className="flex items-center justify-center w-10 h-10 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 ${project.icon} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <FolderKanban size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <ExternalLink size={14} className="text-gray-400 cursor-pointer hover:text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Calendar size={12} />
                      <span>{project.startDate} - {project.endDate}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {project.skills.map((skill, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-md">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  project.status === 'Completed' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {project.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={showAddProject} onClose={() => setShowAddProject(false)} title="Add New Project">
        <form onSubmit={handleAddProject} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input 
              type="text"
              required
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              placeholder="e.g., Portfolio Website"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="Brief description of the project"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input 
                type="month"
                required
                value={newProject.startDateRaw}
                onChange={(e) => setNewProject({ ...newProject, startDateRaw: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date (leave blank if ongoing)</label>
              <input 
                type="month"
                value={newProject.endDateRaw}
                onChange={(e) => setNewProject({ ...newProject, endDateRaw: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={newProject.status}
              onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills Used (comma-separated)</label>
            <input 
              type="text"
              value={newProject.skills}
              onChange={(e) => setNewProject({ ...newProject, skills: e.target.value })}
              placeholder="e.g., React, Node.js, MongoDB"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button 
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Project
          </button>
        </form>
      </Modal>
    </div>
  )
}

export default Projects

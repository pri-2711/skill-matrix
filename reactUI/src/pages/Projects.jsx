import { useState, useEffect } from 'react'
import { FolderKanban, Plus, Calendar, ExternalLink, Trash2, Edit2 } from 'lucide-react'
import Modal from '../components/Modal'
import api from '../api/apiClient'

const iconColors = [
  'bg-blue-100 text-blue-600',
  'bg-purple-100 text-purple-600',
  'bg-green-100 text-green-600',
  'bg-orange-100 text-orange-600',
]

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    startDateRaw: '',
    endDateRaw: '',
    status: 'In Progress',
    skills: '',
    url: '',
  })

  const fetchProjects = async () => {
    try {
      const data = await api.get('/projects')
      setProjects(data)
    } catch (err) {
      console.error('Failed to fetch projects:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects() }, [])

  const openAddModal = () => {
    setNewProject({ name: '', description: '', startDateRaw: '', endDateRaw: '', status: 'In Progress', skills: '', url: '' })
    setEditingId(null)
    setIsModalOpen(true)
  }

  const openEditModal = (project) => {
    setNewProject({ 
      name: project.title, 
      description: project.description, 
      startDateRaw: project.start_date ? project.start_date.substring(0, 7) : '', 
      endDateRaw: project.end_date ? project.end_date.substring(0, 7) : '', 
      status: project.role || 'In Progress', 
      skills: project.tech_stack || '', 
      url: project.url || '' 
    })
    setEditingId(project.id)
    setIsModalOpen(true)
  }

  const handleSaveProject = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        title: newProject.name,
        description: newProject.description,
        tech_stack: newProject.skills,
        role: newProject.status,
        start_date: newProject.startDateRaw ? `${newProject.startDateRaw}-01` : null,
        end_date: newProject.endDateRaw ? `${newProject.endDateRaw}-01` : null,
        url: newProject.url || null,
      }
      
      if (editingId) {
        await api.put(`/projects/${editingId}`, payload)
      } else {
        await api.post('/projects', payload)
      }
      setIsModalOpen(false)
      fetchProjects()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return
    try {
      await api.del(`/projects/${id}`)
      fetchProjects()
    } catch (err) {
      alert(err.message)
    }
  }

  const formatDate = (iso) => {
    if (!iso) return 'Present'
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading projects…</div>
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
            onClick={openAddModal}
            className="flex items-center justify-center w-10 h-10 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        {projects.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No projects yet. Add your first!</p>
        ) : (
          <div className="space-y-4">
            {projects.map((project, idx) => {
              const skillList = project.tech_stack
                ? project.tech_stack.split(',').map((s) => s.trim()).filter(Boolean)
                : []
              const status = project.role || 'In Progress'

              return (
                <div key={project.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 ${iconColors[idx % iconColors.length]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <FolderKanban size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">{project.title}</h4>
                          {project.url && (
                            <a href={project.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink size={14} className="text-gray-400 hover:text-gray-600" />
                            </a>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Calendar size={12} />
                          <span>{formatDate(project.start_date)} - {formatDate(project.end_date)}</span>
                        </div>
                        {skillList.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {skillList.map((skill, i) => (
                              <span key={i} className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-md">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        status === 'Completed'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {status}
                      </span>
                      <button
                        onClick={() => openEditModal(project)}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Project" : "Add New Project"}>
        <form onSubmit={handleSaveProject} className="space-y-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date (blank = ongoing)</label>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Link (GitHub / Live URL)</label>
            <input
              type="url"
              value={newProject.url}
              onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
              placeholder="https://github.com/username/project"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editingId ? "Save Changes" : "Add Project"}
          </button>
        </form>
      </Modal>
    </div>
  )
}

export default Projects

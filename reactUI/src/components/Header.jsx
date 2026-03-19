import { useState } from 'react'
import {
  LayoutDashboard,
  Target,
  Award,
  FolderKanban,
  Sparkles,
  TrendingUp,
  FileText,
  Loader2,
} from 'lucide-react'
import Modal from './Modal'
import api from '../api/apiClient'

const Header = ({ activeTab, setActiveTab }) => {
  const [generating, setGenerating] = useState(false)
  const [showResume, setShowResume] = useState(false)
  const [resume, setResume] = useState(null)

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'skills', label: 'Skills', icon: Target },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'ai-suggestions', label: 'AI Suggestions', icon: Sparkles },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ]

  const handleGenerateResume = async () => {
    setGenerating(true)
    try {
      const data = await api.post('/resume', { title: 'My Resume' })
      setResume(data)
      setShowResume(true)
    } catch (err) {
      alert('Failed to generate resume: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">SM</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Skill Matrix</h1>
                <p className="text-xs text-gray-500">Track & Grow Your Skills</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleGenerateResume}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {generating ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                {generating ? 'Generating…' : 'Generate Resume'}
              </button>
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">U</span>
              </div>
            </div>
          </div>

          <nav className="flex gap-8 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === item.id
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      <Modal isOpen={showResume} onClose={() => setShowResume(false)} title="Generated Resume">
        {resume && (
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-900 text-lg">{resume.title}</h4>
              {resume.summary && <p className="text-gray-500 mt-1">{resume.summary}</p>}
              <p className="text-xs text-gray-400 mt-1">Generated: {new Date(resume.generated_at).toLocaleString()}</p>
            </div>

            {resume.skills?.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Skills</h5>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((s, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {s.skill_name} · {s.proficiency_level}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {resume.certificates?.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Certifications</h5>
                {resume.certificates.map((c, i) => (
                  <div key={i} className="p-2 bg-gray-50 rounded mb-1">
                    <p className="font-medium">{c.title}</p>
                    <p className="text-xs text-gray-500">{c.issuer}{c.issue_date ? ` · ${c.issue_date}` : ''}</p>
                  </div>
                ))}
              </div>
            )}

            {resume.projects?.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Projects</h5>
                {resume.projects.map((p, i) => (
                  <div key={i} className="p-2 bg-gray-50 rounded mb-1">
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-gray-500">{p.description}</p>
                    {p.tech_stack && <p className="text-xs text-gray-400 mt-1">Tech: {p.tech_stack}</p>}
                  </div>
                ))}
              </div>
            )}

            {resume.skills?.length === 0 && resume.certificates?.length === 0 && resume.projects?.length === 0 && (
              <p className="text-gray-400 text-center py-4">
                Resume is empty. Add skills, certifications, and projects first!
              </p>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}

export default Header

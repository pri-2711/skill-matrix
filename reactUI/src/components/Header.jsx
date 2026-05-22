import {
  LayoutDashboard,
  Target,
  Award,
  FolderKanban,
  Sparkles,
  TrendingUp,
  FileText,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Header = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth()

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'skills', label: 'Skills', icon: Target },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'ai-suggestions', label: 'AI Suggestions', icon: Sparkles },
    { id: 'market-trends', label: 'Market Trends', icon: TrendingUp },
    { id: 'resume-builder', label: 'Resume Builder', icon: FileText },
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-100">
              <span className="text-white font-bold text-lg">SM</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 leading-tight">Skill Matrix</h1>
              <p className="text-xs text-gray-500">Track & Grow Your Skills</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm">
                {user?.first_name ? user.first_name[0].toUpperCase() : 'U'}
              </div>
              <span className="hidden sm:inline text-sm font-semibold text-gray-700">
                Hi, {user?.first_name}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-150 rounded-lg transition-all"
              title="Sign Out"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
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
  )
}

export default Header


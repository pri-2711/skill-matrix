import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import Header from './components/Header'
import Overview from './pages/Overview'
import Skills from './pages/Skills'
import Certifications from './pages/Certifications'
import Projects from './pages/Projects'
import AISuggestions from './pages/AISuggestions'
import MarketTrends from './pages/MarketTrends'
import ResumeBuilder from './pages/ResumeBuilder'
import Login from './pages/Login'

function App() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  if (!user) {
    return <Login />
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />
      case 'skills':
        return <Skills />
      case 'certifications':
        return <Certifications />
      case 'projects':
        return <Projects />
      case 'ai-suggestions':
        return <AISuggestions />
      case 'market-trends':
        return <MarketTrends />
      case 'resume-builder':
        return <ResumeBuilder />
      default:
        return <Overview />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  )
}

export default App


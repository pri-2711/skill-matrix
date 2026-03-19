import { useState } from 'react'
import Header from './components/Header'
import Overview from './pages/Overview'
import Skills from './pages/Skills'
import Certifications from './pages/Certifications'
import Projects from './pages/Projects'
import AISuggestions from './pages/AISuggestions'
import Progress from './pages/Progress'

function App() {
  const [activeTab, setActiveTab] = useState('overview')

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
      case 'progress':
        return <Progress />
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

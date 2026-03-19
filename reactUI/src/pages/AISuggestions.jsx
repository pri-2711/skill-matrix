import { useState } from 'react'
import { Sparkles, Lightbulb, Code, Briefcase, Search, CheckCircle, XCircle } from 'lucide-react'
import Modal from '../components/Modal'

const nextSkills = [
  { name: 'GraphQL', description: 'Complements your React and Node.js skills', priority: 'high', color: 'bg-red-100 text-red-600' },
  { name: 'Docker', description: 'Essential for modern deployment workflows', priority: 'high', color: 'bg-red-100 text-red-600' },
  { name: 'MongoDB', description: 'Expands your database knowledge beyond SQL', priority: 'medium', color: 'bg-yellow-100 text-yellow-600' },
]

const suggestedProjects = [
  { 
    name: 'Build a Real-time Dashboard', 
    skills: ['React', 'Node.js', 'WebSockets'], 
    level: 'Intermediate',
    color: 'bg-purple-100 text-purple-600'
  },
  { 
    name: 'Create a REST API with Authentication', 
    skills: ['Node.js', 'SQL', 'JWT'], 
    level: 'Intermediate',
    color: 'bg-purple-100 text-purple-600'
  },
  { 
    name: 'Develop a TypeScript Library', 
    skills: ['TypeScript', 'Git'], 
    level: 'Advanced',
    color: 'bg-purple-100 text-purple-600'
  },
]

const careerPaths = [
  { role: 'Full Stack Developer', match: '85%', skillsToLearn: ['Docker', 'AWS'], matchColor: 'bg-green-100 text-green-600' },
  { role: 'Frontend Engineer', match: '92%', skillsToLearn: ['Next.js'], matchColor: 'bg-green-100 text-green-600' },
  { role: 'Backend Developer', match: '78%', skillsToLearn: ['Microservices', 'Redis'], matchColor: 'bg-green-100 text-green-600' },
]

const userSkills = ['React', 'TypeScript', 'Node.js', 'Python', 'SQL', 'Git']

const roleRequirements = {
  'Full Stack Developer': {
    required: ['React', 'Node.js', 'SQL', 'Docker', 'AWS', 'Git'],
    niceToHave: ['TypeScript', 'GraphQL', 'Redis']
  },
  'Frontend Engineer': {
    required: ['React', 'TypeScript', 'Git', 'Next.js'],
    niceToHave: ['Tailwind', 'GraphQL', 'Jest']
  },
  'Backend Developer': {
    required: ['Node.js', 'Python', 'SQL', 'Microservices', 'Redis', 'Docker'],
    niceToHave: ['AWS', 'GraphQL', 'Kafka']
  }
}

const AISuggestions = () => {
  const [activeTab, setActiveTab] = useState('skills')
  const [careerGoal, setCareerGoal] = useState('')
  const [showStartLearning, setShowStartLearning] = useState(false)
  const [showStartProject, setShowStartProject] = useState(false)
  const [showAnalyzeResult, setShowAnalyzeResult] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [analyzeResult, setAnalyzeResult] = useState(null)

  const handleStartLearning = (skill) => {
    setSelectedItem(skill)
    setShowStartLearning(true)
  }

  const handleStartProject = (project) => {
    setSelectedItem(project)
    setShowStartProject(true)
  }

  const handleAnalyze = () => {
    if (!careerGoal.trim()) {
      alert('Please enter a career role first')
      return
    }
    
    const normalizedGoal = careerGoal.toLowerCase().trim()
    let roleKey = null
    
    if (normalizedGoal.includes('full stack')) roleKey = 'Full Stack Developer'
    else if (normalizedGoal.includes('frontend')) roleKey = 'Frontend Engineer'
    else if (normalizedGoal.includes('backend')) roleKey = 'Backend Developer'
    
    if (roleKey && roleRequirements[roleKey]) {
      const req = roleRequirements[roleKey]
      const skillsHave = req.required.filter(skill => userSkills.includes(skill))
      const skillsMissing = req.required.filter(skill => !userSkills.includes(skill))
      const niceToHaveHave = req.niceToHave.filter(skill => userSkills.includes(skill))
      const niceToHaveMissing = req.niceToHave.filter(skill => !userSkills.includes(skill))
      
      setAnalyzeResult({
        role: roleKey,
        skillsHave,
        skillsMissing,
        niceToHaveHave,
        niceToHaveMissing
      })
    } else {
      setAnalyzeResult({
        role: careerGoal,
        skillsHave: [],
        skillsMissing: ['Enter a recognized role (Full Stack Developer, Frontend Engineer, or Backend Developer)'],
        niceToHaveHave: [],
        niceToHaveMissing: []
      })
    }
    setShowAnalyzeResult(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">AI Suggestions</h2>
        <p className="text-gray-600 mt-1">Get personalized recommendations for your career growth</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="text-purple-600" size={24} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI-Powered Suggestions</h3>
            <p className="text-sm text-gray-500">Personalized recommendations based on your skill profile</p>
          </div>
        </div>

        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('skills')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'skills' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Briefcase size={16} />
            Next Skills
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'projects' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Code size={16} />
            Projects
          </button>
          <button
            onClick={() => setActiveTab('career')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'career' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Briefcase size={16} />
            Career Roles
          </button>
        </div>

        {activeTab === 'skills' && (
          <div className="space-y-4">
            {nextSkills.map((skill, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lightbulb className="text-yellow-500 mt-1" size={20} />
                  <div>
                    <h4 className="font-medium text-gray-900">{skill.name}</h4>
                    <p className="text-sm text-gray-500">{skill.description}</p>
                    <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${skill.color}`}>
                      {skill.priority} priority
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleStartLearning(skill)}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Start Learning
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-4">
            {suggestedProjects.map((project, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{project.name}</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.skills.map((skill, skillIndex) => (
                      <span key={skillIndex} className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-md">
                        {skill}
                      </span>
                    ))}
                    <span className={`text-xs px-2 py-1 rounded-md ${project.color}`}>
                      {project.level}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleStartProject(project)}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Start Project
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'career' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <Briefcase size={20} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">My Career Goal</label>
                <div className="flex gap-2 mt-1">
                  <input 
                    type="text"
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    placeholder="Enter your desired career role (e.g., Full Stack Developer)"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button 
                    onClick={handleAnalyze}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Search size={16} />
                    Analyze
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="text-purple-600" size={20} />
              <h4 className="font-medium text-gray-900">Recommended Career Paths</h4>
            </div>

            {careerPaths.map((path, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{path.role}</h4>
                  <span className={`text-xs px-3 py-1 rounded-full ${path.matchColor}`}>
                    {path.match} Match
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-500">Skills to learn:</span>
                  {path.skillsToLearn.map((skill, skillIndex) => (
                    <span key={skillIndex} className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-md">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showStartLearning} onClose={() => setShowStartLearning(false)} title="Start Learning">
        {selectedItem && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900">{selectedItem.name}</h4>
              <p className="text-gray-600">{selectedItem.description}</p>
              <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${selectedItem.color}`}>
                {selectedItem.priority} priority
              </span>
            </div>
            <form className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Learning Platform</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Udemy</option>
                  <option>Coursera</option>
                  <option>Frontend Masters</option>
                  <option>Pluralsight</option>
                  <option>YouTube</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Study Hours</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>1-2 hours</option>
                  <option>3-5 hours</option>
                  <option>5-10 hours</option>
                  <option>10+ hours</option>
                </select>
              </div>
              <button 
                type="button"
                onClick={() => {
                  alert(`Learning plan created for ${selectedItem.name}!`)
                  setShowStartLearning(false)
                }}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Learning Plan
              </button>
            </form>
          </div>
        )}
      </Modal>

      <Modal isOpen={showStartProject} onClose={() => setShowStartProject(false)} title="Start Project">
        {selectedItem && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900">{selectedItem.name}</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedItem.skills.map((skill, index) => (
                  <span key={index} className="text-xs px-2 py-1 bg-gray-100 rounded-md">
                    {skill}
                  </span>
                ))}
                <span className={`text-xs px-2 py-1 rounded-md ${selectedItem.color}`}>
                  {selectedItem.level}
                </span>
              </div>
            </div>
            <form className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Timeline</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>1-2 weeks</option>
                  <option>2-4 weeks</option>
                  <option>1-2 months</option>
                  <option>3+ months</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Visibility</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Public (GitHub)</option>
                  <option>Private</option>
                  <option>Portfolio Only</option>
                </select>
              </div>
              <button 
                type="button"
                onClick={() => {
                  alert(`Project "${selectedItem.name}" added to your projects!`)
                  setShowStartProject(false)
                }}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Project
              </button>
            </form>
          </div>
        )}
      </Modal>
      <Modal isOpen={showAnalyzeResult} onClose={() => setShowAnalyzeResult(false)} title="Career Analysis Results">
        {analyzeResult && (
          <div className="space-y-4">
            <div className="text-center pb-4 border-b border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900">{analyzeResult.role}</h4>
              <p className="text-sm text-gray-500 mt-1">Skills analysis for this role</p>
            </div>

            {analyzeResult.skillsMissing.length > 0 && analyzeResult.skillsMissing[0].includes('Enter a recognized') ? (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-700">{analyzeResult.skillsMissing[0]}</p>
              </div>
            ) : (
              <>
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    Skills You Already Have
                  </h5>
                  {analyzeResult.skillsHave.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analyzeResult.skillsHave.map((skill, index) => (
                        <span key={index} className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No matching skills found</p>
                  )}
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <XCircle size={16} className="text-red-500" />
                    Skills You Need to Learn
                  </h5>
                  {analyzeResult.skillsMissing.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {analyzeResult.skillsMissing.map((skill, index) => (
                        <span key={index} className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-green-600 italic">You have all required skills!</p>
                  )}
                </div>

                {(analyzeResult.niceToHaveHave.length > 0 || analyzeResult.niceToHaveMissing.length > 0) && (
                  <div className="pt-3 border-t border-gray-100">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Nice-to-Have Skills</h5>
                    {analyzeResult.niceToHaveHave.length > 0 && (
                      <div className="mb-2">
                        <span className="text-xs text-gray-500">You have:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {analyzeResult.niceToHaveHave.map((skill, index) => (
                            <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {analyzeResult.niceToHaveMissing.length > 0 && (
                      <div>
                        <span className="text-xs text-gray-500">Could learn:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {analyzeResult.niceToHaveMissing.map((skill, index) => (
                            <span key={index} className="text-xs px-2 py-1 bg-gray-50 text-gray-500 rounded-full border border-gray-200">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AISuggestions

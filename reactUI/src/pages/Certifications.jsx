import { useState } from 'react'
import { Award, Plus, Calendar } from 'lucide-react'
import Modal from '../components/Modal'

const initialCertifications = [
  {
    id: 1,
    name: 'AWS Certified Developer',
    issuer: 'Amazon Web Services',
    date: 'Aug 2024',
    status: 'active',
    icon: 'bg-purple-100 text-purple-600'
  },
  {
    id: 2,
    name: 'React Advanced Patterns',
    issuer: 'Frontend Masters',
    date: 'Jun 2024',
    status: 'active',
    icon: 'bg-blue-100 text-blue-600'
  }
]

const Certifications = () => {
  const [certifications, setCertifications] = useState(initialCertifications)
  const [showAddCert, setShowAddCert] = useState(false)
  const [newCert, setNewCert] = useState({ name: '', issuer: '', dateRaw: '', status: 'active' })

  const handleAddCert = (e) => {
    e.preventDefault()
    const colors = ['bg-purple-100 text-purple-600', 'bg-blue-100 text-blue-600', 'bg-green-100 text-green-600', 'bg-orange-100 text-orange-600']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    
    const formatDate = (rawDate) => {
      if (!rawDate) return ''
      const date = new Date(rawDate + '-01')
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }
    
    setCertifications([...certifications, { 
      name: newCert.name,
      issuer: newCert.issuer,
      date: formatDate(newCert.dateRaw),
      status: newCert.status,
      id: certifications.length + 1, 
      icon: randomColor 
    }])
    setNewCert({ name: '', issuer: '', dateRaw: '', status: 'active' })
    setShowAddCert(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Certifications</h2>
        <p className="text-gray-600 mt-1">Track your professional certifications and achievements</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
            <p className="text-sm text-gray-500">Your earned certificates and credentials</p>
          </div>
          <button 
            onClick={() => setShowAddCert(true)}
            className="flex items-center justify-center w-10 h-10 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {certifications.map((cert) => (
            <div key={cert.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className={`w-12 h-12 ${cert.icon} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Award size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{cert.name}</h4>
                <p className="text-sm text-gray-500">{cert.issuer}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={12} />
                    {cert.date}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    cert.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {cert.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={showAddCert} onClose={() => setShowAddCert(false)} title="Add Certification">
        <form onSubmit={handleAddCert} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Name</label>
            <input 
              type="text"
              required
              value={newCert.name}
              onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
              placeholder="e.g., AWS Solutions Architect"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
            <input 
              type="text"
              required
              value={newCert.issuer}
              onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
              placeholder="e.g., Amazon Web Services"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Earned</label>
            <input 
              type="month"
              required
              value={newCert.dateRaw}
              onChange={(e) => setNewCert({ ...newCert, dateRaw: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={newCert.status}
              onChange={(e) => setNewCert({ ...newCert, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <button 
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Certification
          </button>
        </form>
      </Modal>
    </div>
  )
}

export default Certifications

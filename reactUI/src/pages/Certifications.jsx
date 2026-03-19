import { useState, useEffect } from 'react'
import { Award, Plus, Calendar, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'
import api from '../api/apiClient'

const iconColors = [
  'bg-purple-100 text-purple-600',
  'bg-blue-100 text-blue-600',
  'bg-green-100 text-green-600',
  'bg-orange-100 text-orange-600',
]

const Certifications = () => {
  const [certifications, setCertifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddCert, setShowAddCert] = useState(false)
  const [newCert, setNewCert] = useState({ name: '', issuer: '', dateRaw: '' })

  const fetchCerts = async () => {
    try {
      const data = await api.get('/certificates')
      setCertifications(data)
    } catch (err) {
      console.error('Failed to fetch certificates:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCerts() }, [])

  const handleAddCert = async (e) => {
    e.preventDefault()
    try {
      await api.post('/certificates', {
        title: newCert.name,
        issuer: newCert.issuer,
        issue_date: newCert.dateRaw ? `${newCert.dateRaw}-01` : null,
      })
      setNewCert({ name: '', issuer: '', dateRaw: '' })
      setShowAddCert(false)
      fetchCerts()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this certificate?')) return
    try {
      await api.del(`/certificates/${id}`)
      fetchCerts()
    } catch (err) {
      alert(err.message)
    }
  }

  const formatDate = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading certificates…</div>
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

        {certifications.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No certificates yet. Add your first!</p>
        ) : (
          <div className="space-y-4">
            {certifications.map((cert, idx) => (
              <div key={cert.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className={`w-12 h-12 ${iconColors[idx % iconColors.length]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Award size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{cert.title}</h4>
                  <p className="text-sm text-gray-500">{cert.issuer}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {cert.issue_date && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={12} />
                        {formatDate(cert.issue_date)}
                      </span>
                    )}
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">active</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(cert.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
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

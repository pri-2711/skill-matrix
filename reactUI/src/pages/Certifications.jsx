import { useState, useEffect } from 'react'
import { Award, Plus, Calendar, Trash2, Edit2, ExternalLink } from 'lucide-react'
import Modal from '../components/Modal'
import api, { API_BASE_URL } from '../api/apiClient'

const iconColors = [
  'bg-purple-100 text-purple-600',
  'bg-blue-100 text-blue-600',
  'bg-green-100 text-green-600',
  'bg-orange-100 text-orange-600',
]

const Certifications = () => {
  const [certifications, setCertifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [newCert, setNewCert] = useState({ name: '', issuer: '', dateRaw: '', file: null })

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

  const openAddModal = () => {
    setNewCert({ name: '', issuer: '', dateRaw: '', file: null })
    setEditingId(null)
    setIsModalOpen(true)
  }

  const openEditModal = (cert) => {
    setNewCert({ 
      name: cert.title, 
      issuer: cert.issuer, 
      dateRaw: cert.issue_date ? cert.issue_date.substring(0, 7) : '', 
      file: null 
    })
    setEditingId(cert.id)
    setIsModalOpen(true)
  }

  const handleSaveCert = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('title', newCert.name)
      formData.append('issuer', newCert.issuer)
      if (newCert.dateRaw) formData.append('issue_date', `${newCert.dateRaw}-01`)
      if (newCert.file) formData.append('file', newCert.file)

      if (editingId) {
        await api.put(`/certificates/${editingId}`, formData)
      } else {
        await api.post('/certificates', formData)
      }
      setIsModalOpen(false)
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
            onClick={openAddModal}
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
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{cert.title}</h4>
                    {cert.credential_url && (
                      <a href={`${API_BASE_URL || 'http://localhost:5000'}${cert.credential_url}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={14} className="text-blue-500 hover:text-blue-700" />
                      </a>
                    )}
                  </div>
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(cert)}
                    className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(cert.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Certification" : "Add Certification"}>
        <form onSubmit={handleSaveCert} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Certificate (Image/PDF)</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setNewCert({ ...newCert, file: e.target.files[0] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editingId ? "Save Changes" : "Add Certification"}
          </button>
        </form>
      </Modal>
    </div>
  )
}

export default Certifications

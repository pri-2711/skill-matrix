import { useState, useEffect } from 'react'
import {
  FileText, User, Mail, Phone, Linkedin, CheckSquare, Square,
  Download, Printer, Sparkles, ChevronRight, Save, History, Award, Briefcase, Target, Globe, Plus, Trash2, MapPin
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/apiClient'

const ResumeBuilder = () => {
  const { user } = useAuth()
  const [activeEditorTab, setActiveEditorTab] = useState('contact') // 'contact' | 'sidebar' | 'education' | 'experience' | 'dbSync'
  
  // Contact details & Custom Sidebar state
  const [personalInfo, setPersonalInfo] = useState({
    firstName: 'Kristi',
    lastName: 'Laar',
    title: 'Registered Nurse',
    email: 'kristi@example.com',
    phone: '909.555.0100',
    linkedin: 'linkedin.com/in/kristilaar',
    website: 'www.interestingsite.com',
    address: '111 1st Avenue\nRedmond, WA 65432',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
    communication: 'I have received several awards for my outstanding communication skills, including recognition for providing exceptional patient education and counseling.',
    leadership: 'I received the "Outstanding Nursing Student" award during my time in nursing school, and I have been recognized for my contributions to patient safety and satisfaction in my current role.',
    references: '[Available upon request]'
  })

  // Dynamic lists for right-column content
  const [educationList, setEducationList] = useState([
    {
      id: 1,
      school: 'Bellows College',
      location: 'Madison, WI',
      degree: 'Bachelors of Science in Nursing',
      details: 'Relevant coursework: Anatomy and physiology, pharmacology, nursing ethics, and patient care management.'
    }
  ])

  const [experienceList, setExperienceList] = useState([
    {
      id: 1,
      dates: 'November 20XX–October 20XX',
      title: 'Registered Nurse',
      specialty: 'Pediatrics',
      company: 'Wholeness Healthcare',
      details: ''
    },
    {
      id: 2,
      dates: 'December 20XX–November 20XX',
      title: 'Registered Nurse',
      specialty: 'General Practice',
      company: 'Wholeness Healthcare',
      details: ''
    },
    {
      id: 3,
      dates: 'September 20XX–August 20XX',
      title: 'Registered Nurse',
      specialty: 'General Practice',
      company: 'Tyler Stein MD',
      details: 'I have a proven track record of delivering high-quality care while maintaining patient safety and satisfaction'
    }
  ])

  // DB entities & checklists
  const [skills, setSkills] = useState([])
  const [certs, setCerts] = useState([])
  const [projects, setProjects] = useState([])
  
  // Selection states
  const [selectedSkills, setSelectedSkills] = useState([])
  const [selectedCerts, setSelectedCerts] = useState([])
  const [selectedProjects, setSelectedProjects] = useState([])

  // Loading/saving state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedResumes, setSavedResumes] = useState([])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [skillsData, certsData, projectsData, resumesData] = await Promise.all([
        api.get('/skills'),
        api.get('/certificates'),
        api.get('/projects'),
        api.get('/resume')
      ])

      setSkills(skillsData)
      setCerts(certsData)
      setProjects(projectsData)
      setSavedResumes(resumesData)

      // Keep DB entities deselected initially so the default template remains pure,
      // but users can check boxes to instantly inject their real DB profile data!
      setSelectedSkills([])
      setSelectedCerts([])
      setSelectedProjects([])
    } catch (err) {
      console.error('Failed to load data for resume builder:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Dynamic add/removes
  const addEducation = () => {
    setEducationList(prev => [
      ...prev,
      { id: Date.now(), school: '', location: '', degree: '', details: '' }
    ])
  }

  const deleteEducation = (id) => {
    setEducationList(prev => prev.filter(item => item.id !== id))
  }

  const updateEducation = (id, field, val) => {
    setEducationList(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item))
  }

  const addExperience = () => {
    setExperienceList(prev => [
      ...prev,
      { id: Date.now(), dates: '', title: '', specialty: '', company: '', details: '' }
    ])
  }

  const deleteExperience = (id) => {
    setExperienceList(prev => prev.filter(item => item.id !== id))
  }

  const updateExperience = (id, field, val) => {
    setExperienceList(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item))
  }

  // Checkbox triggers
  const toggleSkill = (id) => {
    setSelectedSkills(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const toggleCert = (id) => {
    setSelectedCerts(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const toggleProject = (id) => {
    setSelectedProjects(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // Database Save
  const handleSaveResume = async () => {
    setSaving(true)
    try {
      const resumePayload = {
        title: `${personalInfo.firstName} ${personalInfo.lastName} - Resume`,
        summary: JSON.stringify({
          personalInfo,
          educationList,
          experienceList,
          selectedSkills,
          selectedCerts,
          selectedProjects
        }),
      }

      await api.post('/resume', resumePayload)
      
      const updatedResumes = await api.get('/resume')
      setSavedResumes(updatedResumes)
      alert('Resume template config saved successfully to PostgreSQL database!')
    } catch (err) {
      alert('Error saving resume config: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Load saved configurations back
  const handleLoadResume = (res) => {
    try {
      const parsed = JSON.parse(res.summary)
      if (parsed.personalInfo) setPersonalInfo(parsed.personalInfo)
      if (parsed.educationList) setEducationList(parsed.educationList)
      if (parsed.experienceList) setExperienceList(parsed.experienceList)
      if (parsed.selectedSkills) setSelectedSkills(parsed.selectedSkills)
      if (parsed.selectedCerts) setSelectedCerts(parsed.selectedCerts)
      if (parsed.selectedProjects) setSelectedProjects(parsed.selectedProjects)
      alert(`Loaded saved config: ${res.title}`)
    } catch {
      // Fallback if not stringified JSON
      setPersonalInfo(prev => ({
        ...prev,
        summary: res.summary || ''
      }))
    }
  }

  // Clean data filters for previewing Checked DB entities
  const previewSkills = skills.filter(s => selectedSkills.includes(s.id)).map(s => {
    const match = s.skill_name.match(/^(.+?)\s*\[.*\]$/)
    return match ? match[1].trim() : s.skill_name
  })
  
  const previewCerts = certs.filter(c => selectedCerts.includes(c.id))
  const previewProjects = projects.filter(p => selectedProjects.includes(p.id))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 font-semibold animate-pulse">
        Fetching Database Profiles & Building Layout...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Dynamic Printing Style Injectors & Custom Web Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;500;600;700;800&display=swap');

        .resume-serif {
          font-family: 'Lora', Georgia, serif;
        }
        .resume-sans {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        .resume-display {
          font-family: 'Playfair Display', Georgia, serif;
        }

        @media print {
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          header, nav, button, .no-print, .editor-column, .watermark {
            display: none !important;
          }
          .print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            display: flex !important;
            flex-direction: row !important;
            min-height: 100% !important;
            height: 100vh !important;
          }
          .print-sidebar {
            width: 34% !important;
            background-color: #dbe1e8 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            padding: 2rem 1.5rem !important;
            height: 100vh !important;
          }
          .print-main {
            width: 66% !important;
            background-color: white !important;
            padding: 2.5rem 2rem !important;
            height: 100vh !important;
          }
        }
      `}</style>

      {/* Editor Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Custom Split Resume Designer</h2>
          <p className="text-gray-600 mt-1">Inspired by elegant, high-contrast layouts. Ready for physical printing or PDF downloads.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveResume}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Template'}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all shadow-sm"
          >
            <Printer size={16} />
            Print / PDF Layout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Settings Column */}
        <div className="lg:col-span-5 space-y-6 no-print editor-column">
          
          {/* Navigation Sub-Tabs inside editor */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl border border-gray-250/30">
            {[
              { key: 'contact', label: 'Identity' },
              { key: 'sidebar', label: 'Sidebar' },
              { key: 'education', label: 'Education' },
              { key: 'experience', label: 'Experience' },
              { key: 'dbSync', label: 'DB Sync' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveEditorTab(tab.key)}
                className={`flex-grow py-2 text-xs font-bold rounded-lg transition-all ${
                  activeEditorTab === tab.key
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Setting Tab Content Blocks */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            {/* Identity & Headers */}
            {activeEditorTab === 'contact' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <User size={16} className="text-indigo-500" />
                  Primary Identity & Photo
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">First Name</label>
                    <input
                      type="text"
                      value={personalInfo.firstName}
                      onChange={e => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={personalInfo.lastName}
                      onChange={e => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Target Professional Title</label>
                  <input
                    type="text"
                    value={personalInfo.title}
                    onChange={e => setPersonalInfo({ ...personalInfo, title: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Profile Photo Upload</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPersonalInfo(prev => ({ ...prev, photo: reader.result }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="profile-photo-upload"
                    />
                    <label
                      htmlFor="profile-photo-upload"
                      className="flex-grow flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50/20 text-xs font-semibold text-gray-600 hover:text-indigo-600 rounded-xl cursor-pointer transition-all text-center"
                    >
                      <Sparkles size={14} className="text-indigo-500" />
                      Choose Local Image File
                    </label>
                    {personalInfo.photo && (
                      <button
                        type="button"
                        onClick={() => setPersonalInfo(prev => ({ ...prev, photo: '' }))}
                        className="px-3 py-2 border border-red-200 hover:border-red-500 hover:bg-red-50 text-xs font-semibold text-red-500 hover:text-red-600 rounded-xl transition-all"
                        title="Clear Photo"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-t border-gray-100 pt-3">Contact Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={personalInfo.email}
                      onChange={e => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">Phone</label>
                    <input
                      type="text"
                      value={personalInfo.phone}
                      onChange={e => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">LinkedIn Name</label>
                    <input
                      type="text"
                      value={personalInfo.linkedin}
                      onChange={e => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">Website URL</label>
                    <input
                      type="text"
                      value={personalInfo.website}
                      onChange={e => setPersonalInfo({ ...personalInfo, website: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Address Location</label>
                  <textarea
                    rows="2"
                    value={personalInfo.address}
                    onChange={e => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* Sidebar Texts & Columns */}
            {activeEditorTab === 'sidebar' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <FileText size={16} className="text-indigo-500" />
                  Custom Sidebar Columns
                </h3>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Communication Block Summary</label>
                  <textarea
                    rows="3"
                    value={personalInfo.communication}
                    onChange={e => setPersonalInfo({ ...personalInfo, communication: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none leading-normal"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Leadership Block Summary</label>
                  <textarea
                    rows="3"
                    value={personalInfo.leadership}
                    onChange={e => setPersonalInfo({ ...personalInfo, leadership: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none leading-normal"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">References Text</label>
                  <input
                    type="text"
                    value={personalInfo.references}
                    onChange={e => setPersonalInfo({ ...personalInfo, references: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Dynamic Education list builder */}
            {activeEditorTab === 'education' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <Award size={16} className="text-indigo-500" />
                    Education Entries
                  </h3>
                  <button
                    onClick={addEducation}
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-500"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
                {educationList.length === 0 ? (
                  <p className="text-xs text-gray-400 italic text-center py-4">No education entries listed.</p>
                ) : (
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                    {educationList.map((edu, idx) => (
                      <div key={edu.id} className="p-3 border border-gray-150 rounded-xl bg-gray-50/50 space-y-2 relative">
                        <button
                          onClick={() => deleteEducation(edu.id)}
                          className="absolute right-2 top-2 text-red-500 hover:text-red-700"
                          title="Delete entry"
                        >
                          <Trash2 size={14} />
                        </button>
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">Entry #{idx + 1}</span>
                        
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <label className="block text-[9px] font-semibold text-gray-400 mb-0.5">School / College</label>
                            <input
                              type="text"
                              value={edu.school}
                              onChange={e => updateEducation(edu.id, 'school', e.target.value)}
                              className="w-full text-[11px] px-2 py-1 border border-gray-200 rounded-lg outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-semibold text-gray-400 mb-0.5">Location</label>
                            <input
                              type="text"
                              value={edu.location}
                              onChange={e => updateEducation(edu.id, 'location', e.target.value)}
                              className="w-full text-[11px] px-2 py-1 border border-gray-200 rounded-lg outline-none"
                              placeholder="e.g. Redmond, WA"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9px] font-semibold text-gray-400 mb-0.5">Degree Title</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={e => updateEducation(edu.id, 'degree', e.target.value)}
                            className="w-full text-[11px] px-2 py-1 border border-gray-200 rounded-lg outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-semibold text-gray-400 mb-0.5">Specialization Coursework / Honors</label>
                          <textarea
                            rows="2"
                            value={edu.details}
                            onChange={e => updateEducation(edu.id, 'details', e.target.value)}
                            className="w-full text-[11px] px-2 py-1 border border-gray-200 rounded-lg outline-none resize-none leading-tight"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Dynamic Experience list builder */}
            {activeEditorTab === 'experience' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <Briefcase size={16} className="text-indigo-500" />
                    Experience Entries
                  </h3>
                  <button
                    onClick={addExperience}
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-500"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
                {experienceList.length === 0 ? (
                  <p className="text-xs text-gray-400 italic text-center py-4">No experience entries listed.</p>
                ) : (
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                    {experienceList.map((exp, idx) => (
                      <div key={exp.id} className="p-3 border border-gray-150 rounded-xl bg-gray-50/50 space-y-2 relative">
                        <button
                          onClick={() => deleteExperience(exp.id)}
                          className="absolute right-2 top-2 text-red-500 hover:text-red-700"
                          title="Delete entry"
                        >
                          <Trash2 size={14} />
                        </button>
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">Entry #{idx + 1}</span>
                        
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <label className="block text-[9px] font-semibold text-gray-400 mb-0.5">Company / Practice</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={e => updateExperience(exp.id, 'company', e.target.value)}
                              className="w-full text-[11px] px-2 py-1 border border-gray-200 rounded-lg outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-semibold text-gray-400 mb-0.5">Dates Duration</label>
                            <input
                              type="text"
                              value={exp.dates}
                              onChange={e => updateExperience(exp.id, 'dates', e.target.value)}
                              className="w-full text-[11px] px-2 py-1 border border-gray-200 rounded-lg outline-none"
                              placeholder="November 20XX–October 20XX"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] font-semibold text-gray-400 mb-0.5">Job Title</label>
                            <input
                              type="text"
                              value={exp.title}
                              onChange={e => updateExperience(exp.id, 'title', e.target.value)}
                              className="w-full text-[11px] px-2 py-1 border border-gray-200 rounded-lg outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-semibold text-gray-400 mb-0.5">Specialty / Department</label>
                            <input
                              type="text"
                              value={exp.specialty}
                              onChange={e => updateExperience(exp.id, 'specialty', e.target.value)}
                              className="w-full text-[11px] px-2 py-1 border border-gray-200 rounded-lg outline-none"
                              placeholder="Pediatrics"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9px] font-semibold text-gray-400 mb-0.5">Core Achievements</label>
                          <textarea
                            rows="2"
                            value={exp.details}
                            onChange={e => updateExperience(exp.id, 'details', e.target.value)}
                            className="w-full text-[11px] px-2 py-1 border border-gray-200 rounded-lg outline-none resize-none leading-tight"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sync checklist with local PostgreSQL database */}
            {activeEditorTab === 'dbSync' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                  <CheckSquare size={16} className="text-indigo-500" />
                  Inject PostgreSQL Entities
                </h3>
                <p className="text-[11px] text-gray-400 leading-normal">
                  Toggle checked items to inject live portfolio content dynamically into the custom layout. Mapped automatically to relevant columns.
                </p>

                {/* Skills checklist */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Target size={11} /> Skills (Appends to Sidebar)
                  </h4>
                  {skills.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No skills listed in DB.</p>
                  ) : (
                    <div className="max-h-24 overflow-y-auto border border-gray-150 bg-gray-50/50 rounded-xl p-2.5 space-y-1.5">
                      {skills.map(s => {
                        const isSelected = selectedSkills.includes(s.id)
                        const cleanName = s.skill_name.match(/^(.+?)\s*\[.*\]$/)?.[1] || s.skill_name
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => toggleSkill(s.id)}
                            className="flex items-center gap-2 text-left w-full text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                          >
                            {isSelected ? (
                              <CheckSquare size={13} className="text-indigo-600 flex-shrink-0" />
                            ) : (
                              <Square size={13} className="text-gray-400 flex-shrink-0" />
                            )}
                            <span className="truncate">{cleanName}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Certificates checklist */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Award size={11} /> Certifications (Appends to Sidebar)
                  </h4>
                  {certs.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No credentials in DB.</p>
                  ) : (
                    <div className="max-h-24 overflow-y-auto border border-gray-150 bg-gray-50/50 rounded-xl p-2.5 space-y-1.5">
                      {certs.map(c => {
                        const isSelected = selectedCerts.includes(c.id)
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => toggleCert(c.id)}
                            className="flex items-center gap-2 text-left w-full text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                          >
                            {isSelected ? (
                              <CheckSquare size={13} className="text-indigo-600 flex-shrink-0" />
                            ) : (
                              <Square size={13} className="text-gray-400 flex-shrink-0" />
                            )}
                            <span className="truncate">{c.title}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Projects checklist */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Briefcase size={11} /> Projects (Appends as Experience)
                  </h4>
                  {projects.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No projects in DB.</p>
                  ) : (
                    <div className="max-h-24 overflow-y-auto border border-gray-150 bg-gray-50/50 rounded-xl p-2.5 space-y-1.5">
                      {projects.map(p => {
                        const isSelected = selectedProjects.includes(p.id)
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => toggleProject(p.id)}
                            className="flex items-center gap-2 text-left w-full text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                          >
                            {isSelected ? (
                              <CheckSquare size={13} className="text-indigo-600 flex-shrink-0" />
                            ) : (
                              <Square size={13} className="text-gray-400 flex-shrink-0" />
                            )}
                            <span className="truncate">{p.title}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Saved Layout Settings in PostgreSQL */}
          {savedResumes.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <History size={16} className="text-gray-500" />
                Previous Resume Saves
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {savedResumes.map(res => (
                  <div
                    key={res.id}
                    onClick={() => handleLoadResume(res)}
                    className="p-2.5 rounded-xl bg-gray-50 hover:bg-indigo-50/40 hover:border-indigo-200 border border-gray-200 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <p className="font-bold text-gray-800">{res.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-medium">
                        Stored: {new Date(res.generated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Preview Card - Physical Layout Preview */}
        <div className="lg:col-span-7 print-container w-full shadow-2xl rounded-2xl overflow-hidden border border-gray-200 bg-white select-none">
          <div className="flex flex-row min-h-[1050px] w-full bg-white relative">
            
            {/* 1. LEFT SIDEBAR: Slate Grey/Blue background, framed portrait, contact list, communication and leadership text blocks */}
            <div className="print-sidebar w-[34%] bg-[#dbe1e8] p-8 text-slate-800 flex flex-col space-y-7 border-r border-slate-300/30">
              
              {/* Profile Image Rectangular Frame */}
              {personalInfo.photo && (
                <div className="border border-[#9eaec1] p-2 bg-transparent flex justify-center items-center shadow-sm w-full">
                  <img
                    src={personalInfo.photo}
                    alt={`${personalInfo.firstName} Portrait`}
                    className="w-full h-auto object-cover border border-[#9eaec1]"
                  />
                </div>
              )}

              {/* CONTACT details column */}
              <div className="space-y-4">
                <h3 className="resume-display tracking-[0.12em] text-lg uppercase text-slate-900 font-bold">
                  Contact
                </h3>
                <div className="resume-sans space-y-2 text-[11px] leading-relaxed text-slate-800 font-medium">
                  {personalInfo.address && (
                    <div className="whitespace-pre-line leading-normal">{personalInfo.address}</div>
                  )}
                  {personalInfo.phone && (
                    <div>{personalInfo.phone}</div>
                  )}
                  {personalInfo.email && (
                    <div className="break-all">{personalInfo.email}</div>
                  )}
                  {personalInfo.website && (
                    <div className="break-all font-semibold text-slate-900">{personalInfo.website}</div>
                  )}
                  {personalInfo.linkedin && (
                    <div className="break-all font-semibold text-slate-900">{personalInfo.linkedin}</div>
                  )}
                </div>
              </div>

              {/* Separator line */}
              <div className="border-t border-[#a6b5c5] w-full opacity-60" />

              {/* COMMUNICATION column text block */}
              {personalInfo.communication && (
                <div className="space-y-3">
                  <h3 className="resume-display tracking-[0.12em] text-lg uppercase text-slate-900 font-bold">
                    Communication
                  </h3>
                  <p className="resume-sans text-[11px] leading-relaxed text-slate-700 text-left font-medium">
                    {personalInfo.communication}
                  </p>
                </div>
              )}

              {/* Separator line */}
              {personalInfo.leadership && (
                <div className="border-t border-[#a6b5c5] w-full opacity-60" />
              )}

              {/* LEADERSHIP column text block */}
              {personalInfo.leadership && (
                <div className="space-y-3">
                  <h3 className="resume-display tracking-[0.12em] text-lg uppercase text-slate-900 font-bold">
                    Leadership
                  </h3>
                  <p className="resume-sans text-[11px] leading-relaxed text-slate-700 text-left font-medium">
                    {personalInfo.leadership}
                  </p>
                </div>
              )}

              {/* Dynamic DB Skills in sidebar (if checked) */}
              {previewSkills.length > 0 && (
                <>
                  <div className="border-t border-[#a6b5c5] w-full opacity-60" />
                  <div className="space-y-3">
                    <h3 className="resume-display tracking-[0.12em] text-lg uppercase text-slate-900 font-bold">
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {previewSkills.map((sk, idx) => (
                        <span key={idx} className="resume-sans text-[9px] font-bold px-2 py-0.5 bg-white/70 text-slate-800 border border-slate-350 rounded shadow-sm">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Dynamic DB Certifications in sidebar (if checked) */}
              {previewCerts.length > 0 && (
                <>
                  <div className="border-t border-[#a6b5c5] w-full opacity-60" />
                  <div className="space-y-3">
                    <h3 className="resume-display tracking-[0.12em] text-lg uppercase text-slate-900 font-bold">
                      Credentials
                    </h3>
                    <div className="space-y-2 text-[11px]">
                      {previewCerts.map((c, idx) => (
                        <div key={idx} className="leading-snug">
                          <p className="resume-sans font-bold text-slate-900 text-[11px]">{c.title}</p>
                          <p className="resume-sans text-[10px] text-slate-600 font-semibold">{c.issuer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 2. MAIN BODY: Large Name serif titles, bold dividers, Education, Experience, References blocks */}
            <div className="print-main w-[66%] bg-white p-10 flex flex-col space-y-6">
              
              {/* Header Title block: First Name + Last Name (colored serif uppercase) */}
              <div className="space-y-1">
                <h1 className="resume-display text-[54px] tracking-[0.18em] text-[#111827] uppercase leading-none font-normal">
                  {personalInfo.firstName || 'KRISTI'}
                </h1>
                <h1 className="resume-display text-[54px] tracking-[0.18em] text-[#41648a] uppercase leading-none font-normal mt-2.5">
                  {personalInfo.lastName || 'LAAR'}
                </h1>
                
                {/* Thin Divider under names */}
                <div className="border-b border-[#a6b5c5] w-full pt-4 pb-0.5" />
                
                {/* Subtitle - Target Role/Title */}
                <p className="resume-sans text-xs tracking-[0.25em] text-[#111827] uppercase font-bold pt-3.5">
                  {personalInfo.title || 'REGISTERED NURSE'}
                </p>
              </div>

              {/* EDUCATION Section */}
              {educationList.length > 0 && (
                <div className="space-y-4 pt-2">
                  <h3 className="resume-display tracking-[0.12em] text-xl uppercase text-slate-900 font-bold">
                    Education
                  </h3>
                  <div className="space-y-4 pt-0.5">
                    {educationList.map((edu) => (
                      <div key={edu.id} className="space-y-1">
                        <div className="resume-sans text-xs text-gray-500 font-medium">
                          {edu.school}{edu.location ? ` | ${edu.location}` : ''}
                        </div>
                        <h4 className="resume-sans text-xs text-[#111827] font-bold uppercase tracking-wide leading-tight">
                          {edu.degree}
                        </h4>
                        {edu.details && (
                          <p className="resume-sans text-xs text-gray-600 leading-relaxed pt-0.5">{edu.details}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EXPERIENCE Section */}
              <div className="space-y-4">
                {/* Separator line before Experience section */}
                {educationList.length > 0 && (
                  <div className="border-t border-[#a6b5c5] w-full opacity-60 pb-2" />
                )}
                <h3 className="resume-display tracking-[0.12em] text-xl uppercase text-slate-900 font-bold">
                  Experience
                </h3>
                <div className="space-y-4 pt-0.5">
                  {/* Dynamic Custom Experience entries */}
                  {experienceList.map((exp) => (
                    <div key={exp.id} className="space-y-1">
                      <div className="resume-sans text-xs text-gray-500 font-medium uppercase tracking-wider">
                        {exp.dates}
                      </div>
                      <h4 className="resume-sans text-xs text-[#111827] font-bold leading-tight">
                        {[exp.title, exp.specialty, exp.company].filter(Boolean).join(' | ')}
                      </h4>
                      {exp.details && (
                        <p className="resume-sans text-xs text-gray-600 leading-relaxed pt-0.5">{exp.details}</p>
                      )}
                    </div>
                  ))}

                  {/* Checked projects from DB (appends seamlessly under experience) */}
                  {previewProjects.map((p, idx) => (
                    <div key={`db-${idx}`} className="space-y-1 border-l-2 border-indigo-500/30 pl-3">
                      <div className="resume-sans text-xs text-indigo-600/70 font-semibold uppercase tracking-wider">
                        <span>Database Portfolio Project</span>
                        <span className="text-[10px] text-gray-400 font-medium">{p.role || 'Developer'}</span>
                      </div>
                      <h4 className="resume-sans text-xs text-[#111827] font-bold leading-tight">
                        {p.title}
                      </h4>
                      {p.tech_stack && (
                        <p className="resume-sans text-[10px] font-bold text-indigo-600">Tech: {p.tech_stack}</p>
                      )}
                      {p.description && (
                        <p className="resume-sans text-xs text-gray-600 leading-relaxed mt-0.5">{p.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* REFERENCES Section */}
              {personalInfo.references && (
                <div className="space-y-4">
                  {/* Separator line before References section */}
                  <div className="border-t border-[#a6b5c5] w-full opacity-60 pb-2" />
                  <h3 className="resume-display tracking-[0.12em] text-xl uppercase text-slate-900 font-bold">
                    References
                  </h3>
                  <p className="resume-sans text-xs text-gray-600 pt-0.5 font-medium leading-relaxed">
                    {personalInfo.references}
                  </p>
                </div>
              )}
            </div>

            {/* Premium minimal footer watermark */}
            <div className="absolute bottom-4 right-8 watermark text-[9px] text-gray-300 font-semibold tracking-wider uppercase">
              Powered by Skill Matrix Designer
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResumeBuilder


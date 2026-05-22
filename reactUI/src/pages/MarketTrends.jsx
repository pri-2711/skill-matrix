import { useState, useEffect } from 'react'
import {
  TrendingUp, Briefcase, DollarSign, Zap, ChevronRight,
  Users, Globe, ArrowUpRight, RefreshCw, AlertCircle, Sparkles
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import api from '../api/apiClient'

const colorMap = {
  blue:   { bg: 'bg-blue-50/50', border: 'border-blue-100',   badge: 'bg-blue-100 text-blue-700 border border-blue-200',     dot: 'bg-blue-500',   step: 'bg-blue-500'   },
  orange: { bg: 'bg-orange-50/50', border: 'border-orange-100', badge: 'bg-orange-100 text-orange-700 border border-orange-200', dot: 'bg-orange-500',  step: 'bg-orange-500' },
  green:  { bg: 'bg-green-50/50', border: 'border-green-100',  badge: 'bg-green-100 text-green-700 border border-green-200',   dot: 'bg-green-500',  step: 'bg-green-500'  },
  purple: { bg: 'bg-purple-50/50', border: 'border-purple-100', badge: 'bg-purple-100 text-purple-700 border border-purple-200', dot: 'bg-purple-500',  step: 'bg-purple-500' },
}

const iconMap = {
  briefcase: Briefcase,
  trending: TrendingUp,
  dollar: DollarSign,
  zap: Zap
}

const demandColor = (d) =>
  d === 'Very High' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-700 border border-amber-200'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-xl shadow-xl px-4 py-2.5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Hiring Segment</p>
        <p className="text-sm font-bold text-gray-800 mt-0.5">{payload[0].payload.domain}</p>
        <p className="text-xs text-indigo-600 font-semibold mt-1">{(payload[0].value).toLocaleString()} active jobs</p>
      </div>
    )
  }
  return null
}

const MarketTrends = () => {
  const [goalInput, setGoalInput] = useState('AI Product Manager')
  const [activeGoal, setActiveGoal] = useState('')
  const [trends, setTrends] = useState(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('skills')

  const fetchTrends = (targetGoal, forceRefresh = false) => {
    if (!targetGoal) return
    
    if (forceRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)
    
    api.get(`/market-trends?goal=${encodeURIComponent(targetGoal)}&refresh=${forceRefresh}`)
      .then(res => {
        setTrends(res)
        setActiveGoal(res.goal || targetGoal)
        setGoalInput(res.goal || targetGoal)
      })
      .catch(err => {
        console.error("Failed to fetch market trends:", err)
        setError("Failed to gather real-time job market parameters. Please check your query or backend connection.")
      })
      .finally(() => {
        setLoading(false)
        setRefreshing(false)
      })
  }

  useEffect(() => {
    fetchTrends('AI Product Manager')
  }, [])

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Sparkles className="text-indigo-600" size={24} />
            Career Intelligence Dashboard
          </h2>
          <p className="text-gray-500 text-sm mt-1">Real-time target benchmarks parsed through dynamic search analysis</p>
        </div>
        {trends && (
          <div className="text-xs text-gray-400 bg-white shadow-sm border border-gray-100 rounded-lg px-3 py-1.5 self-start md:self-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            Mapped Domain: <span className="font-semibold text-gray-700">{trends.domain}</span>
          </div>
        )}
      </div>

      {/* Goal Selector Form */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-900/50">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full filter blur-3xl opacity-30 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full filter blur-3xl opacity-30 -ml-20 -mb-20"></div>
        
        <div className="relative z-10 max-w-3xl">
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full uppercase tracking-wider border border-indigo-500/30">
            Real-time Parsing Engine
          </span>
          <h3 className="text-2xl font-bold mt-3">Target Career Matrix</h3>
          <p className="text-indigo-200 mt-1 text-sm leading-relaxed">
            Input any specialized career goal. Our backend maps the profile dynamically, fetches local taxonomy indices, and enables live 2026 web-crawls for exact real-time salary curves.
          </p>
          
          <form onSubmit={(e) => { e.preventDefault(); fetchTrends(goalInput); }} className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <input
                type="text"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="e.g. AI Product Manager, Bioinformatician, UI/UX Designer..."
                className="w-full bg-white/5 hover:bg-white/10 focus:bg-white border border-white/10 focus:border-indigo-400 text-white focus:text-gray-900 rounded-xl px-4 py-3.5 text-sm focus:outline-none transition-all shadow-inner placeholder-white/40"
                disabled={loading || refreshing}
              />
              {refreshing && (
                <span className="absolute right-3 top-4 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || refreshing}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-colors shadow-md hover:shadow-lg disabled:bg-indigo-600/50 flex-shrink-0 flex items-center gap-1.5"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} />
                    Analyzing...
                  </>
                ) : 'Fetch Index'}
              </button>
              <button
                type="button"
                onClick={() => fetchTrends(goalInput, true)}
                disabled={loading || refreshing}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-3.5 rounded-xl text-sm transition-colors shadow-md hover:shadow-lg disabled:bg-emerald-600/50 flex-shrink-0 flex items-center gap-1.5"
                title="Perform live Google web search crawl"
              >
                {refreshing ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} />
                    Crawling Web...
                  </>
                ) : (
                  <>
                    <Globe size={16} />
                    Live Sync
                  </>
                )}
              </button>
            </div>
          </form>
          
          {/* Target Suggestions */}
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-indigo-300 font-medium">Domain Suggestions:</span>
            {[
              { label: '🤖 AI Product Manager', goal: 'AI Product Manager' },
              { label: '🧬 Bioinformatician', goal: 'Bioinformatician' },
              { label: '📊 Financial Analyst', goal: 'Financial Analyst' },
              { label: '🎨 UX Designer', goal: 'UX Designer' },
              { label: '☁️ Cloud Architect', goal: 'Cloud Architect' }
            ].map((sugg) => (
              <button
                key={sugg.goal}
                onClick={() => {
                  setGoalInput(sugg.goal);
                  fetchTrends(sugg.goal);
                }}
                disabled={loading || refreshing}
                className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 text-indigo-200 border border-white/5 hover:border-white/15 rounded-full transition-all"
              >
                {sugg.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
          <AlertCircle size={20} className="flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Loading Skeletons */}
      {(loading || !trends) ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
                <div className="space-y-2 flex-grow">
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse h-96">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(n => (
                <div key={n} className="h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Dynamic Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trends.stat_cards.map((s, i) => {
              const Icon = iconMap[s.icon_type] || Briefcase
              const colorGradients = [
                'from-blue-600 to-indigo-600',
                'from-purple-600 to-pink-600',
                'from-emerald-600 to-teal-600',
                'from-orange-600 to-amber-600'
              ]
              const grad = colorGradients[i % colorGradients.length]
              return (
                <div key={i} className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 shadow-sm p-5 flex items-center gap-4 transition-all hover:shadow-md">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">{s.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-0.5">{s.value}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 flex-wrap bg-gray-100/50 p-1.5 rounded-xl border border-gray-200/50 self-start">
            {[
              { key: 'skills',   label: '🔥 In-Demand Skills' },
              { key: 'roles',    label: '💼 Salary Benchmarks' },
              { key: 'paths',    label: '🗺️ Career roadmap'      },
              { key: 'domains',  label: '🏢 Hiring sectors'  },
              { key: 'gap',      label: '🎯 Target Skill Gap'    },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === t.key
                    ? 'bg-white text-indigo-900 shadow-sm font-bold border border-gray-200/40'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Dynamic Tab Panels */}
          <div className="transition-all duration-300">
            {/* In-Demand Skills */}
            {activeTab === 'skills' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Expertise Frequency Index</h3>
                    <p className="text-sm text-gray-400 mt-0.5">Top credentials required for {activeGoal} (2026 data)</p>
                  </div>
                  <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-full border border-indigo-100">
                    Live Indexed
                  </span>
                </div>
                <div className="space-y-5">
                  {trends.in_demand_skills.map((s, i) => (
                    <div key={i} className="hover:bg-gray-50/50 p-2 rounded-xl transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="w-5.5 h-5.5 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white flex-shrink-0"
                            style={{ background: s.color }}>{i + 1}</span>
                          <span className="font-bold text-gray-800 text-sm">{s.skill}</span>
                          <span className="text-[10px] px-2 py-0.5 font-bold bg-slate-100 text-slate-600 rounded-full border border-slate-200/50">{s.category}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-green-100">
                            <ArrowUpRight size={10} />{s.growth}
                          </span>
                          <span className="text-sm font-extrabold text-gray-700 w-10 text-right">{s.demand}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${s.demand}%`, background: s.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Job Roles */}
            {activeTab === 'roles' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Goal Salary Segments</h3>
                  <p className="text-sm text-gray-400 mt-0.5">Average corporate package curves based on real-world hiring ranges in India</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {trends.top_roles.map((r, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow relative flex flex-col justify-between">
                      <div className={`h-1.5 bg-gradient-to-r ${r.grad}`} />
                      <div className="p-5 flex-grow">
                        <div className="flex items-start justify-between mb-3 gap-2">
                          <h4 className="font-bold text-gray-900 text-sm leading-snug">{r.role}</h4>
                          {r.hot && (
                            <span className="text-[9px] font-extrabold bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full border border-rose-200 flex-shrink-0">HOT</span>
                          )}
                        </div>
                        <p className="text-2xl font-black text-slate-800 tracking-tight mt-2">{r.salary}</p>
                      </div>
                      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-gray-500">
                        <span className="flex items-center gap-1 font-semibold text-green-600">
                          <TrendingUp size={11} />{r.growth} YoY
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <Users size={11} />{r.openings} Listings
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Career Paths */}
            {activeTab === 'paths' && (
              <div className="max-w-3xl mx-auto">
                <div className="mb-4 text-center">
                  <h3 className="text-lg font-bold text-gray-900">Career Roadmap Sequence</h3>
                  <p className="text-sm text-gray-400 mt-0.5">Recommended technical blocks to transition into a {activeGoal}</p>
                </div>
                {trends.career_path && (() => {
                  const cp = trends.career_path
                  const c = colorMap[cp.color] || colorMap['blue']
                  return (
                    <div className={`${c.bg} rounded-2xl border ${c.border} p-6 md:p-8 shadow-sm`}>
                      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl p-2.5 bg-white shadow-sm border border-gray-100 rounded-2xl">{cp.icon}</span>
                          <div>
                            <h4 className="font-extrabold text-gray-900 text-lg capitalize">{cp.path} Trajectory</h4>
                            <p className="text-xs text-gray-500 font-medium">Estimated timeline: <span className="font-semibold text-gray-700">{cp.time}</span></p>
                          </div>
                        </div>
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${demandColor(cp.demand)}`}>
                          {cp.demand} Demand
                        </span>
                      </div>

                      {/* Timeline Steps */}
                      <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                        {cp.steps.map((step, j) => (
                          <div key={j} className="flex items-start gap-4 relative">
                            <div className="w-7 h-7 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center flex-shrink-0 z-10">
                              <span className="text-[10px] font-extrabold text-indigo-600">{j + 1}</span>
                            </div>
                            <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 flex-grow hover:shadow-md transition-shadow">
                              <h5 className="font-bold text-gray-800 text-sm">{step}</h5>
                              <p className="text-xs text-gray-400 mt-1">Recommended target specialization block</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-200/50 mt-6 pt-5 flex-wrap gap-2 text-sm">
                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Estimated Base Return</span>
                        <span className="font-extrabold text-indigo-950 text-base">{cp.salary}</span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            {/* Hiring by Domain */}
            {activeTab === 'domains' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Recruiting Industry Breakouts</h3>
                  <p className="text-sm text-gray-400 mt-0.5">Estimated active listings by corporate sector for {activeGoal} roles</p>
                </div>
                {trends.sectors && trends.sectors.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trends.sectors} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                        <XAxis dataKey="domain" tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} />
                        <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: '#64748b' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="jobs" radius={[6, 6, 0, 0]}>
                          {trends.sectors.map((_, idx) => (
                            <Cell key={idx} fill={['#4f46e5','#7c3aed','#2563eb','#0891b2','#059669','#d97706','#db2777','#9333ea'][idx % 8]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Globe size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm font-medium">No specialized sector data found for this goal</p>
                  </div>
                )}
              </div>
            )}

            {/* Skill Gap Analysis */}
            {activeTab === 'gap' && (
              <div className="space-y-6">
                {trends.user_skill_gap && (() => {
                  const gap = trends.user_skill_gap
                  return (
                    <div className="space-y-6">
                      {/* Circular Gauge Alignment Panel */}
                      <div className="flex flex-col md:flex-row items-center justify-around p-6 md:p-8 bg-gradient-to-r from-indigo-50/50 via-slate-50 to-indigo-50/30 rounded-2xl border border-indigo-100/50 shadow-sm gap-6">
                        <div className="relative w-36 h-36 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="72"
                              cy="72"
                              r="60"
                              className="stroke-slate-200/70"
                              strokeWidth="10"
                              fill="transparent"
                            />
                            <circle
                              cx="72"
                              cy="72"
                              r="60"
                              className="stroke-indigo-600 transition-all duration-1000 ease-out"
                              strokeWidth="10"
                              fill="transparent"
                              strokeDasharray={2 * Math.PI * 60}
                              strokeDashoffset={2 * Math.PI * 60 * (1 - gap.match_percentage / 100)}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute text-center">
                            <p className="text-3xl font-black text-slate-800">{gap.match_percentage}%</p>
                            <p className="text-[9px] text-indigo-600 font-extrabold uppercase tracking-wider mt-0.5">Match Index</p>
                          </div>
                        </div>
                        <div className="max-w-md text-center md:text-left">
                          <h4 className="text-lg font-bold text-gray-900">Career Competency Overlap</h4>
                          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                            Your PostgreSQL profile registers <span className="font-extrabold text-indigo-600">{gap.matched_skills.length}</span> out of the <span className="font-extrabold text-slate-800">{trends.in_demand_skills.length}</span> critical skills required to transition into a <span className="font-extrabold text-slate-900 uppercase tracking-tight">{activeGoal}</span>.
                          </p>
                        </div>
                      </div>

                      {/* Breakouts lists */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Acquired Skills */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                          <h4 className="text-sm font-extrabold text-emerald-700 mb-4 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                            Acquired Qualifications ({gap.matched_skills.length})
                          </h4>
                          {gap.matched_skills.length === 0 ? (
                            <p className="text-xs text-gray-400 font-medium py-4 text-center border border-dashed border-gray-100 rounded-xl">No competency matches found. Try syncing custom skills in your profile!</p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {gap.matched_skills.map((s, idx) => (
                                <span key={idx} className="text-xs px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl font-bold transition-all hover:scale-105 flex items-center gap-1">
                                  ✓ {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Deficit Skills */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                          <h4 className="text-sm font-extrabold text-amber-700 mb-4 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                            Missing Target Credentials ({gap.missing_skills.length})
                          </h4>
                          {gap.missing_skills.length === 0 ? (
                            <p className="text-xs text-emerald-600 font-extrabold py-4 text-center border border-dashed border-emerald-100 rounded-xl">Congratulations! You possess 100% of the critical skills required.</p>
                          ) : (
                            <div className="space-y-2.5">
                              {gap.missing_skills.map((s, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3.5 bg-amber-50/50 rounded-xl border border-amber-100/50 hover:bg-amber-50 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold text-gray-800">{s.skill}</span>
                                    <span className="text-[9px] px-2 py-0.5 font-bold bg-white text-slate-500 rounded-full border border-slate-200/50">{s.category}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-semibold text-green-600">{s.growth} rise</span>
                                    <span className="text-xs font-extrabold text-amber-800">{s.demand}% index</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default MarketTrends

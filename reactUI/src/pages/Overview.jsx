import { Target, Award, FolderKanban, TrendingUp, Clock, Users, Star } from 'lucide-react'

const courses = [
  {
    id: 1,
    title: 'Advanced React Patterns',
    provider: 'Frontend Masters',
    rating: 4.8,
    students: '12.5k',
    duration: '8 hours',
    level: 'Advanced',
    image: 'bg-blue-500'
  },
  {
    id: 2,
    title: 'Full Stack Development',
    provider: 'Udemy',
    rating: 4.9,
    students: '25k',
    duration: '42 hours',
    level: 'Beginner',
    image: 'bg-purple-500'
  },
  {
    id: 3,
    title: 'Machine Learning Basics',
    provider: 'Coursera',
    rating: 4.7,
    students: '18k',
    duration: '24 hours',
    level: 'Intermediate',
    image: 'bg-green-500'
  },
  {
    id: 4,
    title: 'AWS Cloud Practitioner',
    provider: 'A Cloud Guru',
    rating: 4.6,
    students: '35k',
    duration: '16 hours',
    level: 'Beginner',
    image: 'bg-orange-500'
  },
  {
    id: 5,
    title: 'System Design Interview',
    provider: 'Educative',
    rating: 4.9,
    students: '8k',
    duration: '20 hours',
    level: 'Advanced',
    image: 'bg-red-500'
  },
  {
    id: 6,
    title: 'Docker & Kubernetes',
    provider: 'Pluralsight',
    rating: 4.8,
    students: '15k',
    duration: '12 hours',
    level: 'Intermediate',
    image: 'bg-cyan-500'
  },
  {
    id: 7,
    title: 'GraphQL Fundamentals',
    provider: 'Apollo',
    rating: 4.7,
    students: '9k',
    duration: '6 hours',
    level: 'Beginner',
    image: 'bg-pink-500'
  },
  {
    id: 8,
    title: 'Next.js Mastery',
    provider: 'Vercel',
    rating: 4.9,
    students: '22k',
    duration: '18 hours',
    level: 'Advanced',
    image: 'bg-gray-700'
  },
  {
    id: 9,
    title: 'TypeScript Deep Dive',
    provider: 'Frontend Masters',
    rating: 4.8,
    students: '11k',
    duration: '10 hours',
    level: 'Intermediate',
    image: 'bg-indigo-500'
  }
]

const Overview = () => {
  const stats = [
    { icon: Target, label: 'Total Skills', value: '6', color: 'bg-blue-100 text-blue-600' },
    { icon: Award, label: 'Certifications', value: '2', color: 'bg-purple-100 text-purple-600' },
    { icon: FolderKanban, label: 'Projects Completed', value: '1', color: 'bg-green-100 text-green-600' },
    { icon: TrendingUp, label: 'Avg. Skill Level', value: '75%', color: 'bg-orange-100 text-orange-600' },
  ]

  const handleEnroll = (course) => {
    alert(`Enrolled in "${course.title}" successfully!`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600 mt-1">Get a quick snapshot of your skill development journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Popular Courses</h3>
          <p className="text-sm text-gray-500">Trending courses to boost your skills</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className={`h-24 ${course.image} flex items-center justify-center`}>
                <span className="text-white font-bold text-lg">{course.title[0]}</span>
              </div>
              <div className="p-4">
                <h4 className="font-medium text-gray-900 line-clamp-1">{course.title}</h4>
                <p className="text-sm text-gray-500">{course.provider}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-500" />
                    {course.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {course.students}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {course.duration}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs px-2 py-1 bg-gray-200 rounded-full">{course.level}</span>
                  <button 
                    onClick={() => handleEnroll(course)}
                    className="text-sm px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Enroll
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Overview

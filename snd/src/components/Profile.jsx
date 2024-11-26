import { Star, Github, Mail, Edit, ChevronRight, Pen } from 'lucide-react'
import kabib from '../assets/Images/kabib.png'
import { useState } from 'react'
import EditProfileModal from './EditProfileModal'
export default function ProfilePage() {

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const skills = ['python', 'django', 'postgresql', 'React']
  const messages = [
    {
      user: 'Mohammed',
      date: 'Nov 9, 2023 at 15:50',
      message: 'I want to study some basics of Python',
      details: 'I am a UI developer and very new to python is there any one to teach me python basics ?',
      tags: ['python', 'basics', 'class']
    },
    {
      user: 'Mohammed',
      date: 'Nov 9, 2023 at 15:50',
      message: 'I want to study some basics of Python',
      details: 'I am a UI developer and very new to python is there any one to teach me python basics ?',
      tags: ['python', 'basics', 'class']
    },
    {
      user: 'Mohammed',
      date: 'Nov 9, 2023 at 15:50',
      message: 'I want to study some basics of Python',
      details: 'I am a UI developer and very new to python is there any one to teach me python basics ?',
      tags: ['python', 'basics', 'class']
    }
  ]

  return (
    <div className="min-h-screen bg-[#0A0B1A] text-white">
      {/* Sidebar */}
      <nav className="fixed left-0 top-0 h-full w-48 border-r border-gray-800 bg-[#0D0E21] p-4">
        <div className="mb-8 text-xl font-bold">
          <span className="font-mono">&lt;/&gt;</span>Snd
        </div>
        <div className="space-y-2">
          {['Home', 'Discover', 'Account', 'Tags', 'Users', 'Messages', 'Requests'].map((item) => (
            <button
              key={item}
              className="w-full rounded-lg px-3 py-2 text-left text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              {item}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="ml-48">
        {/* Banner */}
        <div className="relative h-48 bg-gradient-to-r from-yellow-400 to-blue-600">
          <img
            src="/placeholder.svg?height=192&width=1024"
            alt="Profile banner"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Profile Section */}
        <div className="relative px-8 pb-8">
          {/* Profile Picture */}
          <div className="absolute top-[-12rem] flex items-end">
            <div className="relative">
              <img
                src={kabib}
                alt="Profile picture"
                className="h-[11rem] w-[11rem] rounded-lg border-4 border-[#0A0B1A] object-cover"
              />
              <button className="absolute right-2 top-2 rounded-full bg-gray-900/50 p-1 hover:bg-gray-900">
                <Edit className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="mt-20">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Cristiano Ronaldo</h1>
              <h6 className="h-4 absolute right-[3rem] flex items-center">
                    <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center hover:text-[#4D7EF2]"
                    >
                    <Pen className="mr-1" /> Edit
                    </button>
                </h6>

              <span className="text-sm text-gray-400">@cristiano</span>

              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-4">
              <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white">
                <Github className="h-5 w-5" />
                <span>MohammedAshajile</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white">
                <Mail className="h-5 w-5" />
                <span>cristiano@cr7.com</span>
              </a>
            </div>

            {/* About */}
            <div className="mt-8">
              <h2 className="mb-4 text-xl font-semibold">About</h2>
              <p className="text-gray-300">
                I am a person who loves being creative in my work bearing in mind the required outcome. I am skilled in
                both python and django. This programming language and django framework allows me for flexibility of
                completion of task. Python is very interesting and i intend to do wonders with it. Having backend
                knowledge is not my only executing skill but also a front end knowledge, like HTML and CSS. Am open to
                current technologies and thinking of ways to make it better.
              </p>
            </div>

            {/* Skills */}
            <div className="mt-8">
              <h2 className="mb-4 text-xl font-semibold">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-gray-800 px-4 py-1 text-sm text-gray-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Connect Requests */}
            <div className="mt-8">
              <h2 className="mb-4 text-xl font-semibold">Connect requests</h2>
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className="rounded-lg bg-gray-800/50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-700"></div>
                        <span className="font-medium">{msg.user}</span>
                      </div>
                      <span className="text-sm text-gray-400">{msg.date}</span>
                    </div>
                    <div className="mt-4">
                      <p className="font-medium">{msg.message}</p>
                      <p className="mt-2 text-sm text-gray-400">{msg.details}</p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {msg.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-gray-700 px-3 py-1 text-xs text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <div className="min-h-screen bg-[#0A0B1A] text-white">
      {/* Your existing JSX */}
      
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={{
          username: "Cristiano Ronaldo",
          email: "cristiano@cr7.com",
          githubId: "MohammedAshajile",
          about: "I am a person who loves being creative...",
          skills: skills,
        }}
      />
    </div>
    </div>
  )
}
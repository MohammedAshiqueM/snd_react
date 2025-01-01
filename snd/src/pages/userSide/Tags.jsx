'use client'

import { Copy } from 'lucide-react'

const languages = [
  {
    title: "Javascript",
    description: "For questions about programming in ECMAScript (JavaScript/JS) and its different dialects/implementations (except for ActionScript). Note..."
  },
  {
    title: "Python",
    description: "For questions about programming in ECMAScript (JavaScript/JS) and its different dialects/implementations (except for ActionScript). Note..."
  },
  {
    title: "Java",
    description: "For questions about programming in ECMAScript (JavaScript/JS) and its different dialects/implementations (except for ActionScript). Note..."
  },
  {
    title: "C#",
    description: "For questions about programming in ECMAScript (JavaScript/JS) and its different dialects/implementations (except for ActionScript). Note..."
  }
]

export default function Tags() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-xl font-mono">{'</>'} Snd</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="search"
                placeholder="Search"
                className="bg-gray-800 rounded-md px-4 py-2 pl-10 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
            <button className="bg-gray-800 px-3 py-1 rounded-md">Ctrl + K</button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 h-[calc(100vh-64px)] p-4 border-r border-gray-800">
          <nav className="space-y-2">
            {['Dashboard', 'Users', 'Reports', 'Tags', 'Posts', 'Questions'].map((item) => (
              <a
                key={item}
                href="#"
                className="block px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">56 Questions</h2>
            <button className="bg-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
              Add Tag
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...languages, ...languages, ...languages].map((lang, index) => (
              <div
                key={index}
                className="bg-gray-800 p-4 rounded-lg relative group hover:ring-2 hover:ring-gray-700 transition-all"
              >
                <button className="absolute right-2 top-2 p-2 bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <Copy className="w-4 h-4" />
                </button>
                <h3 className="text-lg font-semibold mb-2">{lang.title}</h3>
                <p className="text-sm text-gray-400">{lang.description}</p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6 gap-2">
            <button className="p-2 rounded-md bg-gray-800 hover:bg-gray-700">
              {'<'}
            </button>
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                className={`p-2 rounded-md hover:bg-gray-700 min-w-[40px] ${
                  page === 1 ? 'bg-gray-700' : 'bg-gray-800'
                }`}
              >
                {page}
              </button>
            ))}
            <button className="p-2 rounded-md bg-gray-800 hover:bg-gray-700">
              {'>'}
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}


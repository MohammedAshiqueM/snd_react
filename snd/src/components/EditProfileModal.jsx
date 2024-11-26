import { useState } from 'react'
import { X } from 'lucide-react'

function EditProfileModal({ isOpen, onClose, userData }) {
  const [formData, setFormData] = useState({
    username: userData?.username || '',
    email: userData?.email || '',
    githubId: userData?.githubId || '',
    about: userData?.about || '',
    skills: userData?.skills?.join(', ') || '',
    profileImage: null,
    coverImage: null,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission (remainder for me later)
    onClose()
  }

  const handleFileChange = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        [type]: file
      }))
    }
  }

  return (
    isOpen && (
      <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
        <div className="bg-[#0D0E21] w-full sm:w-[600px] p-6 rounded-lg relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
          <h2 className="text-xl font-bold text-white mb-6">Edit Profile</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="profileImage" className="text-white">Profile Image</label>
                  <input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'profileImage')}
                    className="bg-[#1C1D2D] border-gray-800 text-white w-full p-2 rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="coverImage" className="text-white">Cover Image</label>
                  <input
                    id="coverImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'coverImage')}
                    className="bg-[#1C1D2D] border-gray-800 text-white w-full p-2 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="username" className="text-white">Username</label>
                <input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="bg-[#1C1D2D] border-gray-800 text-white w-full p-2 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="email" className="text-white">Email</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-[#1C1D2D] border-gray-800 text-white w-full p-2 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="githubId" className="text-white">GitHub ID</label>
                <input
                  id="githubId"
                  value={formData.githubId}
                  onChange={(e) => setFormData(prev => ({ ...prev, githubId: e.target.value }))}
                  className="bg-[#1C1D2D] border-gray-800 text-white w-full p-2 rounded-md"
                />
              </div>

              <div>
                <label htmlFor="about" className="text-white">About</label>
                <textarea
                  id="about"
                  value={formData.about}
                  onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
                  className="bg-[#1C1D2D] border-gray-800 text-white w-full p-2 rounded-md min-h-[100px]"
                />
              </div>

              <div>
                <label htmlFor="skills" className="text-white">Skills (comma-separated)</label>
                <input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                  className="bg-[#1C1D2D] border-gray-800 text-white w-full p-2 rounded-md"
                  placeholder="python, django, react..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="border-gray-800 text-white bg-transparent p-2 rounded-md hover:bg-[#1C1D2D] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#4D7EF2] text-white p-2 rounded-md hover:bg-[#3D6AD8]"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  )
}

export default EditProfileModal;

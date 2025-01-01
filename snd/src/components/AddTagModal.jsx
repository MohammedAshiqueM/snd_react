import React, { useState } from 'react';
import { X } from 'lucide-react';
import { addTag } from '../adminApi';
// import { addTag } from '../api';

export default function AddTagModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ title: '', body_content: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const { title, body_content } = formData;
    if (!title.trim()) {
      setErrors({ title: 'Tag name is required.' });
      return;
    }
    if (!body_content.trim() || body_content.length < 50) {
        setErrors({ body_content: 'Body content must be at least 50 characters long.' });
        return;
      }
    setLoading(true);
    try {
      const response = await addTag({ name: title, about: body_content });

      alert('Tag added successfully!');
      setFormData({ title: '', body_content: '' }); // Reset form
      onClose(); // Close modal
    } catch (error) {
      console.error('Error:', error);
      setErrors(error.response?.data || { message: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-[#0D0E21] w-full sm:w-[800px] p-6 rounded-lg relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold text-white mb-6">Add Tag</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.message && <div className="text-red-500 text-sm mb-4">{errors.message}</div>}
          <div>
            <label className="block text-white mb-2">Tag</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter Tag name"
              className="w-full p-2 rounded-md bg-[#1C1D2D] text-white"
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-white mb-2">Description</label>
            <textarea
              name="body_content"
              value={formData.body_content}
              onChange={handleChange}
              rows="6"
              placeholder="Write about the tag..."
              className="w-full p-2 rounded-md bg-[#1C1D2D] text-white resize-none"
            />
            {errors.body_content && <p className="text-red-500 text-sm">{errors.body_content}</p>}
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="border border-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-md bg-blue-500 text-white ${
                loading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-600'
              }`}
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { createQuestion, tagSuggestion } from '../api'; 

export default function QuestionCreationModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    body_content: '',
    tags: [],
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchTagSuggestions = async (query) => {
    if (query) {
      try {
        const response = await tagSuggestion(query);
        setTagSuggestions(response.data.tags);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    } else {
      setTagSuggestions([]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null })); 
  };

  const handleTagSelect = (tag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
    setTagSuggestions([]);
    setErrors((prev) => ({ ...prev, tags: null })); 
  };

  const handleTagChange = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      const newTag = e.target.value.trim();
      if (newTag && !selectedTags.includes(newTag)) {
        setSelectedTags((prevTags) => [...prevTags, newTag]);
        setFormData((prevData) => ({
          ...prevData,
          tags: [...prevData.tags, newTag],
        }));
        setErrors((prev) => ({ ...prev, tags: null })); 
      }
      e.target.value = ''; 
      setTagSuggestions([]);
    } else {
      fetchTagSuggestions(e.target.value);
    }
  };
  

  const removeTag = (tagToRemove) => {
    setSelectedTags((prevTags) => {
      const updatedTags = prevTags.filter((tag) => tag !== tagToRemove);
      setFormData((prev) => ({
        ...prev,
        tags: updatedTags,
      }));
      return updatedTags;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim() || formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters long.';
    }
    if (!formData.body_content.trim() || formData.body_content.length < 50) {
      newErrors.body_content = 'Body content must be at least 50 characters long.';
    }
    if (formData.tags.length === 0) {
      newErrors.tags = 'Please select a valid tag from the suggestions.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validateForm()) return;

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('body_content', formData.body_content);
    submitData.append('tags', JSON.stringify(formData.tags));
    if (formData.image) {
      submitData.append('image', formData.image);
    }

    setLoading(true);
    try {
      const response = await createQuestion(submitData);

      setFormData({ title: '', body_content: '', tags: [], image: null });
      setImagePreview(null);
      setSelectedTags([]);
      onClose();

      alert('Question created successfully!');
    } catch (error) {
      console.error('Error:', error);
      if (error.data) {
        setErrors(error.data); 
      } else {
        setErrors({ message: 'An unexpected error occurred.' });
      }
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
        <h2 className="text-xl font-bold text-white mb-6">Ask question</h2>

        <form 
         onSubmit={handleSubmit} 
         onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.type !== 'textarea') {
              e.preventDefault();
            }
          }}
         className="space-y-6">
          {errors.message && (
            <div className="text-red-500 text-sm mb-4">{errors.message}</div>
          )}

          {/* Blog Title */}
          <div>
            <label className="block text-white mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter blog title"
              className="w-full p-2 rounded-md bg-[#1C1D2D] text-white"
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          </div>

          {/* Blog Body */}
          <div>
            <label className="block text-white mb-2">Body Content</label>
            <textarea
              name="body_content"
              value={formData.body_content}
              onChange={handleChange}
              rows="6"
              placeholder="Write your blog content here..."
              className="w-full p-2 rounded-md bg-[#1C1D2D] text-white resize-none"
            />
            {errors.body_content && (
              <p className="text-red-500 text-sm">{errors.body_content}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-white mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-700 text-white px-2 py-1 rounded-full flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-red-300 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add tag (press Enter or , to add)"
              onKeyDown={handleTagChange}
              className="w-full p-2 rounded-md bg-[#1C1D2D] text-white"
            />
            {tagSuggestions.length > 0 && (
              <ul className="mt-2 bg-[#1C1D2D] p-2 rounded-md text-white">
                {tagSuggestions.map((tag) => (
                  <li
                    key={tag.id}
                    onClick={() => handleTagSelect(tag.name)}
                    className="cursor-pointer hover:bg-gray-600 p-1 rounded-md"
                  >
                    {tag.name}
                  </li>
                ))}
              </ul>
            )}
            {errors.tags && <p className="text-red-500 text-sm">{errors.tags}</p>}
          </div>

          {/* Submit Button */}
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
              {loading ? 'Posting...' : 'Post Blog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, Upload, Clock } from 'lucide-react';
import { createSession, tagSuggestion, updateRequest } from '../api';

export default function SessionRequestModal({ isOpen, onClose, initialData, mode = 'create', onSuccess}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    body_content: initialData?.body_content || '',
    tags: initialData?.tags?.map(t => t.tag.name) || [],
    duration_minutes: initialData?.duration_minutes || 30,
    preferred_time: initialData?.preferred_time ? 
      new Date(initialData.preferred_time).toISOString().slice(0, 16) : 
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    auto_publish: initialData ? initialData.status === 'PE' : false
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
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
      e.preventDefault();
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
      newErrors.body_content = 'Request content must be at least 50 characters long.';
    }
    if (formData.tags.length === 0) {
      newErrors.tags = 'Please select at least one tag.';
    }
    if (formData.duration_minutes < 5 || formData.duration_minutes > 180) {
      newErrors.duration_minutes = 'Duration must be between 5 and 180 minutes.';
    }
    
    const selectedTime = new Date(formData.preferred_time);
    const minTime = new Date();
    minTime.setHours(minTime.getHours() + 1);
    if (selectedTime < minTime) {
      newErrors.preferred_time = 'Preferred time must be at least 1 hour in the future.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validateForm()) return;

    const submitData = new FormData();

    const newStatus = formData.auto_publish ? 'PE' : 'DR';
    submitData.append('status', newStatus);

    Object.keys(formData).forEach(key => {
      if (key === 'tags') {
        submitData.append(key, JSON.stringify(formData[key]));
      } else {
        submitData.append(key, formData[key]);
      }
    });

    setLoading(true);
    try {
        let response;
        if (mode === 'edit') {
        response = await updateRequest(initialData.id, submitData);
        } else {
        response = await createSession(submitData);
        }
      
      if (onSuccess) {
        onSuccess(response);
      }
      
      setFormData({
        title: '',
        body_content: '',
        tags: [],
        duration_minutes: 30,
        preferred_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        auto_publish: false
      });
      setSelectedTags([]);
      onClose();

      alert(formData.auto_publish ? 'Request published successfully!' : 'Request saved as draft!');
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
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
        <h2 className="text-xl font-bold text-white mb-6">New Skill Request</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.message && (
            <div className="text-red-500 text-sm mb-4">{errors.message}</div>
          )}

          {/* Title */}
          <div>
            <label className="block text-white mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter request title"
              className="w-full p-2 rounded-md bg-[#1C1D2D] text-white"
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          </div>

          {/* Content */}
          <div>
            <label className="block text-white mb-2">Request Details</label>
            <textarea
              name="body_content"
              value={formData.body_content}
              onChange={handleChange}
              rows="6"
              placeholder="Describe what you'd like to learn..."
              className="w-full p-2 rounded-md bg-[#1C1D2D] text-white resize-none"
            />
            {errors.body_content && (
              <p className="text-red-500 text-sm">{errors.body_content}</p>
            )}
          </div>

          {/* Duration and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleChange}
                min="5"
                max="180"
                className="w-full p-2 rounded-md bg-[#1C1D2D] text-white"
              />
              {errors.duration_minutes && (
                <p className="text-red-500 text-sm">{errors.duration_minutes}</p>
              )}
            </div>
            <div>
              <label className="block text-white mb-2">
                Preferred Time
              </label>
              <input
                type="datetime-local"
                name="preferred_time"
                value={formData.preferred_time}
                onChange={handleChange}
                className="w-full p-2 rounded-md bg-[#1C1D2D] text-white"
              />
              {errors.preferred_time && (
                <p className="text-red-500 text-sm">{errors.preferred_time}</p>
              )}
            </div>
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
              placeholder="Add tags (press Enter or , to add)"
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

          {/* Auto-publish Option */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="auto_publish"
              id="auto_publish"
              checked={formData.auto_publish}
              onChange={handleChange}
              className="rounded bg-[#1C1D2D] text-blue-500"
            />
            <label htmlFor="auto_publish" className="text-white">
              Publish immediately (time will be reserved)
            </label>
          </div>

          {/* Submit Buttons */}
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
              {loading ? 'Saving...' : formData.auto_publish ? 'Publish Request' : 'Save as Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
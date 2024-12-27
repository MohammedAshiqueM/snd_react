import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { createQuestion, reportUser, tagSuggestion } from '../api'; 

export default function ReportModal({ isOpen, onClose, userData }) {
  const { pk } = useParams();

  const [formData, setFormData] = useState({
    first_name: userData?.first_name || '',
    last_name: userData?.last_name || '',
    username: userData?.username || '',
    email: userData?.email || '',
    body_content: '',
    tags: [],
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null })); 
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.body_content.trim() || formData.body_content.length < 50) {
      newErrors.body_content = 'Report content must be at least 50 characters long.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validateForm()) return;

    const submitData = new FormData();
    submitData.append('note', formData.body_content);

    setLoading(true);
    try {
      const response = await reportUser(pk,submitData);

      setFormData({ body_content: ''});
      onClose();

      alert('Report is posted successfully!');
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
        <h2 className="text-xl font-bold text-white mb-6">Report {formData.first_name?formData.first_name:formData.username}</h2>

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

          {/* Reason */}
          <div>
            <label className="block text-white mb-2">Reason</label>
            <textarea
              name="body_content"
              value={formData.body_content}
              onChange={handleChange}
              rows="6"
              placeholder="Write your reason for this report..."
              className="w-full p-2 rounded-md bg-[#1C1D2D] text-white resize-none"
            />
            {errors.body_content && (
              <p className="text-red-500 text-sm">{errors.body_content}</p>
            )}
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
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

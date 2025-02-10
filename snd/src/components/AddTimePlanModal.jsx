import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { addPlans, updatePlan } from '../adminApi';

export default function AddTimePlanModal({ isOpen, onClose, plan, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    minutes: '',
    price: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        minutes: plan.minutes,
        price: plan.price,
        description: plan.description || ''
      });
    } else {
      setFormData({
        name: '',
        minutes: '',
        price: '',
        description: ''
      });
    }
  }, [plan]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const { name, minutes, price, description } = formData;
    const validationErrors = {};
    
    if (!name.trim()) validationErrors.name = 'Name is required.';
    if (!minutes || minutes < 1) validationErrors.minutes = 'Minutes must be at least 1.';
    if (!price || price < 1) validationErrors.price = 'Price must be at least 1.';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      
      const response = await plan ? updatePlan(plan.id,formData) : addPlans(formData);

    //   if (!response.ok) {
    //     throw new Error('Failed to save time plan');
    //   }

      alert(`Time plan ${plan ? 'updated' : 'added'} successfully!`);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      setErrors({ message: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-[#0D0E21] w-full sm:w-[600px] p-6 rounded-lg relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold text-white mb-6">
          {plan ? 'Edit Time Plan' : 'Add Time Plan'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.message && (
            <div className="text-red-500 text-sm mb-4">{errors.message}</div>
          )}
          
          <div>
            <label className="block text-white mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-[#1C1D2D] text-white"
              placeholder="Enter plan name"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-white mb-2">Minutes</label>
            <input
              type="number"
              name="minutes"
              value={formData.minutes}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-[#1C1D2D] text-white"
              min="1"
              placeholder="Enter minutes"
            />
            {errors.minutes && <p className="text-red-500 text-sm">{errors.minutes}</p>}
          </div>

          <div>
            <label className="block text-white mb-2">Price (₹)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-[#1C1D2D] text-white"
              min="1"
              step="0.01"
              placeholder="Enter price"
            />
            {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-white mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full p-2 rounded-md bg-[#1C1D2D] text-white resize-none"
              placeholder="Enter description (optional)"
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
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
              {loading ? 'Saving...' : plan ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { Star } from "lucide-react";
import { ratingUser } from "../wsApi";

const RatingModal = ({ teacherId, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    const data = {
        teacher_id: teacherId,
        rating: rating,
      }
    try {
        console.log(data)
      const response = ratingUser(data);

      setSuccess(true);
      setTimeout(() => {
        onSubmit();
        onClose();
      }, 1500);
    } catch (err) {
      setError("Failed to submit rating. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-center text-white">Rate Your Session</h2>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-red-500/20 text-red-500 border border-red-500/50 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-4 bg-green-500/20 text-green-500 border border-green-500/50 p-3 rounded-md text-sm">
            Thank you for your rating!
          </div>
        )}

        {/* Star Rating */}
        <div className="flex justify-center space-x-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className="focus:outline-none"
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className="w-8 h-8 transition-all"
                fill={star <= (hover || rating) ? "gold" : "transparent"}
                color={star <= (hover || rating) ? "gold" : "gray"}
              />
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-all"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all disabled:opacity-50"
            disabled={success}
          >
            Submit Rating
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { createPropose } from "../wsApi";

const ScheduleProposal = ({ isOpen, onClose, requestId, onScheduleProposed }) => {
  const [scheduleData, setScheduleData] = useState({
    scheduled_time: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    note: "",
    request: null,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update scheduleData when requestId changes
  useEffect(() => {
    console.log("RequestId received:", requestId);
    setScheduleData(prev => ({
      ...prev,
      request: requestId
    }));
  }, [requestId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
  
    console.log("Current scheduleData:", scheduleData); // Debug log
  
    // Validate requestId
    if (!requestId) {
      setError("Missing request ID");
      setIsSubmitting(false);
      return;
    }
  
    // Explicitly construct the data to be sent
    const formattedData = {
      scheduled_time: new Date(scheduleData.scheduled_time).toISOString(),
      timezone: scheduleData.timezone,
      note: scheduleData.note,
      request: requestId, // Use the requestId prop directly
    };
  
    console.log("Sending data to backend:", formattedData); // Debug log
  
    try {
      const data = await createPropose(formattedData); // Expecting JSON directly
  
      console.log("Success response:", data); // Debug log
      alert("Schedule proposed successfully! ✅");
      
      onScheduleProposed(data);
      onClose();
    } catch (err) {
      console.error("Error in submission:", err); // Debug log
      setError(err.message || "Failed to propose schedule");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScheduleData(prev => ({
      ...prev,
      [name]: value,
      request: requestId  // Maintain the requestId
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#1A1B2E] border border-gray-700 text-gray-200 rounded-lg shadow-lg w-full max-w-lg">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-blue-400">Propose Schedule</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">
              Schedule Time
            </label>
            <input
              type="datetime-local"
              name="scheduled_time"
              className="w-full p-2 rounded bg-[#131427] border border-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={scheduleData.scheduled_time}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">
              Note
            </label>
            <textarea
              name="note"
              className="w-full p-2 rounded bg-[#131427] border border-gray-700 text-gray-200 h-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={scheduleData.note}
              onChange={handleInputChange}
              placeholder="Add any additional information..."
            />
          </div>

          {error && <div className="text-red-400 text-sm">{error}</div>}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-gray-400 hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Proposing..." : "Propose Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleProposal;
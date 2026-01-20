import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Calendar, ArrowLeft, Send } from "lucide-react";
import axios from "axios";
import { BASE_URL } from "../lib/lib";

const ApplyLeave = () => {
  const { userData, isloading } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  

  const [leaveDate, setLeaveDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  useEffect( () => {
    if(userData?.employee?.role === "owner" && !isloading){
      navigate('/dashboard')
    }

  })

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!leaveDate) {
      setMessage({ type: "error", text: "Please select a leave date" });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await axios.post(
        `${BASE_URL}api/attendance/apply`,
        { leave_date: leaveDate },
        { withCredentials: true }
      );

      setMessage({ type: "success", text: res.data.message || "Leave applied successfully" });
      setLeaveDate("");
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to apply leave",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen border-gray-200 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm sm:text-base">Back to Dashboard</span>
          </button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            Apply for Leave
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Request a day off from work
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Employee Info Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-bold text-blue-600">
                  {userData?.employee?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="text-white">
                <h2 className="text-lg sm:text-xl font-semibold">
                  {userData?.employee?.name || "Employee"}
                </h2>
                <p className="text-xs sm:text-sm text-blue-100">
                  ID: {userData?.employee?.id || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Input */}
              <div>
                <label
                  htmlFor="leave_date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>Select Leave Date</span>
                  </div>
                </label>
                <input
                  type="date"
                  id="leave_date"
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  min={today}
                  className="w-full px-4 py-3 border border-gray-300 outline-none rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                  disabled={isSubmitting}
                />
                <p className="mt-2 text-xs sm:text-sm text-gray-500">
                  You can only apply for future dates
                </p>
              </div>

              {/* Message Display */}
              {message.text && (
                <div
                  className={`p-4 rounded-lg ${
                    message.type === "success"
                      ? "bg-green-50 border border-green-200 text-green-800"
                      : "bg-red-50 border border-red-200 text-red-800"
                  }`}
                >
                  <p className="text-sm sm:text-base font-medium flex items-center gap-2">
                    {message.type === "success" ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-600">✕</span>
                    )}
                    {message.text}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !leaveDate}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Submit Leave Request</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Info Section */}
          <div className="bg-gray-50 p-4 sm:p-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Important Notes:
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Leave requests are subject to approval by HR</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>You can only apply for future dates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Check your leave balance before applying</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;
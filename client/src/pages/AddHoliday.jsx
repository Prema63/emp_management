import React, { useState, useEffect } from 'react';
import { Calendar, Plus, X } from 'lucide-react';
import { BASE_URL } from '../lib/lib';
import { toast } from 'react-toastify';

const HolidayManagement = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [holidayName, setHolidayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}api/holidays/`);
      const data = await response.json();
      setHolidays(data.holidays || []);
    } catch (err) {
      console.error('Error fetching holidays:', err);
      setError('Failed to fetch holidays');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHoliday = async () => {
    setError('');
    setSuccess('');

    if (!selectedDate || !holidayName.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}api/holidays/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          holiday_date: selectedDate,
          holiday_name: holidayName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add holiday');
      }

      setSuccess('Holiday added successfully!');
      // toast.success("Holiday added succesfully")
      setSelectedDate('');
      setHolidayName('');
      fetchHolidays();
      
      setTimeout(() => {
        setShowAddModal(false);
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const groupHolidaysByMonth = () => {
    const grouped = {};
    holidays.forEach(holiday => {
      const date = new Date(holiday.holiday_date);
      const monthYear = date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(holiday);
    });
    return grouped;
  };

  const groupedHolidays = groupHolidaysByMonth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-slate-600 text-lg">Loading holidays...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Calendar className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Holiday Management</h1>
                <p className="text-slate-500 mt-1">Manage company holidays and events</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 
                text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
            >
              <Plus size={20} />
              Add Holiday
            </button>
          </div>
        </div>

        {/* Holidays List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">All Holidays</h2>
          
          {holidays.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto text-slate-300 mb-4" size={64} />
              <p className="text-slate-500 text-lg">No holidays added yet</p>
              <p className="text-slate-400 mt-2">Click "Add Holiday" to get started</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedHolidays).map(([monthYear, monthHolidays]) => (
                <div key={monthYear}>
                  <h3 className="text-lg font-semibold text-slate-700 mb-3 px-2">
                    {monthYear}
                  </h3>
                  <div className="space-y-2">
                    {monthHolidays.map((holiday, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-amber-50 
                          border-l-4 border-yellow-400 rounded-lg hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center justify-center bg-white rounded-lg p-3 shadow-sm min-w-16">
                            <span className="text-2xl font-bold text-yellow-600">
                              {new Date(holiday.holiday_date).getDate()}
                            </span>
                            <span className="text-xs text-slate-500 uppercase">
                              {new Date(holiday.holiday_date).toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800 text-lg">
                              {holiday.holiday_name}
                            </h4>
                            <p className="text-slate-500 text-sm">
                              {formatDate(holiday.holiday_date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Holiday Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Add New Holiday</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-slate-500" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Holiday Name
                  </label>
                  <input
                    type="text"
                    value={holidayName}
                    onChange={(e) => setHolidayName(e.target.value)}
                    placeholder="e.g., Christmas Day"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 
                      focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Holiday Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 
                      focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    {success}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setError('');
                      setSuccess('');
                    }}
                    className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-xl 
                      hover:bg-slate-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddHoliday}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                      rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-medium"
                  >
                    Add Holiday
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HolidayManagement;
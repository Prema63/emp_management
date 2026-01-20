import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BASE_URL } from "../lib/lib";
import { toast } from "react-toastify";
import axios from "axios";

const AttendanceCalendar = () => {
  const { userData, isloading } = useSelector((state) => state.auth);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [hoveredDate, setHoveredDate] = useState(null);

  useEffect(() => {
    fetchData();
  }, [isloading]);

  const fetchData = async () => {
    try {
      const empId = userData?.employee?.id;

      const [attendanceRes, holidaysRes] = await Promise.all([
        axios.get(`${BASE_URL}api/attendance/employee/${empId}`, {
          withCredentials: true,
        }),
        axios.get(`${BASE_URL}api/holidays/`, { withCredentials: true }),
      ]);

      const attendanceJson = attendanceRes.data;
      const holidaysJson = holidaysRes.data;

      setAttendanceData(attendanceJson.leaves || []);
      setHolidays(holidaysJson.holidays || []);

      console.log(attendanceData);
    } catch (error) {
      toast.error("Failed to fetch data");
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const getDateInfo = (dateStr) => {
    const attendance = attendanceData.find(
      (a) => a.attendance_date?.split("T")[0] === dateStr,
    );
    const holiday = holidays.find(
      (h) => h.holiday_date?.split("T")[0] === dateStr,
    );

    return { attendance, holiday };
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const { daysInMonth, startingDayOfWeek, year, month } =
    getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-2xl font-semibold">{monthName}</h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
          >
            Today
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {/* Week Days */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-slate-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="aspect-square" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const dateStr = formatDate(year, month, day);
              const { attendance, holiday } = getDateInfo(dateStr);
              const today = isToday(day);

              let bgColor = "bg-white hover:bg-slate-50";
              let textColor = "text-slate-700";
              let borderColor = "border-slate-200";

              if (today) {
                borderColor = "border-blue-500";
              }

              if (attendance?.is_absent) {
                bgColor = "bg-red-50 hover:bg-red-100";
                textColor = "text-red-700";
                borderColor = "border-red-300";
              } else if (holiday) {
                bgColor = "bg-yellow-50 hover:bg-yellow-100";
                textColor = "text-yellow-800";
                borderColor = "border-yellow-300";
              }

              return (
                <div
                  key={day}
                  className="relative aspect-square"
                  onMouseEnter={() => setHoveredDate(dateStr)}
                  onMouseLeave={() => setHoveredDate(null)}
                >
                  <div
                    className={`h-full w-full rounded-lg border-2 ${borderColor} ${bgColor} 
                      flex items-center justify-center font-medium ${textColor} 
                      transition-all duration-200 cursor-pointer transform hover:scale-105`}
                  >
                    {day}
                  </div>

                  {/* Tooltip */}
                  {hoveredDate === dateStr &&
                    (attendance?.is_absent || holiday) && (
                      <div
                        className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                      px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap"
                      >
                        {attendance?.is_absent && (
                          <div className="font-medium">
                            {attendance.is_approved
                              ? " Approved "
                              : " Not Approved "}
                          </div>
                        )}
                        {holiday && (
                          <div className="font-medium">
                            {holiday.holiday_name}
                          </div>
                        )}
                        <div
                          className="absolute top-full left-1/2 transform -translate-x-1/2 
                        border-4 border-transparent border-t-slate-800"
                        />
                      </div>
                    )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-slate-200 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-300" />
              <span className="text-slate-600">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-300" />
              <span className="text-slate-600">Holiday</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white border-2 border-blue-500" />
              <span className="text-slate-600">Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;

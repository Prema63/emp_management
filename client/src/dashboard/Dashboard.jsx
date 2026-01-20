import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Clock,
  HandCoins,
  CalendarClock,
  CalendarCheck2,
  UserRoundCheck,
  UserRoundPlus,
  CalendarDays,
  User,
  Building2,
  CalendarPlus,
  Mail,
  Phone,
  Briefcase,
} from "lucide-react";
import { useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet, useLocation } from "react-router-dom";


const EmployeeDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { userData, isloading } = useSelector((state) => state.auth);
  const [currentUser, setCurrentUser] = useState({
    name: "",
    role: "",
    avatar: "",
  });
  const location = useLocation();

  useEffect(() => {
    if (!isloading && userData?.employee) {
      setCurrentUser({
        name: userData.employee.name,
        role: userData.employee.role,
        avatar: "",
      });
    }
  }, [isloading, userData]);


  const role = currentUser.role?.toLowerCase(); // "owner" | "hr" | "manager" | "employee"

const navItems = [
  // Dashboard → show to ALL
  { 
    label: "Dashboard", 
    icon: LayoutDashboard, 
    path: "/", 
    show: true 
  },

  // Employee Management → HR + Owner
  { 
    label: "Employee Management", 
    icon: Users, 
    path: "employees",
    show: role === "hr" || role === "owner"
  },

  // Add New Joiner → HR + Owner
  { 
    label: "Add New Joiner", 
    icon: UserRoundPlus, 
    path: "add-new-joiner",
    show: role === "hr" || role === "owner"
  },

  // Assign Manager → HR + Owner
  { 
    label: "Assign Manager", 
    icon: UserRoundCheck, 
    path: "assign-manager",
    show: role === "hr" || role === "owner"
  },

  // Attendance → HR + Owner
  { 
    label: "Attendance", 
    icon: Clock, 
    path: "attendance",
    show: role === "hr" 
  },

  // Salary Slip → show all EXCEPT owner
  { 
    label: "Salary Slip", 
    icon: HandCoins, 
    path: "salary-slip",
    show: role !== "owner"
  },

  // View Calendar → show ALL roles
  { 
    label: "View Calendar", 
    icon: CalendarDays, 
    path: "callender",
    show: role !== "owner"
  },

  // Add Holidays → HR + Owner
  { 
    label: "Add Holidays", 
    icon: CalendarPlus, 
    path: "add-holiday",
    show: role === "hr" || role === "owner"
  },

  // Apply Leave → show all EXCEPT owner
  { 
    label: "Apply Leave", 
    icon: CalendarClock, 
    path: "apply-leave",
    show: role !== "owner"
  },

  // Approve Leave → show everyone EXCEPT employee
  { 
    label: "Approve Leave", 
    icon: CalendarCheck2, 
    path: "approve-leave",
    show: role !== "employee"
  },
];



  if (isloading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const { employee, manager, subordinates } = userData;
  const isOwner = employee?.role?.toLowerCase() === "owner";
  
  const isDashboardHome = location.pathname.endsWith('/dashboard') || location.pathname.endsWith('/dashboard/');

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar
        setSidebarOpen={setSidebarOpen}
        userDropdownOpen={userDropdownOpen}
        setUserDropdownOpen={setUserDropdownOpen}
        currentUser={currentUser}
      />

      {/* navbar content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          navItems={navItems.filter(item => item.show)}
        />
        
        {/* Main Area */}
        <div className="flex-1 p-6 overflow-auto">
          {isDashboardHome ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Welcome back, {employee?.name || "User"}!
                </h1>
                <p className="text-gray-600">
                  {isOwner
                    ? "Company Owner Dashboard"
                    : `Role: ${employee?.role || "N/A"}`}
                </p>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm mb-1">Your Role</p>
                      <p className="text-2xl font-bold">{employee?.role || "N/A"}</p>
                    </div>
                    <Briefcase className="w-10 h-10 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm mb-1">Manager</p>
                      <p className="text-2xl font-bold">
                        {manager ? "Assigned" : "None"}
                      </p>
                    </div>
                    <User className="w-10 h-10 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm mb-1">Team Size</p>
                      <p className="text-2xl font-bold">
                        {subordinates?.length || 0}
                      </p>
                    </div>
                    <Users className="w-10 h-10 text-purple-200" />
                  </div>
                </div>
              </div>

              {/* Employee details */}
              {!isOwner && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <User className="w-5 h-5 text-blue-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      Your Information
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-gray-800">{employee?.email || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Contact</p>
                        <p className="text-gray-800">
                          {employee?.contact_number || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Employee ID</p>
                        <p className="text-gray-800">{employee?.id || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Role</p>
                        <p className="text-gray-800">{employee?.role || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Manager Card */}
              {manager && !isOwner && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <User className="w-5 h-5 text-green-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      Your Manager
                    </h2>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {manager.name}
                        </h3>
                        <p className="text-sm text-gray-600">{manager.role}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{manager.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {manager.contact_number}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subordinates card */}
              {subordinates && subordinates.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <Users className="w-5 h-5 text-purple-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      {isOwner ? "All Employees" : "Your Team Members"}
                    </h2>
                    <span className="ml-auto bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                      {subordinates.length}{" "}
                      {subordinates.length === 1 ? "member" : "members"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subordinates.map((subordinate) => (
                      <div
                        key={subordinate.id}
                        className="bg-purple-50 rounded-lg p-4 border border-purple-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-gray-800 mb-1">
                              {subordinate.name}
                            </h3>
                            <p className="text-sm text-purple-700 font-medium mb-2">
                              {subordinate.role}
                            </p>
                          </div>
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-3 h-3 text-gray-500 flex-shrink-0" />
                            <span className="text-xs text-gray-700 truncate">
                              {subordinate.email}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-3 h-3 text-gray-500 flex-shrink-0" />
                            <span className="text-xs text-gray-700">
                              {subordinate.contact_number}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Briefcase className="w-3 h-3 text-gray-500 flex-shrink-0" />
                            <span className="text-xs text-gray-700">
                              ID: {subordinate.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Subordinates */}
              {(!subordinates || subordinates.length === 0) && !isOwner && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Users className="w-5 h-5 text-gray-400 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      Your Team Members
                    </h2>
                  </div>
                  <p className="text-gray-500 text-center py-8">
                    You don't have any team members reporting to you yet.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
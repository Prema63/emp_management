import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { BASE_URL } from "../lib/lib";
import axios from "axios";
import { toast } from "react-toastify";

const AssignManager = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [availableManagers, setAvailableManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const currentUser = useSelector((state) => state.user?.userData);

  // hierarchy
  const roleHierarchy = {
    employee: "TL",
    TL: "HR",
    HR: "Manager",
    Manager: null,
  };

  
  useEffect(() => {
    fetchEmployees();
  }, []);

  //available managers
  useEffect(() => {
    if (selectedEmployee) {
      const employee = employees.find((emp) => emp.id === selectedEmployee);
      if (employee) {
        filterManagers(employee.role);
      }
    } else {
      setAvailableManagers([]);
      setSelectedManager("");
    }
  }, [selectedEmployee, employees]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}api/employees/getallEmptData`,
        { withCredentials: true },
      );

      setEmployees(response.data.employeeData ?? []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]); 
      toast.error(error.response?.data?.error || "Failed to fetch employees");
    }
  };

const filterManagers = (employeeRole) => {
  if (!employeeRole) return setAvailableManagers([]);

  const normalizedRole = employeeRole.trim().toLowerCase(); 
  const managerRoleKey = Object.keys(roleHierarchy).find(
    (key) => key.toLowerCase() === normalizedRole
  );

  const managerRole = managerRoleKey ? roleHierarchy[managerRoleKey] : null;

  if (!managerRole) {
    setAvailableManagers([]);
    return;
  }

  const filteredManagers = employees.filter(
    (emp) =>
      emp.role &&
      emp.role.trim().toLowerCase() === managerRole.toLowerCase() &&
      emp.id !== selectedEmployee
  );

  setAvailableManagers(filteredManagers);
};



  const handleAssignManager = async () => {
    if (!selectedEmployee || !selectedManager) {
      toast.error("Please select both employee and manager");
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.patch(`${BASE_URL}api/employees/assign`, {
        empId: selectedEmployee,
        managerId: selectedManager,
      });

      const data = response.data;

     toast.success(data.message || "Manager assigned successfully");

      setSelectedEmployee("");
      setSelectedManager("");
      fetchEmployees();
    } catch (error) {
      console.error("Error assigning manager:", error);

      toast.error(error.response?.data?.error || "An error occurred while assigning manager" );
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeInfo = (empId) => {
    const emp = employees.find((e) => e.id === empId);
    return emp ? `${emp.name} (${emp.role})` : "";
  };

  const getManagerRoleText = (employeeRole) => {
    const managerRole = roleHierarchy[employeeRole];
    return managerRole || "No manager needed";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Assign Manager
          </h2>

          {/* Info Box */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Hierarchy:</span> Employee → TL →
              HR → Manager
            </p>
          </div>

          <div className="space-y-6">
            {/* Select Employee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Employee
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 outline-none rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                disabled={loading}
              >
                <option value="">Choose an employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} - {emp.role} ({emp.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Employee Role*/}
            {selectedEmployee && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Selected:</span>{" "}
                  {getEmployeeInfo(selectedEmployee)}
                </p>
              </div>
            )}

            {/* Select Manager */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Manager
              </label>
              <select
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 outline-none rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                disabled={
                  !selectedEmployee || availableManagers.length === 0 || loading
                }
              >
                <option value="">
                  {!selectedEmployee
                    ? "-- Select employee first --"
                    : availableManagers.length === 0
                      ? " No managers available "
                      : " Choose a manager "}
                </option>
                {availableManagers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name} - {manager.role} ({manager.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleAssignManager}
              disabled={loading || !selectedEmployee || !selectedManager}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Assigning...
                </span>
              ) : (
                "Assign Manager"
              )}
            </button>
          </div>

          {/* Current User */}
          {currentUser && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Logged in as:{" "}
                <span className="font-semibold text-gray-700">
                  {currentUser.name}
                </span>{" "}
                ({currentUser.role})
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignManager;

import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import EmployeeDashboard from "./dashboard/Dashboard";
import LoginPage from "./pages/Login";
import Attendence from "./pages/Attendence";
import EmployeeManagement from "./pages/EmployeeManagement";
import AddNewJoiner from "./pages/AddNewJoiner";
import AssignManager from "./pages/AssignManager";
import SalarySlip from "./pages/SalarySlip";
import Callender from "./pages/Callender";
import AddHoliday from "./pages/AddHoliday";
import ApplyLeave from "./pages/ApplyLeaves";
import ApproveLeaves from "./pages/ApproveLeaves";
import { authInitializer } from "./redux/authInitializer";

function Router() {
  const dispatch = useDispatch();

  useEffect(() => {
    authInitializer(dispatch);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />
        {/* <Route path="/login" element={<LoginPage />} /> */}

        {/* Protected Dashboard Layout */}
        <Route path="/dashboard" element={<EmployeeDashboard />}>
          <Route index element={<EmployeeDashboard/>} />
          <Route path="add-new-joiner" element={<AddNewJoiner />} />
          <Route path="assign-manager" element={<AssignManager />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="attendance" element={<Attendence />} />
          <Route path="salary-slip" element={<SalarySlip />} />
          <Route path="callender" element={<Callender  />} />
          <Route path="add-holiday" element={<AddHoliday />} />
          <Route path="apply-leave" element={<ApplyLeave />} />
          <Route path="approve-leave" element={<ApproveLeaves />} />
        </Route>

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;

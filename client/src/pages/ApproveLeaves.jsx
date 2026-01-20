import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Calendar,
  User,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";
import { BASE_URL } from "../lib/lib";
import { toast } from "react-toastify";

const ApproveLeave = () => {
  const { userData, isloading } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const itemsPerPage = 10;

  const userRole = userData?.employee?.role?.toLowerCase();
  const userId = userData?.employee?.id;

  useEffect(() => {
    if (userRole === "employee" && !isloading) {
      navigate("/dashboard");
    }
  }, [isloading, userData, navigate, userRole]);

  useEffect(() => {
    fetchLeaves();
  }, [reloadTrigger]);

  useEffect(() => {
    filterLeaves();
  }, [searchTerm, filterStatus, leaves]);

  const fetchLeaves = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${BASE_URL}api/attendance/getLeavesForApproval`,
        { withCredentials: true },
      );
     

      const fetchedLeaves = res.data.leaves || [];
      setLeaves(fetchedLeaves);
      setMessage({ type: "", text: "" });
    } catch (error) {
      console.error("Error fetching leaves:", error);
      setLeaves([]);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to fetch leave requests",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterLeaves = () => {
    let filtered = [...leaves];

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(
        (leave) =>
          leave.employee_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          leave.employee_id?.toString().includes(searchTerm),
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((leave) => {
        if (filterStatus === "pending") return leave.is_approved === false;
        if (filterStatus === "approved") return leave.is_approved === true;
        return true;
      });
    }

    setFilteredLeaves(filtered);
    setCurrentPage(1);
  };

  const handleLeaveAction = async (leaveId, action) => {
    try {
      setActionLoading(leaveId);
      setMessage({ type: "", text: "" });

      const res = await axios.patch(
        `${BASE_URL}api/attendance/approve/${leaveId}`,
        {},
        { withCredentials: true },
      );
      if (res.status != 200) {
        toast.error("Unable to approve leave.");
        return;
      }
      
      setReloadTrigger(0);

      setMessage({
        type: "success",
        text: res.data.message || `Leave ${action} d successfully`,
      });
      toast.success("Leave apporved");

      await fetchLeaves();

      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || `Failed to ${action} leave`,
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (leave) => {
    if (leave.is_approved === false) {
      return (
        <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    }
    if (leave.is_approved === true) {
      return (
        <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" />
          Approved
        </span>
      );
    }
    return null;
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      employee: "bg-blue-100 text-blue-800",
      teamleader: "bg-purple-100 text-purple-800",
      hr: "bg-indigo-100 text-indigo-800",
      manager: "bg-orange-100 text-orange-800",
      owner: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
          roleColors[role?.toLowerCase()] || "bg-gray-100 text-gray-800"
        }`}
      >
        {role}
      </span>
    );
  };

  const getApprovalHierarchyText = () => {
    if (userRole === "hr") {
      return "You can approve leaves for all employees except HR";
    } else if (userRole === "owner") {
      return "You can approve leaves for all employees";
    } else if (userRole === "manager" || userRole === "teamleader") {
      return "You can approve leaves for your team members";
    }
    return "";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Pagination
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
  const paginatedLeaves = filteredLeaves.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm sm:text-base">Back to Dashboard</span>
          </button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Leave Approvals
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            {getApprovalHierarchyText()}
          </p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-4 sm:mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            <p className="text-sm sm:text-base font-medium flex items-center gap-2">
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              {message.text}
            </p>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by employee name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">Total</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">
                {leaves.length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">Pending</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                {leaves.filter((l) => l.is_approved === false).length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">Approved</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {leaves.filter((l) => l.is_approved === true).length}
              </p>
            </div>
          </div>
        </div>

        {/* Leave Requests List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 sm:py-16">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                No Leave Requests
              </h3>
              <p className="text-sm sm:text-base text-gray-500">
                {searchTerm || filterStatus !== "all"
                  ? "No requests match your filters"
                  : "There are no leave requests to display"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Leave Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedLeaves.map((leave) => (
                      <tr
                        key={leave.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {leave.employee_name?.charAt(0).toUpperCase() ||
                                  "U"}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {leave.employee_name || "Unknown"}
                              </p>
                              <p className="text-sm text-gray-500">
                                ID: {leave.employee_id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getRoleBadge(leave.employee_role)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(leave.attendance_date)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(leave)}</td>
                        <td className="px-6 py-4 text-right">
                          {leave.is_approved === false ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() =>
                                  handleLeaveAction(leave.id, "approve")
                                }
                                disabled={actionLoading === leave.id}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all text-sm font-medium"
                              >
                                {actionLoading === leave.id ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Approve</span>
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">
                              Already processed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-200">
                {paginatedLeaves.map((leave) => (
                  <div key={leave.id} className="p-4 sm:p-6 space-y-4">
                    {/* Employee Info */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold">
                          {leave.employee_name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {leave.employee_name || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {leave.employee_id}
                        </p>
                        <div className="mt-1">
                          {getRoleBadge(leave.employee_role)}
                        </div>
                      </div>
                      {getStatusBadge(leave)}
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Leave Date
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatDate(leave.attendance_date)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {leave.is_approved === false && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLeaveAction(leave.id, "approve")}
                          disabled={actionLoading === leave.id}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-medium"
                        >
                          {actionLoading === leave.id ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              <span>Approve</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleLeaveAction(leave.id, "reject")}
                          disabled={actionLoading === leave.id}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-medium"
                        >
                          {actionLoading === leave.id ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <XCircle className="w-5 h-5" />
                              <span>Reject</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {filteredLeaves.length > 0 && totalPages > 1 && (
            <div className="bg-gray-50 px-4 sm:px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-700 text-center sm:text-left">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredLeaves.length,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{filteredLeaves.length}</span>{" "}
                  results
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, idx) => {
                      const pageNum = idx + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 &&
                          pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === pageNum
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                : "border border-gray-300 hover:bg-gray-100 text-gray-700"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return (
                          <span
                            key={pageNum}
                            className="px-2 py-1.5 text-gray-500"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApproveLeave;

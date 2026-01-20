import React, { useEffect } from "react";
import { Menu, Bell, Calendar, ChevronDown } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Navbar = ({
  sidebarOpen,
  setSidebarOpen,
  userDropdownOpen,
  setUserDropdownOpen,
  currentUser,
}) => {
  const { isLoggedIn, isloading } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn && !isloading) {
      navigate("/");
    }
  }, [isloading]);

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 px-4 lg:px-6 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 active:scale-95"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
          <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Dashboard
          </h2>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-3 p-2 pr-3 rounded-xl hover:bg-gray-100 transition-all duration-200 active:scale-95"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md hover:shadow-lg transition-shadow">
                  {currentUser.avatar}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
                  <Calendar size={12} className="text-blue-600" />
                </div>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-gray-800">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  {currentUser.role}
                </p>
              </div>
              <ChevronDown
                size={16}
                className={`hidden lg:block text-gray-500 transition-transform duration-200 ${userDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

          
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

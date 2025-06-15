"use client"

import { Link, useNavigate } from "react-router-dom"
import { LogOut, Menu, Settings, User, BookOpen, Search, MessageCircle, Home, Bell } from "lucide-react"
import { FaUserCircle } from "react-icons/fa"
import { useState, useEffect, useRef, useCallback } from "react"
import { getNavbarNotifications } from "../../services/api_instructor"

const API_URL = import.meta.env.VITE_BACKEND_URL 

const FallbackAvatarIcon = () => <FaUserCircle size={32} color="#ccc" />

const Header = ({ school, isAuthenticated, user, onLogout }) => {
  const [open, setOpen] = useState({
    menu: false,
    mobileMenu: false,
    notifications: false,
  })
  const [notifications, setNotifications] = useState([])
  const [isAvatarLoading, setIsAvatarLoading] = useState(true)
  const [avatarSrc, setAvatarSrc] = useState(null)
  const avatarRef = useRef(null)
  const navigate = useNavigate()

  // Fetch notifications when component mounts for instructors
  useEffect(() => {
    const fetchNotifications = async () => {
      if (user?.role === "instructor") {
        try {
          const response = await getNavbarNotifications();
          setNotifications(response.notifications || []);
          console.log("Notifications:", response.notifications);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      }
    };

    fetchNotifications();
  }, [user?.role]); // Only re-run if user role changes

  // Initialize avatar source
  useEffect(() => {
    let isMounted = true;
    console.log("Avatar effect - User:", user);
    console.log("Avatar effect - Is authenticated:", isAuthenticated);

    if (!user?.avatar) {
      console.log("No avatar in user data");
      setIsAvatarLoading(false);
      return;
    }

    const loadAvatar = () => {
    // If avatar is a full URL, use it directly
      if (user.avatar.startsWith("http")) {
        console.log("Using direct URL:", user.avatar);
      if (isMounted) {
          setAvatarSrc(user.avatar);
      }
      return;
    }

    // If avatar is a storage path that starts with /storage
      if (user.avatar.startsWith("/storage")) {
        const fullUrl = `${API_URL}${user.avatar}`;
        console.log("Using storage URL:", fullUrl);
      if (isMounted) {
          setAvatarSrc(fullUrl);
      }
      return;
    }

    // If avatar is just a filename or other relative path
      const fullUrl = `${API_URL}/storage/${user.avatar}`;
      console.log("Using relative path URL:", fullUrl);
    if (isMounted) {
        setAvatarSrc(fullUrl);
    }
    };

    loadAvatar();

    return () => {
      isMounted = false;
    };
  }, [user?.avatar, isAuthenticated]);

  // Handle avatar loading
  const handleAvatarLoad = useCallback(() => {
    console.log("Avatar loaded successfully");
    setIsAvatarLoading(false);
  }, []);

  // Handle avatar error more gracefully
  const handleAvatarError = useCallback(() => {
    console.log("Avatar load error, using fallback");
    setIsAvatarLoading(false);
    setAvatarSrc(null);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".header-menu") ) {
        setOpen((prev) => ({
          ...prev,
          menu: false,
        }));
      }

      // Close notifications when clicking anywhere outside the notifications dropdown
      if (!event.target.closest(".notifications-dropdown") && !event.target.closest(".notifications-button")) {
        setOpen((prev) => ({
          ...prev,
          notifications: false,
        }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    const cleanup = () => {
      setOpen((prev) => ({ ...prev, mobileMenu: false }));
    };
    return cleanup;
  }, [navigate]);

  const toggle = useCallback((key) => {
    setOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
      ...(key !== "mobileMenu" && { mobileMenu: false }),
    }));
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side: Logo + Mobile Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => toggle("mobileMenu")}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="text-xl font-bold text-black hover:text-gray-700 transition-colors">
              {school}
            </Link>
          </div>

          {/* Middle: Public Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
            >
              Accueil
            </Link>
            <Link
              to="/formations"
              className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
            >
              Formations
            </Link>
            <Link
              to="/a-propos"
              className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
            >
              À propos
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
            >
              Contact
            </Link>
                          </div>

          {/* Right Side: Auth/User Menu */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* User Avatar Menu */}
                <div className="relative header-menu">
                  <button
                    onClick={() => toggle("menu")}
                    className="p-1 rounded-full border-2 border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    {isAvatarLoading && <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>}
                    <img
                      ref={avatarRef}
                      src={avatarSrc || "/placeholder.svg"}
                      alt="User avatar"
                  className={`w-8 h-8 rounded-full object-cover ${isAvatarLoading ? "hidden" : "block"}`}
                  onLoad={handleAvatarLoad}
                  onError={handleAvatarError}
                />
              </button>

              {open.menu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-lg z-20">
                      <div className="p-2">
                        <div className="px-3 py-2">
                          <p className="text-sm font-medium text-black">{user?.name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>

                        <div className="mt-2 space-y-1">
                      <Link
                        to="/learner"
                            onClick={() => toggle("menu")}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors"
                      >
                        <Home className="w-4 h-4" />
                        Dashboard
                      </Link>
                      { user.role === "learner" && <Link
                            to="/learner/all-enrolled-courses"
                            onClick={() => toggle("menu")}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors"
                      >
                        <BookOpen className="w-4 h-4" />
                        My Courses
                      </Link>}
                      { user.role === "instructor" && <Link
                            to="/instructor/dashboard/courses"
                            onClick={() => toggle("menu")}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors"
                      >
                        <BookOpen className="w-4 h-4" />
                        My Courses
                      </Link>}
                      { user.role === "learner" && <Link
                            to="/learner/suggested-courses"
                            onClick={() => toggle("menu")}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors"
                      >
                        <Search className="w-4 h-4" />
                        Browse Courses
                      </Link>}
                      <Link
                            to="/contact"
                            onClick={() => toggle("menu")}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Contact
                      </Link>
                      { user.role === "learner" &&
                      <Link
                            to="/learner/settings"
                            onClick={() => toggle("menu")}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      }
                      { user.role === "instructor" &&
                      <Link
                            to="/instructor/dashboard/settings"
                            onClick={() => toggle("menu")}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      }
                          <div className="border-t border-gray-200 pt-2 mt-2">
                      <button
                              onClick={onLogout}
                              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                          </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {user.role === "instructor" && (
              <div className="relative">
                <button
                  onClick={() => toggle("notifications")}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors relative notifications-button"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {notifications.slice(0, 5).some(notification => !notification.read) && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {open.notifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg border border-gray-200 shadow-lg z-20 notifications-dropdown">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-3">Notifications</h3>
                      {notifications.length > 0 ? (
                        <>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {notifications.slice(0, 5).map((notification, index) => (
                              <div
                                key={index}
                                className={`p-3 hover:bg-gray-50 rounded-lg transition-colors border-l-4 ${
                                  !notification.read
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 bg-white'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="text-sm font-semibold text-gray-900 capitalize">
                                    {notification.type.replace(/_/g, ' ')}
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">{notification.date}</span>
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-1">
                                  {notification.message || notification.text}
                                </p>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <Link
                              to="/instructor/notifications"
                              onClick={() => toggle("notifications")}
                              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              Voir toutes les notifications →
                            </Link>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">Aucune notification</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open.mobileMenu && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-2 space-y-1">
            {/* Public Links */}
            <Link
              to="/"
              onClick={() => toggle("mobileMenu")}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors"
            >
              Accueil
            </Link>
            <Link
              to="/formations"
              onClick={() => toggle("mobileMenu")}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors"
            >
              Formations
            </Link>
            <Link
              to="/a-propos"
              onClick={() => toggle("mobileMenu")}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors"
            >
              À propos
            </Link>
            <Link
              to="/contact"
              onClick={() => toggle("mobileMenu")}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors"
            >
              Contact
            </Link>

            {/* Auth Links */}
            {isAuthenticated ? (
              <>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <Link
                    to="/learner"
              onClick={() => toggle("mobileMenu")}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
            { user.role === "learner" && <Link
              to="/learner/all-enrolled-courses"
              onClick={() => toggle("mobileMenu")}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              My Courses
            </Link>}
            <Link
              to="/learner/suggested-courses"
              onClick={() => toggle("mobileMenu")}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors"
            >
              <Search className="w-4 h-4" />
              Browse Courses
            </Link>
            <Link
              to="/learner/contact"
              onClick={() => toggle("mobileMenu")}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Contact
            </Link>
            { user.role === "instructor" && <Link
              to="/instructor/notifications"
              onClick={() => toggle("mobileMenu")}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors"
            >
              <Bell className="w-4 h-4" />
              Notifications
            </Link>}
            <Link
              to="/learner/settings"
              onClick={() => toggle("mobileMenu")}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <button
                      onClick={onLogout}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
                </div>
              </>
            ) : (
              <>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <Link
                    to="/auth/login"
                    onClick={() => toggle("mobileMenu")}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors"
                  >
                    Se connecter
                  </Link>
                  <Link
                    to="/auth/register"
                    onClick={() => toggle("mobileMenu")}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors"
                  >
                    S'inscrire
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header


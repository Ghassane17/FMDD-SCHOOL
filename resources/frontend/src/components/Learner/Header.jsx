"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Bell, LogOut, Menu, Settings, ExpandIcon as ExpandMore, ChevronRight } from "lucide-react"
import { getLearnerNotifications, markNotificationAsRead, updateNotifications, logout } from "@/services/api.js"
import { FaUserCircle } from "react-icons/fa"

const API_URL = import.meta.env.VITE_BACKEND_URL 

const FallbackAvatarIcon = () => <FaUserCircle size={32} color="#ccc" />

const Header = ({ school, avatar, notifications: initialNotifications = [] }) => {
  const [open, setOpen] = useState({
    menu: false,
    notifications: false,
    mobileMenu: false,
  })
  const [notifications, setNotifications] = useState(initialNotifications)
  const [loading, setLoading] = useState(false)
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    app: true,
  })
  const [isAvatarLoading, setIsAvatarLoading] = useState(true)
  const [avatarSrc, setAvatarSrc] = useState(null)
  const [showNotificationPrefs, setShowNotificationPrefs] = useState(false)
  const avatarRef = useRef(null)
  const navigate = useNavigate()

  // Initialize avatar source
  useEffect(() => {
    let isMounted = true;

    if (!avatar) {
      setIsAvatarLoading(false);
      return;
    }

    // If avatar is a full URL, use it directly
    if (avatar.startsWith("http")) {
      if (isMounted) {
        setAvatarSrc(avatar);
      }
      return;
    }

    // If avatar is a storage path that starts with /storage
    if (avatar.startsWith("/storage")) {
      if (isMounted) {
        setAvatarSrc(`${API_URL}${avatar}`);
      }
      return;
    }

    // If avatar is just a filename or other relative path
    if (isMounted) {
      setAvatarSrc(`${API_URL}/storage/${avatar}`);
    }

    return () => {
      isMounted = false;
    };
  }, [avatar]);

  // Handle avatar loading
  const handleAvatarLoad = useCallback(() => {
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
      if (!event.target.closest(".header-menu") && !event.target.closest(".header-notifications")) {
        setOpen((prev) => ({
          ...prev,
          menu: false,
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

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.notifications) {
      setNotificationPreferences(user.notifications);
    }
  }, []);

  const toggle = useCallback(async (key) => {
    if (key === "notifications") {
      setLoading(true)
      try {
        const response = await getLearnerNotifications()
        setNotifications(response.data)
      } catch (error) {
        console.error("Error loading notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    setOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
      ...(key !== "mobileMenu" && { mobileMenu: false }),
    }))
  }, [])

  const handleNotificationClick = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handlePreferenceChange = async (type) => {
    try {
      const newPreferences = {
        ...notificationPreferences,
        [type]: !notificationPreferences[type],
      }

      await updateNotifications({
        notifications: newPreferences,
      })

      setNotificationPreferences(newPreferences)

      const user = JSON.parse(localStorage.getItem("user"))
      user.notifications = newPreferences
      localStorage.setItem("user", JSON.stringify(user))
    } catch (error) {
      console.error("Error updating notification preferences:", error)
    }
  }

  const hasUnread = notifications?.some((n) => !n.read)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side: Logo + Mobile Menu */}
          <div className="flex items-center space-x-8">
            <button
              onClick={() => toggle("mobileMenu")}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/learner" className="text-xl font-bold text-black hover:text-gray-700 transition-colors">
              {school}
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="all-enrolled-courses"
                className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
              >
                My Courses
              </Link>
              <Link
                to="suggested-courses"
                className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
              >
                Browse Courses
              </Link>
              <Link to="contact" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
                Contact
              </Link>
              <Link to="/learner" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
                Dashboard
              </Link>
            </nav>
          </div>

          {/* Right Side: Icons & Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative header-notifications">
              <button
                onClick={() => toggle("notifications")}
                aria-label="Notifications"
                className="relative p-2 rounded-lg text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
                disabled={loading}
              >
                <Bell className="w-5 h-5" />
                {hasUnread && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>}
              </button>

              {open.notifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg border border-gray-200 shadow-lg z-20 max-h-[80vh] overflow-y-auto">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-black">Notifications</h3>
                      {hasUnread && (
                        <span className="text-xs text-gray-500">{notifications.filter((n) => !n.read).length} new</span>
                      )}
                    </div>

                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No notifications yet</p>
                        <p className="text-xs text-gray-400 mt-1">We'll notify you when there's something new</p>
                      </div>
                    ) : (
                      <div className="space-y-2 mb-4">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                              n.read
                                ? "bg-gray-50 hover:bg-gray-100 border-gray-100"
                                : "bg-blue-50 hover:bg-blue-100 border-blue-200"
                            }`}
                            onClick={() => handleNotificationClick(n.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-black truncate">{n.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                                <p className="text-xs text-gray-400 mt-2">{n.createdAt}</p>
                              </div>
                              {!n.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-2 flex-shrink-0"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Notification Preferences */}
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setShowNotificationPrefs(!showNotificationPrefs)}
                        className="flex items-center justify-between w-full mb-3"
                      >
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-black">Preferences</h4>
                          <Settings className="w-4 h-4 text-gray-400" />
                        </div>
                        {showNotificationPrefs ? (
                          <ExpandMore className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </button>

                      {showNotificationPrefs && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-black">Email Notifications</p>
                              <p className="text-xs text-gray-500">Receive updates via email</p>
                            </div>
                            <button
                              onClick={() => handlePreferenceChange("email")}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                                notificationPreferences.email ? "bg-black" : "bg-gray-200"
                              }`}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                  notificationPreferences.email ? "translate-x-5" : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-black">In-App Notifications</p>
                              <p className="text-xs text-gray-500">Show notifications in the app</p>
                            </div>
                            <button
                              onClick={() => handlePreferenceChange("app")}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                                notificationPreferences.app ? "bg-black" : "bg-gray-200"
                              }`}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                  notificationPreferences.app ? "translate-x-5" : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Settings Link */}
            <Link
              to="settings"
              className="p-2 rounded-lg text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>

            {/* User Avatar (Profile only) */}
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-20">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-black">Profile</p>
                      <p className="text-xs text-gray-500">Manage your account</p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                    >
                      View Profile
                    </Link>
                    <Link
                      to="/account"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                    >
                      Account Settings
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              aria-label="Logout"
              className="p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open.mobileMenu && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-2 space-y-1">
            <Link
              to="/learner/all-enrolled-courses"
              onClick={() => toggle("mobileMenu")}
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors"
            >
              My Courses
            </Link>
            <Link
              to="/learner/suggested-courses"
              onClick={() => toggle("mobileMenu")}
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors"
            >
              Browse Courses
            </Link>
            <Link
              to="/learner/contact"
              onClick={() => toggle("mobileMenu")}
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors"
            >
              Contact
            </Link>
            <Link
              to="/learner/settings"
              onClick={() => toggle("mobileMenu")}
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors"
            >
              Settings
            </Link>
            <Link
              to="/learner"
              onClick={() => toggle("mobileMenu")}
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black rounded-lg transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header




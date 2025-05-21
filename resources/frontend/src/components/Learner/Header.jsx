import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, LogOut, Menu, Search, User, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { getLearnerNotifications, markNotificationAsRead, updateLearnerSettings } from '../../services/api.js';

const Header = ({ school, avatar, notifications: initialNotifications = [] }) => {
  const [open, setOpen] = useState({
    menu: false,
    notifications: false,
    mobileMenu: false
  });
  const [notifications, setNotifications] = useState(initialNotifications);
  const [loading, setLoading] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    app: true
  });

  useEffect(() => {
    // Load notification preferences from user settings
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.notifications) {
      setNotificationPreferences(user.notifications);
    }
  }, []);

  const toggle = async (key) => {
    if (key === 'notifications') {
      setLoading(true);
      try {
        const response = await getLearnerNotifications();
        setNotifications(response.data);
      } catch (error) {
        toast.error('Failed to load notifications');
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    }
    
    setOpen({
      menu: key === 'menu' ? !open.menu : false,
      notifications: key === 'notifications' ? !open.notifications : false,
      mobileMenu: key === 'mobileMenu' ? !open.mobileMenu : false
    });
  };

  const handleNotificationClick = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      toast.error('Failed to mark notification as read');
      console.error('Error marking notification as read:', error);
    }
  };

  const handlePreferenceChange = async (type) => {
    try {
      const newPreferences = {
        ...notificationPreferences,
        [type]: !notificationPreferences[type]
      };
      
      await updateLearnerSettings({
        notifications: newPreferences
      });
      
      setNotificationPreferences(newPreferences);
      
      // Update user in localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      user.notifications = newPreferences;
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success('Notification preferences updated');
    } catch (error) {
      toast.error('Failed to update notification preferences');
      console.error('Error updating notification preferences:', error);
    }
  };

  const hasUnread = notifications?.some((n) => !n.read);

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left Side: Logo + Mobile Menu */}
        <div className="flex items-center space-x-4">
          <button onClick={() => toggle('mobileMenu')} className="md:hidden focus:outline-none">
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/learner" className="text-xl md:text-2xl font-bold tracking-tight whitespace-nowrap">
            {school}
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex w-full max-w-md mx-4">
          <div className="relative w-full">
            <input
              className="w-full bg-white text-sm text-gray-700 placeholder:text-gray-400 border border-gray-300 rounded-md pl-4 pr-12 py-2 shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
              placeholder="Search courses..."
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side: Icons & Menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => toggle('notifications')}
              aria-label="Notifications"
              className="relative p-2 rounded-full hover:bg-blue-600 transition-colors"
              disabled={loading}
            >
              <Bell className="w-6 h-6" />
              {hasUnread && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>
            {open.notifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded-lg shadow-lg z-20 max-h-[80vh] overflow-y-auto">
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 text-lg mb-2">Notifications</h3>
                  {loading ? (
                    <p className="text-sm text-gray-500">Loading notifications...</p>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">No notifications yet</p>
                      <p className="text-xs text-gray-400 mt-1">We'll notify you when there's something new</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-3 mb-2 rounded-md cursor-pointer transition-colors ${n.read ? 'bg-gray-50 hover:bg-gray-100' : 'bg-indigo-100 hover:bg-indigo-200'}`}
                        onClick={() => handleNotificationClick(n.id)}
                      >
                        <h4 className="text-sm font-medium text-gray-800">{n.title}</h4>
                        <p className="text-xs text-gray-600">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{n.createdAt}</p>
                      </div>
                    ))
                  )}

                  {/* Notification Preferences */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-800">Notification Preferences</h4>
                      <Settings className="w-4 h-4 text-gray-500" />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-700">Email Notifications</p>
                          <p className="text-xs text-gray-500">Receive updates via email</p>
                        </div>
                        <button
                          onClick={() => handlePreferenceChange('email')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                            notificationPreferences.email ? 'bg-indigo-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationPreferences.email ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-700">In-App Notifications</p>
                          <p className="text-xs text-gray-500">Show notifications in the app</p>
                        </div>
                        <button
                          onClick={() => handlePreferenceChange('app')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                            notificationPreferences.app ? 'bg-indigo-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationPreferences.app ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => toggle('menu')}
              className="focus:outline-none rounded-full border-2 border-white"
            >
              <img
                src={avatar || "https://via.placeholder.com/50"}
                alt="User avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
            </button>
            {open.menu && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-gray-800 rounded-lg shadow-xl z-20">
                <div className="py-2">
                  <Link to="all-enrolled-courses" className="block px-4 py-2 hover:bg-gray-100">
                    🎓 Mes Formations
                  </Link>
                  <Link to="suggested-courses" className="block px-4 py-2 hover:bg-gray-100">
                    📘 Autres Formations
                  </Link>
                  <Link to="contact" className="block px-4 py-2 hover:bg-gray-100">
                    📞 Contact Nous
                  </Link>
                  <Link to="settings" className="block px-4 py-2 hover:bg-gray-100">
                    ⚙️ Paramètres
                  </Link>
                  <Link to="/learner" className="block px-4 py-2 hover:bg-gray-100">
                    📈 Dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <Link to="/login" aria-label="Logout" className="p-2 rounded-full hover:bg-blue-600 transition-colors">
            <LogOut className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {open.mobileMenu && (
        <div className="md:hidden bg-white text-black p-4 space-y-2">
          <Link to="/course/all-enrolled-courses" onClick={() => toggle('mobileMenu')} className="block">
            Mes Formations
          </Link>
          <Link to="/course/suggested-courses" onClick={() => toggle('mobileMenu')} className="block">
            Autres Formations
          </Link>
          <Link to="/course/contact" onClick={() => toggle('mobileMenu')} className="block">
            Contact
          </Link>
          <Link to="/course/settings" onClick={() => toggle('mobileMenu')} className="block">
            Paramètres
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;

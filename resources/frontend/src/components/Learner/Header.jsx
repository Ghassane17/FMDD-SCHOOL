import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, LogOut, Menu, Search, User } from 'lucide-react';

const Header = ({ school, avatar, notifications }) => {
  const [open, setOpen] = useState({
    menu: false,
    notifications: false,
    mobileMenu: false
  });

  const toggle = (key) => {
    setOpen({
      menu: key === 'menu' ? !open.menu : false,
      notifications: key === 'notifications' ? !open.notifications : false,
      mobileMenu: key === 'mobileMenu' ? !open.mobileMenu : false
    });
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
            >
              <Bell className="w-6 h-6" />
              {hasUnread && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>
            {open.notifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 text-lg mb-2">Notifications</h3>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={`p-3 mb-2 rounded-md ${n.read ? 'bg-gray-50' : 'bg-indigo-100'}`}>
                        <h4 className="text-sm font-medium text-gray-800">{n.title}</h4>
                        <p className="text-xs text-gray-600">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{n.createdAt}</p>
                      </div>
                    ))
                  )}
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

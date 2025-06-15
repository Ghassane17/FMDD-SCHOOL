import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, CreditCard, Inbox, Settings, Users } from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'profile', label: 'Profil', icon: <Users className="w-5 h-5" /> },
    { id: 'courses', label: 'Mes Cours', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'calendar', label: 'Planning', icon: <Calendar className="w-5 h-5" /> },
    { id: 'messages', label: 'Messages', icon: <Inbox className="w-5 h-5" /> },
    { id: 'payments', label: 'Paiements', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'settings', label: 'Paramètres', icon: <Settings className="w-5 h-5" /> }
  ];

  const handleTabClick = (tabId) => {
    console.log('Navigation: Clicking tab:', tabId);
    setActiveTab(tabId);
    navigate(`/instructor/dashboard/${tabId}`);
  };
  
  return (
    <div className="bg-white shadow rounded-2xl mb-6 px-2 py-3">
      <div className="flex items-center justify-center space-x-2 md:space-x-4 overflow-x-auto">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`flex items-center px-4 py-2 rounded-full font-medium text-sm transition-all duration-150
              ${activeTab === item.id
                ? 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow'
                : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'}
            `}
            onClick={() => handleTabClick(item.id)}
          >
            {item.icon}
            <span className="ml-2 whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navigation;

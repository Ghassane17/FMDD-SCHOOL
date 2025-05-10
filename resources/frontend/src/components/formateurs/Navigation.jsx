
import React from 'react';
import { BookOpen, Calendar, CreditCard, Inbox, Settings, Users } from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'profile', label: 'Profil', icon: <Users className="w-5 h-5" /> },
    { id: 'courses', label: 'Mes Cours', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'calendar', label: 'Planning', icon: <Calendar className="w-5 h-5" /> },
    { id: 'messages', label: 'Messages', icon: <Inbox className="w-5 h-5" /> },
    { id: 'payments', label: 'Paiements', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'settings', label: 'Paramètres', icon: <Settings className="w-5 h-5" /> }
  ];
  
  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="container mx-auto">
        <div className="flex items-center space-x-1 md:space-x-4 overflow-x-auto">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`flex items-center py-4 px-2 md:px-4 border-b-2 font-medium text-sm ${
                activeTab === item.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span className="ml-2 whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navigation;

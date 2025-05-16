
import React, { useState } from 'react';
import { Bell, BookOpen, Calendar, CreditCard, Inbox, Settings, Star, Users } from 'lucide-react';
import Navigation from './Navigation';
import ProfileHeader from './ProfileHeader';
import SkillsSection from './SkillsSection';
import StatisticsCards from './StatisticsCards';
import CourseList from './CourseList';
import TrainerCalendar from './TrainerCalendar';
import CommentSection from './CommentSection';
import AccountSettings from './AccountSettings';
import PaymentSection from './PaymentSection';
import { trainerData } from '../../data/trainerData';

const TrainerDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const user = JSON.parse(localStorage.getItem('user'))|| {};

  // Render the appropriate content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <>
            <ProfileHeader />
            <StatisticsCards />
            <SkillsSection />
            <CommentSection />
          </>
        );
      case 'courses':
        return <CourseList />;
      case 'calendar':
        return <TrainerCalendar />;
      case 'payments':
        return <PaymentSection />;
      case 'settings':
        return <AccountSettings />;
      default:
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold">Cette fonctionnalité sera bientôt disponible</h2>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Formateur Section</h1>
            </div>
            <div className="flex items-center">
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                <Bell className="h-6 w-6" />
              </button>
              <div className="ml-3 relative">
                <div>
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={user.avatar || 'https://via.placeholder.com/150'}
                    alt={user.username}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;

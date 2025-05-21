import React, { useState, useEffect } from 'react';
import { Bell, BookOpen, Calendar, CreditCard, Inbox, Settings, Star, Users } from 'lucide-react';
import Navigation from './Navigation';
import ProfileHeader from './ProfileHeader';
import SkillsSection from './SkillsSection';
import StatisticsCards from './StatisticsCards';
import CourseList from './CourseList';
import InstructorCalendar from './InstructorCalendar';
import CommentSection from './CommentSection';
import AccountSettings from './AccountSettings';
import PaymentSection from './PaymentSection';
import { getInstructorDashboard } from '../../services/api_instructor';

const InstructorDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [instructorData, setInstructorData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getInstructorDashboard();
        setInstructorData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Render the appropriate content based on the active tab
  const renderContent = () => {
    if (loading) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
            <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        </div>
      );
    }

    if (!instructorData) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 p-4 rounded-lg">
            <p>No instructor data available</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'profile':
        return (
          <>
            <ProfileHeader instructorData={instructorData} />
            <StatisticsCards instructorData={instructorData} />
            <SkillsSection instructorData={instructorData} />
            <CommentSection instructorData={instructorData} />
          </>
        );
      case 'courses':
        return <CourseList instructorData={instructorData} />;
      case 'calendar':
        return <InstructorCalendar availability={instructorData.availability} />;
      case 'payments':
        return <PaymentSection payments={instructorData.payments} bankInfo={instructorData.bank_info} />;
      case 'settings':
        return <AccountSettings instructorData={instructorData} />;
      default:
        return (
          <div className="container mx-auto px-4 py-8">
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
                    src={instructorData?.user?.avatar || 'https://via.placeholder.com/150'}
                    alt={instructorData?.user?.name || 'User'}
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

export default InstructorDashboard;

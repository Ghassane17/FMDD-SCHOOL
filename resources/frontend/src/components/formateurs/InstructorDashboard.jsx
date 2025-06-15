import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
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

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const InstructorDashboard = () => {
  const { tab } = useParams();
  const [searchParams] = useSearchParams();
  const queryTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState('profile');

  // This will update activeTab when the URL parameter changes
  useEffect(() => {
    const newTab = tab || queryTab || 'profile';
    console.log('URL tab parameter:', tab);
    console.log('Query tab parameter:', queryTab);
    console.log('Setting active tab to:', newTab);
    setActiveTab(newTab);
  }, [tab, queryTab]);
  
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

  const handleBankInfoUpdate = (newBankInfo) => {
    setInstructorData(prev => ({
      ...prev,
      bank_info: newBankInfo
    }));
  };

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
            <ProfileHeader instructorData={instructorData} backend_url={API_URL} />
            <StatisticsCards instructorData={instructorData} />
            <SkillsSection instructorData={instructorData} />
            <CommentSection instructorData={instructorData} />
          </>
        );
      case 'courses':
        return <CourseList instructorData={instructorData} backend_url={API_URL} />;
      case 'calendar':
        return <InstructorCalendar availability={instructorData.availability} />;
      case 'payments':
        return (
          <PaymentSection 
            payments={instructorData.payments} 
            bankInfo={instructorData.bank_info} 
            onUpdate={handleBankInfoUpdate}
          />
        );
      case 'settings':
        return <AccountSettings instructorData={instructorData} backend_url={API_URL} />;
      default:
        return (
          <div className="container mx-auto px-4 py-8">
            <h2 className="text-xl font-bold">Cette fonctionnalité sera bientôt disponible</h2>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="container mx-auto px-4 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default InstructorDashboard;



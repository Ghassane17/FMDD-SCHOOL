
import React from 'react';
import { BookOpen, Star, Users } from 'lucide-react';
import { trainerData } from '../../data/trainerData';

const StatisticsCards = () => {
  const stats = [
    { 
      title: "Total de cours publiés", 
      value: trainerData.stats.totalCourses, 
      icon: <BookOpen className="h-6 w-6 text-blue-600" /> 
    },
    { 
      title: "Total d'apprenants formés", 
      value: trainerData.stats.totalStudents, 
      icon: <Users className="h-6 w-6 text-green-600" /> 
    },
    { 
      title: "Note moyenne globale", 
      value: trainerData.stats.averageRating + "/5", 
      icon: <Star className="h-6 w-6 text-yellow-500" /> 
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
            {stat.icon}
          </div>
          <p className="text-2xl font-bold">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default StatisticsCards;

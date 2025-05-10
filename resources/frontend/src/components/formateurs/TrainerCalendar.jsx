
import React from 'react';
import { trainerData } from '../../data/trainerData';

const TrainerCalendar = () => {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const currentMonth = 'Avril 2025';
  
  // Mock calendar data (simplified)
  const dates = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    hasEvent: [3, 7, 12, 15, 18, 22, 26].includes(i + 1)
  }));
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Planning & Disponibilités</h2>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <button className="text-gray-600 hover:text-gray-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="font-medium">{currentMonth}</h3>
          <button className="text-gray-600 hover:text-gray-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {days.map(day => (
            <div key={day} className="text-center text-gray-500 text-sm font-medium">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {dates.map((date, i) => (
            <div 
              key={i} 
              className={`h-10 flex items-center justify-center rounded-full cursor-pointer ${
                date.hasEvent 
                  ? 'bg-blue-100 text-blue-800 font-medium' 
                  : 'hover:bg-gray-100'
              }`}
            >
              {date.day}
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="font-medium mb-3">Créneaux disponibles</h3>
        
        {trainerData.availability.map((day, i) => (
          <div key={i} className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">{day.day}</h4>
            <div className="flex flex-wrap gap-2">
              {day.slots.map((slot, j) => (
                <button 
                  key={j}
                  className="px-3 py-1 border border-blue-200 text-blue-700 rounded-md hover:bg-blue-50"
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        ))}
        
        <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
          Gérer mes disponibilités
        </button>
      </div>
    </div>
  );
};

export default TrainerCalendar;

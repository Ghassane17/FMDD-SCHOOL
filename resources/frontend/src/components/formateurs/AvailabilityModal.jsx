import React, { useState, useEffect } from 'react';
import { updateInstructorAvailability } from '../../services/api_instructor';
import { toast } from 'react-hot-toast';

const AvailabilityModal = ({ isOpen, onClose, onSave, initialAvailability = [] }) => {
  const [selectedDays, setSelectedDays] = useState([]);
  const [dayTimeSlots, setDayTimeSlots] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00'
  ];

  // Initialize the modal with existing availability data
  useEffect(() => {
    if (isOpen && initialAvailability.length > 0) {
      // Parse the availability data if it's in string format
      const parsedAvailability = initialAvailability.map(item => 
        typeof item === 'string' ? JSON.parse(item) : item
      );

      // Set selected days
      setSelectedDays(parsedAvailability.map(item => item.day));

      // Set time slots for each day
      const initialTimeSlots = {};
      parsedAvailability.forEach(item => {
        initialTimeSlots[item.day] = item.slots;
      });
      setDayTimeSlots(initialTimeSlots);
    }
  }, [isOpen, initialAvailability]);

  const toggleDay = (day) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        const newDays = prev.filter(d => d !== day);
        // Remove the day's time slots when unselecting
        const newDayTimeSlots = { ...dayTimeSlots };
        delete newDayTimeSlots[day];
        setDayTimeSlots(newDayTimeSlots);
        return newDays;
      } else {
        return [...prev, day];
      }
    });
  };

  const toggleTimeSlot = (day, time) => {
    setDayTimeSlots(prev => {
      const daySlots = prev[day] || [];
      const newDaySlots = daySlots.includes(time)
        ? daySlots.filter(t => t !== time)
        : [...daySlots, time].sort();
      
      return {
        ...prev,
        [day]: newDaySlots
      };
    });
  };

  const handleSave = async () => {
    try {
      // Filter out days that have no time slots selected
      const daysWithTimeSlots = selectedDays.filter(day => 
        dayTimeSlots[day] && dayTimeSlots[day].length > 0
      );

      if (daysWithTimeSlots.length === 0) {
        toast.error('Veuillez sélectionner au moins un créneau horaire');
        return;
      }

      setIsLoading(true);
      // Format each day's availability as a string
      const formattedAvailability = daysWithTimeSlots.map(day => {
        const slots = dayTimeSlots[day] || [];
        return JSON.stringify({
          day,
          slots
        });
      });

      // Call the API to update availability with the formatted data
      await updateInstructorAvailability({ 
        availability: formattedAvailability
      });
      
      // Call the parent's onSave with the original format
      onSave(daysWithTimeSlots.map(day => ({
        day,
        slots: dayTimeSlots[day] || []
      })));
      
      // Show success message
      setShowSuccess(true);
      toast.success('Disponibilités mises à jour avec succès');

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Erreur lors de la mise à jour des disponibilités');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Gérer mes disponibilités</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-3">Jours disponibles</h3>
          <div className="flex flex-wrap gap-2">
            {days.map(day => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`px-4 py-2 rounded-md border ${
                  selectedDays.includes(day)
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {selectedDays.map(day => (
          <div key={day} className="mb-6">
            <h3 className="font-medium mb-3">Créneaux horaires - {day}</h3>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map(time => (
                <button
                  key={time}
                  onClick={() => toggleTimeSlot(day, time)}
                  className={`px-4 py-2 rounded-md border ${
                    (dayTimeSlots[day] || []).includes(time)
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isLoading || showSuccess}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || showSuccess}
            className={`px-4 py-2 rounded-md flex items-center gap-2 ${
              showSuccess 
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } disabled:opacity-50`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : showSuccess ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Enregistré !
              </>
            ) : (
              'Enregistrer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityModal; 
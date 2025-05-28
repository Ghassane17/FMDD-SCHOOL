import React, { useState } from 'react';
import { Rating } from '@mui/material';
import { toast } from 'sonner';
import { submitComment } from '@/services/api.js';

/**
 * NotesPanel Component
 * Panel for taking and saving notes with rating
 *
 * @param {Object} props
 * @param {string} props.notes - Current notes content
 * @param {Function} props.onSaveNotes - Handler for saving notes
 * @param {number} props.courseId - ID of the current course
 */
const NotesPanel = ({ notes = '', onSaveNotes, courseId }) => {
  // Local state to handle note edits
  const [noteText, setNoteText] = useState(notes);
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle form submission to save notes and rating
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input before submission
    if (!noteText.trim()) {
      toast.error('Veuillez écrire un commentaire');
      return;
    }

    if (rating === 0) {
      toast.error('Veuillez attribuer une note');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitComment(courseId, {
        text: noteText,
        rating: rating
      });

      toast.success('Votre commentaire a été enregistré avec succès !');
      onSaveNotes(noteText, rating);
      setNoteText('');
      setRating(0);
    } catch (error) {
      // The error message is already formatted in the API service
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-3">Mes notes et évaluation</h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Votre note
          </label>
          <Rating
            value={rating}
            onChange={(event, newValue) => setRating(newValue)}
            precision={1}
          />
        </div>

        <textarea
          className="w-full border rounded-md p-3 min-h-[150px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Écrivez vos notes ici..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          disabled={isSubmitting}
        />

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!noteText.trim() || rating === 0 || isSubmitting}
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotesPanel;

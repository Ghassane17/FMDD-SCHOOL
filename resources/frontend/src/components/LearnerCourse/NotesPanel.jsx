
import React, { useState } from 'react';

/**
 * NotesPanel Component
 * Panel for taking and saving notes
 * 
 * @param {Object} props
 * @param {string} props.notes - Current notes content
 * @param {Function} props.onSaveNotes - Handler for saving notes
 */
const NotesPanel = ({ notes = '', onSaveNotes }) => {
  // Local state to handle note edits
  const [noteText, setNoteText] = useState(notes);
  
  /**
   * Handle form submission to save notes
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveNotes(noteText);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-3">Mes notes</h3>
      
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full border rounded-md p-3 min-h-[150px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Écrivez vos notes ici..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        />
        
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotesPanel;

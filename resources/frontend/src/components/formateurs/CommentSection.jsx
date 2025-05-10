
import React from 'react';
import { Star } from 'lucide-react';
import { trainerData } from '../../data/trainerData';

const CommentSection = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Commentaires des étudiants</h2>
      
      <div className="space-y-6">
        {trainerData.comments.map(comment => (
          <div key={comment.id} className="border-b pb-4 last:border-b-0 last:pb-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">{comment.user}</h3>
                <p className="text-sm text-gray-600">{comment.course}</p>
              </div>
              <div className="flex items-center">
                <span className="mr-1 text-sm text-gray-600">{comment.rating}</span>
                <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
              </div>
            </div>
            <p className="text-gray-700 mb-2">{comment.text}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{comment.date}</span>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Répondre</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;

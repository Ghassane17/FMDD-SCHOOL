import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Star } from 'lucide-react';

export default function CommentSection() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/instructor/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept:        'application/json'
      }
    })
    .then(response => {
      // Expecting response.data.comments to be an array
      setComments(Array.isArray(response.data.comments)
        ? response.data.comments
        : []
      );
    })
    .catch(err => {
      console.error('Failed to load comments:', err);
      setError('Failed to load comments');
    })
    .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p>Loading comments…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Commentaires des étudiants</h2>
      {comments.length === 0 ? (
        <p className="text-gray-500">Aucun commentaire pour l'instant.</p>
      ) : (
        <div className="space-y-6">
          {comments.map(comment => (
            <div
              key={comment.id}
              className="border-b pb-4 last:border-b-0 last:pb-0"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{comment.user}</h3>
                  <p className="text-sm text-gray-600">{comment.course}</p>
                </div>
                <div className="flex items-center">
                  <span className="mr-1 text-sm text-gray-600">
                    {comment.rating}
                  </span>
                  <Star
                    className="h-4 w-4 text-yellow-500"
                    fill="currentColor"
                  />
                </div>
              </div>
              <p className="text-gray-700 mb-2">{comment.text}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{comment.date}</span>
                <button className="text-blue-600 hover:text-blue-800 text-sm">
                  Répondre
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Star, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { trainerData } from '../../data/trainerData';

export default function CommentSection() {
  const [comments] = useState(trainerData.comments);
  const [loading] = useState(false);
  const [error] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});

  const toggleReply = (commentId) => {
    setActiveReplyId(activeReplyId === commentId ? null : commentId);
    setReplyText('');
  };

  const toggleExpand = (commentId) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const handleReply = (commentId) => {
    // Here you would typically send the reply to your backend
    console.log(`Replying to comment ${commentId}:`, replyText);
    setReplyText('');
    setActiveReplyId(null);
  };

  // Placeholder comments for loading state
  const placeholderComments = [
    {
      id: 1,
      user: 'Chargement...',
      course: 'Chargement du cours...',
      rating: 0,
      text: 'Chargement du commentaire...',
      date: 'Chargement...'
    },
    {
      id: 2,
      user: 'Chargement...',
      course: 'Chargement du cours...',
      rating: 0,
      text: 'Chargement du commentaire...',
      date: 'Chargement...'
    }
  ];

  // Show placeholder comments while loading
  const displayComments = loading ? placeholderComments : comments;

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">Commentaires</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-700">Commentaires</h2>
        <span className="text-sm text-gray-500">{comments.length} commentaires</span>
      </div>
      
      {!loading && comments.length === 0 ? (
        <p className="text-gray-500">Aucun commentaire pour l'instant.</p>
      ) : (
        <div className="space-y-6">
          {displayComments.map(comment => (
            <div
              key={comment.id}
              className={`border rounded-lg p-4 ${loading ? 'animate-pulse' : ''} hover:shadow-md transition-shadow duration-200`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold text-gray-800 ${loading ? 'bg-gray-200 rounded h-4 w-32' : ''}`}>
                      {comment.user}
                    </h3>
                    <span className="text-xs text-gray-500">•</span>
                    <span className={`text-sm text-gray-600 ${loading ? 'bg-gray-200 rounded h-3 w-24' : ''}`}>
                      {comment.date}
                    </span>
                  </div>
                  <p className={`text-sm text-indigo-600 font-medium mt-1 ${loading ? 'bg-gray-200 rounded h-3 w-40' : ''}`}>
                    {comment.course}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                    <span className="mr-1 text-sm font-medium text-yellow-700">
                      {comment.rating}
                    </span>
                    <Star
                      className="h-4 w-4 text-yellow-500"
                      fill="currentColor"
                    />
                  </div>
                  <button
                    onClick={() => toggleExpand(comment.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expandedComments[comment.id] ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className={`${expandedComments[comment.id] ? 'block' : 'hidden'}`}>
                <p className={`text-gray-700 mb-4 ${loading ? 'bg-gray-200 rounded h-4 w-full' : ''}`}>
                  {comment.text}
                </p>

                {activeReplyId === comment.id ? (
                  <div className="mt-4 space-y-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Écrivez votre réponse..."
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      rows="3"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => toggleReply(comment.id)}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => handleReply(comment.id)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        Envoyer
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => toggleReply(comment.id)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                  >
                    <Send className="h-4 w-4" />
                    Répondre
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

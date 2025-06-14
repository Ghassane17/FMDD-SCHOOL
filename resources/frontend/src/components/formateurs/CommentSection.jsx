"use client"

import { useState, useEffect } from "react"
import { Star, Send, ChevronDown, ChevronUp, Trash2, MessageCircle, Clock, User } from "lucide-react"
import {
  getInstructorComments,
  getCommentReplies,
  storeCommentReply,
  deleteCommentReply,
} from "../../services/api_instructor"

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"

export default function CommentSection() {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [activeReplyId, setActiveReplyId] = useState(null)
  const [expandedComments, setExpandedComments] = useState({})
  const [replies, setReplies] = useState({})
  const [loadingReplies, setLoadingReplies] = useState({})
  const [submittingReply, setSubmittingReply] = useState(false)
  const [deletingReply, setDeletingReply] = useState(null)

  useEffect(() => {
    fetchComments()
  }, [])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await getInstructorComments()
      setComments(response.comments)
      setError(null)
    } catch (err) {
      setError(err.message || "Failed to fetch comments")
    } finally {
      setLoading(false)
    }
  }

  const fetchReplies = async (commentId) => {
    try {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: true }))
      const response = await getCommentReplies(commentId)
      setReplies((prev) => ({ ...prev, [commentId]: response.replies }))
    } catch (err) {
      console.error("Error fetching replies:", err)
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: false }))
    }
  }

  const toggleReply = (commentId) => {
    setActiveReplyId(activeReplyId === commentId ? null : commentId)
    setReplyText("")
  }

  const toggleExpand = async (commentId) => {
    const newExpandedState = !expandedComments[commentId]
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: newExpandedState,
    }))

    // Fetch replies when expanding a comment
    if (newExpandedState && !replies[commentId]) {
      await fetchReplies(commentId)
    }
  }

  const handleReply = async (commentId) => {
    if (!replyText.trim()) return

    try {
      setSubmittingReply(true)
      const response = await storeCommentReply(commentId, { reply: replyText })

      // Update the replies for this comment
      setReplies((prev) => ({
        ...prev,
        [commentId]: [...(prev[commentId] || []), response.reply],
      }))

      setReplyText("")
      setActiveReplyId(null)
    } catch (err) {
      console.error("Failed to send reply:", err)
      setError("Failed to send reply. Please try again.")
    } finally {
      setSubmittingReply(false)
    }
  }

  const handleDeleteReply = async (commentId, replyId) => {
    try {
      setDeletingReply(replyId)
      await deleteCommentReply(replyId)

      // Update the replies for this comment by removing the deleted reply
      setReplies((prev) => ({
        ...prev,
        [commentId]: prev[commentId].filter((reply) => reply.id !== replyId),
      }))
    } catch (err) {
      console.error("Failed to delete reply:", err)
      setError("Failed to delete reply. Please try again.")
    } finally {
      setDeletingReply(null)
    }
  }

  const getRatingColor = (rating) => {
    if (rating >= 4) return "text-emerald-600 bg-emerald-50 border-emerald-200"
    if (rating >= 3) return "text-amber-600 bg-amber-50 border-amber-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "text-amber-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  // Placeholder comments for loading state
  const placeholderComments = [
    {
      id: 1,
      user: "Chargement...",
      course: "Chargement du cours...",
      rating: 0,
      text: "Chargement du commentaire...",
      date: "Chargement...",
    },
    {
      id: 2,
      user: "Chargement...",
      course: "Chargement du cours...",
      rating: 0,
      text: "Chargement du commentaire...",
      date: "Chargement...",
    },
  ]

  // Show placeholder comments while loading
  const displayComments = loading ? placeholderComments : comments

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <MessageCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-800">Commentaires</h2>
        </div>
        <div className="bg-white rounded-lg p-4 border border-red-200">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Commentaires des Étudiants</h2>
              <p className="text-blue-100 text-sm">Gérez les retours de vos apprenants</p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="text-white font-semibold">{comments.length} commentaires</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8">
        {!loading && comments.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <MessageCircle className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Aucun commentaire</h3>
            <p className="text-slate-500">Les commentaires de vos étudiants apparaîtront ici.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayComments.map((comment) => (
              <div
                key={comment.id}
                className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
                  loading ? "animate-pulse" : ""
                }`}
              >
                {/* Comment Header */}
                <div className="p-6 border-b border-slate-100">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="relative">
                        {comment.user_avatar ? (
                          <img
                            src={API_URL + comment.user_avatar || "/placeholder.svg"}
                            alt={comment.user}
                            className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3
                            className={`font-semibold text-slate-800 ${loading ? "bg-slate-200 rounded h-5 w-32" : ""}`}
                          >
                            {comment.user}
                          </h3>
                          <span className="text-slate-400">•</span>
                          <div className="flex items-center text-slate-500 text-sm">
                            <Clock className="h-4 w-4 mr-1" />
                            <span className={loading ? "bg-slate-200 rounded h-4 w-20" : ""}>{comment.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <p
                            className={`text-sm font-medium text-indigo-600 ${loading ? "bg-slate-200 rounded h-4 w-40" : ""}`}
                          >
                            📚 {comment.course}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Rating Display */}
                      <div
                        className={`flex items-center space-x-2 px-3 py-2 rounded-full border ${getRatingColor(comment.rating)}`}
                      >
                        <span className="font-bold text-sm">{comment.rating}</span>
                        <div className="flex space-x-1">{getRatingStars(comment.rating)}</div>
                      </div>

                      {/* Expand Button */}
                      <button
                        onClick={() => toggleExpand(comment.id)}
                        className="p-2 rounded-full hover:bg-slate-100 transition-colors duration-200"
                      >
                        {expandedComments[comment.id] ? (
                          <ChevronUp className="h-5 w-5 text-slate-600" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                <div className={`${expandedComments[comment.id] ? "block" : "hidden"}`}>
                  {/* Comment Text */}
                  <div className="px-6 py-4 bg-slate-50">
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <p
                        className={`text-slate-700 leading-relaxed ${loading ? "bg-slate-200 rounded h-4 w-full" : ""}`}
                      >
                        {comment.text}
                      </p>
                    </div>
                  </div>

                  {/* Replies Section */}
                  {loadingReplies[comment.id] ? (
                    <div className="px-6 py-4 space-y-3">
                      <div className="animate-pulse">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : replies[comment.id] && replies[comment.id].length > 0 ? (
                    <div className="px-6 py-4 space-y-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="h-px bg-slate-200 flex-1"></div>
                        <span className="text-sm font-medium text-slate-500 px-3">Vos réponses</span>
                        <div className="h-px bg-slate-200 flex-1"></div>
                      </div>

                      {replies[comment.id].map((reply) => (
                        <div
                          key={reply.id}
                          className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border-l-4 border-indigo-400"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              {reply.instructor?.user?.avatar ? (
                                <img
                                  src={API_URL + reply.instructor.user.avatar || "/placeholder.svg"}
                                  alt={reply.instructor.user.name}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-white"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center">
                                  <User className="h-6 w-6 text-white" />
                                </div>
                              )}
                              <div>
                                <span className="font-semibold text-slate-800 text-sm">
                                  {reply.instructor?.user?.name}
                                </span>
                                <span className="text-indigo-600 text-xs ml-2 bg-indigo-100 px-2 py-1 rounded-full">
                                  Instructeur
                                </span>
                                <div className="flex items-center text-slate-500 text-xs mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {reply.created_at.split("T")[0] + " | " + reply.created_at.split("T")[1].split(":")[0] + ":" + reply.created_at.split("T")[1].split(":")[1]}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteReply(comment.id, reply.id)}
                              disabled={deletingReply === reply.id}
                              className={`p-2 rounded-full hover:bg-red-100 transition-colors duration-200 ${
                                deletingReply === reply.id
                                  ? "opacity-50 cursor-not-allowed"
                                  : "text-red-500 hover:text-red-700"
                              }`}
                            >
                              {deletingReply === reply.id ? (
                                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          <p className="text-slate-700 text-sm leading-relaxed pl-11">{reply.reply}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {/* Reply Form */}
                  <div className="px-6 py-4 border-t border-slate-100 bg-white">
                    {activeReplyId === comment.id ? (
                      <div className="space-y-4">
                        <div className="relative">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Rédigez une réponse professionnelle et constructive..."
                            className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all duration-200 bg-slate-50 focus:bg-white"
                            rows="4"
                            disabled={submittingReply}
                          />
                          <div className="absolute bottom-3 right-3 text-xs text-slate-400">{replyText.length}/500</div>
                        </div>

                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => toggleReply(comment.id)}
                            disabled={submittingReply}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={() => handleReply(comment.id)}
                            disabled={!replyText.trim() || submittingReply}
                            className={`px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 ${
                              !replyText.trim() || submittingReply
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg transform hover:scale-105"
                            }`}
                          >
                            {submittingReply ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Envoi...</span>
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4" />
                                <span>Envoyer la réponse</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleReply(comment.id)}
                        className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md"
                      >
                        <Send className="h-4 w-4" />
                        <span>Répondre à ce commentaire</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

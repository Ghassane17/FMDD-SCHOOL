"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import {
  Send,
  Edit3,
  Trash2,
  Reply,
  X,
  Check,
  MessageCircle,
  Clock,
  Loader,
  MoreVertical,
  Users,
  Sparkles,
  Hash,
  Star,
  AlertTriangle,
} from "lucide-react"
import { getChatMessages, sendChatMessage, updateChatMessage, deleteChatMessage } from "../../services/api_chat"

const API_URL = import.meta.env.VITE_BACKEND_URL

/**
 * Confirmation Modal Component
 */
function ConfirmationModal({ isOpen, onConfirm, onCancel, title, message, confirmText = "Supprimer", cancelText = "Annuler" }) {
  const modalRef = useRef(null)

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onCancel])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onCancel()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 max-w-md w-full animate-slideUp"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <p className="text-slate-600 text-sm">Action irréversible</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          <p className="text-slate-700 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="px-8 py-6 border-t border-slate-200/50 flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition-all duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

/**
 * Dropdown Menu component that is rendered in a portal-like fashion
 */
function DropdownMenu({
  msg,
  coords,
  onClose,
  onEdit,
  onDelete,
  onReply,
  isParent,
  isOwnMessage,
  canDelete,
}) {
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside of it
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose()
      }
    }
    // Use mousedown to capture event before a potential click on another element
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [onClose])

  if (!coords) return null

  return (
    <div
      ref={dropdownRef}
      onClick={(e) => e.stopPropagation()}
      className="absolute w-48 bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-2xl z-50 py-2 animate-slideDown"
      style={{
        top: `${coords.top}px`,
        right: `${coords.right}px`,
        transform: coords.transform,
      }}
    >
      {isParent && (
        <button
          onClick={onReply}
          className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 flex items-center gap-3 transition-colors duration-200 font-medium"
        >
          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
            <Reply className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p>Répondre</p>
            <p className="text-xs text-slate-500">Répondre à ce message</p>
          </div>
        </button>
      )}
      {isOwnMessage && (
        <button
          onClick={onEdit}
          className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-amber-50 flex items-center gap-3 transition-colors duration-200 font-medium"
        >
          <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
            <Edit3 className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p>Modifier</p>
            <p className="text-xs text-slate-500">Éditer ce message</p>
          </div>
        </button>
      )}
      {canDelete && (
        <button
          onClick={onDelete}
          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors duration-200 font-medium"
        >
          <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
            <Trash2 className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <p>Supprimer</p>
            <p className="text-xs text-red-500">Supprimer définitivement</p>
          </div>
        </button>
      )}
    </div>
  )
}

/**
 * Enhanced Message Component
 */
function MessageItem({
  msg,
  onReply,
  openDropdown,
  isParent,
  currentUserId,
  currentUser,
  messageIndex,
  isReply = false,
}) {
  const username = msg.user?.username || "Utilisateur inconnu"
  const userId = msg.user?.id
  const userAvatar = msg.user?.avatar
  const userRole = msg.user?.role
  const isOwnMessage = userId && userId === currentUserId
  const triggerRef = useRef(null)

  const canDelete = isOwnMessage || currentUser.role === "instructor"

  const messageTime = new Date(msg.created_at).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })

  const handleDropdownClick = (e) => {
    e.stopPropagation()
    openDropdown(msg.id, triggerRef.current)
  }

  const getAvatarGradient = (name) => {
    const colors = [
      "from-blue-500 to-indigo-600",
      "from-purple-500 to-pink-600",
      "from-green-500 to-emerald-600",
      "from-orange-500 to-red-600",
      "from-teal-500 to-cyan-600",
      "from-violet-500 to-purple-600",
      "from-rose-500 to-pink-600",
      "from-amber-500 to-orange-600",
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'learner':
        return 'Apprenant'
      case 'instructor':
        return 'Instructeur'
      default:
        return 'Utilisateur'
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'learner':
        return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700'
      case 'instructor':
        return 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700'
      default:
        return 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600'
    }
  }

  return (
    <div
      className={`group relative animate-fadeIn ${isReply ? "opacity-95" : ""}`}
      style={{ animationDelay: `${messageIndex * 100}ms` }}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {userAvatar ? (
            <div className={`${isReply ? "w-12 h-12" : "w-14 h-14"} rounded-full overflow-hidden shadow-lg ring-2 ring-white`}>
              <img 
                src={API_URL + userAvatar} 
                alt={username}
                className="w-full h-full object-cover img-crisp"
                onError={(e) => {
                  // Fallback to gradient if image fails to load
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div 
                className={`w-full h-full bg-gradient-to-br ${getAvatarGradient(username)} flex items-center justify-center text-white text-sm font-bold`}
                style={{ display: 'none' }}
              >
                {username.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <div
              className={`${isReply ? "w-12 h-12" : "w-14 h-14"} rounded-full bg-gradient-to-br ${getAvatarGradient(username)} flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-white`}
            >
              {username.charAt(0).toUpperCase()}
            </div>
          )}
          {!isReply && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <span className="font-bold text-slate-900">{username}</span>
            {userRole && (
              <div className={`px-2 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 ${getRoleBadgeColor(userRole)}`}>
                <Star className="h-3 w-3" />
                {getRoleLabel(userRole)}
              </div>
            )}
            {isOwnMessage && (
              <div className="px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-semibold rounded-lg">
                Vous
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              <span>{messageTime}</span>
              {isParent && (
                <div className="px-2 py-1 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 rounded-lg font-medium flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  Discussion
                </div>
              )}
            </div>
          </div>

          {/* Message Bubble */}
          <div className="relative max-w-2xl">
            <div
              className={`relative rounded-2xl px-6 py-4 shadow-lg hover:shadow-xl transition-all duration-300 border backdrop-blur-sm ${
                isOwnMessage
                  ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50"
                  : "bg-white/90 border-slate-200/50 hover:bg-white"
              } ${isReply ? "rounded-xl px-4 py-3" : ""}`}
            >
              <p className={`text-slate-800 leading-relaxed ${isReply ? "text-sm" : ""}`}>{msg.content}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            {isParent && (
              <button
                onClick={onReply}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-600 hover:text-blue-600 bg-slate-100/80 hover:bg-blue-50 rounded-xl transition-all duration-200 font-medium"
              >
                <Reply className="h-3 w-3" />
                Répondre
              </button>
            )}
          </div>
        </div>

        {/* 3-dots Menu */}
        {(isOwnMessage || canDelete || isParent) && (
          <div className="relative flex-shrink-0">
            <button
              ref={triggerRef}
              onClick={handleDropdownClick}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Modern Course Chat Component for E-Learning Platform
 */
export default function CourseChat() {
  const { courseId } = useParams()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [replyTo, setReplyTo] = useState(null)
  const [editing, setEditing] = useState({ id: null, text: "" })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [dropdownCoords, setDropdownCoords] = useState(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, messageId: null })
  
  const messagesEndRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const chatContainerRef = useRef(null)

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}")
  const currentUserId = currentUser.id

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (courseId) {
      fetchMessages()
    }
  }, [courseId])

  const openDropdown = (messageId, triggerEl) => {
    if (!triggerEl || !scrollContainerRef.current || !chatContainerRef.current) return

    const scrollRect = scrollContainerRef.current.getBoundingClientRect()
    const triggerRect = triggerEl.getBoundingClientRect()
    const chatRect = chatContainerRef.current.getBoundingClientRect()

    // Don't open if the trigger is not fully visible in the scroll container
    if (triggerRect.top < scrollRect.top || triggerRect.bottom > scrollRect.bottom) {
      return
    }

    const triggerMidY = triggerRect.top + triggerRect.height / 2
    const scrollMidY = scrollRect.top + scrollRect.height / 2
    const isAbove = triggerMidY > scrollMidY

    let top = triggerRect.bottom - chatRect.top + 4
    let transform = ""
    if (isAbove) {
      top = triggerRect.top - chatRect.top - 4
      transform = "translateY(-100%)"
    }
    
    const right = chatRect.right - triggerRect.right;

    setDropdownCoords({ top, right, transform })
    setActiveDropdown(messageId)
  }

  const closeDropdown = () => setActiveDropdown(null)

  async function fetchMessages() {
    if (!loading) setLoading(true)
    try {
      const response = await getChatMessages(courseId)
      setMessages(response.messages)
      setError("")
    } catch (e) {
      setError("Impossible de charger le chat")
    } finally {
      setLoading(false)
    }
  }

  async function handleSend() {
    if (!newMessage.trim() || sending) return
    setSending(true)
    try {
      await sendChatMessage(courseId, newMessage, replyTo)
      setNewMessage("")
      setReplyTo(null)
      await fetchMessages()
    } catch (e) {
      setError("Envoi du message échoué")
    } finally {
      setSending(false)
    }
  }

  function startEdit(msg) {
    setEditing({ id: msg.id, text: msg.content })
    setReplyTo(null)
    closeDropdown()
  }

  async function submitEdit() {
    if (!editing.text.trim()) return
    try {
      await updateChatMessage(courseId, editing.id, editing.text)
      setEditing({ id: null, text: "" })
      await fetchMessages()
    } catch (e) {
      setError("Mise à jour échouée")
    }
  }

  function showDeleteConfirmation(messageId) {
    setDeleteConfirmation({ isOpen: true, messageId })
    closeDropdown()
  }

  async function confirmDelete() {
    if (!deleteConfirmation.messageId) return
    
    try {
      await deleteChatMessage(courseId, deleteConfirmation.messageId)
      await fetchMessages()
      setDeleteConfirmation({ isOpen: false, messageId: null })
    } catch (e) {
      setError("Suppression échouée")
      setDeleteConfirmation({ isOpen: false, messageId: null })
    }
  }

  function cancelDelete() {
    setDeleteConfirmation({ isOpen: false, messageId: null })
  }

  function handleReply(msg) {
    if (!msg.parent_message_id) {
      setReplyTo(msg.id)
      closeDropdown()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (editing.id) {
        submitEdit()
      } else {
        handleSend()
      }
    }
  }

  const getParentMessage = (parentId) => {
    return messages.find((msg) => msg.id === parentId)
  }

  const totalMessages = messages.reduce((count, msg) => {
    return count + 1 + (msg.replies ? msg.replies.length : 0)
  }, 0)
  
  // Find the active message for the dropdown
  let messageForDropdown = null;
  if (activeDropdown) {
    for (const parentMsg of messages) {
      if (parentMsg.id === activeDropdown) {
        messageForDropdown = parentMsg;
        break;
      }
      if (parentMsg.replies) {
        const reply = parentMsg.replies.find(r => r.id === activeDropdown);
        if (reply) {
          messageForDropdown = reply;
          break;
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[700px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-3xl border border-slate-200/50 backdrop-blur-sm">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Loader className="h-8 w-8 animate-spin text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-white animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">Chargement du chat</h3>
            <p className="text-slate-600">Préparation de votre espace de discussion...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={chatContainerRef} className="max-w-full mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50 relative">
      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .animate-slideDown { animation: slideDown 0.2s ease-out forwards; }
        .img-crisp {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }
      `}</style>
      
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-8 py-6">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageCircle className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Hash className="h-4 w-4 text-blue-300" />
                <h2 className="text-xl font-bold text-white">Discussion du cours</h2>
              </div>
              <p className="text-blue-100 text-sm flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                Échangez avec vos collègues apprenants
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-white/80 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">{totalMessages}</span>
            <span className="text-xs text-white/60">messages</span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div ref={scrollContainerRef} className="h-[600px] overflow-y-auto bg-gradient-to-b from-slate-50/50 to-white/50 backdrop-blur-sm relative">
        {error && (
          <div className="m-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-2xl text-red-700 text-sm flex items-center gap-3 shadow-sm backdrop-blur-sm">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <X className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="font-medium">Erreur de connexion</p>
              <p className="text-red-600/80">{error}</p>
            </div>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="text-center py-20 h-full flex flex-col justify-center items-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 rounded-3xl" />
            <div className="relative space-y-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                  <MessageCircle className="h-12 w-12 text-slate-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800">Commencez la conversation</h3>
                <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                  Soyez le premier à partager vos idées et à engager la discussion avec vos collègues !
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-500">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 space-y-8 relative">
            {messages.map((msg, index) => (
              <div key={msg.id} className="space-y-4 relative">
                <MessageItem
                  msg={msg}
                  onReply={() => handleReply(msg)}
                  openDropdown={openDropdown}
                  isParent={true}
                  currentUserId={currentUserId}
                  currentUser={currentUser}
                  messageIndex={index}
                />
                {msg.replies && msg.replies.length > 0 && (
                  <div className="ml-16 pl-6 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-blue-200 via-indigo-200 to-transparent" />
                    <div className="absolute left-0 top-6 w-6 h-px bg-gradient-to-r from-blue-200 to-transparent" />
                    <div className="space-y-4">
                      {msg.replies.map((reply, replyIndex) => (
                        <div key={reply.id} className="relative">
                          <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
                            <div className="w-4 h-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                              <Reply className="h-2 w-2 text-blue-600" />
                            </div>
                            <span className="font-medium">Réponse à</span>
                            <span className="text-slate-700 font-semibold">{msg.user?.username}</span>
                          </div>
                          <MessageItem
                            msg={reply}
                            onReply={() => {}}
                            openDropdown={openDropdown}
                            isParent={false}
                            currentUserId={currentUserId}
                            currentUser={currentUser}
                            messageIndex={replyIndex}
                            isReply={true}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Global Dropdown Menu */}
      {messageForDropdown && (
        <DropdownMenu
          msg={messageForDropdown}
          coords={dropdownCoords}
          onClose={closeDropdown}
          onEdit={() => startEdit(messageForDropdown)}
          onDelete={() => showDeleteConfirmation(messageForDropdown.id)}
          onReply={() => handleReply(messageForDropdown)}
          isParent={!messageForDropdown.parent_message_id}
          isOwnMessage={messageForDropdown.user?.id === currentUserId}
          canDelete={messageForDropdown.user?.id === currentUserId || currentUser.role === "instructor"}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title="Supprimer le message"
        message="Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible et supprimera également toutes les réponses associées."
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
      />

      {/* Reply/Edit Indicator */}
      {(replyTo || editing.id) && (
        <div className="px-8 py-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-t border-blue-100/50 backdrop-blur-sm relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-transparent" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {replyTo && (
                <div className="flex items-center space-x-3 text-blue-700">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Reply className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Répondre à {getParentMessage(replyTo)?.user?.username}</p>
                    <p className="text-xs text-blue-600">Appuyez sur Échap pour annuler</p>
                  </div>
                </div>
              )}
              {editing.id && (
                <div className="flex items-center space-x-3 text-amber-700">
                  <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Edit3 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Modifier le message</p>
                    <p className="text-xs text-amber-600">Appuyez sur Échap pour annuler</p>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setReplyTo(null)
                setEditing({ id: null, text: "" })
              }}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-white/50 rounded-xl transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Simple Input Area */}
      <div className="px-8 py-6 bg-white/80 backdrop-blur-xl border-t border-slate-200/50 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50/30 to-transparent" />
        <div className="relative flex items-center space-x-4">
          <div className="relative flex-shrink-0">
            {currentUser.avatar ? (
              <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg">
                <img 
                  src={API_URL + currentUser.avatar} 
                  alt={currentUser.username}
                  className="w-full h-full object-cover img-crisp"
                  onError={(e) => {
                    // Fallback to gradient if image fails to load
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div 
                  className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold"
                  style={{ display: 'none' }}
                >
                  {currentUser.username?.charAt(0).toUpperCase() || "U"}
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-lg">
                {currentUser.username?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
          </div>

          <div className="flex-1">
            <input
              type="text"
              value={editing.id ? editing.text : newMessage}
              onChange={(e) =>
                editing.id ? setEditing((p) => ({ ...p, text: e.target.value })) : setNewMessage(e.target.value)
              }
              onKeyPress={handleKeyPress}
              placeholder={
                editing.id ? "Modifier le message..." : replyTo ? "Écrire une réponse..." : "Tapez votre message..."
              }
              className="w-full px-6 py-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 text-slate-800 placeholder-slate-400"
              disabled={sending}
            />
          </div>

          <button
            onClick={editing.id ? submitEdit : handleSend}
            disabled={sending || (editing.id ? !editing.text.trim() : !newMessage.trim())}
            className={`px-6 py-4 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 min-w-[120px] ${
              sending || (editing.id ? !editing.text.trim() : !newMessage.trim())
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
            }`}
          >
            {sending ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                Envoi...
              </>
            ) : editing.id ? (
              <>
                <Check className="h-5 w-5" />
                Modifier
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Envoyer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

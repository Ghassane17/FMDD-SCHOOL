import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    deleteAllNotifications
} from '../../services/api_instructor';
import {
    Bell,
    Check,
    CheckCheck,
    Trash2,
    Search,
    Calendar,
    Info,
    CheckCircle,
    XCircle,
    Loader2,
    ExternalLink,
    MessageSquare,
    X
} from 'lucide-react';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);

    // Notification type icons and colors
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'course_approved':
            case 'course_published':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'course_rejected':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'changes_requested':
                return <Info className="w-5 h-5 text-orange-500" />;
            case 'new_comment':
            case 'new_enrollment':
                return <Info className="w-5 h-5 text-blue-500" />;
            case 'payment_received':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            default:
                return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'course_approved':
            case 'course_published':
            case 'payment_received':
                return 'border-green-200 bg-green-50';
            case 'course_rejected':
                return 'border-red-200 bg-red-50';
            case 'changes_requested':
                return 'border-orange-200 bg-orange-50';
            case 'new_comment':
            case 'new_enrollment':
                return 'border-blue-200 bg-blue-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await getNotifications();
            setNotifications(response.notifications || []);
            setFilteredNotifications(response.notifications || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Filter notifications
    useEffect(() => {
        let filtered = notifications;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(notification =>
                notification.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                notification.type.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(notification => notification.type === filterType);
        }

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(notification =>
                filterStatus === 'read' ? notification.read : !notification.read
            );
        }

        setFilteredNotifications(filtered);
    }, [notifications, searchTerm, filterType, filterStatus]);

    // Mark notification as read
    const handleMarkAsRead = async (notificationId) => {
        try {
            setActionLoading(true);
            await markNotificationAsRead(notificationId);
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId ? { ...notif, read: true } : notif
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        } finally {
            setActionLoading(false);
        }
    };

    // Mark all notifications as read
    const handleMarkAllAsRead = async () => {
        try {
            setActionLoading(true);
            await markAllNotificationsAsRead();
            setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        } finally {
            setActionLoading(false);
        }
    };

    // Delete notification
    const handleDeleteNotification = async (notificationId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
            return;
        }

        try {
            setActionLoading(true);
            await deleteNotification(notificationId);
            setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
            setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
        } catch (error) {
            console.error('Error deleting notification:', error);
        } finally {
            setActionLoading(false);
        }
    };

    // Delete all notifications
    const handleDeleteAllNotifications = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
            return;
        }

        try {
            setActionLoading(true);
            await deleteAllNotifications();
            setNotifications([]);
            setSelectedNotifications([]);
        } catch (error) {
            console.error('Error deleting all notifications:', error);
        } finally {
            setActionLoading(false);
        }
    };

    // Handle checkbox selection
    const handleSelectNotification = (notificationId) => {
        setSelectedNotifications(prev =>
            prev.includes(notificationId)
                ? prev.filter(id => id !== notificationId)
                : [...prev, notificationId]
        );
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedNotifications.length === filteredNotifications.length) {
            setSelectedNotifications([]);
        } else {
            setSelectedNotifications(filteredNotifications.map(notif => notif.id));
        }
    };

    // Check if notification type should be clickable (exclude course_rejected since course is deleted)
    const isClickableNotification = (type) => {
        return ['course_approved', 'changes_requested'].includes(type);
    };

    // Check if notification has admin message
    const hasAdminMessage = (notification) => {
        return notification.data?.message && notification.data.message.trim() !== '';
    };

    // Handle showing admin message
    const handleShowMessage = (notification) => {
        setSelectedMessage({
            type: notification.type,
            message: notification.data.message,
            date: notification.date
        });
        setShowMessageModal(true);
    };

    // Handle notification title click
    const handleNotificationClick = (notification) => {
        if (isClickableNotification(notification.type) && notification.data?.course_id) {
            // Mark as read if not already read
            if (!notification.read) {
                handleMarkAsRead(notification.id);
            }
            // Navigate to manage course page
            navigate(`/instructor/manage-course/${notification.data.course_id}`);
        }
    };

    // Get unique notification types for filter
    const notificationTypes = [...new Set(notifications.map(notif => notif.type))];

    // Statistics
    const unreadCount = notifications.filter(notif => !notif.read).length;
    const totalCount = notifications.length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="text-gray-600">Chargement des notifications...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                                <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                                Notifications
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                                {totalCount} notification{totalCount !== 1 ? 's' : ''} au total,
                                {unreadCount} non lue{unreadCount !== 1 ? 's' : ''}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    disabled={actionLoading}
                                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base cursor-pointer"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                    <span className="hidden sm:inline">Tout marquer comme lu</span>
                                    <span className="sm:hidden">Marquer tout lu</span>
                                </button>
                            )}

                            {totalCount > 0 && (
                                <button
                                    onClick={handleDeleteAllNotifications}
                                    disabled={actionLoading}
                                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm sm:text-base cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Tout supprimer</span>
                                    <span className="sm:hidden">Supprimer tout</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
                        {/* Search */}
                        <div className="relative sm:col-span-2 lg:col-span-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Type Filter */}
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tous les types</option>
                            {notificationTypes.map(type => (
                                <option key={type} value={type}>
                                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="unread">Non lues</option>
                            <option value="read">Lues</option>
                        </select>

                        {/* Select All */}
                        <div className="flex items-center gap-2 sm:justify-center lg:justify-start">
                            <input
                                type="checkbox"
                                id="selectAll"
                                checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                                onChange={handleSelectAll}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="selectAll" className="text-sm text-gray-700">
                                Tout sélectionner
                            </label>
                        </div>
                    </div>
                </div>

                {/* Notifications List */}
                {filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
                        <Bell className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                            {notifications.length === 0 ? 'Aucune notification' : 'Aucun résultat'}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-500">
                            {notifications.length === 0
                                ? 'Vous n\'avez pas encore reçu de notifications.'
                                : 'Aucune notification ne correspond à vos critères de recherche.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`bg-white rounded-lg shadow-sm border-l-4 transition-all duration-200 hover:shadow-md ${
                                    !notification.read
                                        ? `${getNotificationColor(notification.type)} border-l-blue-500`
                                        : 'border-l-gray-200 bg-white'
                                }`}
                            >
                                <div className="p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
                                        <div className="flex items-start gap-3 sm:gap-4 flex-1">
                                            {/* Checkbox */}
                                            <input
                                                type="checkbox"
                                                checked={selectedNotifications.includes(notification.id)}
                                                onChange={() => handleSelectNotification(notification.id)}
                                                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                                            />

                                            {/* Icon */}
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(notification.type)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                                    {isClickableNotification(notification.type) && notification.data?.course_id ? (
                                                        <h3
                                                            className="text-base sm:text-lg font-semibold text-blue-600 capitalize cursor-pointer hover:text-blue-800 hover:underline transition-colors flex items-center gap-2"
                                                            onClick={() => handleNotificationClick(notification)}
                                                            title="Cliquez pour gérer le cours"
                                                        >
                                                            {notification.type.replace(/_/g, ' ')}
                                                            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        </h3>
                                                    ) : (
                                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 capitalize">
                                                            {notification.type.replace(/_/g, ' ')}
                                                        </h3>
                                                    )}
                                                    {!notification.read && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 self-start">
                                                            Nouveau
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-sm sm:text-base text-gray-700 mb-3 leading-relaxed">
                                                    {notification.text}
                                                </p>

                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        <span className="truncate">{notification.date}</span>
                                                    </div>

                                                    {hasAdminMessage(notification) && (
                                                        <div className="flex items-center gap-1 text-orange-600">
                                                            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            <span className="hidden sm:inline">Message admin</span>
                                                            <span className="sm:hidden">Admin</span>
                                                        </div>
                                                    )}

                                                    {notification.data && Object.keys(notification.data).length > 0 && !hasAdminMessage(notification) && (
                                                        <div className="flex items-center gap-1">
                                                            <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            <span className="hidden sm:inline">Données supplémentaires</span>
                                                            <span className="sm:hidden">Données</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-end gap-1 sm:gap-2 sm:ml-4 flex-shrink-0">
                                            {hasAdminMessage(notification) && (
                                                <button
                                                    onClick={() => handleShowMessage(notification)}
                                                    className="p-1.5 sm:p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
                                                    title="Voir le message de l'administrateur"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                </button>
                                            )}

                                            {!notification.read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    disabled={actionLoading}
                                                    className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
                                                    title="Marquer comme lu"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleDeleteNotification(notification.id)}
                                                disabled={actionLoading}
                                                className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Bulk Actions */}
                {selectedNotifications.length > 0 && (
                    <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 sm:p-4 z-40">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                            <span className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                                {selectedNotifications.length} notification{selectedNotifications.length !== 1 ? 's' : ''} sélectionnée{selectedNotifications.length !== 1 ? 's' : ''}
                            </span>

                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                                <button
                                    onClick={() => {
                                        selectedNotifications.forEach(id => handleMarkAsRead(id));
                                        setSelectedNotifications([]);
                                    }}
                                    disabled={actionLoading}
                                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-xs sm:text-sm flex-1 sm:flex-none justify-center"
                                >
                                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">Marquer comme lues</span>
                                    <span className="sm:hidden">Marquer</span>
                                </button>

                                <button
                                    onClick={() => {
                                        if (window.confirm(`Supprimer ${selectedNotifications.length} notification${selectedNotifications.length !== 1 ? 's' : ''} ?`)) {
                                            selectedNotifications.forEach(id => handleDeleteNotification(id));
                                            setSelectedNotifications([]);
                                        }
                                    }}
                                    disabled={actionLoading}
                                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-xs sm:text-sm flex-1 sm:flex-none justify-center"
                                >
                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">Supprimer</span>
                                    <span className="sm:hidden">Suppr.</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Message Modal */}
                {showMessageModal && selectedMessage && (
                    <div className="fixed inset-0 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] sm:max-h-[85vh] overflow-y-auto transform transition-all duration-300 scale-100">
                            <div className="p-4 sm:p-6 lg:p-8">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="p-2 sm:p-3 rounded-full bg-orange-100 flex-shrink-0">
                                            {getNotificationIcon(selectedMessage.type)}
                                        </div>
                                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                                            Message de l'administrateur
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setShowMessageModal(false)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors self-end sm:self-auto"
                                    >
                                        <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="space-y-4 sm:space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Type de notification</p>
                                            <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 capitalize">
                                                {selectedMessage.type.replace(/_/g, ' ')}
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                            <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">Date</p>
                                            <p className="text-sm sm:text-base lg:text-lg text-gray-900">{selectedMessage.date}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-base sm:text-lg font-medium text-gray-700 mb-3 sm:mb-4">Message de l'administrateur:</p>
                                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 sm:p-6 border-l-4 border-orange-400 shadow-sm">
                                            <p className="text-gray-800 leading-relaxed text-sm sm:text-base lg:text-lg">
                                                {selectedMessage.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="mt-6 sm:mt-8 flex justify-end border-t border-gray-200 pt-4 sm:pt-6">
                                    <button
                                        onClick={() => setShowMessageModal(false)}
                                        className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm sm:text-base lg:text-lg hover:scale-105 duration-300 hover:shadow-lg cursor-pointer"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
import { useContext, useEffect, useState } from 'react';
import { Bell, CheckCheck, MessageCircle, Package, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const formatNotificationDate = (value) => new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
});

const NotificationCenter = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        const loadNotifications = async () => {
            try {
                const response = await axios.get(`${API}/notifications`);
                if (!active) return;
                setNotifications(response.data.data || []);
                setUnreadCount(Number(response.data.unread_count || 0));
                setError('');
            } catch (requestError) {
                if (active) setError(requestError.response?.data?.message || 'Notifications are temporarily unavailable.');
            } finally {
                if (active) setIsLoading(false);
            }
        };

        loadNotifications();
        const interval = window.setInterval(loadNotifications, 20000);
        const refreshOnFocus = () => loadNotifications();
        window.addEventListener('focus', refreshOnFocus);
        return () => {
            active = false;
            window.clearInterval(interval);
            window.removeEventListener('focus', refreshOnFocus);
        };
    }, [user?.id]);

    const handleNotificationClick = async (notification) => {
        setIsOpen(false);
        if (!notification.is_read) {
            setNotifications((current) => current.map((item) => (
                item.notification_id === notification.notification_id ? { ...item, is_read: 1 } : item
            )));
            setUnreadCount((current) => Math.max(0, current - 1));
            try {
                await axios.post(`${API}/notifications/${notification.notification_id}/read`);
            } catch {
                // The next refresh reconciles the badge with persisted read state.
            }
        }

        if (notification.notification_type === 'SELLER_REPLY' && notification.conversation_id) {
            navigate(`/messages?conversationId=${notification.conversation_id}`);
        } else if (notification.order_id) {
            navigate(`/orders?orderId=${notification.order_id}`);
        }
    };

    const markAllRead = async () => {
        try {
            await axios.post(`${API}/notifications/read-all`);
            setNotifications((current) => current.map((item) => ({ ...item, is_read: 1 })));
            setUnreadCount(0);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not mark notifications as read.');
        }
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
                aria-expanded={isOpen}
                title="Notifications"
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${isOpen
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-800'}`}
            >
                <Bell size={21} strokeWidth={1.7} />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-gray-900">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <button
                        type="button"
                        aria-label="Close notifications"
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 z-40 cursor-default"
                    />
                    <section className="absolute right-0 top-full z-50 mt-3 w-[min(390px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/15 dark:border-gray-700 dark:bg-gray-900">
                        <header className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5 dark:border-gray-800">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h2>
                                    {unreadCount > 0 && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{unreadCount} new</span>}
                                </div>
                                <p className="mt-0.5 text-[11px] text-gray-500">Order updates and seller replies</p>
                            </div>
                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={markAllRead}
                                        title="Mark all as read"
                                        aria-label="Mark all notifications as read"
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary dark:hover:bg-gray-800"
                                    >
                                        <CheckCheck size={17} />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    title="Close notifications"
                                    aria-label="Close notifications"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <X size={17} />
                                </button>
                            </div>
                        </header>

                        <div className="max-h-[min(65vh,520px)] overflow-y-auto">
                            {error && <p role="alert" className="m-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-gray-500">
                                    <span className="loading loading-spinner loading-sm text-primary" /> Loading updates
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="px-6 py-10 text-center">
                                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                        <Bell size={21} />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">You’re all caught up</p>
                                    <p className="mt-1 text-xs text-gray-500">Order updates and seller replies will appear here.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {notifications.map((notification) => {
                                        const isUnread = !notification.is_read;
                                        const isReply = notification.notification_type === 'SELLER_REPLY';
                                        const Icon = isReply ? MessageCircle : Package;
                                        return (
                                            <button
                                                type="button"
                                                key={notification.notification_id}
                                                onClick={() => handleNotificationClick(notification)}
                                                className={`flex w-full gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60 ${isUnread ? 'bg-primary/[0.035]' : ''}`}
                                            >
                                                <span className={`relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isReply
                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                                    : 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300'}`}>
                                                    <Icon size={17} />
                                                    {isUnread && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-primary dark:border-gray-900" />}
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="flex items-start justify-between gap-2">
                                                        <span className="text-xs font-bold leading-5 text-gray-900 dark:text-white">{notification.title}</span>
                                                        <time className="shrink-0 pt-0.5 text-[10px] text-gray-400">{formatNotificationDate(notification.created_at)}</time>
                                                    </span>
                                                    <span className="mt-0.5 block text-xs leading-5 text-gray-600 dark:text-gray-300">{notification.body}</span>
                                                    <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-primary">
                                                        {isReply ? 'Open seller chat' : 'View order'} <span aria-hidden="true">→</span>
                                                    </span>
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <footer className="border-t border-gray-100 bg-gray-50/80 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-950/40">
                                <p className="text-center text-[10px] text-gray-500">Showing your 30 most recent updates</p>
                            </footer>
                        )}
                    </section>
                </>
            )}
        </div>
    );
};

export default NotificationCenter;
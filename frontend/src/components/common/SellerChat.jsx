import { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { MessageCircle, Send, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const API = 'http://localhost:5000/api';

const ConversationThread = ({ conversationId, otherName, productName, onMessageSent }) => {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [messageBody, setMessageBody] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const bottomRef = useRef(null);

    useEffect(() => {
        let active = true;
        const loadMessages = async () => {
            try {
                const response = await axios.get(`${API}/messages/conversations/${conversationId}/messages`);
                if (active) {
                    setMessages(response.data.data || []);
                    setError('');
                }
            } catch (requestError) {
                if (active) setError(requestError.response?.data?.message || 'Unable to load this conversation.');
            } finally {
                if (active) setLoading(false);
            }
        };

        loadMessages();
        const refresh = window.setInterval(loadMessages, 5000);
        return () => {
            active = false;
            window.clearInterval(refresh);
        };
    }, [conversationId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (event) => {
        event.preventDefault();
        const body = messageBody.trim();
        if (!body || sending) return;

        setSending(true);
        setError('');
        try {
            const response = await axios.post(`${API}/messages/conversations/${conversationId}/messages`, {
                message_body: body,
            });
            setMessages((current) => [...current, response.data.data]);
            setMessageBody('');
            onMessageSent?.();
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Message could not be sent.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                <p className="font-bold text-gray-900 dark:text-white">{otherName}</p>
                <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">About {productName}</p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50/70 p-4 dark:bg-gray-950/50">
                {loading && <p className="py-8 text-center text-sm text-gray-500">Loading conversation...</p>}
                {!loading && messages.length === 0 && (
                    <div className="py-10 text-center">
                        <MessageCircle className="mx-auto mb-2 text-gray-300" size={28} />
                        <p className="text-sm text-gray-500">Start the conversation with a message.</p>
                    </div>
                )}
                {messages.map((message) => {
                    const ownMessage = message.sender_role === user?.role;
                    return (
                        <div key={message.message_id} className={`flex ${ownMessage ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${ownMessage
                                ? 'rounded-br-md bg-primary text-white'
                                : 'rounded-bl-md border border-gray-200 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100'}`}>
                                {!ownMessage && <p className="mb-1 text-[11px] font-semibold opacity-70">{message.sender_name}</p>}
                                <p className="whitespace-pre-wrap wrap-break-word text-sm">{message.message_body}</p>
                                <time className={`mt-1 block text-right text-[10px] ${ownMessage ? 'text-white/70' : 'text-gray-400'}`}>
                                    {new Date(message.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </time>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>
            {error && <p role="alert" className="px-4 pt-2 text-xs text-red-600">{error}</p>}
            <form onSubmit={sendMessage} className="flex items-end gap-2 border-t border-gray-100 p-3 dark:border-gray-800">
                <textarea
                    value={messageBody}
                    onChange={(event) => setMessageBody(event.target.value)}
                    maxLength={2000}
                    rows={2}
                    aria-label="Write a message"
                    placeholder="Write a message..."
                    className="textarea textarea-bordered min-h-11 flex-1 resize-none rounded-xl text-sm"
                />
                <button
                    type="submit"
                    disabled={!messageBody.trim() || sending}
                    title="Send message"
                    aria-label="Send message"
                    className="btn btn-primary btn-square rounded-xl text-white"
                >
                    <Send size={17} />
                </button>
            </form>
        </div>
    );
};

export const SellerChatDialog = ({ conversationId, sellerName, productName, onClose }) => (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/45 p-3" role="presentation" onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
    }}>
        <section role="dialog" aria-modal="true" aria-label={`Chat with ${sellerName}`} className="flex h-[min(680px,92vh)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Seller chat</p>
                    <h2 className="mt-0.5 text-lg font-bold text-gray-900 dark:text-white">{sellerName}</h2>
                </div>
                <button onClick={onClose} title="Close chat" aria-label="Close chat" className="btn btn-ghost btn-sm btn-square rounded-lg">
                    <X size={18} />
                </button>
            </header>
            <ConversationThread conversationId={conversationId} otherName={sellerName} productName={productName} />
        </section>
    </div>
);

export const SellerInbox = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        const loadConversations = async () => {
            try {
                const response = await axios.get(`${API}/messages/conversations`);
                if (active) {
                    const items = response.data.data || [];
                    setConversations(items);
                    setSelectedId((current) => current || items[0]?.conversation_id || null);
                    setError('');
                }
            } catch (requestError) {
                if (active) setError(requestError.response?.data?.message || 'Unable to load seller messages.');
            } finally {
                if (active) setLoading(false);
            }
        };

        loadConversations();
        const refresh = window.setInterval(loadConversations, 10000);
        return () => {
            active = false;
            window.clearInterval(refresh);
        };
    }, []);

    const selectedConversation = conversations.find((item) => String(item.conversation_id) === String(selectedId));

    return (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="grid min-h-140 grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)]">
                <aside className="border-b border-gray-100 md:border-b-0 md:border-r dark:border-gray-800">
                    <div className="border-b border-gray-100 px-4 py-4 dark:border-gray-800">
                        <h2 className="font-bold text-gray-900 dark:text-white">Customer messages</h2>
                        <p className="mt-1 text-xs text-gray-500">Product questions from your customers</p>
                    </div>
                    <div className="max-h-65 overflow-y-auto md:max-h-127.5">
                        {loading && <p className="p-4 text-sm text-gray-500">Loading inbox...</p>}
                        {!loading && conversations.length === 0 && (
                            <p className="px-4 py-8 text-center text-sm text-gray-500">New customer conversations will appear here.</p>
                        )}
                        {conversations.map((conversation) => (
                            <button
                                key={conversation.conversation_id}
                                onClick={() => setSelectedId(conversation.conversation_id)}
                                className={`block w-full border-b border-gray-100 px-4 py-3 text-left transition-colors dark:border-gray-800 ${String(selectedId) === String(conversation.conversation_id)
                                    ? 'bg-primary/5'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                            >
                                <span className="block truncate text-sm font-semibold text-gray-900 dark:text-white">{conversation.customer_name}</span>
                                <span className="mt-0.5 block truncate text-xs text-gray-500">{conversation.product_name}</span>
                                <span className="mt-1 block truncate text-xs text-gray-400">{conversation.last_message || 'No messages yet'}</span>
                            </button>
                        ))}
                    </div>
                </aside>
                <div className="flex min-h-90 min-w-0 flex-col">
                    {error && <p role="alert" className="m-4 text-sm text-red-600">{error}</p>}
                    {selectedConversation ? (
                        <ConversationThread
                            key={selectedConversation.conversation_id}
                            conversationId={selectedConversation.conversation_id}
                            otherName={selectedConversation.customer_name}
                            productName={selectedConversation.product_name}
                        />
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-gray-400">
                            <MessageCircle size={34} className="mb-3" />
                            <p className="text-sm">Select a customer conversation to reply.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { ConversationThread } from '../components/common/SellerChat';

const API = 'http://localhost:5000/api';

const MessagesPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const requestedConversationId = searchParams.get('conversationId');
    const [conversations, setConversations] = useState([]);
    const [selectedId, setSelectedId] = useState(requestedConversationId);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        const loadConversations = async () => {
            try {
                const response = await axios.get(`${API}/messages/conversations`);
                if (!active) return;
                const items = response.data.data || [];
                setConversations(items);
                const requestedExists = items.some((item) => String(item.conversation_id) === String(requestedConversationId));
                const nextId = requestedExists ? requestedConversationId : items[0]?.conversation_id || null;
                setSelectedId(nextId);
                setError('');
            } catch (requestError) {
                if (active) setError(requestError.response?.data?.message || 'Unable to load your conversations.');
            } finally {
                if (active) setLoading(false);
            }
        };

        loadConversations();
        return () => { active = false; };
    }, [requestedConversationId]);

    const selectedConversation = conversations.find((item) => String(item.conversation_id) === String(selectedId));

    const selectConversation = (conversationId) => {
        setSelectedId(conversationId);
        navigate(`/messages?conversationId=${conversationId}`, { replace: true });
    };

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 font-sans dark:bg-gray-950">
            <Navbar />
            <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-7 md:px-6">
                <div className="mb-5 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-primary">Your conversations</p>
                        <h1 className="mt-1 text-2xl font-black text-gray-900 dark:text-white">Messages</h1>
                    </div>
                    <span className="text-xs text-gray-500">{conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}</span>
                </div>

                {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
                <section className="grid min-h-[min(680px,72vh)] flex-1 grid-cols-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 md:grid-cols-[300px_minmax(0,1fr)]">
                    <aside className="border-b border-gray-100 dark:border-gray-800 md:border-b-0 md:border-r">
                        <div className="border-b border-gray-100 px-4 py-4 dark:border-gray-800">
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Seller chats</h2>
                            <p className="mt-0.5 text-xs text-gray-500">Questions and replies about products</p>
                        </div>
                        <div className="max-h-52 overflow-y-auto md:max-h-[min(600px,65vh)]">
                            {loading && <p className="p-4 text-sm text-gray-500">Loading conversations...</p>}
                            {!loading && conversations.length === 0 && <p className="px-5 py-9 text-center text-sm text-gray-500">Chats you start from a product page will appear here.</p>}
                            {conversations.map((conversation) => (
                                <button
                                    type="button"
                                    key={conversation.conversation_id}
                                    onClick={() => selectConversation(conversation.conversation_id)}
                                    className={`block w-full border-b border-gray-100 px-4 py-3 text-left transition-colors dark:border-gray-800 ${String(selectedId) === String(conversation.conversation_id)
                                        ? 'bg-primary/5'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                                >
                                    <span className="block truncate text-sm font-semibold text-gray-900 dark:text-white">{conversation.shop_name || conversation.seller_name}</span>
                                    <span className="mt-0.5 block truncate text-xs text-gray-500">{conversation.product_name}</span>
                                    <span className="mt-1 block truncate text-xs text-gray-400">{conversation.last_message || 'No messages yet'}</span>
                                </button>
                            ))}
                        </div>
                    </aside>
                    <div className="flex min-h-90 min-w-0 flex-col">
                        {selectedConversation ? (
                            <ConversationThread
                                key={selectedConversation.conversation_id}
                                conversationId={selectedConversation.conversation_id}
                                otherName={selectedConversation.shop_name || selectedConversation.seller_name}
                                productName={selectedConversation.product_name}
                            />
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-gray-400">
                                <MessageCircle size={36} className="mb-3" />
                                <p className="text-sm font-semibold">{loading ? 'Loading your messages' : 'Select a conversation'}</p>
                                {!loading && <p className="mt-1 max-w-xs text-xs">Open a seller chat from any product page to ask a question.</p>}
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default MessagesPage;
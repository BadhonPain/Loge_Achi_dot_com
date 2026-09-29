import { useEffect, useRef, useState } from 'react';
import { Bot, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000/api/assistant/chat';
const starterPrompts = [
    'Find a gift under ৳2,000',
    'Show me tech for daily use',
    'Help me find something for home',
];

const makeMessage = (role, content, products = []) => ({
    id: `${Date.now()}-${Math.random()}`,
    role,
    content,
    products,
});

const ShoppingAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [draft, setDraft] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [messages, setMessages] = useState([
        makeMessage('assistant', 'Hi! Tell me what you are shopping for, your budget, or what matters most. I will find options from our current catalog.'),
    ]);
    const messageListRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messageListRef.current?.scrollTo({ top: messageListRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, isSending]);

    const sendMessage = async (value) => {
        const content = value.trim();
        if (!content || isSending) return;

        const history = messages
            .filter((message) => message.role === 'user' || message.role === 'assistant')
            .slice(-8)
            .map(({ role, content: text }) => ({ role, content: text }));
        setMessages((current) => [...current, makeMessage('user', content)]);
        setDraft('');
        setIsSending(true);

        try {
            const { data } = await axios.post(API, { message: content, history });
            setMessages((current) => [
                ...current,
                makeMessage('assistant', data.data.answer, data.data.products || []),
            ]);
        } catch (error) {
            setMessages((current) => [
                ...current,
                makeMessage('assistant', error.response?.data?.message || 'I could not reach the shopping service just now. Please try again.'),
            ]);
        } finally {
            setIsSending(false);
            inputRef.current?.focus();
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        sendMessage(draft);
    };

    return (
        <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
            {isOpen && (
                <section
                    role="dialog"
                    aria-labelledby="shopping-assistant-title"
                    className="flex h-[min(620px,calc(100dvh-6.5rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.55)] dark:border-gray-700 dark:bg-gray-950"
                >
                    <header className="flex items-center justify-between border-b border-gray-800 bg-gray-950 px-4 py-3.5 text-white">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
                                <Sparkles size={18} />
                            </div>
                            <div>
                                <h2 id="shopping-assistant-title" className="text-sm font-bold">Shopping Assistant</h2>
                                <p className="text-[11px] text-gray-400">Catalog-aware recommendations</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            aria-label="Close shopping assistant"
                            onClick={() => setIsOpen(false)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-300 transition hover:bg-gray-800 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </header>

                    <div ref={messageListRef} className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-900">
                        {messages.map((message) => (
                            <div key={message.id} className={`flex gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {message.role === 'assistant' && (
                                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Bot size={16} />
                                    </div>
                                )}
                                <div className={`min-w-0 max-w-[85%] ${message.role === 'user' ? 'text-right' : ''}`}>
                                    <p className={`whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${message.role === 'user'
                                        ? 'rounded-br-md bg-gray-900 text-white dark:bg-gray-700'
                                        : 'rounded-bl-md border border-gray-200 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'
                                        }`}>
                                        {message.content}
                                    </p>
                                    {message.products?.length > 0 && (
                                        <div className="mt-2 space-y-2 text-left">
                                            {message.products.map((product) => (
                                                <Link
                                                    key={product.product_id}
                                                    to={`/product/${product.product_id}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-2 transition hover:border-primary/50 dark:border-gray-700 dark:bg-gray-800"
                                                >
                                                    <img src={product.image} alt="" className="h-14 w-12 shrink-0 rounded-lg bg-gray-100 object-cover dark:bg-gray-700" />
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block line-clamp-2 text-xs font-semibold text-gray-900 dark:text-white">{product.product_name}</span>
                                                        <span className="mt-1 block text-[10px] text-gray-500 dark:text-gray-400">{product.category_name}</span>
                                                    </span>
                                                    <span className="shrink-0 text-xs font-extrabold text-primary">৳{Number(product.price).toLocaleString()}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {messages.length === 1 && !isSending && (
                            <div className="ml-9 flex flex-wrap gap-2">
                                {starterPrompts.map((prompt) => (
                                    <button
                                        key={prompt}
                                        type="button"
                                        onClick={() => sendMessage(prompt)}
                                        className="rounded-full border border-gray-200 bg-white px-3 py-2 text-left text-[11px] font-medium text-gray-700 transition hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        )}

                        {isSending && (
                            <div role="status" className="ml-9 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span className="loading loading-dots loading-sm text-primary" />
                                Finding options from the catalog…
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950">
                        <label className="sr-only" htmlFor="shopping-assistant-message">Message the shopping assistant</label>
                        <textarea
                            id="shopping-assistant-message"
                            ref={inputRef}
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' && !event.shiftKey) {
                                    event.preventDefault();
                                    handleSubmit(event);
                                }
                            }}
                            maxLength={800}
                            rows={1}
                            placeholder="What are you looking for?"
                            className="max-h-24 min-h-11 flex-1 resize-y rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                        <button
                            type="submit"
                            disabled={!draft.trim() || isSending}
                            aria-label="Send message"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                            <Send size={17} />
                        </button>
                    </form>
                </section>
            )}

            <button
                type="button"
                aria-label={isOpen ? 'Close shopping assistant' : 'Open shopping assistant'}
                aria-expanded={isOpen}
                onClick={() => setIsOpen((open) => !open)}
                className="flex h-14 items-center gap-2.5 rounded-full bg-gray-950 px-4 text-sm font-bold text-white shadow-[0_12px_35px_-12px_rgba(0,0,0,0.7)] ring-1 ring-white/15 transition hover:-translate-y-0.5 hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
                {isOpen ? <X size={19} /> : <MessageCircle size={19} />}
                <span>{isOpen ? 'Close' : 'Ask LogeAchi'}</span>
            </button>
        </div>
    );
};

export default ShoppingAssistant;
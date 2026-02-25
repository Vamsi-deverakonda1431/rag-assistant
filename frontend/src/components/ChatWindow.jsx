import { useEffect, useRef } from 'react';
import Message from './Message';

export default function ChatWindow({ messages, isLoading }) {
    const bottomRef = useRef(null);

    // Auto scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <div className="chat-window">
            {messages.length === 0 ? (
                <div className="empty-state">
                    <h2>Welcome to RAG Assistant</h2>
                    <p>Ask me anything based on the knowledge base.</p>
                </div>
            ) : (
                messages.map((msg) => (
                    <Message key={msg.id} msg={msg} />
                ))
            )}

            {isLoading && (
                <div className="message-wrapper assistant">
                    <div className="message-bubble">
                        <div className="spinner" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: 'var(--primary-color)' }}></div>
                    </div>
                </div>
            )}

            <div ref={bottomRef} />
        </div>
    );
}

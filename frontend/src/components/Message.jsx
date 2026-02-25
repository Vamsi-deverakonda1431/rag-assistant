export default function Message({ msg }) {
    const isUser = msg.role === 'user';

    return (
        <div className={`message-wrapper ${isUser ? 'user' : 'assistant'}`}>
            <div className="message-bubble" style={msg.isError ? { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #f87171' } : {}}>
                {msg.content}
            </div>
            {!isUser && msg.meta && (
                <div className="message-meta">
                    <span>Chunks used: {msg.meta.chunks}</span>
                    <span>Tokens: {msg.meta.tokens || 0}</span>
                </div>
            )}
        </div>
    );
}

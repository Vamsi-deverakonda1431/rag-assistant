import { useState } from 'react';

export default function InputBox({ onSend, isLoading }) {
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSend(input);
            setInput('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form className="input-container" onSubmit={handleSubmit}>
            <input
                type="text"
                className="input-box"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
            />
            <button
                type="submit"
                className="send-btn"
                disabled={isLoading || !input.trim()}
            >
                {isLoading ? <div className="spinner"></div> : 'Send'}
            </button>
        </form>
    );
}

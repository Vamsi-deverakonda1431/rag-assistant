import { useState, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import InputBox from './components/InputBox';
import { v4 as uuidv4 } from 'uuid';
import { sendMessage } from './api';

function App() {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');

    // Initialize session
    useEffect(() => {
        let currentSessionId = localStorage.getItem('rag_session_id');
        if (!currentSessionId) {
            currentSessionId = uuidv4();
            localStorage.setItem('rag_session_id', currentSessionId);
        }
        setSessionId(currentSessionId);

        // Load local history if desired
        const savedChat = localStorage.getItem(`chat_${currentSessionId}`);
        if (savedChat) {
            setMessages(JSON.parse(savedChat));
        }
    }, []);

    // Save chat on change
    useEffect(() => {
        if (sessionId && messages.length > 0) {
            localStorage.setItem(`chat_${sessionId}`, JSON.stringify(messages));
        }
    }, [messages, sessionId]);

    const handleSendMessage = async (text) => {
        if (!text.trim()) return;

        const userMessage = { role: 'user', content: text, id: Date.now().toString() };
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await sendMessage(sessionId, text);

            const assistantMessage = {
                role: 'assistant',
                content: response.reply,
                id: (Date.now() + 1).toString(),
                meta: {
                    tokens: response.tokensUsed,
                    chunks: response.retrievedChunks
                }
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage = {
                role: 'assistant',
                content: error.message || "An error occurred while connecting to the server.",
                id: (Date.now() + 1).toString(),
                isError: true
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const startNewChat = () => {
        const newSessionId = uuidv4();
        localStorage.setItem('rag_session_id', newSessionId);
        setSessionId(newSessionId);
        setMessages([]);
    };

    return (
        <div className="app-container">
            <header className="header">
                <h1>RAG Assistant</h1>
                <button className="new-chat-btn" onClick={startNewChat}>New Chat</button>
            </header>

            <ChatWindow messages={messages} isLoading={isLoading} />

            <InputBox onSend={handleSendMessage} isLoading={isLoading} />
        </div>
    );
}

export default App;

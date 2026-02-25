export async function sendMessage(sessionId, message) {
    const API_URL = 'http://localhost:3001/api/chat';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId, message }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch response');
        }

        return data;
    } catch (error) {
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            throw new Error('Could not connect to the server. Make sure the backend is running.');
        }
        throw error;
    }
}

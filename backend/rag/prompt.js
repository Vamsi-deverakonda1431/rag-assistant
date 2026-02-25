export function buildPrompt(systemRules, retrievedChunks, conversationHistory, userQuestion) {
    const contextText = retrievedChunks.map(chunk => `[Source: ${chunk.title}]\n${chunk.text}`).join('\n\n');

    let messages = [
        {
            role: "system",
            content: `${systemRules}\n\nCONTEXT:\n${contextText || "No relevant context found."}`
        }
    ];

    // Add last 5 conversation messages
    const historyLimit = 5;
    const recentHistory = conversationHistory.slice(-historyLimit);

    recentHistory.forEach(msg => {
        messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
        });
    });

    messages.push({
        role: "user",
        content: userQuestion
    });

    return messages;
}

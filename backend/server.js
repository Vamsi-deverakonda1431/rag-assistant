import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { retrieveRelevantChunks } from './rag/retrieve.js';
import { buildPrompt } from './rag/prompt.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// In-memory store for session memory
const sessions = {};

const SYSTEM_RULES = `You are a helpful GenAI assistant.
Strictly follow these rules:
* Answer only from context provided.
* Do not use outside knowledge.
* If missing info -> say "I don't have enough information."
* Be concise and helpful.`;


// ================= CHAT ENDPOINT =================
app.post('/api/chat', async (req, res) => {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
        return res.status(400).json({ error: "sessionId and message are required" });
    }

    try {

        // Initialize session memory
        if (!sessions[sessionId]) {
            sessions[sessionId] = [];
        }

        // 1️⃣ Retrieve relevant chunks using embeddings
        const retrievedChunks = await retrieveRelevantChunks(message, 3, 0.75);

        // 2️⃣ If nothing relevant found → fallback
        if (retrievedChunks.length === 0) {

            const fallbackReply = "I don't have enough information.";

            sessions[sessionId].push({ role: 'user', content: message });
            sessions[sessionId].push({ role: 'assistant', content: fallbackReply });

            if (sessions[sessionId].length > 10) {
                sessions[sessionId] = sessions[sessionId].slice(-10);
            }

            return res.json({
                reply: fallbackReply,
                tokensUsed: 0,
                retrievedChunks: 0
            });
        }

        // 3️⃣ Build prompt (still useful for structure/history)
        const messages = buildPrompt(
            SYSTEM_RULES,
            retrievedChunks,
            sessions[sessionId],
            message
        );

        // 4️⃣ LOCAL RESPONSE GENERATION (No OpenAI API)
        // Combine retrieved context chunks into final answer
        let replyText = retrievedChunks
            .map(chunk => chunk.content)
            .join("\n\n");

        // 5️⃣ Save conversation memory
        sessions[sessionId].push({ role: 'user', content: message });
        sessions[sessionId].push({ role: 'assistant', content: replyText });

        if (sessions[sessionId].length > 10) {
            sessions[sessionId] = sessions[sessionId].slice(-10);
        }

        // 6️⃣ Send response
        res.json({
            reply: replyText,
            tokensUsed: 0,
            retrievedChunks: retrievedChunks.length
        });

    } catch (error) {
        console.error("Chat API error:", error);

        res.status(500).json({
            error: "An internal error occurred during request processing."
        });
    }
});


// ================= TIMEOUT MIDDLEWARE =================
app.use((req, res, next) => {
    req.setTimeout(30000, () => {
        let err = new Error('Request Timeout');
        err.status = 408;
        next(err);
    });
    next();
});


// ================= START SERVER =================
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Make sure to run 'npm run ingest' before asking questions!`);
});
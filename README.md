# Production-Grade RAG Chat Assistant

A complete full-stack GenAI assistant that answers user questions using Retrieval-Augmented Generation (RAG). It uses real embeddings, a local vector store, and cosine similarity for contextual search.

## Architecture

```text
+---------------+       +------------------+       +-------------------+
|               |       |                  |       |                   |
|  React (Vite) +------->   Express API    +------->   OpenAI API      |
|  Frontend     <-------+   Backend        <-------+   (LLM & Embed)   |
|               |       |                  |       |                   |
+---------------+       +--------+---------+       +-------------------+
                                 |
                                 | (Cosine Similarity)
                                 v
                        +--------+---------+
                        |                  |
                        | vector_store.json|
                        |                  |
                        +------------------+
```

## RAG Workflow Logic
1. **Ingestion**: `scripts/ingest.js` reads `docs.json`, chunk texts into ~300 words with 50-word overlap, generates vectors for each chunk via OpenAI, and saves them to `vector_store.json`.
2. **Retrieval**: When a user queries, the server embeds the query, iterates through `vector_store.json`, and calculates the **cosine similarity**. Chunks with score >= 0.75 are retrieved (max 3).
3. **Prompt Generation**: The backend injects the retrieved contexts, the last 5 conversation messages (maintained in-memory), and the user query into the system prompt.
4. **LLM Inference**: LLM replies strictly using the provided context, preventing hallucination.

## Features
- **Strict Anti-Hallucination**: If no chunks exceed the 0.75 threshold, it short-circuits to "I don't have enough information".
- **Similarity Search**: Handwritten cosine similarity mathematical function.
- **Session Control**: In-memory session tracking on backend + localstorage persistence.
- **Modern UI**: Clean, auto-scrolling, rich interface with loading states, chunk counters, and responsive design.

## Setup Instructions

### 1. Backend Setup
1. Navigate to `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory and add your OpenAI API key:
   ```
   PORT=3001
   OPENAI_API_KEY=your_actual_api_key_here
   ```
4. Run the document ingestion script (MANDATORY BEFORE SERVER START):
   ```bash
   npm run ingest
   ```
5. Start the server:
   ```bash
   npm start
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:5173` in your browser.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateEmbedding } from './embed.js';
import { cosineSimilarity } from '../utils/vector_math.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.join(__dirname, '../data/vector_store.json');

let vectorStore = null;

function loadVectorStore() {
    if (!vectorStore) {
        if (!fs.existsSync(STORE_PATH)) {
            throw new Error("Vector store not found. Please run ingest script first.");
        }
        vectorStore = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
    }
    return vectorStore;
}

export async function retrieveRelevantChunks(query, topK = 3, threshold = 0.75) {
    const store = loadVectorStore();
    const queryEmbedding = await generateEmbedding(query);

    const results = store.map(item => {
        const score = cosineSimilarity(queryEmbedding, item.embedding);
        return { ...item, score };
    });

    results.sort((a, b) => b.score - a.score);

    // Filter by threshold
    const filtered = results.filter(item => item.score >= threshold);

    return filtered.slice(0, topK);
}

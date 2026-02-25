import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chunkText } from '../utils/chunker.js';
import { generateEmbedding } from '../rag/embed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_PATH = path.join(__dirname, '../data/docs.json');
const STORE_PATH = path.join(__dirname, '../data/vector_store.json');

async function ingest() {
    console.log("Starting ingestion process...");

    if (!fs.existsSync(DOCS_PATH)) {
        console.error(`Docs file not found at ${DOCS_PATH}`);
        process.exit(1);
    }

    const docs = JSON.parse(fs.readFileSync(DOCS_PATH, 'utf-8'));
    const vectorStore = [];

    for (const doc of docs) {
        console.log(`Processing document: ${doc.title}`);
        const chunks = chunkText(doc.text, 300, 50);

        for (let i = 0; i < chunks.length; i++) {
            const chunkTextContent = chunks[i];
            console.log(`  Generating embedding for chunk ${i + 1}/${chunks.length}...`);

            try {
                const embedding = await generateEmbedding(chunkTextContent);
                vectorStore.push({
                    id: `${doc.id}_chunk_${i}`,
                    docId: doc.id,
                    title: doc.title,
                    text: chunkTextContent,
                    embedding: embedding
                });
            } catch (err) {
                console.error(`Failed to embed chunk ${i + 1} of doc ${doc.id}`);
                throw err;
            }
        }
    }

    fs.writeFileSync(STORE_PATH, JSON.stringify(vectorStore, null, 2));
    console.log(`Ingestion complete! ${vectorStore.length} chunks saved to vector_store.json`);
}

ingest().catch(console.error);

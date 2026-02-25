/**
 * Chunks text into approx `maxWords` with `overlapWords`
 */
export function chunkText(text, maxWords = 300, overlapWords = 50) {
  const words = text.split(/\s+/);
  const chunks = [];
  
  if (words.length <= maxWords) {
    return [text];
  }

  let i = 0;
  while (i < words.length) {
    const chunk = words.slice(i, i + maxWords).join(" ");
    chunks.push(chunk);
    i += maxWords - overlapWords;
  }

  return chunks;
}
